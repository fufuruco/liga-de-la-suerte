import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import GameSetup from '@/components/GameSetup';
import GameBoard from '@/components/GameBoard';

export default function Jugar() {
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [nueva, setNueva] = useState(false);

  useEffect(() => {
    (async () => {
      const abiertas = await base44.entities.Sesion.filter(
        { estado: 'en_curso' },
        '-created_date',
        1
      );
      setSesion(abiertas[0] || null);
      setCargando(false);
    })();
  }, []);

  const crear = async ({ nombre, jornadas, equipos }) => {
    const creada = await base44.entities.Sesion.create({ nombre, jornadas, estado: 'en_curso' });
    await base44.entities.Equipo.bulkCreate(
      equipos.map((nombreEquipo, i) => ({ sesion_id: creada.id, nombre: nombreEquipo, orden: i }))
    );
    setSesion(creada);
    setNueva(false);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl bg-[radial-gradient(circle_at_50%_-10%,#1268b8_0%,#073c72_35%,#031f3b_75%,#00101f_100%)] px-4 pb-12 pt-6 sm:px-8 lg:px-12">
      <PageHeader
        title={sesion && !nueva ? 'En juego' : 'Nueva partida'}
        subtitle={sesion && !nueva ? 'Cada equipo lanza el dado por jornada' : 'Configura equipos y jornadas'}
      />

      {cargando ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-amber-300" />
        </div>
      ) : sesion && !nueva ? (
        <>
          <GameBoard sesion={sesion} />
          <button
            onClick={() => setNueva(true)}
            className="mt-3 w-full rounded-xl py-3 text-sm font-bold uppercase tracking-[0.1em] text-sky-100/70 transition hover:text-white"
          >
            Empezar otra partida
          </button>
        </>
      ) : (
        <GameSetup onCrear={crear} />
      )}
    </div>
  );
}