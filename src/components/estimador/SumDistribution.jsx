import { Info } from 'lucide-react';

const ESCALA = 1 / 6;

export default function SumDistribution({ dist, mejor }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <p className="mb-4 text-sm font-bold uppercase tracking-[0.12em] text-sky-100/75 sm:text-base">
        Probabilidad estimada por suma
      </p>
      <div className="space-y-3">
        {dist.map((d) => (
          <div key={d.suma} className="flex items-center gap-2.5">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-heading text-base ${
                d.suma === mejor.suma ? 'bg-amber-300 text-[#03213e]' : 'bg-white/10 text-white/80'
              }`}
            >
              {d.suma}
            </span>
            <div className="relative h-3.5 flex-1 rounded-full bg-white/10">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (d.probabilidad / ESCALA) * 100)}%` }}
              />
              <span
                className="absolute -top-0.5 bottom-0 w-px bg-white/50"
                style={{ left: `${Math.min(100, (d.teorica / ESCALA) * 100)}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right font-mono text-sm text-sky-100/85 sm:text-base">
              {(d.probabilidad * 100).toFixed(1)}%
            </span>
            <span className="w-10 shrink-0 text-right font-mono text-sm text-sky-100/70 sm:text-base">
              ×{d.conteo}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-sky-100/75">
        <Info className="mt-1 h-4 w-4 shrink-0" />
        La muesca blanca marca la probabilidad teórica; ×N indica las veces observadas. Las barras
        muestran la estimación ajustada con el historial.
      </p>
    </div>
  );
}