const BASE = import.meta.env.VITE_API_URL ?? '';

async function request<T>(method: string, url: string, body?: any): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export const api = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T>(url: string, body?: any) => request<T>('POST', url, body),
  put: <T>(url: string, body?: any) => request<T>('PUT', url, body),
  patch: <T>(url: string, body?: any) => request<T>('PATCH', url, body),
  delete: <T>(url: string) => request<T>('DELETE', url),
};
