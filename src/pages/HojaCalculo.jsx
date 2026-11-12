import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/PageHeader';
import { api } from '@/api/client';
import { exportarCSV, exportarXLS } from '@/utils/excelExport';
import {
  FileSpreadsheet,
  Download,
  Plus,
  Trash2,
  RefreshCw,
  FolderOpen,
  Calculator,
  TrendingUp,
  Info,
} from 'lucide-react';

const EJEMPLO_INICIAL = [
  { id: '1', jornada: 1, equipo_nombre: 'Equipo Alfa', dado1: 3, dado2: 4 },
  { id: '2', jornada: 1, equipo_nombre: 'Equipo Beta', dado1: 2, dado2: 3 },
  { id: '3', jornada: 2, equipo_nombre: 'Equipo Alfa', dado1: 5, dado2: 2 },
  { id: '4', jornada: 2, equipo_nombre: 'Equipo Beta', dado1: 6, dado2: 4 },
  { id: '5', jornada: 3, equipo_nombre: 'Equipo Alfa', dado1: 1, dado2: 3 },
  { id: '6', jornada: 3, equipo_nombre: 'Equipo Beta', dado1: 4, dado2: 5 },
  { id: '7', jornada: 4, equipo_nombre: 'Equipo Alfa', dado1: 6, dado2: 6 },
  { id: '8', jornada: 4, equipo_nombre: 'Equipo Beta', dado1: 3, dado2: 3 },
  { id: '9', jornada: 5, equipo_nombre: 'Equipo Alfa', dado1: 4, dado2: 2 },
  { id: '10', jornada: 5, equipo_nombre: 'Equipo Beta', dado1: 5, dado2: 5 },
  { id: '11', jornada: 6, equipo_nombre: 'Equipo Alfa', dado1: 3, dado2: 5 },
  { id: '12', jornada: 6, equipo_nombre: 'Equipo Beta', dado1: 2, dado2: 4 },
];

export default function HojaCalculo() {
  const [filas, setFilas] = useState(EJEMPLO_INICIAL);
  const [sesionesGuardadas, setSesionesGuardadas] = useState([]);
  const [cargandoSesiones, setCargandoSesiones] = useState(false);
  const [mostrarModalCargar, setMostrarModalCargar] = useState(false);

  // Cargar lista de sesiones de la base de datos para poder importarlas
  useEffect(() => {
    api.listSessions(50).then((res) => {
      setSesionesGuardadas(res || []);
    }).catch(() => {});
  }, []);

  // Procesar filas calculando fórmulas automáticas
  const filasCalculadas = useMemo(() => {
    const acumuladorEquipos = {};
    return filas.map((fila, index) => {
      const jornada = Number(fila.jornada) || 1;
      const dado1 = Math.min(6, Math.max(1, Number(fila.dado1) || 1));
      const dado2 = Math.min(6, Math.max(1, Number(fila.dado2) || 1));
      const suma = dado1 + dado2;
      const ajuste = suma - 4;
      const puntaje_base = 20 + 2 * jornada;
      const puntaje_final = puntaje_base + ajuste;

      const equipo = (fila.equipo_nombre || 'Equipo').trim();
      acumuladorEquipos[equipo] = (acumuladorEquipos[equipo] || 0) + puntaje_final;

      return {
        ...fila,
        index: index + 1,
        jornada,
        dado1,
        dado2,
        suma,
        ajuste,
        puntaje_base,
        puntaje_final,
        acumulado: acumuladorEquipos[equipo],
      };
    });
  }, [filas]);

  // Resumen estadístico
  const estadisticas = useMemo(() => {
    const n = filasCalculadas.length;
    if (n === 0) {
      return {
        totalTiros: 0,
        mediaSuma: 0,
        mediaAjuste: 0,
        mediaPuntajeFinal: 0,
        desviacionSuma: 0,
        varianzaSuma: 0,
        sumaMin: 0,
        sumaMax: 0,
      };
    }

    const sumas = filasCalculadas.map((f) => f.suma);
    const ajustes = filasCalculadas.map((f) => f.ajuste);
    const puntajes = filasCalculadas.map((f) => f.puntaje_final);

    const mediaSuma = sumas.reduce((a, b) => a + b, 0) / n;
    const mediaAjuste = ajustes.reduce((a, b) => a + b, 0) / n;
    const mediaPuntajeFinal = puntajes.reduce((a, b) => a + b, 0) / n;

    const varianzaSuma = sumas.reduce((acc, val) => acc + (val - mediaSuma) ** 2, 0) / n;
    const desviacionSuma = Math.sqrt(varianzaSuma);

    return {
      totalTiros: n,
      mediaSuma,
      mediaAjuste,
      mediaPuntajeFinal,
      desviacionSuma,
      varianzaSuma,
      sumaMin: Math.min(...sumas),
      sumaMax: Math.max(...sumas),
    };
  }, [filasCalculadas]);

  // Modificar celda
  const actualizarFila = (index, campo, valor) => {
    setFilas((prev) => {
      const copia = [...prev];
      copia[index] = { ...copia[index], [campo]: valor };
      return copia;
    });
  };

  // Agregar fila
  const agregarFila = () => {
    const ultima = filas[filas.length - 1];
    const nuevaJornada = ultima ? ultima.jornada : 1;
    const nuevoEquipo = ultima ? (ultima.equipo_nombre === 'Equipo Alfa' ? 'Equipo Beta' : 'Equipo Alfa') : 'Equipo 1';
    const nuevaFila = {
      id: String(Date.now()),
      jornada: nuevaJornada,
      equipo_nombre: nuevoEquipo,
      dado1: 3,
      dado2: 4,
    };
    setFilas((prev) => [...prev, nuevaFila]);
  };

  // Eliminar fila
  const eliminarFila = (index) => {
    setFilas((prev) => prev.filter((_, i) => i !== index));
  };

  // Cargar datos desde una sesión en base de datos
  const cargarDesdeSesion = async (sesionId) => {
    try {
      setCargandoSesiones(true);
      const tiradas = await api.listSessionRolls(sesionId, 300);
      if (tiradas && tiradas.length > 0) {
        setFilas(
          tiradas.map((t) => ({
            id: t.id,
            jornada: t.jornada,
            equipo_nombre: t.equipo_nombre,
            dado1: t.dado1,
            dado2: t.dado2,
          }))
        );
      }
      setMostrarModalCargar(false);
    } catch {
      alert('No se pudieron obtener los datos de la sesión.');
    } finally {
      setCargandoSesiones(false);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl bg-[radial-gradient(circle_at_50%_-10%,#1268b8_0%,#073c72_35%,#031f3b_75%,#00101f_100%)] px-3 pb-16 pt-6 sm:px-6 lg:px-8">
      <PageHeader
        title="Hoja de Registro y Calculadora"
        subtitle="Planilla tipo Excel con fórmulas en tiempo real y exportación"
      />

      {/* Barra de Herramientas Superior tipo Excel */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#02182d]/90 p-3 sm:p-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={agregarFila}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-emerald-400"
          >
            <Plus className="h-4 w-4" />
            Agregar Fila
          </button>
          <button
            onClick={() => setMostrarModalCargar(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-sky-200 transition hover:bg-white/10"
          >
            <FolderOpen className="h-4 w-4 text-amber-300" />
            Importar Partida
          </button>
          <button
            onClick={() => setFilas(EJEMPLO_INICIAL)}
            className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-sky-200 transition hover:bg-white/10"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Cargar Ejemplo
          </button>
          <button
            onClick={() => setFilas([])}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpiar
          </button>
        </div>

        {/* Botones de Exportar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportarCSV(filasCalculadas, estadisticas)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-700/80 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-600"
            title="Descargar archivo .CSV compatible con Microsoft Excel"
          >
            <Download className="h-4 w-4" />
            Exportar CSV (Excel)
          </button>
          <button
            onClick={() => exportarXLS(filasCalculadas, estadisticas)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3.5 py-2 text-xs font-bold text-[#03213e] shadow-md transition hover:brightness-110"
            title="Descargar archivo .XLS con estilos y fórmulas"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Exportar XLS
          </button>
        </div>
      </div>

      {/* Barra de Fórmula estilo Excel (fx) */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-[#031d36] px-4 py-2.5 font-mono text-xs sm:text-sm">
        <span className="font-bold text-amber-300">fx:</span>
        <span className="text-sky-200/90 font-medium">
          Yt = Tt + It = (20 + 2*t) + (dado1 + dado2 - 4)
        </span>
        <span className="ml-auto hidden text-[11px] text-sky-300/60 sm:inline">
          Edita cualquier celda de dados o rondas directamente en la tabla
        </span>
      </div>

      {/* Tabla Tipo Hoja de Cálculo Excel */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-white/15 bg-[#02182d] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse font-sans text-xs sm:text-sm">
            <thead>
              {/* Cabecera con letras de columnas estilo Excel A, B, C, D... */}
              <tr className="border-b border-white/10 bg-[#062648] text-[10px] font-bold text-sky-300/60">
                <th className="w-10 border-r border-white/10 px-2 py-1 text-center">#</th>
                <th className="w-20 border-r border-white/10 px-2 py-1 text-center">A</th>
                <th className="border-r border-white/10 px-2 py-1 text-center">B</th>
                <th className="w-20 border-r border-white/10 px-2 py-1 text-center">C</th>
                <th className="w-20 border-r border-white/10 px-2 py-1 text-center">D</th>
                <th className="w-28 border-r border-white/10 px-2 py-1 text-center">E (Auto)</th>
                <th className="w-28 border-r border-white/10 px-2 py-1 text-center">F (Auto)</th>
                <th className="w-28 border-r border-white/10 px-2 py-1 text-center">G (Auto)</th>
                <th className="w-32 border-r border-white/10 px-2 py-1 text-center">H (Auto)</th>
                <th className="w-32 border-r border-white/10 px-2 py-1 text-center">I (Auto)</th>
                <th className="w-12 px-2 py-1 text-center"></th>
              </tr>

              {/* Nombres de Columnas descriptivas */}
              <tr className="border-b border-white/20 bg-[#073c72] font-heading font-semibold text-white">
                <th className="border-r border-white/10 px-2 py-3 text-center">Fila</th>
                <th className="border-r border-white/10 px-3 py-3 text-center">Ronda (t)</th>
                <th className="border-r border-white/10 px-4 py-3 text-left">Equipo / Jugador</th>
                <th className="border-r border-white/10 px-2 py-3 text-center bg-amber-400/20 text-amber-200">
                  Dado 1 (d₁)
                </th>
                <th className="border-r border-white/10 px-2 py-3 text-center bg-amber-400/20 text-amber-200">
                  Dado 2 (d₂)
                </th>
                <th className="border-r border-white/10 px-3 py-3 text-center bg-sky-900/40">
                  Suma (D)
                </th>
                <th className="border-r border-white/10 px-3 py-3 text-center bg-sky-900/40">
                  Ajuste (Iₜ)
                </th>
                <th className="border-r border-white/10 px-3 py-3 text-center bg-sky-900/40">
                  Base (Tₜ)
                </th>
                <th className="border-r border-white/10 px-3 py-3 text-center bg-emerald-900/40 text-emerald-200">
                  Puntaje (Yₜ)
                </th>
                <th className="border-r border-white/10 px-3 py-3 text-center bg-purple-900/30 text-purple-200">
                  Acumulado
                </th>
                <th className="px-2 py-3 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 font-mono">
              {filasCalculadas.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-sky-200/60 font-sans">
                    La hoja está vacía. Haz clic en <strong>"Agregar Fila"</strong> o <strong>"Cargar Ejemplo"</strong>.
                  </td>
                </tr>
              ) : (
                filasCalculadas.map((fila, idx) => (
                  <tr
                    key={fila.id || idx}
                    className="transition hover:bg-white/[0.04]"
                  >
                    {/* Número de fila */}
                    <td className="border-r border-white/10 bg-[#041d36]/70 px-2 py-2 text-center text-xs text-sky-300/60 font-bold">
                      {idx + 1}
                    </td>

                    {/* Ronda (t) - Editable */}
                    <td className="border-r border-white/10 px-2 py-1.5 text-center">
                      <input
                        type="number"
                        min="1"
                        max="12"
                        value={fila.jornada}
                        onChange={(e) => actualizarFila(idx, 'jornada', e.target.value)}
                        className="w-14 rounded-lg border border-transparent bg-transparent px-2 py-1 text-center font-bold text-white transition hover:border-white/20 focus:border-amber-300 focus:bg-[#031d38] focus:outline-none"
                      />
                    </td>

                    {/* Equipo - Editable */}
                    <td className="border-r border-white/10 px-3 py-1.5 text-left font-sans">
                      <input
                        type="text"
                        value={fila.equipo_nombre}
                        onChange={(e) => actualizarFila(idx, 'equipo_nombre', e.target.value)}
                        className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 font-medium text-white transition hover:border-white/20 focus:border-amber-300 focus:bg-[#031d38] focus:outline-none"
                      />
                    </td>

                    {/* Dado 1 - Editable */}
                    <td className="border-r border-white/10 bg-amber-400/[0.03] px-2 py-1.5 text-center">
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={fila.dado1}
                        onChange={(e) => actualizarFila(idx, 'dado1', e.target.value)}
                        className="w-12 rounded-lg border border-amber-300/30 bg-[#072d54] px-1 py-1 text-center font-bold text-amber-300 transition focus:border-amber-300 focus:outline-none"
                      />
                    </td>

                    {/* Dado 2 - Editable */}
                    <td className="border-r border-white/10 bg-amber-400/[0.03] px-2 py-1.5 text-center">
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={fila.dado2}
                        onChange={(e) => actualizarFila(idx, 'dado2', e.target.value)}
                        className="w-12 rounded-lg border border-amber-300/30 bg-[#072d54] px-1 py-1 text-center font-bold text-amber-300 transition focus:border-amber-300 focus:outline-none"
                      />
                    </td>

                    {/* Suma D (Calculada) */}
                    <td className="border-r border-white/10 px-3 py-2 text-center font-bold text-white">
                      {fila.suma}
                    </td>

                    {/* Ajuste It (Calculado) */}
                    <td className="border-r border-white/10 px-3 py-2 text-center font-semibold">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-xs ${
                          fila.ajuste > 0
                            ? 'bg-emerald-400/20 text-emerald-300'
                            : fila.ajuste < 0
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-white/10 text-sky-200'
                        }`}
                      >
                        {fila.ajuste > 0 ? `+${fila.ajuste}` : fila.ajuste}
                      </span>
                    </td>

                    {/* Base Tt (Calculada) */}
                    <td className="border-r border-white/10 px-3 py-2 text-center text-sky-200">
                      {fila.puntaje_base}
                    </td>

                    {/* Puntaje Final Yt (Calculado) */}
                    <td className="border-r border-white/10 bg-emerald-500/[0.05] px-3 py-2 text-center font-bold text-emerald-300">
                      {fila.puntaje_final}
                    </td>

                    {/* Acumulado (Calculado) */}
                    <td className="border-r border-white/10 bg-purple-500/[0.04] px-3 py-2 text-center font-bold text-purple-200">
                      {fila.acumulado}
                    </td>

                    {/* Acciones */}
                    <td className="px-2 py-2 text-center">
                      <button
                        onClick={() => eliminarFila(idx)}
                        className="rounded-lg p-1 text-rose-400/70 transition hover:bg-rose-500/20 hover:text-rose-300"
                        title="Eliminar fila"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Pie de tabla con Resumen Automático */}
            {filasCalculadas.length > 0 && (
              <tfoot className="border-t-2 border-amber-300/40 bg-[#062648] font-mono text-xs font-bold text-white">
                <tr>
                  <td colSpan={3} className="border-r border-white/10 px-4 py-3 text-right font-heading uppercase text-amber-300">
                    Promedios y Estadísticos ({estadisticas.totalTiros} tiros)
                  </td>
                  <td colSpan={2} className="border-r border-white/10 px-2 py-3 text-center text-sky-200">
                    -
                  </td>
                  <td className="border-r border-white/10 px-2 py-3 text-center text-amber-200">
                    X̄ = {estadisticas.mediaSuma.toFixed(2)}
                  </td>
                  <td className="border-r border-white/10 px-2 py-3 text-center text-amber-200">
                    Ī = {estadisticas.mediaAjuste.toFixed(2)}
                  </td>
                  <td className="border-r border-white/10 px-2 py-3 text-center text-sky-200">
                    -
                  </td>
                  <td className="border-r border-white/10 px-2 py-3 text-center text-emerald-300">
                    Ȳ = {estadisticas.mediaPuntajeFinal.toFixed(2)}
                  </td>
                  <td colSpan={2} className="px-2 py-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Tarjetas de Fórmulas y Resumen Estadístico Detallado */}
      <div className="mb-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Fórmulas utilizadas */}
        <div className="rounded-3xl border border-white/10 bg-[#02182d]/80 p-5 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-300">
            <Calculator className="h-5 w-5" />
            Fórmulas de la Hoja
          </div>
          <div className="mt-4 space-y-3 font-mono text-xs text-sky-100/90">
            <div className="rounded-xl bg-white/[0.04] p-3">
              <span className="text-amber-200 font-bold">1. Suma de Dados:</span>
              <p className="mt-1 font-bold text-white">D = d₁ + d₂</p>
              <p className="text-[11px] text-sky-300/70">Rango: 2 a 12 | Esperanza: μ = 7.00</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <span className="text-amber-200 font-bold">2. Ajuste de Suerte:</span>
              <p className="mt-1 font-bold text-white">Iₜ = D − 4</p>
              <p className="text-[11px] text-sky-300/70">Rango: -2 a +8 | Esperanza: E[Iₜ] = 3.00</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <span className="text-amber-200 font-bold">3. Puntaje Base:</span>
              <p className="mt-1 font-bold text-white">Tₜ = 20 + 2t</p>
              <p className="text-[11px] text-sky-300/70">Crecimiento constante por ronda (t)</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <span className="text-amber-200 font-bold">4. Puntaje Final:</span>
              <p className="mt-1 font-bold text-white">Yₜ = Tₜ + Iₜ</p>
              <p className="text-[11px] text-sky-300/70">Suma del avance base + suerte</p>
            </div>
          </div>
        </div>

        {/* Resumen Estadístico Observado vs Teórico */}
        <div className="rounded-3xl border border-white/10 bg-[#02182d]/80 p-5 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-emerald-300">
            <TrendingUp className="h-5 w-5" />
            Estadística Muestral vs Teórica
          </div>
          <div className="mt-4 space-y-2.5 text-xs text-sky-100/85">
            <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-2.5">
              <span>Lanzamientos analizados (n):</span>
              <strong className="font-mono text-sm text-white">{estadisticas.totalTiros}</strong>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-2.5">
              <span>Media muestral (X̄):</span>
              <div className="text-right font-mono">
                <span className="font-bold text-emerald-300">{estadisticas.mediaSuma.toFixed(2)}</span>
                <span className="ml-1 text-[11px] text-sky-300/60">(Teórica: 7.00)</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-2.5">
              <span>Ajuste medio (Ī):</span>
              <div className="text-right font-mono">
                <span className="font-bold text-emerald-300">{estadisticas.mediaAjuste.toFixed(2)}</span>
                <span className="ml-1 text-[11px] text-sky-300/60">(Teórica: 3.00)</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-2.5">
              <span>Desviación estándar (s):</span>
              <div className="text-right font-mono">
                <span className="font-bold text-amber-300">{estadisticas.desviacionSuma.toFixed(2)}</span>
                <span className="ml-1 text-[11px] text-sky-300/60">(Teórica: 2.415)</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-2.5">
              <span>Varianza muestral (s²):</span>
              <div className="text-right font-mono">
                <span className="font-bold text-amber-300">{estadisticas.varianzaSuma.toFixed(2)}</span>
                <span className="ml-1 text-[11px] text-sky-300/60">(Teórica: 5.833)</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-2.5">
              <span>Rango observado:</span>
              <span className="font-mono font-bold text-white">
                Min {estadisticas.sumaMin} — Max {estadisticas.sumaMax}
              </span>
            </div>
          </div>
        </div>

        {/* Interpretación y Explicación para el Profesor */}
        <div className="rounded-3xl border border-sky-400/20 bg-gradient-to-b from-[#073663] to-[#02182d] p-5 shadow-lg md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-sky-200">
            <Info className="h-5 w-5 text-amber-300" />
            Interpretación de los Datos
          </div>
          <div className="mt-4 space-y-3 text-xs leading-relaxed text-sky-100/85">
            <p>
              • <strong className="text-white">Media de la suma:</strong> Si la media observada (
              <span className="text-amber-300">{estadisticas.mediaSuma.toFixed(2)}</span>) es cercana a 7.0,
              los dados se comportaron de acuerdo con la distribución binomial simétrica de dos dados equilibrados.
            </p>
            <p>
              • <strong className="text-white">Ajuste de suerte medio:</strong> Un ajuste medio de{' '}
              <span className="text-amber-300">{estadisticas.mediaAjuste.toFixed(2)}</span> indica si la partida
              estuvo por encima o por debajo de la ganancia esperada teórica de +3.
            </p>
            <p>
              • <strong className="text-white">Desviación estándar:</strong> Mide la dispersión del azar. Cuanto
              más cercana a 2.42, mayor confirmación de la variabilidad natural del juego.
            </p>
            <p>
              • <strong className="text-white">Impacto del tiempo vs suerte:</strong> En las primeras jornadas, el
              ajuste $I_t$ representa hasta el 35% del puntaje; hacia la jornada 6 en adelante, la base $T_t$ domina
              más del 80% del resultado total.
            </p>
          </div>
        </div>
      </div>

      {/* Modal para Seleccionar e Importar Partidas Guardadas */}
      {mostrarModalCargar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-[#03203e] p-6 shadow-2xl">
            <h3 className="font-heading text-lg font-bold text-white">
              Importar datos desde una partida existente
            </h3>
            <p className="mt-1 text-xs text-sky-200/70">
              Selecciona una de las partidas guardadas en la base de datos para cargar sus tiros en la hoja:
            </p>

            <div className="mt-4 max-h-60 space-y-2 overflow-y-auto pr-1">
              {cargandoSesiones ? (
                <div className="py-8 text-center text-sm text-sky-200">Cargando partidas...</div>
              ) : sesionesGuardadas.length === 0 ? (
                <div className="rounded-xl bg-white/5 py-8 text-center text-sm text-sky-200/60">
                  No hay partidas registradas en la base de datos todavía.
                </div>
              ) : (
                sesionesGuardadas.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => cargarDesdeSesion(s.id)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-amber-300/40 hover:bg-white/[0.08]"
                  >
                    <div>
                      <p className="font-bold text-white">{s.nombre}</p>
                      <p className="text-[11px] text-sky-200/60">
                        {s.jornadas} jornadas • {new Date(s.created_date).toLocaleDateString('es')}
                      </p>
                    </div>
                    <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300">
                      Cargar
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setMostrarModalCargar(false)}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
