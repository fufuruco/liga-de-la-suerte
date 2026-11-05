import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Target, Trophy, Settings, LogOut, Crown, Dices, ArrowRight, Sparkles } from 'lucide-react';
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

const MENU = [
  {
    to: '/jugar',
    label: 'Jugar',
    hint: 'Nueva partida por jornadas',
    icon: Play,
    tone: 'from-emerald-400 to-emerald-600 shadow-emerald-900/50',
  },
  {
    to: '/estimador',
    label: 'Estimar próximo tiro',
    hint: 'Predicción con el historial',
    icon: Target,
    tone: 'from-sky-400 to-sky-600 shadow-sky-900/50',
  },
  {
    to: '/puntajes',
    label: 'Puntajes',
    hint: 'Tabla de posiciones',
    icon: Trophy,
    tone: 'from-fuchsia-400 to-purple-600 shadow-purple-900/50',
  },
  {
    to: '/configuracion',
    label: 'Configuración',
    hint: 'Equipos, jornadas y reglas',
    icon: Settings,
    tone: 'from-slate-300 to-slate-400 shadow-slate-900/50',
  },
];

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
          <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200">
            6 jornadas
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(21rem,0.85fr)] lg:items-start">
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
              Tira los dados, registra cada jornada y descubre qué número tiene más probabilidad de salir
              en el próximo lanzamiento.
            </p>
          </div>

          <div className="min-w-0">
            <div className="space-y-3">
              <Link
                to="/jugar"
                className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 px-5 py-4 text-left shadow-lg shadow-emerald-950/50 transition active:scale-[0.985]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
                  <Play className="h-5 w-5 text-white" fill="currentColor" />
                </span>
                <span className="flex-1">
                  <span className="block font-heading text-lg font-semibold text-white">Jugar</span>
                  <span className="block text-xs font-semibold text-emerald-50/80">Nueva partida por jornadas</span>
                </span>
                <ArrowRight className="h-5 w-5 text-white/80 transition group-hover:translate-x-0.5" />
              </Link>

              <Link
                to="/estimador"
                className="group flex items-center gap-4 rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-300 to-amber-500 px-5 py-4 text-left shadow-lg shadow-amber-900/40 transition active:scale-[0.985]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#03213e]/15">
                  <Target className="h-5 w-5 text-[#03213e]" />
                </span>
                <span className="flex-1">
                  <span className="block font-heading text-lg font-semibold text-[#03213e]">Estimar próximo tiro</span>
                  <span className="block text-xs font-semibold text-[#03213e]/70">Predicción con el historial</span>
                </span>
                <ArrowRight className="h-5 w-5 text-[#03213e]/70 transition group-hover:translate-x-0.5" />
              </Link>

              <div className="grid grid-cols-2 gap-3">
                {MENU.filter((m) => m.to === '/puntajes' || m.to === '/configuracion').map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex flex-col gap-3 rounded-2xl border border-white/10 bg-gradient-to-br ${item.tone} px-4 py-4 text-left shadow-lg transition active:scale-[0.985]`}
                  >
                    <item.icon className={item.to === '/puntajes' ? 'h-5 w-5 text-white' : 'h-5 w-5 text-[#0b2740]'} />
                    <span>
                      <span className={`block font-heading text-base font-semibold ${item.to === '/puntajes' ? 'text-white' : 'text-[#0b2740]'}`}>
                        {item.label}
                      </span>
                      <span className={`block text-[11px] font-semibold ${item.to === '/puntajes' ? 'text-white/75' : 'text-[#0b2740]/70'}`}>
                        {item.hint}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <button
              onClick={consultarPronostico}
              disabled={calculando}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 py-4 font-heading text-base font-semibold text-[#03213e] shadow-lg shadow-amber-900/40 active:scale-[0.99] disabled:opacity-60"
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
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-200/80">
            <Dices className="h-4 w-4" />
            Cómo se calcula
          </div>
          <dl className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-[#042544]/70 px-2 py-3">
              <dt className="font-mono text-[11px] text-sky-200/60">Tₜ</dt>
              <dd className="mt-1 font-heading text-sm text-white">20 + 2t</dd>
              <dd className="mt-0.5 text-[10px] font-semibold text-sky-200/50">Base</dd>
            </div>
            <div className="rounded-xl bg-[#042544]/70 px-2 py-3">
              <dt className="font-mono text-[11px] text-sky-200/60">Iₜ</dt>
              <dd className="mt-1 font-heading text-sm text-white">D − 4</dd>
              <dd className="mt-0.5 text-[10px] font-semibold text-sky-200/50">Suerte</dd>
            </div>
            <div className="rounded-xl bg-[#042544]/70 px-2 py-3">
              <dt className="font-mono text-[11px] text-sky-200/60">Yₜ</dt>
              <dd className="mt-1 font-heading text-sm text-white">Tₜ + Iₜ</dd>
              <dd className="mt-0.5 text-[10px] font-semibold text-sky-200/50">Puntaje</dd>
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