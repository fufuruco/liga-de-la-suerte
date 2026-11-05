// Fórmulas y utilidades estadísticas de "Liga de la Suerte" con dos dados
// D  = dado1 + dado2        (2 a 12)
// Iₜ = D − 4                ajuste de suerte
// Tₜ = 20 + 2t              puntaje base de la jornada t
// Yₜ = Tₜ + Iₜ              puntaje final

export const CARAS = [1, 2, 3, 4, 5, 6];
export const SUMAS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const PROB_CARA_UNIFORME = 1 / 6;
export const FUERZA_PRIOR_SUMAS = 6;

/** Distribución teórica de la suma de dos dados equilibrados. */
export const PROB_SUMA_TEORICA = SUMAS.reduce((acc, s) => {
  acc[s] = (6 - Math.abs(7 - s)) / 36;
  return acc;
}, {});

export const puntajeBase = (t) => 20 + 2 * t;
export const ajuste = (suma) => suma - 4;
export const puntajeFinal = (t, suma) => puntajeBase(t) + ajuste(suma);

export function media(valores) {
  if (!valores.length) return 0;
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

export function desviacionEstandar(valores) {
  if (!valores.length) return 0;
  const m = media(valores);
  return Math.sqrt(valores.reduce((a, v) => a + (v - m) ** 2, 0) / valores.length);
}

export function conteoCaras(tiradas, campo) {
  const conteo = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  tiradas.forEach((t) => {
    if (conteo[t[campo]] !== undefined) conteo[t[campo]] += 1;
  });
  return conteo;
}

/** Probabilidad de cada cara de un dado con suavizado de Laplace (prior uniforme). */
export function distribucionCaras(tiradas, campo, alpha = 1) {
  const conteo = conteoCaras(tiradas, campo);
  const total = tiradas.length + 6 * alpha;
  return CARAS.map((cara) => ({
    cara,
    conteo: conteo[cara],
    probabilidad: total ? (conteo[cara] + alpha) / total : PROB_CARA_UNIFORME,
  }));
}

/** Estima las sumas observadas con suavizado centrado en dos dados equilibrados. */
export function distribucionSuma(tiradas) {
  const conteos = Object.fromEntries(SUMAS.map((suma) => [suma, 0]));
  tiradas.forEach((tirada) => {
    if (conteos[tirada.suma] !== undefined) conteos[tirada.suma] += 1;
  });
  const total = tiradas.length + FUERZA_PRIOR_SUMAS;

  return SUMAS.map((s) => ({
    suma: s,
    probabilidad: (conteos[s] + FUERZA_PRIOR_SUMAS * PROB_SUMA_TEORICA[s]) / total,
    teorica: PROB_SUMA_TEORICA[s],
    conteo: conteos[s],
    observada: tiradas.length ? conteos[s] / tiradas.length : 0,
  }));
}

export function sumaMasProbable(distribucion) {
  return distribucion.reduce((mejor, actual) =>
    actual.probabilidad > mejor.probabilidad ? actual : mejor
  );
}

export function candidatosSuma(distribucion, limite = 3) {
  return [...distribucion]
    .sort((a, b) => b.probabilidad - a.probabilidad || b.teorica - a.teorica || a.suma - b.suma)
    .slice(0, limite);
}

export function sumaEsperada(distribucion) {
  return distribucion.reduce((acc, d) => acc + d.suma * d.probabilidad, 0);
}

export function caraMasProbable(distribucion) {
  return distribucion.reduce((mejor, actual) =>
    actual.probabilidad > mejor.probabilidad ? actual : mejor
  );
}

/**
 * Entre todos los pares de caras que suman `suma`, devuelve el más probable
 * según las distribuciones estimadas de cada dado.
 */
export function parMasProbable(dist1, dist2, suma) {
  let mejor = null;
  dist1.forEach((a) => {
    const b = dist2.find((d) => d.cara === suma - a.cara);
    if (!b) return;
    const p = a.probabilidad * b.probabilidad;
    if (!mejor || p > mejor.p) mejor = { a, b, p };
  });
  return mejor;
}

/** Compara las sumas observadas con la distribución teórica de dos dados (χ², 10 gl). */
export function analisisSesgo(tiradas) {
  const n = tiradas.length;
  if (n < 30) {
    return {
      suficiente: false,
      chi2: 0,
      mensaje:
        'Con menos de 30 lanzamientos el azar domina por completo: todavía no se puede juzgar si los dados están cargados.',
    };
  }
  const chi2 = SUMAS.reduce((acc, s) => {
    const esperado = n * PROB_SUMA_TEORICA[s];
    const observado = tiradas.filter((t) => t.suma === s).length;
    return acc + (observado - esperado) ** 2 / esperado;
  }, 0);
  const sesgado = chi2 > 18.31;
  return {
    suficiente: true,
    chi2,
    sesgado,
    mensaje: sesgado
      ? 'La diferencia frente a dos dados equilibrados es grande: conviene revisar los dados o seguir registrando lanzamientos.'
      : 'Las diferencias observadas son compatibles con dos dados equilibrados.',
  };
}

export function resumenEquipo(tiradasEquipo) {
  const ajustes = tiradasEquipo.map((t) => t.ajuste);
  const puntajes = tiradasEquipo.map((t) => t.puntaje_final);
  return {
    total: puntajes.reduce((a, b) => a + b, 0),
    mediaAjustes: media(ajustes),
    desviacion: desviacionEstandar(ajustes),
    jornadas: tiradasEquipo.length,
    serie: tiradasEquipo.map((t) => ({
      jornada: t.jornada,
      puntaje: t.puntaje_final,
      suma: t.suma,
    })),
  };
}

export const COLORES_EQUIPO = ['#ffcc00', '#4ade80', '#60a5fa', '#c084fc'];