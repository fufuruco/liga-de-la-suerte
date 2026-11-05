import { useState } from 'react';
import { api } from '@/api/client';
import PageHeader from '@/components/PageHeader';
import { leerConfig, guardarConfig } from '@/lib/config';
import { Check, Plus, Minus, Trash2 } from 'lucide-react';

export default function Configuracion() {
  const inicial = leerConfig();
  const [jornadas, setJornadas] = useState(inicial.jornadas);
  const [equipos, setEquipos] = useState(inicial.equipos);
  const [guardado, setGuardado] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);
  const [borrando, setBorrando] = useState(false);

  const cambiar = (i, valor) => {
    setGuardado(false);
    setEquipos((prev) => prev.map((eq, idx) => (idx === i ? valor : eq)));
  };

  const guardar = () => {
    guardarConfig({
      jornadas,
      equipos: equipos.map((eq, i) => eq.trim() || `Equipo ${i + 1}`),
    });
    setGuardado(true);
  };

  const borrarHistorial = async () => {
    setBorrando(true);
    await api.deleteHistory();
    setBorrando(false);
    setConfirmarBorrado(false);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-[radial-gradient(circle_at_50%_-10%,#1268b8_0%,#073c72_35%,#031f3b_75%,#00101f_100%)] px-5 pb-12 pt-6">
      <PageHeader title="Configuración" subtitle="Valores por defecto de las partidas" />

      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200/80">
                Jornadas por partida
              </p>
              <p className="mt-0.5 text-xs text-sky-200/60">El documento define 6 jornadas</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setJornadas((j) => Math.max(1, j - 1));
                  setGuardado(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
                aria-label="Menos jornadas"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-heading text-2xl text-amber-300">{jornadas}</span>
              <button
                onClick={() => {
                  setJornadas((j) => Math.min(12, j + 1));
                  setGuardado(false);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
                aria-label="Más jornadas"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200/80">
            Equipos por defecto
          </p>
          <div className="space-y-2">
            {equipos.map((eq, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300/15 font-heading text-sm text-amber-300">
                  {i + 1}
                </span>
                <input
                  value={eq}
                  onChange={(e) => cambiar(i, e.target.value)}
                  className="flex-1 rounded-xl border border-white/10 bg-[#04213c] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300/60"
                />
                <button
                  onClick={() => {
                    setEquipos((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)));
                    setGuardado(false);
                  }}
                  disabled={equipos.length <= 2}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-rose-300/80 disabled:opacity-30"
                  aria-label="Quitar equipo"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setEquipos((prev) =>
                prev.length >= 4 ? prev : [...prev, `Equipo ${prev.length + 1}`]
              );
              setGuardado(false);
            }}
            disabled={equipos.length >= 4}
            className="mt-3 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Añadir equipo
          </button>
        </div>

        <button
          onClick={guardar}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 py-3.5 font-heading text-sm font-semibold text-[#03213e] active:scale-[0.99]"
        >
          {guardado ? <Check className="h-4 w-4" /> : null}
          {guardado ? 'Guardado' : 'Guardar configuración'}
        </button>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200/80">Reglas del juego</p>
          <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-sky-100/70">
            <li>· De 2 a 4 equipos, cada uno con nombre de carrera.</li>
            <li>· En cada jornada el capitán lanza un dado de seis caras.</li>
            <li>· Ajuste de suerte: Iₜ = D − 4 (de −3 a +2).</li>
            <li>· Puntaje base: Tₜ = 20 + 2t, puntaje final Yₜ = Tₜ + Iₜ.</li>
            <li>· Gana el equipo con más puntos acumulados.</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-rose-400/20 bg-rose-500/[0.06] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-rose-200/80">Zona de riesgo</p>
          <p className="mt-1 text-[12px] leading-relaxed text-rose-100/60">
            Borra todas las partidas y tiradas registradas. El estimador empezará de cero.
          </p>
          {confirmarBorrado ? (
            <div className="mt-3 flex gap-2">
              <button
                onClick={borrarHistorial}
                disabled={borrando}
                className="flex-1 rounded-xl bg-rose-500 py-2.5 font-heading text-sm font-semibold text-white disabled:opacity-60"
              >
                {borrando ? 'Borrando…' : 'Sí, borrar todo'}
              </button>
              <button
                onClick={() => setConfirmarBorrado(false)}
                className="flex-1 rounded-xl bg-white/10 py-2.5 font-heading text-sm font-semibold text-white"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmarBorrado(true)}
              className="mt-3 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-rose-200"
            >
              <Trash2 className="h-3.5 w-3.5" /> Borrar historial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}