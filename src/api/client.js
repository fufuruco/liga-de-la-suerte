async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.error || 'No se pudo completar la solicitud.');
  return data;
}

const json = (value) => JSON.stringify(value);
const idPath = (id) => encodeURIComponent(id);

export const api = {
  listSessions: (limit = 25, estado) => {
    const query = new URLSearchParams({ limit: String(limit) });
    if (estado) query.set('estado', estado);
    return request(`/sessions?${query}`);
  },
  createSession: (data) => request('/sessions', { method: 'POST', body: json(data) }),
  getSession: (id) => request(`/sessions/${idPath(id)}`),
  updateSession: (id, data) => request(`/sessions/${idPath(id)}`, { method: 'PATCH', body: json(data) }),
  deleteSession: (id) => request(`/sessions/${idPath(id)}`, { method: 'DELETE' }),
  listTeams: (sessionId) => request(`/sessions/${idPath(sessionId)}/teams`),
  listSessionRolls: (sessionId, limit = 200) => request(`/sessions/${idPath(sessionId)}/rolls?limit=${limit}`),
  createRoll: (sessionId, data) => request(`/sessions/${idPath(sessionId)}/rolls`, { method: 'POST', body: json(data) }),
  listRolls: (limit = 300) => request(`/rolls?limit=${limit}`),
  deleteHistory: () => request('/history', { method: 'DELETE' }),
};