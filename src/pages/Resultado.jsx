import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/api/client';
import PageHeader from '@/components/PageHeader';
import { COLORES_EQUIPO, puntajeBase, resumenEquipo } from '@/lib/estadistica';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Trophy, Target, RotateCcw, FileSpreadsheet, Download } from 'lucide-react';
import { exportarCSV, exportarXLS } from '@/utils/excelExport';

export default function Resultado() {
  const { id } = useParams();
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    (async () => {
      const [sesion, equiposPage, tiradasPage] = await Promise.all([
        api.getSession(id),
        api.listTeams(id),
        api.listSessionRolls(id, 200),
      ]);
      setDatos({
        sesion,
        equipos: equiposPage,
        tiradas: tiradasPage,
      });
    })();
  }, [id]);

  if (!datos) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#031f3b]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-amber-300" />
      </div>
    );
  }

  const { sesion, equipos, tiradas } = datos;

  const ranking = equipos
    .map((eq, i) => ({
      id: eq.id,
      nombre: eq.nombre,
      color: COLORES_EQUIPO[i % COLORES_EQUIPO.length],
      ...resumenEquipo(tiradas.filter((t) => t.equipo_id === eq.id)),
    }))
    .sort((a, b) => b.total - a.total);

  const campeon = ranking[0];

  const serie = Array.from({ length: sesion.jornadas }, (_, i) => {
    const t = i + 1;
    const fila = { jornada: `J${t}`, Tendencia: puntajeBase(t) };
    equipos.forEach((eq) => {
      const tiro = tiradas.find((x) => x.equipo_id === eq.id && x.jornada === t);
      if (tiro) fila[eq.nombre] = tiro.puntaje_final;
    });
    return fila;
  });

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl bg-[radial-gradient(circle_at_50%_-10%,#0d4c86_0%,#052f58_45%,#001428_100%)] px-4 pb-12 pt-6 sm:px-8 lg:px-12">
      <PageHeader title="Resultado final" subtitle={sesion.nombre} />

      <div className="overflow-hidden rounded-3xl border border-amber-300/30 bg-gradient-to-b from-[#0a3c6d] to-[#03203c] p-7 text-center shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)] sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-300/15 sm:h-24 sm:w-24">
          <Trophy className="h-10 w-10 text-amber-300 sm:h-12 sm:w-12" />
        </div>
        <h2 className="mt-4 font-heading text-3xl text-white sm:text-4xl">¡Felicidades!</h2>
        <p className="mt-2 text-lg font-semibold text-amber-200 sm:text-xl">{campeon?.nombre || 'Sin datos'}</p>

        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:gap-5">
          <div className="rounded-2xl bg-white/[0.06] py-4 sm:py-5">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-sky-100/75 sm:text-base">Puntaje final</p>
            <p className="font-heading text-3xl text-white sm:text-4xl">{campeon?.total ?? 0}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.06] py-4 sm:py-5">
            <p className="text-sm font-bold uppercase tracking-[0.1em] text-sky-100/75 sm:text-base">Posición</p>
            <p className="font-heading text-3xl text-amber-300 sm:text-4xl">1°</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
        <p className="mb-4 text-base font-bold uppercase tracking-[0.12em] text-sky-100/80 sm:text-lg">
          Media y desviación de los ajustes
        </p>
        <div className="space-y-3">
          {ranking.map((eq, pos) => (
            <div key={eq.id} className="rounded-2xl bg-[#04213c]/70 p-4 sm:p-5">
              <div className="flex items-center gap-2">
                <span className="w-8 text-center font-heading text-lg text-sky-100/80">{pos + 1}°</span>
                <span
                  className="h-4 w-4 rounded-full"
                  style={{ backgroundColor: eq.color }}
                />
                <span className="flex-1 truncate text-base font-semibold text-white sm:text-lg">{eq.nombre}</span>
                <span className="font-heading text-lg text-amber-200 sm:text-xl">{eq.total} pts</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 pl-10 text-sm font-semibold text-sky-100/75 sm:text-base">
                <span>Ī = {eq.mediaAjustes.toFixed(2)}</span>
                <span>σ = {eq.desviacion.toFixed(2)}</span>
                <span>n = {eq.jornadas}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-7">
        <p className="mb-2 text-base font-bold uppercase tracking-[0.12em] text-sky-100/80 sm:text-lg">
          Puntajes por jornada
        </p>
        <p className="mb-4 text-sm text-sky-100/75 sm:text-base">Línea dorada punteada: tendencia Tₜ = 20 + 2t</p>
        <div className="h-80 w-full sm:h-96">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={serie} margin={{ top: 12, right: 20, left: 8, bottom: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="jornada" tick={{ fill: 'rgba(220,238,255,0.82)', fontSize: 14 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(220,238,255,0.82)', fontSize: 14 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#04213c',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 12,
                  fontSize: 15,
                }}
                labelStyle={{ color: '#ffcc00' }}
              />
              <Legend wrapperStyle={{ fontSize: 14, color: 'rgba(220,238,255,0.82)', paddingTop: 12 }} />
              <Line
                type="monotone"
                dataKey="Tendencia"
                stroke="#ffcc00"
                strokeWidth={3}
                strokeDasharray="7 5"
                dot={false}
              />
              {equipos.map((eq, i) => (
                <Line
                  key={eq.id}
                  type="monotone"
                  dataKey={eq.nombre}
                  stroke={COLORES_EQUIPO[i % COLORES_EQUIPO.length]}
                  strokeWidth={3.5}
                  dot={{ r: 5, strokeWidth: 0, fill: COLORES_EQUIPO[i % COLORES_EQUIPO.length] }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sección de Exportación a Excel */}
      <div className="mt-6 rounded-3xl border border-amber-300/30 bg-gradient-to-r from-[#073663] to-[#04203b] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="flex items-center gap-2 font-heading text-lg font-bold text-white">
              <FileSpreadsheet className="h-5 w-5 text-amber-300" />
              Exportar Registro de Partida a Excel
            </span>
            <p className="mt-1 text-xs text-sky-200/70">
              Descarga la planilla con todas las rondas, fórmulas ($D, I_t, T_t, Y_t$) y el resumen estadístico.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const n = tiradas.length || 1;
                const sumas = tiradas.map((t) => t.suma);
                const ajustes = tiradas.map((t) => t.ajuste);
                const mediaSuma = sumas.reduce((a, b) => a + b, 0) / n;
                const mediaAjuste = ajustes.reduce((a, b) => a + b, 0) / n;
                const varianza = sumas.reduce((acc, v) => acc + (v - mediaSuma) ** 2, 0) / n;
                const estadisticas = {
                  totalTiros: n,
                  mediaSuma,
                  mediaAjuste,
                  desviacionSuma: Math.sqrt(varianza),
                  varianzaSuma: varianza,
                  mediaPuntajeFinal: tiradas.reduce((a, b) => a + b.puntaje_final, 0) / n,
                };
                exportarCSV(tiradas, estadisticas, `partida-${sesion.nombre.toLowerCase().replace(/\s+/g, '-')}.csv`);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500"
            >
              <Download className="h-4 w-4" />
              Descargar .CSV (Excel)
            </button>
            <button
              onClick={() => {
                const n = tiradas.length || 1;
                const sumas = tiradas.map((t) => t.suma);
                const ajustes = tiradas.map((t) => t.ajuste);
                const mediaSuma = sumas.reduce((a, b) => a + b, 0) / n;
                const mediaAjuste = ajustes.reduce((a, b) => a + b, 0) / n;
                const varianza = sumas.reduce((acc, v) => acc + (v - mediaSuma) ** 2, 0) / n;
                const estadisticas = {
                  totalTiros: n,
                  mediaSuma,
                  mediaAjuste,
                  desviacionSuma: Math.sqrt(varianza),
                  varianzaSuma: varianza,
                  mediaPuntajeFinal: tiradas.reduce((a, b) => a + b.puntaje_final, 0) / n,
                };
                exportarXLS(tiradas, estadisticas, `partida-${sesion.nombre.toLowerCase().replace(/\s+/g, '-')}.xls`);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-[#03213e] shadow-md transition hover:bg-amber-300"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Descargar .XLS
            </button>
            <Link
              to="/hoja-calculo"
              className="flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              Abrir en Hoja de Cálculo →
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          to="/estimador"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 py-4 font-heading text-base font-semibold text-[#03213e] sm:text-lg"
        >
          <Target className="h-5 w-5" />
          Estimar el próximo tiro
        </Link>
        <Link
          to="/jugar"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-4 font-heading text-base font-semibold text-white sm:text-lg"
        >
          <RotateCcw className="h-5 w-5" />
          Nueva partida
        </Link>
        <Link
          to="/"
          className="flex w-full items-center justify-center rounded-2xl py-4 text-sm font-bold uppercase tracking-[0.08em] text-sky-100/75 sm:col-span-2 sm:text-base"
        >
          Volver al menú
        </Link>
      </div>
    </div>
  );
}