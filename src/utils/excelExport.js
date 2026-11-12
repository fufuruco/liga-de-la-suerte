// Exportador de datos para Excel y hojas de cálculo (CSV con BOM y XLS estructurado)

export function exportarCSV(filas, estadisticas, nombreArchivo = 'liga-de-la-suerte-registro.csv') {
  const delimitador = ';';
  const saltos = '\r\n';

  const cabeceras = [
    'Ronda (t)',
    'Equipo / Jugador',
    'Dado 1',
    'Dado 2',
    'Suma (D = d1 + d2)',
    'Ajuste de Suerte (It = D - 4)',
    'Puntaje Base (Tt = 20 + 2t)',
    'Puntaje Final (Yt = Tt + It)',
    'Puntaje Acumulado Equipo',
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(delimitador) || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lineas = [];
  lineas.push(cabeceras.map(escapeCSV).join(delimitador));

  filas.forEach((f) => {
    lineas.push([
      f.jornada,
      f.equipo_nombre,
      f.dado1,
      f.dado2,
      f.suma,
      f.ajuste,
      f.puntaje_base,
      f.puntaje_final,
      f.acumulado || '',
    ].map(escapeCSV).join(delimitador));
  });

  if (estadisticas) {
    lineas.push('');
    lineas.push(['--- RESUMEN ESTADÍSTICO ---'].map(escapeCSV).join(delimitador));
    lineas.push(['Métrica', 'Valor Observado', 'Valor Teórico / Esperado'].map(escapeCSV).join(delimitador));
    lineas.push(['Total de lanzamientos (n)', estadisticas.totalTiros, '-'].map(escapeCSV).join(delimitador));
    lineas.push(['Media de la Suma (D)', estadisticas.mediaSuma.toFixed(2), '7.00'].map(escapeCSV).join(delimitador));
    lineas.push(['Media del Ajuste de Suerte (It)', estadisticas.mediaAjuste.toFixed(2), '3.00'].map(escapeCSV).join(delimitador));
    lineas.push(['Desviación Estándar (s)', estadisticas.desviacionSuma.toFixed(2), '2.415'].map(escapeCSV).join(delimitador));
    lineas.push(['Varianza (s^2)', estadisticas.varianzaSuma.toFixed(2), '5.83'].map(escapeCSV).join(delimitador));
    lineas.push(['Puntaje Final Promedio por Tiro', estadisticas.mediaPuntajeFinal.toFixed(2), '-'].map(escapeCSV).join(delimitador));
  }

  // BOM UTF-8 (\uFEFF) para que Excel abra acentos y caracteres especiales sin romper codificación
  const contenido = '\uFEFF' + lineas.join(saltos);
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
  descargarBlob(blob, nombreArchivo);
}

export function exportarXLS(filas, estadisticas, nombreArchivo = 'liga-de-la-suerte-registro.xls') {
  let tablaHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Registro de Partida</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        table { border-collapse: collapse; font-family: Calibri, sans-serif; }
        th { background-color: #073c72; color: #ffffff; font-weight: bold; border: 1px solid #cccccc; padding: 8px 12px; text-align: center; }
        td { border: 1px solid #e0e0e0; padding: 6px 10px; text-align: center; }
        .texto { text-align: left; }
        .destacado { font-weight: bold; background-color: #f7fafc; }
        .resumen-th { background-color: #2b6cb0; color: #ffffff; font-weight: bold; }
        .resumen-td { background-color: #ebf8ff; font-weight: bold; }
      </style>
    </head>
    <body>
      <h2>Liga de la Suerte - Bitácora de Registro y Calculadora Estadística</h2>
      <p>Generado el: ${new Date().toLocaleString('es')}</p>
      <br/>
      <table>
        <thead>
          <tr>
            <th>Ronda (t)</th>
            <th class="texto">Equipo / Jugador</th>
            <th>Dado 1</th>
            <th>Dado 2</th>
            <th>Suma (D = d1 + d2)</th>
            <th>Ajuste (It = D - 4)</th>
            <th>Base (Tt = 20 + 2t)</th>
            <th>Puntaje Final (Yt = Tt + It)</th>
            <th>Puntaje Acumulado</th>
          </tr>
        </thead>
        <tbody>
  `;

  filas.forEach((f) => {
    tablaHtml += `
      <tr>
        <td>${f.jornada}</td>
        <td class="texto">${f.equipo_nombre}</td>
        <td>${f.dado1}</td>
        <td>${f.dado2}</td>
        <td class="destacado">${f.suma}</td>
        <td>${f.ajuste > 0 ? `+${f.ajuste}` : f.ajuste}</td>
        <td>${f.puntaje_base}</td>
        <td class="destacado">${f.puntaje_final}</td>
        <td>${f.acumulado || ''}</td>
      </tr>
    `;
  });

  tablaHtml += `
        </tbody>
      </table>
  `;

  if (estadisticas) {
    tablaHtml += `
      <br/><br/>
      <h3>Resumen Estadístico y Fórmulas</h3>
      <table>
        <thead>
          <tr>
            <th class="resumen-th texto">Métrica Estadística</th>
            <th class="resumen-th">Fórmula</th>
            <th class="resumen-th">Valor Obtenido</th>
            <th class="resumen-th">Valor Teórico / Esperado</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="texto">Total de Lanzamientos (n)</td>
            <td>∑ rondas</td>
            <td>${estadisticas.totalTiros}</td>
            <td>-</td>
          </tr>
          <tr>
            <td class="texto">Media Muestral de Sumas (D)</td>
            <td>X̄ = (∑ D) / n</td>
            <td class="resumen-td">${estadisticas.mediaSuma.toFixed(2)}</td>
            <td>μ = 7.00</td>
          </tr>
          <tr>
            <td class="texto">Media del Ajuste de Suerte (It)</td>
            <td>Ī = (∑ It) / n</td>
            <td class="resumen-td">${estadisticas.mediaAjuste.toFixed(2)}</td>
            <td>E[It] = 3.00</td>
          </tr>
          <tr>
            <td class="texto">Desviación Estándar Muestral (s)</td>
            <td>s = √[ ∑ (D - X̄)² / n ]</td>
            <td class="resumen-td">${estadisticas.desviacionSuma.toFixed(2)}</td>
            <td>σ ≈ 2.415</td>
          </tr>
          <tr>
            <td class="texto">Varianza Muestral (s²)</td>
            <td>s² = ∑ (D - X̄)² / n</td>
            <td class="resumen-td">${estadisticas.varianzaSuma.toFixed(2)}</td>
            <td>σ² = 5.833</td>
          </tr>
          <tr>
            <td class="texto">Puntaje Final Promedio por Tiro (Y)</td>
            <td>Ȳ = (∑ Yt) / n</td>
            <td class="resumen-td">${estadisticas.mediaPuntajeFinal.toFixed(2)}</td>
            <td>-</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  tablaHtml += `
    </body>
    </html>
  `;

  const blob = new Blob([tablaHtml], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  descargarBlob(blob, nombreArchivo);
}

function descargarBlob(blob, nombreArchivo) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

