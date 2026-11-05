import { CARAS } from '@/lib/estadistica';

function SelectorCara({ label, value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold uppercase tracking-[0.08em] text-sky-100/80">{label}</p>
      <div className="grid grid-cols-6 gap-2">
        {CARAS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`h-12 rounded-lg font-heading text-xl transition ${
              value === c
                ? 'bg-amber-300 text-[#03213e]'
                : 'bg-white/[0.08] text-sky-100/70 hover:bg-white/15'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ManualRoll({ dado1, dado2, onCambiar1, onCambiar2, onRegistrar, disabled }) {
  const suma = dado1 + dado2;

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-amber-100 sm:text-base">
        Digita tu tiro con dados físicos
      </p>
      <div className="space-y-4">
        <SelectorCara label="Dado 1" value={dado1} onChange={onCambiar1} />
        <SelectorCara label="Dado 2" value={dado2} onChange={onCambiar2} />
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-[#04213c] px-4 py-3">
        <span className="text-sm font-semibold text-sky-100/80">Suma D</span>
        <span className="font-heading text-2xl text-amber-200">{suma}</span>
        <span className="text-sm font-semibold text-sky-100/80">Ajuste Iₜ</span>
        <span className={`font-heading text-xl ${suma - 4 >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
          {suma - 4 > 0 ? `+${suma - 4}` : suma - 4}
        </span>
      </div>

      <button
        onClick={() => onRegistrar(dado1, dado2)}
        disabled={disabled}
        className="mt-4 w-full rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 py-4 font-heading text-base font-semibold text-white shadow-lg shadow-emerald-950/30 active:scale-[0.99] disabled:opacity-60"
      >
        Registrar tirada
      </button>
    </div>
  );
}