import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/client';
import Dice from '@/components/Dice';
import PageHeader from '@/components/PageHeader';
import ManualRoll from '@/components/ManualRoll';
import { COLORES_EQUIPO, puntajeBase } from '@/lib/estadistica';
import { ArrowRight, Flag, Sparkles, Dices, PencilLine } from 'lucide-react';

export default function GameBoard({ sesion }) {
  const navigate = useNavigate();
  const [equipos, setEquipos] = useState([]);
  const [tiradas, setTiradas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cara1, setCara1] = useState(1);
  const [cara2, setCara2] = useState(1);
  const [girando, setGirando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [ultima, setUltima] = useState(null);
  const [modo, setModo] = useState('digital');

  useEffect(() => {
    (async () => {
      const [eq, ti] = await Promise.all([
        api.listTeams(sesion.id),
        api.listSessionRolls(sesion.id, 200),
      ]);
      setEquipos(eq);
      setTiradas(ti);
      setCargando(false);
    })();
  }, [sesion.id]);

  const totalTiros = sesion.jornadas * (equipos.length || 1);
  const terminado = tiradas.length >= totalTiros && equipos.length > 0;
  const indice = tiradas.length;
  const equipoActual = equipos[indice % (equipos.length || 1)];
  const jornadaActual = Math.min(
    sesion.jornadas,
    Math.floor(indice / (equipos.length || 1)) + 1
  );

  const totales = useMemo(() => {
    const mapa = {};
    tiradas.forEach((t) => {
      mapa[t.equipo_id] = (mapa[t.equipo_id] || 0) + t.puntaje_final;
    });
    return mapa;
  }, [tiradas]);

  const registrar = async (dado1, dado2, manual) => {
    if (!equipoActual) return;
    setGuardando(true);
    const creada = await api.createRoll(sesion.id, {
      equipo_id: equipoActual.id,
      jornada: jornadaActual,
      dado1,
      dado2,
      manual: Boolean(manual),
    });
    setTiradas((prev) => [...prev, creada]);
    setUltima(creada);
    setGuardando(false);
  };

  const lanzar = async () => {
    if (girando || guardando || terminado || !equipoActual) return;
    setGirando(true);
    setUltima(null);
    const intervalo = setInterval(() => {
      setCara1(1 + Math.floor(Math.random() * 6));
      setCara2(1 + Math.floor(Math.random() * 6));
    }, 80);
    await new Promise((r) => setTimeout(r, 850));
    clearInterval(intervalo);

    const d1 = 1 + Math.floor(Math.random() * 6);
    const d2 = 1 + Math.floor(Math.random() * 6);
    setCara1(d1);
    setCara2(d2);
    setGirando(false);
    await registrar(d1, d2, false);
  };

  const finalizar = async () => {
    const ranking = equipos
      .map((eq) => ({ nombre: eq.nombre, total: totales[eq.id] || 0 }))
      .sort((a, b) => b.total - a.total);
    await api.updateSession(sesion.id, {
      estado: 'finalizada',
      campeon: ranking[0]?.nombre || '',
    });
    navigate(`/resultado/${sesion.id}`);
  };

  if (cargando) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-amber-300" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={sesion.nombre}
        subtitle={terminado ? 'Ronda completada' : `Jornada ${jornadaActual} de ${sesion.jornadas}`}
      />

      <div className="mb-5">
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500 transition-all duration-500"
            style={{ width: `${Math.min(100, (tiradas.length / totalTiros) * 100)}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-sm font-bold uppercase tracking-[0.08em] text-sky-100/80 sm:text-base">
          <span>{tiradas.length} de {totalTiros} tiros</span>
          <span>Tₜ = {puntajeBase(jornadaActual)}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-sky-100/75">Turno de</p>
            <p className="truncate font-heading text-2xl font-semibold text-white sm:text-3xl">
              {terminado ? 'Todos los turnos jugados' : equipoActual?.nombre}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.08em] text-amber-100 sm:text-base">
            Jornada {jornadaActual}
          </span>
        </div>

        {!terminado && (
          <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-white/[0.06] p-1">
            <button
              onClick={() => setModo('digital')}
              className={`flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold uppercase tracking-[0.06em] transition sm:text-base ${
                modo === 'digital' ? 'bg-amber-300 text-[#03213e]' : 'text-sky-200/60'
              }`}
            >
              <Dices className="h-5 w-5" /> Digital
            </button>
            <button
              onClick={() => setModo('manual')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-bold uppercase tracking-[0.1em] transition ${
                modo === 'manual' ? 'bg-amber-300 text-[#03213e]' : 'text-sky-200/60'
              }`}
            >
              <PencilLine className="h-5 w-5" /> Dados físicos
            </button>
          </div>
        )}

        <div className="wood-tray relative flex h-60 items-center justify-center gap-6 overflow-hidden rounded-[1.75rem] sm:h-72 sm:gap-10">
          <Dice value={cara1} size={152} rolling={girando} className="sm:!h-48 sm:!w-48" />
          <Dice value={cara2} size={152} rolling={girando} className="sm:!h-48 sm:!w-48" />
          {cara1 === cara2 && !girando && (
            <span className="absolute right-3 top-3 rounded-full bg-[#03213e]/90 px-3 py-2 text-sm font-bold uppercase tracking-[0.08em] text-amber-200">
              ¡Dobles!
            </span>
          )}
        </div>

        {ultima && (
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-[#04213c] py-3">
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-sky-100/75">Suma D</p>
              <p className="font-heading text-2xl text-white">{ultima.suma}</p>
            </div>
            <div className="rounded-xl bg-[#04213c] py-3">
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-sky-100/75">Iₜ</p>
              <p className={`font-heading text-2xl ${ultima.ajuste >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {ultima.ajuste > 0 ? `+${ultima.ajuste}` : ultima.ajuste}
              </p>
            </div>
            <div className="rounded-xl bg-[#04213c] py-3">
              <p className="text-sm font-bold uppercase tracking-[0.08em] text-sky-100/75">Yₜ</p>
              <p className="font-heading text-2xl text-amber-300">{ultima.puntaje_final}</p>
            </div>
          </div>
        )}

        {terminado ? (
          <button
            onClick={finalizar}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 py-4 font-heading text-base font-semibold text-[#03213e] shadow-lg shadow-amber-900/30 active:scale-[0.99]"
          >
            <Flag className="h-5 w-5" />
            Ver resultados finales
          </button>
        ) : modo === 'digital' ? (
          <button
            onClick={lanzar}
            disabled={girando || guardando}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 py-4 font-heading text-base font-semibold text-white shadow-lg shadow-emerald-950/40 active:scale-[0.99] disabled:opacity-60"
          >
            <Sparkles className="h-5 w-5" />
            {girando ? 'Lanzando…' : 'Lanzar dados'}
          </button>
        ) : (
          <ManualRoll
            dado1={cara1}
            dado2={cara2}
            onCambiar1={setCara1}
            onCambiar2={setCara2}
            onRegistrar={(d1, d2) => registrar(d1, d2, true)}
            disabled={guardando}
          />
        )}
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <p className="mb-4 text-base font-bold uppercase tracking-[0.12em] text-sky-100/80">Marcador</p>
        <div className="space-y-3">
          {equipos.map((eq, i) => (
            <div key={eq.id} className="flex items-center gap-3">
              <span
                className="h-4 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: COLORES_EQUIPO[i % COLORES_EQUIPO.length] }}
              />
              <span className="flex-1 truncate text-base font-semibold text-white sm:text-lg">{eq.nombre}</span>
              <span className="font-heading text-lg text-amber-200 sm:text-xl">{totales[eq.id] || 0} pts</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold uppercase tracking-[0.08em] text-sky-100/75 transition hover:text-white sm:text-base"
      >
        Guardar y salir al menú <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}