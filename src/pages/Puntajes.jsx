import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/client';
import PageHeader from '@/components/PageHeader';
import { Trophy, Trash2, ChevronRight, Users } from 'lucide-react';

const fecha = (iso) =>
  new Date(iso).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });

export default function Puntajes() {
  const [sesiones, setSesiones] = useState(null);
  const [tiradas, setTiradas] = useState([]);
  const [tab, setTab] = useState('sesiones');
  const [confirmar, setConfirmar] = useState(null);

  useEffect(() => {
    (async () => {
      const [ses, ti] = await Promise.all([
        api.listSessions(25),
        api.listRolls(500),
      ]);
      setSesiones(ses);
      setTiradas(ti);
    })();
  }, []);

  const borrar = async (sesion) => {
    await api.deleteSession(sesion.id);
    setSesiones((prev) => prev.filter((s) => s.id !== sesion.id));
    setTiradas((prev) => prev.filter((t) => t.sesion_id !== sesion.id));
    setConfirmar(null);
  };

  const resumenSesion = (sesion) => {
    const propias = tiradas.filter((t) => t.sesion_id === sesion.id);
    const mapa = {};
    propias.forEach((t) => {
      mapa[t.equipo_nombre] = (mapa[t.equipo_nombre] || 0) + t.puntaje_final;
    });
    const equipos = Object.entries(mapa)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total);
    return { tiros: propias.length, equipos };
  };

  const rankingGlobal = (() => {
    const mapa = {};
    tiradas.forEach((t) => {
      const fila = mapa[t.equipo_nombre] || { nombre: t.equipo_nombre, total: 0, tiros: 0, sesiones: new Set() };
      fila.total += t.puntaje_final;
      fila.tiros += 1;
      fila.sesiones.add(t.sesion_id);
      mapa[t.equipo_nombre] = fila;
    });
    return Object.values(mapa)
      .map((f) => ({ ...f, sesiones: f.sesiones.size }))
      .sort((a, b) => b.total - a.total);
  })();

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-[radial-gradient(circle_at_50%_-10%,#1268b8_0%,#073c72_35%,#031f3b_75%,#00101f_100%)] px-5 pb-12 pt-6">
      <PageHeader title="Puntajes" subtitle="Tabla de posiciones" />

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
        {[
          { id: 'sesiones', label: 'Sesiones' },
          { id: 'equipos', label: 'Equipos' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
              tab === t.id ? 'bg-amber-300 text-[#03213e]' : 'text-sky-200/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!sesiones ? (
        <div className="flex h-52 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-amber-300" />
        </div>
      ) : tab === 'sesiones' ? (
        sesiones.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center">
            <Trophy className="mx-auto h-10 w-10 text-amber-300/80" />
            <p className="mt-3 font-heading text-lg text-white">Sin partidas todavía</p>
            <p className="mt-1 text-sm text-sky-100/60">Juega la primera ronda para ver aquí los puntajes.</p>
            <Link
              to="/jugar"
              className="mt-4 inline-block rounded-xl bg-emerald-500 px-5 py-2.5 font-heading text-sm font-semibold text-white"
            >
              Jugar
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sesiones.map((s) => {
              const { tiros, equipos } = resumenSesion(s);
              const lider = equipos[0];
              return (
                <div key={s.id} className="rounded-3xl border border-white/10 bg-white/[0.05] p-4">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-heading text-base font-semibold text-white">{s.nombre}</p>
                      <p className="text-[11px] text-sky-200/50">
                        {fecha(s.created_date)} · {s.jornadas} jornadas · {tiros} tiros
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${
                        s.estado === 'finalizada'
                          ? 'bg-emerald-400/15 text-emerald-300'
                          : 'bg-amber-300/15 text-amber-200'
                      }`}
                    >
                      {s.estado === 'finalizada' ? 'Final' : 'En curso'}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    {equipos.map((eq, i) => (
                      <div key={eq.nombre} className="flex items-center gap-2 text-[12px]">
                        <span className="w-4 text-sky-200/40">{i + 1}°</span>
                        <span className={`flex-1 truncate ${i === 0 ? 'font-bold text-white' : 'text-sky-100/70'}`}>
                          {eq.nombre}
                        </span>
                        <span className="font-heading text-amber-300">{eq.total} pts</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
                    <Link
                      to={`/resultado/${s.id}`}
                      className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-sky-200/70"
                    >
                      Ver detalle <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                    {confirmar === s.id ? (
                      <span className="flex items-center gap-2 text-[11px]">
                        <button onClick={() => borrar(s)} className="font-bold text-rose-300">
                          Borrar
                        </button>
                        <button onClick={() => setConfirmar(null)} className="text-sky-200/50">
                          Cancelar
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setConfirmar(s.id)}
                        className="text-rose-300/50 transition hover:text-rose-300"
                        aria-label="Borrar partida"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {lider && s.estado === 'finalizada' && (
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-200/60">
                      Campeón: {lider.nombre}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : rankingGlobal.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center">
          <Users className="mx-auto h-10 w-10 text-amber-300/80" />
          <p className="mt-3 font-heading text-lg text-white">Aún sin equipos</p>
          <p className="mt-1 text-sm text-sky-100/60">Los puntos acumulados aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rankingGlobal.map((eq, i) => (
            <div key={eq.nombre} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-heading text-sm ${
                  i === 0 ? 'bg-amber-300 text-[#03213e]' : 'bg-white/10 text-sky-100/70'
                }`}
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{eq.nombre}</p>
                <p className="text-[10px] text-sky-200/50">
                  {eq.sesiones} partidas · {eq.tiros} tiros
                </p>
              </div>
              <span className="font-heading text-base text-amber-300">{eq.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}