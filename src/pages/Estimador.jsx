import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import PredictionCard from '@/components/estimador/PredictionCard';
import SumDistribution from '@/components/estimador/SumDistribution';
import SumDataTable from '@/components/estimador/SumDataTable';
import {
  analisisSesgo,
  candidatosSuma,
  desviacionEstandar,
  distribucionCaras,
  distribucionSuma,
  media,
  parMasProbable,
  puntajeBase,
  sumaEsperada,
  sumaMasProbable,
} from '@/lib/estadistica';
import { AlertTriangle, CheckCircle2, Play, Sparkles, Target } from 'lucide-react';

const VENTANAS = [
  { id: 'todo', label: 'Todo' },
  { id: '30', label: 'Últ. 30' },
  { id: '10', label: 'Últ. 10' },
];

function GuiaDeUso() {
  return (
    <section className="mt-4 rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.05] p-5 sm:p-6">
      <h2 className="text-lg font-bold text-emerald-200 sm:text-xl">
        Cómo usar el pronóstico
      </h2>
      <p className="mt-2 text-base leading-relaxed text-sky-100/85">
        Registra los resultados reales en «Jugar». Luego elige si quieres analizar todo el historial,
        los últimos 30 o los últimos 10 lanzamientos y pulsa «Pronóstico». Compara el favorito con
        los otros dos candidatos y con las columnas observada, teórica y estimada de la tabla.
        El porcentaje indica una posibilidad según los datos; no garantiza el próximo resultado.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#02182d]/70 p-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-amber-200 sm:text-base">
            Ejemplo de pronóstico
          </h3>
          <p className="mt-2 text-base leading-relaxed text-sky-100/85">
            Si los dados muestran 3 y 4, la suma es <strong className="text-white">D = 3 + 4 = 7</strong>.
            Con dos dados equilibrados, hay 6 combinaciones que suman 7 entre 36 posibles:
            <strong className="text-white"> Pteórica(7) = 6/36 = 16.7%</strong>.
          </p>
          <p className="mt-3 rounded-xl bg-white/[0.05] px-3 py-3 font-mono text-sm leading-relaxed text-white sm:text-base">
            Ejemplo con 8 sietes en 36 tiros:<br />
            (8 + 6 × 0.167) / (36 + 6) ≈ 0.214 = 21.4%
          </p>
          <p className="mt-2 text-sm leading-relaxed text-sky-100/75">
            Ese 21.4% combina el historial con seis tiros teóricos de referencia. El Estimador hace
            este cálculo para cada suma, de 2 a 12, y ordena las tres más probables.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#02182d]/70 p-4">
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-amber-200 sm:text-base">
            Ejemplo de puntaje
          </h3>
          <p className="mt-2 text-base leading-relaxed text-sky-100/85">
            Si en la jornada 1 salen 3 y 4, entonces D = 7. El ajuste es
            <strong className="text-white"> I₁ = D − 4 = 3</strong>; el puntaje base es
            <strong className="text-white"> T₁ = 20 + 2(1) = 22</strong>.
          </p>
          <p className="mt-3 rounded-xl bg-white/[0.05] px-3 py-3 font-mono text-base text-white sm:text-lg">
            Y₁ = T₁ + I₁ = 22 + 3 = 25 puntos
          </p>
          <p className="mt-2 text-sm leading-relaxed text-sky-100/75">
            En la siguiente jornada aumenta la base en 2 puntos. La app acumula los puntajes de
            cada equipo y los muestra en el marcador y en Puntajes.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Estimador() {
  const [tiradas, setTiradas] = useState(null);
  const [ventana, setVentana] = useState('todo');
  const [pronostico, setPronostico] = useState(null);

  useEffect(() => {
    base44.entities.Tirada.list('-created_date', 300).then((registros) => {
      setTiradas(registros);
    });
  }, []);

  const usadas = useMemo(() => {
    if (!tiradas) return [];
    return ventana === 'todo' ? tiradas : tiradas.slice(0, Number(ventana));
  }, [tiradas, ventana]);

  const dist = useMemo(() => distribucionSuma(usadas), [usadas]);
  const mejor = useMemo(() => sumaMasProbable(dist), [dist]);
  const candidatos = useMemo(() => candidatosSuma(dist), [dist]);
  const esperada = useMemo(() => sumaEsperada(dist), [dist]);
  const dist1 = useMemo(() => distribucionCaras(usadas, 'dado1'), [usadas]);
  const dist2 = useMemo(() => distribucionCaras(usadas, 'dado2'), [usadas]);
  const par = useMemo(() => parMasProbable(dist1, dist2, mejor.suma), [dist1, dist2, mejor]);
  const caras1 = par.a;
  const caras2 = par.b;
  const ajustes = usadas.map((t) => t.ajuste);
  const sesgo = useMemo(() => analisisSesgo(usadas), [usadas]);

  if (!tiradas) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#031f3b]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-amber-300" />
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl bg-[radial-gradient(circle_at_50%_-10%,#1268b8_0%,#073c72_35%,#031f3b_75%,#00101f_100%)] px-4 pb-12 pt-6 sm:px-8 lg:px-12">
      <PageHeader title="Estimador" subtitle="¿Qué suma caerá en el próximo tiro?" />

      {tiradas.length === 0 ? (
        <>
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-8 text-center">
            <Target className="mx-auto h-10 w-10 text-amber-300/80" />
            <h2 className="mt-3 font-heading text-lg text-white">Todavía no hay historial</h2>
            <p className="mt-2 text-sm leading-relaxed text-sky-100/60">
              Por ahora se muestra la referencia teórica de dos dados equilibrados. Registra tiros
              para que la estimación empiece a reflejar tus datos.
            </p>
            <Link
              to="/jugar"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 px-5 py-3 font-heading text-sm font-semibold text-white"
            >
              <Play className="h-4 w-4" fill="currentColor" /> Jugar
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { label: 'Esperanza E[D]', value: esperada.toFixed(2) },
              { label: 'Suma favorita', value: mejor.suma },
              { label: 'Media observada', value: '—' },
              { label: 'Tiradas', value: 0 },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-sm font-bold uppercase tracking-[0.1em] text-sky-100/75">{m.label}</p>
                  <p className="mt-1 font-heading text-2xl text-white">{m.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4"><SumDistribution dist={dist} mejor={mejor} /></div>
          <SumDataTable dist={dist} total={0} />
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#02182d]/60 p-4">
              <p className="text-base font-bold uppercase tracking-[0.12em] text-amber-200">Fórmulas del resumen</p>
              <dl className="mt-4 space-y-4 font-mono text-base leading-relaxed text-sky-100/85">
                <div><dt className="font-sans text-sm font-bold text-sky-100/70">Suma observada</dt><dd>D = dado₁ + dado₂</dd></div>
                <div><dt className="font-sans text-sm font-bold text-sky-100/70">Probabilidad estimada</dt><dd className="break-words">P(D = s) = (nₛ + 6 · Pteórica(s)) / (N + 6)</dd></div>
                <div><dt className="font-sans text-sm font-bold text-sky-100/70">Esperanza de la suma</dt><dd>E[D] = Σ s · P(D = s)</dd></div>
                <div><dt className="font-sans text-sm font-bold text-sky-100/70">Ajuste y puntaje</dt><dd>Iₜ = D − 4 · · · Tₜ = 20 + 2t · · · Yₜ = Tₜ + Iₜ</dd></div>
                <div><dt className="font-sans text-sm font-bold text-sky-100/70">Desviación de ajustes</dt><dd>σ = √(Σ(Iᵢ − Ī)² / N)</dd></div>
            </dl>
              <p className="mt-4 text-sm leading-relaxed text-sky-100/75">
              Sin observaciones, la estimación coincide con la probabilidad teórica; por eso el 7
              parte como favorito, no porque el pronóstico lo fuerce.
            </p>
          </div>
            <GuiaDeUso />
        </>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
            {VENTANAS.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setVentana(v.id);
                  setPronostico(null);
                }}
                className={`rounded-lg py-2.5 text-sm font-bold uppercase tracking-[0.08em] transition ${
                  ventana === v.id ? 'bg-amber-300 text-[#03213e]' : 'text-sky-200/60'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setPronostico({ mejor, candidatos, caras1, caras2, total: usadas.length, esperada })
            }
            className="mb-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 py-4 font-heading text-base font-semibold text-[#03213e] shadow-lg shadow-amber-900/40 active:scale-[0.99]"
          >
            <Sparkles className="h-5 w-5" />
            Pronóstico
          </button>

          {pronostico ? (
            <PredictionCard
              mejor={pronostico.mejor}
              candidatos={pronostico.candidatos}
              caras1={pronostico.caras1}
              caras2={pronostico.caras2}
              total={pronostico.total}
              esperada={pronostico.esperada}
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-5 py-6 text-center text-base leading-relaxed text-sky-100/80">
              Pulsa «Pronóstico» y te digo qué suma y qué cara son las más probables en el próximo
              lanzamiento, según tu historial.
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { label: 'Media de la suma', value: media(usadas.map((t) => t.suma)).toFixed(2) },
              { label: 'Esperanza E[D]', value: esperada.toFixed(2) },
              { label: 'Media ajustes Ī', value: media(ajustes).toFixed(2) },
              { label: 'Desviación σ', value: desviacionEstandar(ajustes).toFixed(2) },
              { label: 'Suma favorita', value: mejor.suma },
              { label: 'Tiradas', value: usadas.length },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-sky-100/75">
                  {m.label}
                </p>
                <p className="mt-1 font-heading text-2xl text-white">{m.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <SumDistribution dist={dist} mejor={mejor} />
          </div>

          <SumDataTable dist={dist} total={usadas.length} />

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-start gap-2">
              {sesgo.sesgado ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
              )}
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-sky-100/75">
                  ¿Los dados están cargados?
                </p>
                <p className="mt-2 text-base leading-relaxed text-sky-100/85">{sesgo.mensaje}</p>
                {sesgo.suficiente && (
                  <p className="mt-2 font-mono text-sm text-sky-100/75">
                    χ² = {sesgo.chi2.toFixed(2)} (crítico 18.31 con 10 gl)
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-sky-100/75">
              Puntaje esperado por jornada
            </p>
            <p className="mb-4 text-base text-sky-100/75">
              Si los dados suman {mejor.suma} (lo más probable), se espera:
            </p>
            <div className="space-y-1.5">
              {[1, 2, 3, 4, 5, 6].map((t) => {
                const y = puntajeBase(t) + (mejor.suma - 4);
                return (
                  <div
                    key={t}
                    className="flex items-center justify-between rounded-xl bg-[#04213c]/70 px-4 py-3 text-base"
                  >
                    <span className="text-sky-100/85">Jornada {t}</span>
                    <span className="font-mono text-sky-100/75">Tₜ {puntajeBase(t)}</span>
                    <span className="font-heading text-lg text-amber-300">{y} pts</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-[#02182d]/60 p-4">
            <p className="text-base font-bold uppercase tracking-[0.12em] text-amber-200">
              Fórmulas del resumen
            </p>
            <dl className="mt-4 space-y-4 font-mono text-base leading-relaxed text-sky-100/85">
              <div><dt className="font-sans text-sm font-bold text-sky-100/75">Suma observada</dt><dd>D = dado₁ + dado₂</dd></div>
              <div><dt className="font-sans text-sm font-bold text-sky-100/75">Probabilidad estimada</dt><dd className="break-words">P(D = s) = (nₛ + 6 · Pteórica(s)) / (N + 6)</dd></div>
              <div><dt className="font-sans text-sm font-bold text-sky-100/75">Esperanza de la suma</dt><dd>E[D] = Σ s · P(D = s)</dd></div>
              <div><dt className="font-sans text-sm font-bold text-sky-100/75">Ajuste y puntaje</dt><dd>Iₜ = D − 4 · · · Tₜ = 20 + 2t · · · Yₜ = Tₜ + Iₜ</dd></div>
              <div><dt className="font-sans text-sm font-bold text-sky-100/75">Desviación de ajustes</dt><dd>σ = √(Σ(Iᵢ − Ī)² / N)</dd></div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-sky-100/80">
              El 6 del suavizado equivale a seis lanzamientos teóricos repartidos según dos dados
              equilibrados. Conforme aumenta el historial, los resultados registrados pesan más;
              ningún pronóstico garantiza el siguiente tiro.
            </p>
          </div>
          <GuiaDeUso />
        </>
      )}
    </div>
  );
}