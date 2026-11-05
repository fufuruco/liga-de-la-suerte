const CLAVE = 'liga-de-la-suerte:config';

export const EQUIPOS_POR_DEFECTO = ['Sistemas', 'Civil', 'Industrial', 'Contabilidad'];

export const CONFIG_INICIAL = {
  jornadas: 6,
  equipos: ['Sistemas', 'Civil', 'Industrial'],
};

export function leerConfig() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    if (!guardado) return { ...CONFIG_INICIAL };
    return {
      jornadas: Number(guardado.jornadas) || CONFIG_INICIAL.jornadas,
      equipos:
        Array.isArray(guardado.equipos) && guardado.equipos.length >= 2
          ? guardado.equipos
          : [...CONFIG_INICIAL.equipos],
    };
  } catch {
    return { ...CONFIG_INICIAL };
  }
}

export function guardarConfig(config) {
  localStorage.setItem(CLAVE, JSON.stringify(config));
}