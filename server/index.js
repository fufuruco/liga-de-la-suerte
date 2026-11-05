import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { createReadStream, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dataDirectory = resolve(process.env.DATA_DIR || join(projectRoot, 'data'));
const databasePath = join(dataDirectory, 'liga.sqlite');
const port = Number(process.env.PORT || 4400);
const production = process.env.NODE_ENV === 'production';
const host = process.env.HOST || (production ? '0.0.0.0' : '127.0.0.1');
const distributionDirectory = join(projectRoot, 'dist');

mkdirSync(dataDirectory, { recursive: true });

const database = new DatabaseSync(databasePath);
database.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS sesiones (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    jornadas INTEGER NOT NULL CHECK (jornadas BETWEEN 1 AND 12),
    estado TEXT NOT NULL DEFAULT 'en_curso' CHECK (estado IN ('en_curso', 'finalizada')),
    campeon TEXT NOT NULL DEFAULT '',
    created_date TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
    updated_date TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS equipos (
    id TEXT PRIMARY KEY,
    sesion_id TEXT NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    orden INTEGER NOT NULL DEFAULT 0,
    created_date TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE TABLE IF NOT EXISTS tiradas (
    id TEXT PRIMARY KEY,
    sesion_id TEXT NOT NULL REFERENCES sesiones(id) ON DELETE CASCADE,
    equipo_id TEXT NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
    equipo_nombre TEXT NOT NULL,
    jornada INTEGER NOT NULL CHECK (jornada BETWEEN 1 AND 12),
    dado1 INTEGER NOT NULL CHECK (dado1 BETWEEN 1 AND 6),
    dado2 INTEGER NOT NULL CHECK (dado2 BETWEEN 1 AND 6),
    suma INTEGER NOT NULL CHECK (suma BETWEEN 2 AND 12),
    ajuste INTEGER NOT NULL,
    puntaje_base INTEGER NOT NULL,
    puntaje_final INTEGER NOT NULL,
    manual INTEGER NOT NULL DEFAULT 0,
    created_date TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );

  CREATE INDEX IF NOT EXISTS equipos_sesion_orden ON equipos(sesion_id, orden);
  CREATE INDEX IF NOT EXISTS tiradas_sesion_fecha ON tiradas(sesion_id, created_date);
  CREATE INDEX IF NOT EXISTS tiradas_fecha ON tiradas(created_date);
`);

const sessionById = database.prepare('SELECT * FROM sesiones WHERE id = ?');
const teamsBySession = database.prepare('SELECT * FROM equipos WHERE sesion_id = ? ORDER BY orden, created_date');
const rollsBySession = database.prepare('SELECT * FROM tiradas WHERE sesion_id = ? ORDER BY created_date LIMIT ?');

function sendJson(response, status, data) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(JSON.stringify(data));
}

async function readJson(request) {
  let text = '';
  for await (const chunk of request) {
    text += chunk;
    if (text.length > 1_000_000) throw Object.assign(new Error('El cuerpo de la solicitud es demasiado grande.'), { status: 413 });
  }
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw Object.assign(new Error('El cuerpo debe ser JSON válido.'), { status: 400 });
  }
}

function requireSession(id) {
  const session = sessionById.get(id);
  if (!session) throw Object.assign(new Error('No se encontró la partida.'), { status: 404 });
  return session;
}

function boundedLimit(value, fallback, max) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.min(Math.max(parsed, 1), max) : fallback;
}

function createSession({ nombre, jornadas, equipos }) {
  const normalizedName = typeof nombre === 'string' ? nombre.trim() : '';
  const normalizedRounds = Number(jornadas);
  if (!normalizedName) throw Object.assign(new Error('El nombre de la partida es obligatorio.'), { status: 400 });
  if (!Number.isInteger(normalizedRounds) || normalizedRounds < 1 || normalizedRounds > 12) {
    throw Object.assign(new Error('Las jornadas deben estar entre 1 y 12.'), { status: 400 });
  }
  if (!Array.isArray(equipos) || equipos.length < 2 || equipos.length > 4) {
    throw Object.assign(new Error('La partida debe tener entre 2 y 4 equipos.'), { status: 400 });
  }
  const names = equipos.map((team) => typeof team === 'string' ? team.trim() : '').filter(Boolean);
  if (names.length !== equipos.length) throw Object.assign(new Error('Todos los equipos deben tener nombre.'), { status: 400 });

  const sessionId = randomUUID();
  database.exec('BEGIN IMMEDIATE');
  try {
    database.prepare('INSERT INTO sesiones (id, nombre, jornadas, estado) VALUES (?, ?, ?, ?)')
      .run(sessionId, normalizedName, normalizedRounds, 'en_curso');
    const insertTeam = database.prepare('INSERT INTO equipos (id, sesion_id, nombre, orden) VALUES (?, ?, ?, ?)');
    names.forEach((teamName, index) => insertTeam.run(randomUUID(), sessionId, teamName, index));
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
  return { sesion: sessionById.get(sessionId), equipos: teamsBySession.all(sessionId) };
}

function createRoll(sessionId, payload) {
  const session = requireSession(sessionId);
  const teamId = typeof payload.equipo_id === 'string' ? payload.equipo_id : '';
  const team = database.prepare('SELECT * FROM equipos WHERE id = ? AND sesion_id = ?').get(teamId, sessionId);
  if (!team) throw Object.assign(new Error('El equipo no pertenece a esta partida.'), { status: 400 });

  const jornada = Number(payload.jornada);
  const dado1 = Number(payload.dado1);
  const dado2 = Number(payload.dado2);
  if (!Number.isInteger(jornada) || jornada < 1 || jornada > session.jornadas) {
    throw Object.assign(new Error('La jornada indicada no es válida.'), { status: 400 });
  }
  if (![dado1, dado2].every((die) => Number.isInteger(die) && die >= 1 && die <= 6)) {
    throw Object.assign(new Error('Cada dado debe mostrar un valor entre 1 y 6.'), { status: 400 });
  }

  const suma = dado1 + dado2;
  const ajuste = suma - 4;
  const puntajeBase = 20 + 2 * jornada;
  const id = randomUUID();
  database.prepare(`
    INSERT INTO tiradas (id, sesion_id, equipo_id, equipo_nombre, jornada, dado1, dado2, suma, ajuste, puntaje_base, puntaje_final, manual)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, sessionId, team.id, team.nombre, jornada, dado1, dado2, suma, ajuste, puntajeBase, puntajeBase + ajuste, payload.manual ? 1 : 0);
  return database.prepare('SELECT * FROM tiradas WHERE id = ?').get(id);
}

function serveStatic(request, response, pathname) {
  if (!production || !existsSync(join(distributionDirectory, 'index.html'))) return false;
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const normalizedPath = normalize(requestedPath).replace(/^([/\\])+/, '');
  const fullPath = resolve(distributionDirectory, normalizedPath);
  if (fullPath !== distributionDirectory && !fullPath.startsWith(distributionDirectory + sep)) return false;
  const filePath = existsSync(fullPath) ? fullPath : join(distributionDirectory, 'index.html');
  const types = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  };
  response.writeHead(200, { 'Content-Type': types[extname(filePath)] || 'application/octet-stream' });
  createReadStream(filePath).pipe(response);
  return true;
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  try {
    if (request.method === 'GET' && pathname === '/api/health') {
      return sendJson(response, 200, { status: 'ok', database: 'sqlite' });
    }

    if (request.method === 'GET' && pathname === '/api/sessions') {
      const limit = boundedLimit(url.searchParams.get('limit'), 25, 100);
      const status = url.searchParams.get('estado');
      const rows = status
        ? database.prepare('SELECT * FROM sesiones WHERE estado = ? ORDER BY created_date DESC LIMIT ?').all(status, limit)
        : database.prepare('SELECT * FROM sesiones ORDER BY created_date DESC LIMIT ?').all(limit);
      return sendJson(response, 200, rows);
    }

    if (request.method === 'POST' && pathname === '/api/sessions') {
      return sendJson(response, 201, createSession(await readJson(request)));
    }

    if (request.method === 'GET' && pathname === '/api/rolls') {
      const limit = boundedLimit(url.searchParams.get('limit'), 300, 1000);
      const rows = database.prepare('SELECT * FROM tiradas ORDER BY created_date DESC LIMIT ?').all(limit);
      return sendJson(response, 200, rows);
    }

    if (request.method === 'DELETE' && pathname === '/api/history') {
      database.exec('DELETE FROM sesiones');
      return sendJson(response, 200, { deleted: true });
    }

    const sessionMatch = pathname.match(/^\/api\/sessions\/([^/]+)(?:\/(teams|rolls))?$/);
    if (sessionMatch) {
      const [, id, resource] = sessionMatch;
      if (request.method === 'GET' && !resource) return sendJson(response, 200, requireSession(id));
      if (request.method === 'GET' && resource === 'teams') {
        requireSession(id);
        return sendJson(response, 200, teamsBySession.all(id));
      }
      if (request.method === 'GET' && resource === 'rolls') {
        requireSession(id);
        return sendJson(response, 200, rollsBySession.all(id, boundedLimit(url.searchParams.get('limit'), 200, 1000)));
      }
      if (request.method === 'POST' && resource === 'rolls') {
        return sendJson(response, 201, createRoll(id, await readJson(request)));
      }
      if (request.method === 'PATCH' && !resource) {
        const body = await readJson(request);
        const state = body.estado === 'finalizada' ? 'finalizada' : 'en_curso';
        database.prepare("UPDATE sesiones SET estado = ?, campeon = ?, updated_date = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?")
          .run(state, typeof body.campeon === 'string' ? body.campeon : '', id);
        return sendJson(response, 200, requireSession(id));
      }
      if (request.method === 'DELETE' && !resource) {
        requireSession(id);
        database.prepare('DELETE FROM sesiones WHERE id = ?').run(id);
        return sendJson(response, 200, { deleted: true });
      }
    }

    if (request.method === 'GET' && serveStatic(request, response, pathname)) return;
    return sendJson(response, 404, { error: 'Ruta no encontrada.' });
  } catch (error) {
    console.error(error);
    return sendJson(response, error.status || 500, { error: error.status ? error.message : 'Error interno del servidor.' });
  }
});

server.listen(port, host, () => {
  console.log(`Liga de la Suerte API lista en http://localhost:${port}`);
  console.log(`Base SQLite: ${databasePath}`);
});

function shutdown() {
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);