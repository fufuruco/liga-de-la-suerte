export default function SumDataTable({ dist, total }) {
  const ejemplo = dist.reduce((mejor, fila) =>
    fila.probabilidad > mejor.probabilidad ? fila : mejor
  );
  const numerador = ejemplo.conteo + 6 * ejemplo.teorica;

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#02182d]/70">
      <div className="border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-amber-200/90 sm:text-base">
          Datos y cálculo por suma
        </h2>
        <p className="mt-1 text-sm text-sky-200/70">
          {total} lanzamientos registrados · prior teórico: 6 lanzamientos
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-right text-lg">
          <thead className="bg-white/[0.04] text-sm uppercase tracking-[0.04em] text-sky-100/90 sm:text-base">
            <tr>
              <th scope="col" className="px-4 py-4 text-left">Suma</th>
              <th scope="col" className="px-3 py-4">Veces</th>
              <th scope="col" className="px-3 py-4">Observada</th>
              <th scope="col" className="px-3 py-4">Teórica</th>
              <th scope="col" className="px-4 py-4 text-amber-200">Estimada</th>
            </tr>
          </thead>
          <tbody>
            {dist.map((fila) => (
              <tr key={fila.suma} className="border-t border-white/[0.06] text-lg text-sky-100/95">
                <th scope="row" className="px-4 py-4 text-left font-semibold text-white">{fila.suma}</th>
                <td className="px-3 py-4 font-mono">{fila.conteo}</td>
                <td className="px-3 py-4 font-mono">{(fila.observada * 100).toFixed(1)}%</td>
                <td className="px-3 py-4 font-mono text-sky-100/80">{(fila.teorica * 100).toFixed(1)}%</td>
                <td className="px-4 py-4 font-mono text-lg font-bold text-amber-200">{(fila.probabilidad * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-white/10 bg-amber-300/[0.06] px-4 py-3">
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-amber-200 sm:text-base">
          Ejemplo con la suma {ejemplo.suma}
        </p>
        <p className="mt-2 font-mono text-lg leading-relaxed text-white sm:text-xl">
          ({ejemplo.conteo} + 6 × {(ejemplo.teorica * 100).toFixed(1)}%) / ({total} + 6)
          {' = '}{(numerador / (total + 6) * 100).toFixed(1)}%
        </p>
        <p className="mt-2 text-base leading-relaxed text-sky-100/85">
          {ejemplo.suma} salió {ejemplo.conteo} veces; se combina ese conteo con su probabilidad teórica y el prior de 6 tiros.
        </p>
      </div>
      <p className="border-t border-white/10 px-4 py-3 text-base leading-relaxed text-sky-100/85">
        Observada = veces de la suma / lanzamientos. Estimada = (veces + 6 × probabilidad teórica) / (lanzamientos + 6).
      </p>
    </div>
  );
}
