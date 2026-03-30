export const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export const resolveImageUrl = (url?: string | null) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${path}`;
};
