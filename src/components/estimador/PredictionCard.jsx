import Dice from '@/components/Dice';

export default function PredictionCard({ mejor, candidatos, caras1, caras2, total, esperada }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-amber-300/40 bg-gradient-to-b from-[#0d4a83] to-[#04213c] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="text-center">
              <Dice value={caras1.cara} size={52} />
              <p className="mt-1 text-sm font-bold text-sky-100/80">
                {(caras1.probabilidad * 100).toFixed(0)}%
              </p>
            </div>
            <span className="font-heading text-lg text-white/40">+</span>
            <div className="text-center">
              <Dice value={caras2.cara} size={52} />
              <p className="mt-1 text-sm font-bold text-sky-100/80">
                {(caras2.probabilidad * 100).toFixed(0)}%
              </p>
            </div>
          </div>
          <p className="mt-1 text-center font-mono text-sm font-bold text-amber-200">
            {caras1.cara} + {caras2.cara} = {caras1.cara + caras2.cara}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold uppercase tracking-[0.1em] text-amber-100">
            Favorito estadístico
          </p>
          <p className="font-heading text-5xl leading-none text-amber-300">{mejor.suma}</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {(mejor.probabilidad * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white/[0.06] px-4 py-3 text-base leading-relaxed text-sky-100/85">
        Suma esperada E[D] = {esperada.toFixed(2)} → ajuste esperado Iₜ ≈{' '}
        {(esperada - 4).toFixed(2)} · {total} tiradas
      </div>

      <div className="mt-3">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.1em] text-sky-100/75">
          Tres resultados con mayor probabilidad
        </p>
        <div className="grid grid-cols-3 gap-2">
          {candidatos.map((candidato, indice) => (
            <div
              key={candidato.suma}
              className={`rounded-xl px-2 py-2 text-center ${indice === 0 ? 'bg-amber-300/15' : 'bg-white/[0.05]'}`}
            >
              <p className={`font-heading text-lg ${indice === 0 ? 'text-amber-200' : 'text-white/85'}`}>
                {candidato.suma}
              </p>
              <p className="font-mono text-sm text-sky-100/80">
                {(candidato.probabilidad * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-sky-100/75">
        No es una certeza: incluso el favorito puede no salir. Las probabilidades combinan las sumas
        observadas con la referencia teórica de dos dados equilibrados. Caras más probables: {caras1.cara}
        {' + '}{caras2.cara}.
      </p>
    </div>
  );
}