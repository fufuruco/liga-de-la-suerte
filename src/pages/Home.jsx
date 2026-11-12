import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Target,
  Trophy,
  Settings,
  LogOut,
  Crown,
  Dices,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  Brain,
  Users,
} from 'lucide-react';
import Dice from '@/components/Dice';
import { api } from '@/api/client';
import PredictionCard from '@/components/estimador/PredictionCard';
import {
  caraMasProbable,
  candidatosSuma,
  distribucionCaras,
  distribucionSuma,
  sumaEsperada,
  sumaMasProbable,
} from '@/lib/estadistica';

export default function Home() {
  const [bye, setBye] = useState(false);
  const [pronostico, setPronostico] = useState(null);
  const [calculando, setCalculando] = useState(false);

  const consultarPronostico = async () => {
    if (calculando) return;
    setCalculando(true);
    const tiradas = await api.listRolls(300);
    const dist = distribucionSuma(tiradas);
    setPronostico({
      mejor: sumaMasProbable(dist),
      candidatos: candidatosSuma(dist),
      esperada: sumaEsperada(dist),
      caras1: caraMasProbable(distribucionCaras(tiradas, 'dado1')),
      caras2: caraMasProbable(distribucionCaras(tiradas, 'dado2')),
      total: tiradas.length,
    });
    setCalculando(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_50%_-10%,#1268b8_0%,#073c72_35%,#031f3b_70%,#00101f_100%)]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:repeating-conic-gradient(from_0deg_at_50%_20%,#ffffff_0deg_6deg,transparent_6deg_12deg)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-10 pt-6 sm:px-8 lg:px-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-200/70">
            <Crown className="h-4 w-4 text-amber-300" />
            Liga de la Suerte
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/configuracion"
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-sky-200/80 transition hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-3.5 w-3.5" />
              Configuración
            </Link>
            <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200">
              6 jornadas
            </span>
          </div>
        </div>

        {/* Banner Destacado de Integrantes del Grupo */}
        <section aria-label="Integrantes del Grupo" className="mb-6 rounded-3xl border border-white/15 bg-gradient-to-r from-[#031d38]/95 via-[#062c52]/95 to-[#031d38]/95 p-4 sm:p-5 shadow-2xl backdrop-blur-md">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
                <Users className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Integrantes del Equipo
              </span>
            </div>
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              Proyecto de Estadística
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Elvin Sharon Centeno Gonzalez (Verde Esmeralda) */}
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-emerald-950/50 to-[#021b33] p-3 shadow-md shadow-emerald-950/30 transition hover:border-emerald-300 hover:scale-[1.02]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-400/20 font-heading text-sm font-bold text-emerald-300 border border-emerald-400/30">
                1
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-emerald-300 sm:text-base">
                  Elvin Sharon
                </p>
                <p className="truncate text-xs font-semibold text-emerald-100/90">
                  Centeno Gonzalez
                </p>
              </div>
            </div>

            {/* Jorge Alberto Pereira Hernandez (Rojo Vibrante) */}
            <div className="flex items-center gap-3 rounded-2xl border border-rose-400/40 bg-gradient-to-br from-rose-950/50 to-[#021b33] p-3 shadow-md shadow-rose-950/30 transition hover:border-rose-300 hover:scale-[1.02]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-400/20 font-heading text-sm font-bold text-rose-300 border border-rose-400/30">
                2
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-rose-300 sm:text-base">
                  Jorge Alberto
                </p>
                <p className="truncate text-xs font-semibold text-rose-100/90">
                  Pereira Hernandez
                </p>
              </div>
            </div>

            {/* Julio Emilio Guadamuz Medrano (Verde Menta) */}
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/40 bg-gradient-to-br from-teal-950/50 to-[#021b33] p-3 shadow-md shadow-emerald-950/30 transition hover:border-emerald-300 hover:scale-[1.02]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-400/20 font-heading text-sm font-bold text-emerald-300 border border-emerald-400/30">
                3
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-emerald-300 sm:text-base">
                  Julio Emilio
                </p>
                <p className="truncate text-xs font-semibold text-emerald-100/90">
                  Guadamuz Medrano
                </p>
              </div>
            </div>

            {/* Oswaldo Emilio Martinez Rivera (Rojo Rubí) */}
            <div className="flex items-center gap-3 rounded-2xl border border-rose-400/40 bg-gradient-to-br from-red-950/50 to-[#021b33] p-3 shadow-md shadow-rose-950/30 transition hover:border-rose-300 hover:scale-[1.02]">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-400/20 font-heading text-sm font-bold text-rose-300 border border-rose-400/30">
                4
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-rose-300 sm:text-base">
                  Oswaldo Emilio
                </p>
                <p className="truncate text-xs font-semibold text-rose-100/90">
                  Martinez Rivera
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(22rem,0.9fr)] lg:items-start">
          <div className="min-w-0">
            <div className="relative flex h-[240px] items-center justify-center gap-1 overflow-hidden rounded-[1.75rem] border border-amber-300/40 bg-[radial-gradient(circle_at_50%_30%,#195a8a_0%,#07345d_56%,#03213e_100%)] p-3 shadow-[0_30px_70px_-28px_rgba(0,0,0,0.95)] sm:h-[268px] sm:gap-8 sm:p-6 lg:h-[420px] lg:gap-12">
              <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:repeating-conic-gradient(from_0deg_at_50%_20%,#ffffff_0deg_5deg,transparent_5deg_10deg)]" />
              <Dice value={3} size={116} className="relative h-14 w-14 rotate-[-12deg] sm:h-28 sm:w-28 lg:h-36 lg:w-36" />
              <div className="relative shrink-0 text-center">
                <Dices className="mx-auto h-7 w-7 text-amber-200 sm:h-8 sm:w-8" />
                <p className="mt-2 font-heading text-xl font-bold text-white sm:text-2xl">¡A jugar!</p>
                <p className="text-xs text-sky-100/70 sm:text-sm">Suerte y estadística</p>
              </div>
              <Dice value={4} size={116} className="relative h-14 w-14 rotate-[10deg] sm:h-28 sm:w-28 lg:h-36 lg:w-36" />
            </div>

            <p className="mt-5 max-w-2xl text-center text-sm leading-relaxed text-sky-100/70 lg:text-left">
              Herramienta educativa de registro de datos por ronda, calculadora estadística y modelado probabilístico de dos dados.
            </p>
          </div>

          <div className="min-w-0">
            <div className="space-y-3">
              {/* Botón Principal: Jugar */}
              <Link
                to="/jugar"
                className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 px-5 py-4 text-left shadow-lg shadow-emerald-950/50 transition active:scale-[0.985]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Play className="h-5 w-5 text-white" fill="currentColor" />
                </span>
                <span className="flex-1">
                  <span className="block font-heading text-lg font-semibold text-white">Jugar Partida</span>
                  <span className="block text-xs font-semibold text-emerald-50/80">Partida interactiva por jornadas</span>
                </span>
                <ArrowRight className="h-5 w-5 text-white/80 transition group-hover:translate-x-0.5" />
              </Link>

              {/* Botón Destacado: Hoja Excel y Fórmulas */}
              <Link
                to="/hoja-calculo"
                className="group flex items-center gap-4 rounded-2xl border border-amber-300/40 bg-gradient-to-br from-[#073867] to-[#04203b] px-5 py-4 text-left shadow-lg shadow-black/40 transition hover:border-amber-300 hover:bg-[#094175] active:scale-[0.985]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
                  <FileSpreadsheet className="h-6 w-6" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 font-heading text-lg font-semibold text-white">
                    Hoja de Registro (Excel)
                    <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                      NUEVO
                    </span>
                  </span>
                  <span className="block text-xs font-semibold text-sky-200/70">
                    Planilla interactiva, fórmulas en vivo y exportar CSV/XLS
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 text-amber-300/80 transition group-hover:translate-x-0.5" />
              </Link>

              {/* Botón Destacado: El Juego en la Vida Real */}
              <Link
                to="/vida-diaria"
                className="group flex items-center gap-4 rounded-2xl border border-sky-400/30 bg-gradient-to-br from-[#073663] to-[#031d36] px-5 py-4 text-left shadow-lg shadow-black/40 transition hover:border-sky-300 hover:bg-[#0a4278] active:scale-[0.985]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-400/20 text-sky-300">
                  <Brain className="h-6 w-6" />
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 font-heading text-lg font-semibold text-white">
                    El Juego en la Vida Diaria
                    <span className="rounded-md bg-sky-400/20 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                      CASOS
                    </span>
                  </span>
                  <span className="block text-xs font-semibold text-sky-200/70">
                    Finanzas, carrera, deportes y toma de decisiones
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 text-sky-300/80 transition group-hover:translate-x-0.5" />
              </Link>

              {/* Fila de 2 Columnas: Estimador y Puntajes */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/estimador"
                  className="flex flex-col gap-2 rounded-2xl border border-sky-300/20 bg-[#05284b] p-4 text-left shadow-lg transition hover:bg-[#07335e] active:scale-[0.985]"
                >
                  <Target className="h-5 w-5 text-sky-300" />
                  <span>
                    <span className="block font-heading text-sm font-semibold text-white">
                      Estimador
                    </span>
                    <span className="block text-[11px] font-semibold text-sky-200/60">
                      Pronóstico bayesiano
                    </span>
                  </span>
                </Link>

                <Link
                  to="/puntajes"
                  className="flex flex-col gap-2 rounded-2xl border border-fuchsia-400/20 bg-[#05284b] p-4 text-left shadow-lg transition hover:bg-[#07335e] active:scale-[0.985]"
                >
                  <Trophy className="h-5 w-5 text-amber-300" />
                  <span>
                    <span className="block font-heading text-sm font-semibold text-white">
                      Puntajes
                    </span>
                    <span className="block text-[11px] font-semibold text-sky-200/60">
                      Tabla de posiciones
                    </span>
                  </span>
                </Link>
              </div>
            </div>

            <button
              onClick={consultarPronostico}
              disabled={calculando}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 py-3.5 font-heading text-base font-semibold text-[#03213e] shadow-lg shadow-amber-900/40 active:scale-[0.99] disabled:opacity-60"
            >
              <Sparkles className="h-5 w-5" />
              {calculando ? 'Calculando…' : 'Pronóstico de la nueva tirada'}
            </button>

            {pronostico && (
              <div className="mt-3">
                <PredictionCard {...pronostico} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-amber-200/80">
            <span className="flex items-center gap-2">
              <Dices className="h-4 w-4" />
              Fórmulas Estadísticas Fundamentales
            </span>
            <Link to="/vida-diaria" className="text-[11px] text-sky-300 hover:underline">
              Ver explicación completa →
            </Link>
          </div>
          <dl className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-[#042544]/70 px-2 py-3">
              <dt className="font-mono text-[11px] text-sky-200/60">Tₜ</dt>
              <dd className="mt-1 font-heading text-sm text-white">20 + 2t</dd>
              <dd className="mt-0.5 text-[10px] font-semibold text-sky-200/50">Base de Jornada</dd>
            </div>
            <div className="rounded-xl bg-[#042544]/70 px-2 py-3">
              <dt className="font-mono text-[11px] text-sky-200/60">Iₜ</dt>
              <dd className="mt-1 font-heading text-sm text-white">D − 4</dd>
              <dd className="mt-0.5 text-[10px] font-semibold text-sky-200/50">Ajuste de Suerte</dd>
            </div>
            <div className="rounded-xl bg-[#042544]/70 px-2 py-3">
              <dt className="font-mono text-[11px] text-sky-200/60">Yₜ</dt>
              <dd className="mt-1 font-heading text-sm text-white">Tₜ + Iₜ</dd>
              <dd className="mt-0.5 text-[10px] font-semibold text-sky-200/50">Puntaje Final</dd>
            </div>
          </dl>
        </div>

        <button
          onClick={() => setBye(true)}
          className="mt-6 flex items-center justify-center gap-2 self-center rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-rose-200/60 transition hover:text-rose-200"
        >
          <LogOut className="h-3.5 w-3.5" />
          Salir
        </button>
      </div>

      {bye && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00101f]/90 px-6 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-3xl border border-amber-300/30 bg-[#04294f] p-7 text-center shadow-2xl">
            <Crown className="mx-auto h-10 w-10 text-amber-300" />
            <h2 className="mt-3 font-heading text-xl text-white">¡Gracias por jugar!</h2>
            <p className="mt-2 text-sm text-sky-100/70">
              Tu historial de tiradas queda guardado para la próxima partida.
            </p>
            <button
              onClick={() => setBye(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 py-3 font-heading text-sm font-semibold text-[#03213e]"
            >
              Volver al menú
            </button>
          </div>
        </div>
      )}
    </div>
  );
}