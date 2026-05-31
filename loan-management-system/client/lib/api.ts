import type { ApiEnvelope } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiClientError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lms_token');
}

export function setToken(token: string) {
  localStorage.setItem('lms_token', token);
}

export function clearToken() {
  localStorage.removeItem('lms_token');
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const isForm = init.body instanceof FormData;
  const headers = new Headers(init.headers);

  if (!isForm && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers
  });

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T> & { message?: string };

  if (!response.ok) {
    throw new ApiClientError(response.status, payload.message ?? 'Request failed', payload.details);
  }

  return payload.data;
}

export function fileUrl(url?: string) {
  if (!url) return '';
  return `${API_URL.replace('/api', '')}${url}`;
}
