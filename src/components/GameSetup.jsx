import { useState } from 'react';
import { Plus, Minus, Play } from 'lucide-react';
import { leerConfig, EQUIPOS_POR_DEFECTO } from '@/lib/config';

export default function GameSetup({ onCrear }) {
  const cfg = leerConfig();
  const [nombre, setNombre] = useState('Liga de la Suerte');
  const [jornadas, setJornadas] = useState(cfg.jornadas);
  const [equipos, setEquipos] = useState(cfg.equipos);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (i, valor) =>
    setEquipos((prev) => prev.map((eq, idx) => (idx === i ? valor : eq)));

  const agregar = () =>
    setEquipos((prev) =>
      prev.length >= 4
        ? prev
        : [...prev, EQUIPOS_POR_DEFECTO[prev.length] || `Equipo ${prev.length + 1}`]
    );

  const quitar = (i) =>
    setEquipos((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)));

  const enviar = async (e) => {
    e.preventDefault();
    setEnviando(true);
    await onCrear({
      nombre: nombre.trim() || 'Liga de la Suerte',
      jornadas,
      equipos: equipos.map((eq, i) => eq.trim() || `Equipo ${i + 1}`),
    });
  };

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
        <label className="text-sm font-bold uppercase tracking-[0.1em] text-amber-100">
          Nombre de la partida
        </label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-[#04213c] px-4 py-3 font-heading text-base text-white outline-none focus:border-amber-300/60"
          placeholder="Liga de la Suerte"
        />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
        <div className="flex items-center justify-between">
          <div>
              <p className="text-sm font-bold uppercase tracking-[0.1em] text-amber-100">Jornadas</p>
              <p className="mt-1 text-sm text-sky-100/75">Cada equipo lanza una vez por jornada</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setJornadas((j) => Math.max(1, j - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
              aria-label="Quitar jornada"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center font-heading text-2xl text-amber-300">{jornadas}</span>
            <button
              type="button"
              onClick={() => setJornadas((j) => Math.min(12, j + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
              aria-label="Agregar jornada"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold uppercase tracking-[0.1em] text-amber-100">
            Equipos ({equipos.length})
          </p>
          <button
            type="button"
            onClick={agregar}
            disabled={equipos.length >= 4}
            className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.06em] text-white disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" /> Añadir
          </button>
        </div>
        <div className="space-y-2">
          {equipos.map((eq, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-300/15 font-heading text-sm text-amber-300">
                {i + 1}
              </span>
              <input
                value={eq}
                onChange={(e) => cambiar(i, e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-[#04213c] px-3 py-3 text-base text-white outline-none focus:border-amber-300/60"
                placeholder={`Equipo ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => quitar(i)}
                disabled={equipos.length <= 2}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-rose-300/80 disabled:opacity-30"
                aria-label="Quitar equipo"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-sky-100/75">
          De 2 a 4 equipos. Puedes usar nombres de carreras: Sistemas, Civil, Industrial, Contabilidad.
        </p>
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 py-4 font-heading text-base font-semibold text-white shadow-lg shadow-emerald-950/40 transition active:scale-[0.99] disabled:opacity-60"
      >
        <Play className="h-5 w-5" fill="currentColor" />
        {enviando ? 'Preparando…' : 'Comenzar partida'}
      </button>
    </form>
  );
}