// Small fetch wrapper: attaches the JWT, parses JSON and throws readable errors.
const TOKEN_KEY = 'learnhub_token';

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t) => {
    try {
      t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined && !form) headers['Content-Type'] = 'application/json';
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: form || (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const data = res.headers.get('content-type')?.includes('application/json')
    ? await res.json()
    : null;
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}
