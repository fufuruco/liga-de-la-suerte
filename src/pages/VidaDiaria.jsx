import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import {
  TrendingUp,
  Brain,
  ShieldAlert,
  Briefcase,
  DollarSign,
  Medal,
  Dice5,
  Sparkles,
} from 'lucide-react';

export default function VidaDiaria() {
  const [jornadaSimulada, setJornadaSimulada] = useState(6);
  const [sumaSeleccionada, setSumaSeleccionada] = useState(7);

  // Cálculos para la simulación conceptual de Tt vs It
  const baseTt = 20 + 2 * jornadaSimulada;
  const ajustePromedio = 3; // E[It] = 7 - 4 = 3
  const puntajeEsperado = baseTt + ajustePromedio;
  const porcentajeBase = Math.round((baseTt / puntajeEsperado) * 100);
  const porcentajeSuerte = 100 - porcentajeBase;

  // Matriz 6x6 de combinaciones de dados
  const caras = [1, 2, 3, 4, 5, 6];
  const combinaciones = [];
  for (let d1 = 1; d1 <= 6; d1++) {
    for (let d2 = 1; d2 <= 6; d2++) {
      combinaciones.push({ d1, d2, suma: d1 + d2 });
    }
  }

  const cantidadParaSuma = combinaciones.filter((c) => c.suma === sumaSeleccionada).length;
  const probSuma = ((cantidadParaSuma / 36) * 100).toFixed(1);

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl bg-[radial-gradient(circle_at_50%_-10%,#1268b8_0%,#073c72_35%,#031f3b_75%,#00101f_100%)] px-4 pb-16 pt-6 sm:px-8 lg:px-12">
      <PageHeader
        title="El Juego en la Vida Diaria"
        subtitle="Fundamentos estadísticos, toma de decisiones y aplicaciones reales"
      />

      {/* Hero: La Ecuación Maestra de la Vida */}
      <section className="mb-10 overflow-hidden rounded-3xl border border-amber-300/30 bg-gradient-to-b from-[#0a3f72] to-[#03203c] p-6 shadow-2xl sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="rounded-full border border-amber-300/40 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300">
            Filosofía y Matemáticas del Juego
          </span>
          <span className="text-xs text-sky-200/70">Modelo Estocástico Progresivo</span>
        </div>

        <h2 className="mt-4 font-heading text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
          ¿Por qué jugamos a «Liga de la Suerte»?
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-sky-100/85 sm:text-base">
          En la vida real, casi ningún resultado depende al 100% de nuestro esfuerzo ni al 100% de la
          suerte. Vivimos en un equilibrio constante entre <strong>lo que construimos día a día</strong> y{' '}
          <strong>las circunstancias imprevistas que nos rodean</strong>. Las matemáticas de este juego
          modelan con exactitud ese principio.
        </p>

        {/* Ecuación visual destacada */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#02182d]/80 p-5 shadow-inner">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-amber-200/70">
            La Ecuación Central
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:gap-4 font-mono text-xl sm:text-2xl font-bold">
            <span className="rounded-xl bg-purple-500/20 px-4 py-2 text-purple-300 border border-purple-400/30">
              Yₜ
            </span>
            <span className="text-white">=</span>
            <span className="rounded-xl bg-sky-500/20 px-4 py-2 text-sky-300 border border-sky-400/30">
              Tₜ (20 + 2t)
            </span>
            <span className="text-white">+</span>
            <span className="rounded-xl bg-amber-500/20 px-4 py-2 text-amber-300 border border-amber-400/30">
              Iₜ (D − 4)
            </span>
          </div>

          <div className="mt-6 grid gap-4 text-xs sm:text-sm sm:grid-cols-3">
            <div className="rounded-xl bg-purple-950/40 p-3 border border-purple-500/20">
              <strong className="block text-purple-300 font-heading">Yₜ = Tu Resultado Real</strong>
              <p className="mt-1 text-sky-100/75">
                El éxito alcanzado al final de una etapa, proyecto o año.
              </p>
            </div>
            <div className="rounded-xl bg-sky-950/40 p-3 border border-sky-500/20">
              <strong className="block text-sky-300 font-heading">Tₜ = Tu Preparación y Hábitos</strong>
              <p className="mt-1 text-sky-100/75">
                Lo que tú controlas: estudio, disciplina, tiempo invertido. Crece +2 puntos en cada jornada.
              </p>
            </div>
            <div className="rounded-xl bg-amber-950/40 p-3 border border-amber-500/20">
              <strong className="block text-amber-300 font-heading">Iₜ = La Suerte y el Entorno</strong>
              <p className="mt-1 text-sky-100/75">
                Lo que no controlas: crisis, clima, coincidencias, rachas del azar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simulador Interactivo: La Gran Lección del Tiempo vs Suerte */}
      <section className="mb-10 rounded-3xl border border-white/10 bg-[#02182d]/90 p-6 shadow-xl sm:p-8">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-300">
          <TrendingUp className="h-5 w-5" />
          Demostración Interactiva: Cómo el Tiempo Vence al Azar
        </div>
        <h3 className="mt-2 font-heading text-xl font-bold text-white sm:text-2xl">
          Avanza las jornadas y observa qué componente domina
        </h3>
        <p className="mt-2 text-sm text-sky-100/80">
          En la jornada 1, la suerte tiene mucho peso relativo. Pero a medida que avanzas en el tiempo, tu
          base de preparación acumulada pasa a dominar casi todo tu puntaje.
        </p>

        {/* Control deslizante */}
        <div className="mt-6 rounded-2xl bg-white/[0.04] p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">
              Jornada seleccionada (<span className="text-amber-300 font-bold font-mono">t = {jornadaSimulada}</span>)
            </span>
            <span className="font-mono text-sm text-sky-200">Base Tₜ = 20 + 2({jornadaSimulada}) = {baseTt} pts</span>
          </div>

          <input
            type="range"
            min="1"
            max="20"
            value={jornadaSimulada}
            onChange={(e) => setJornadaSimulada(Number(e.target.value))}
            className="mt-4 w-full accent-amber-400 cursor-pointer"
          />
          <div className="mt-1 flex justify-between text-[11px] text-sky-300/50">
            <span>Jornada 1 (Inicio)</span>
            <span>Jornada 6 (Liga)</span>
            <span>Jornada 12 (Mediano plazo)</span>
            <span>Jornada 20 (Largo plazo)</span>
          </div>

          {/* Barra de Proporción */}
          <div className="mt-6">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-sky-300">Preparación y Tiempo: {porcentajeBase}%</span>
              <span className="text-amber-300">Ajuste de Suerte Promedio: {porcentajeSuerte}%</span>
            </div>
            <div className="flex h-5 w-full overflow-hidden rounded-full border border-white/20 bg-black/40">
              <div
                style={{ width: `${porcentajeBase}%` }}
                className="bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-300"
              />
              <div
                style={{ width: `${porcentajeSuerte}%` }}
                className="bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-300"
              />
            </div>
            <p className="mt-3 text-xs text-sky-200/70 italic">
              Conclusión matemática: En la jornada 1, la base representa el 88%; en la jornada 20, la base
              sube a 60 puntos fijos y representa más del 95% del valor esperado.
              <strong> ¡La constancia minimiza el impacto de la mala suerte!</strong>
            </p>
          </div>
        </div>
      </section>

      {/* 5 Casos Reales en la Vida Cotidiana */}
      <section className="mb-12">
        <div className="mb-6 text-center">
          <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-sky-200">
            Aplicaciones Cotidianas
          </span>
          <h2 className="mt-3 font-heading text-2xl font-bold text-white sm:text-3xl">
            5 Situaciones de tu Vida donde Funciona este Modelo
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Caso 1: Finanzas e Inversiones */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#02182d]/80 p-6 shadow-xl transition hover:border-emerald-400/40">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-300">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-white">
                1. Finanzas Personales e Inversiones
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-sky-100/80">
                <strong>El ahorro programado es Tₜ:</strong> Cada mes que apartas dinero e inviertes con interés
                compuesto, tu capital base crece progresivamente.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-sky-100/80">
                <strong>La volatilidad bursátil es Iₜ:</strong> Un mes la bolsa puede caer (tiro de $D=2 \implies I_t = -2$)
                o dispararse ($D=12 \implies I_t = +8$).
              </p>
            </div>
            <div className="mt-4 rounded-xl bg-white/[0.04] p-3 text-xs text-emerald-200">
              💡 <em>Lección:</em> Un inversionista disciplinado no teme a una mala tirada de mercado porque su base acumulada crece mes a mes.
            </div>
          </div>

          {/* Caso 2: Carrera y Empleo */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#02182d]/80 p-6 shadow-xl transition hover:border-sky-400/40">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/20 text-sky-300">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-white">
                2. Carrera Profesional y Emprendimiento
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-sky-100/80">
                <strong>Tu currículum y habilidades son Tₜ:</strong> Aprender idiomas, dominar herramientas de software
                y certificarte aumentan tu valor de base ($20 + 2t$).
              </p>
              <p className="mt-2 text-xs leading-relaxed text-sky-100/80">
                <strong>Una entrevista fortuita es Iₜ:</strong> Que el reclutador esté de buen humor o que conozcas
                a alguien en un evento de networking es suerte.
              </p>
            </div>
            <div className="mt-4 rounded-xl bg-white/[0.04] p-3 text-xs text-sky-200">
              💡 <em>Lección:</em> La suerte ($I_t$) te abre la puerta, pero tu habilidad acumulada ($T_t$) es lo que te mantiene en el puesto.
            </div>
          </div>

          {/* Caso 3: Deportes y Competición */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#02182d]/80 p-6 shadow-xl transition hover:border-amber-400/40">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-300">
                <Medal className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-white">
                3. Deportes y Ligas Profesionales
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-sky-100/80">
                <strong>El entrenamiento y la táctica son Tₜ:</strong> Un equipo que entrena a diario construye una
                ventaja sólida y duradera.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-sky-100/80">
                <strong>El rebote del balón o el árbitro es Iₜ:</strong> En un partido aislado de 90 minutos, un equipo
                modesto puede ganar por un penal afortunado.
              </p>
            </div>
            <div className="mt-4 rounded-xl bg-white/[0.04] p-3 text-xs text-amber-200">
              💡 <em>Lección:</em> En torneos largos de 38 jornadas, el azar se cancela (Ī ≈ 3) y campeona el equipo más consistente.
            </div>
          </div>

          {/* Caso 4: Seguros y Riesgos */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#02182d]/80 p-6 shadow-xl transition hover:border-rose-400/40">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-400/20 text-rose-300">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-white">
                4. Seguros y Gestión de Riesgos
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-sky-100/80">
                <strong>Esperanza matemática:</strong> ¿Por qué el ajuste resta 4 ($I_t = D - 4$)? Porque el valor esperado
                de dos dados es 7. En promedio el jugador gana $7 - 4 = +3$ puntos.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-sky-100/80">
                <strong>Desviación ($\sigma \approx 2.42$):</strong> Las aseguradoras cobran una prima para protegerse
                del peor caso ($D=2 \implies I_t = -2$).
              </p>
            </div>
            <div className="mt-4 rounded-xl bg-white/[0.04] p-3 text-xs text-rose-200">
              💡 <em>Lección:</em> Conocer la probabilidad de eventos extremos te permite protegerte antes de que ocurran.
            </div>
          </div>

          {/* Caso 5: Sesgos Cognitivos */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-[#02182d]/80 p-6 shadow-xl transition hover:border-purple-400/40 md:col-span-2 lg:col-span-2">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-400/20 text-purple-300">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-heading text-lg font-bold text-white">
                5. Toma de Decisiones y la «Falacia del Apostador»
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-sky-100/80">
                Muchos jugadores creen erróneamente: <em>«Como saqué 2 y 3 en las dos últimas rondas, en la siguiente
                por fuerza tiene que salir un 11 o 12 para compensar»</em>.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-sky-100/80">
                En estadística, <strong>cada tirada de dos dados es un evento estocástico independiente</strong>. Los dados
                no tienen memoria ni rencor. La probabilidad de obtener 7 en el siguiente tiro sigue siendo exactamente
                $6/36 = 16.7\%$, sin importar lo que haya salido antes.
              </p>
            </div>
            <div className="mt-4 rounded-xl bg-white/[0.04] p-3 text-xs text-purple-200">
              💡 <em>Lección:</em> Entender la independencia de eventos evita caer en estafas de apuestas, inversiones fraudulentas y decisiones emocionales basadas en corazonadas.
            </div>
          </div>
        </div>
      </section>

      {/* Espacio Muestral Interactivo: Matriz 6x6 */}
      <section className="mb-10 rounded-3xl border border-white/10 bg-[#02182d]/90 p-6 shadow-xl sm:p-8">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-300">
          <Dice5 className="h-5 w-5" />
          Espacio Muestral de Dos Dados (36 Combinaciones)
        </div>
        <h3 className="mt-2 font-heading text-xl font-bold text-white sm:text-2xl">
          ¿Por qué el 7 es el número más frecuente?
        </h3>
        <p className="mt-2 text-sm text-sky-100/80">
          Haz clic en cualquier suma (2 a 12) para ver cuántas combinaciones la forman en la matriz y cuál es su
          probabilidad teórica exacta:
        </p>

        {/* Selector de suma */}
        <div className="mt-5 flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((s) => (
            <button
              key={s}
              onClick={() => setSumaSeleccionada(s)}
              className={`rounded-xl px-3 py-2 font-mono text-xs sm:text-sm font-bold transition ${
                sumaSeleccionada === s
                  ? 'bg-amber-300 text-[#03213e] shadow-lg shadow-amber-400/30'
                  : 'bg-white/5 text-sky-200 hover:bg-white/10'
              }`}
            >
              D = {s}
            </button>
          ))}
        </div>

        {/* Detalle de la suma seleccionada */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-amber-400/10 border border-amber-300/20 p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-200">
              Suma seleccionada: D = {sumaSeleccionada}
            </p>
            <p className="text-sm font-semibold text-white">
              Ajuste de Suerte: <span className="font-mono text-amber-300">Iₜ = {sumaSeleccionada} − 4 = {sumaSeleccionada - 4 > 0 ? `+${sumaSeleccionada - 4}` : sumaSeleccionada - 4}</span>
            </p>
          </div>
          <div className="text-right font-mono">
            <span className="text-lg font-bold text-white">{cantidadParaSuma} de 36 combinaciones</span>
            <p className="text-xs text-amber-300 font-bold">Probabilidad: {probSuma}%</p>
          </div>
        </div>

        {/* Matriz 6x6 */}
        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[340px] max-w-md mx-auto">
            <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-xs">
              {/* Esquina vacía */}
              <div className="p-2 font-bold text-amber-300">d₁ \ d₂</div>
              {caras.map((c) => (
                <div key={c} className="p-2 font-bold text-sky-200 bg-sky-950/60 rounded-lg">
                  {c}
                </div>
              ))}

              {caras.map((d1) => (
                <>
                  <div key={`d1-${d1}`} className="p-2 font-bold text-sky-200 bg-sky-950/60 rounded-lg">
                    {d1}
                  </div>
                  {caras.map((d2) => {
                    const suma = d1 + d2;
                    const esSeleccionado = suma === sumaSeleccionada;
                    return (
                      <div
                        key={`cell-${d1}-${d2}`}
                        onClick={() => setSumaSeleccionada(suma)}
                        className={`cursor-pointer rounded-lg p-2 font-bold transition ${
                          esSeleccionado
                            ? 'bg-amber-400 text-[#03213e] scale-105 shadow-md shadow-amber-400/40 ring-2 ring-white'
                            : 'bg-white/[0.04] text-white hover:bg-white/10'
                        }`}
                        title={`Dado 1: ${d1}, Dado 2: ${d2} -> Suma: ${suma}`}
                      >
                        {suma}
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Frase de Cierre */}
      <div className="rounded-3xl border border-sky-400/30 bg-gradient-to-r from-[#073663] to-[#04213d] p-6 text-center shadow-xl">
        <Sparkles className="mx-auto h-8 w-8 text-amber-300" />
        <p className="mt-3 font-heading text-lg font-semibold text-white sm:text-xl">
          «El azar reparte las cartas, pero nosotros jugamos la partida.»
        </p>
        <p className="mt-1 text-xs text-sky-200/70">
          En Liga de la Suerte y en la vida, trabaja en tu base ($T_t$) todos los días para que ninguna racha
          del azar ($I_t$) te desvíe de tu meta.
        </p>
      </div>
    </div>
  );
}
