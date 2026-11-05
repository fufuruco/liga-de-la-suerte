# Liga de la Suerte

Aplicación educativa para jugar partidas por jornadas, registrar los resultados de dos dados, calcular puntajes y estimar probabilidades desde el historial.

## Requisitos

- Node.js 22.13 o superior (usa `node:sqlite`).
- npm.

## Desarrollo

```powershell
npm install
npm run dev
```

El comando inicia en una sola terminal:

- API Node en `http://localhost:4400`.
- Vite en `http://localhost:5173`.
- SQLite persistente en `data/liga.sqlite`.

Detén ambos procesos con `Ctrl+C`. Los datos sobreviven al reinicio del servidor. El directorio `data/` está excluido de Git.

También se pueden ejecutar por separado:

```powershell
npm run dev:api
npm run dev:web
```

## Producción

```powershell
npm run build
$env:NODE_ENV = 'production'
npm start
```

El servidor Node sirve el frontend compilado y la API desde el mismo origen. Configura `PORT` y `DATA_DIR` para cambiar el puerto y la ubicación del archivo SQLite.

## Despliegue en Railway

El archivo `railway.json` configura el build, el comando de inicio y el healthcheck. Para publicar desde GitHub, conecta este repositorio en Railway y selecciona la rama `main`.

En el servicio de Railway:

1. Añade un volumen montado en `/data`.
2. Define `DATA_DIR=/data` y `NODE_ENV=production`.
3. Genera un dominio público para el servicio.

Los deploys posteriores de `main` se publican automáticamente. El volumen conserva el historial SQLite entre deploys; sin él, la app arranca pero los datos se pierden al reemplazar la instancia.

## API

- `GET /api/health`
- `GET /api/sessions?limit=25&estado=en_curso`
- `POST /api/sessions` con nombre, jornadas y equipos iniciales
- `GET /api/sessions/:id`
- `PATCH /api/sessions/:id` para finalizar una partida
- `DELETE /api/sessions/:id` (elimina equipos y tiros asociados)
- `GET /api/sessions/:id/teams`
- `GET /api/sessions/:id/rolls?limit=200`
- `POST /api/sessions/:id/rolls`
- `GET /api/rolls?limit=300`
- `DELETE /api/history`

El servidor valida dados, jornadas, equipos y calcula suma, ajuste y puntaje final; el cliente no envía puntajes calculados.

## Fórmulas del juego

- Suma: `D = dado1 + dado2`.
- Ajuste: `I_t = D - 4`.
- Base por jornada: `T_t = 20 + 2t`.
- Puntaje final: `Y_t = T_t + I_t`.
- La estimación estadística combina frecuencias registradas con una referencia teórica de dos dados equilibrados.

La aplicación es independiente: no requiere una cuenta de proveedor externo. Los datos se almacenan en SQLite.
