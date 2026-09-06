const TOKEN_KEY = 'garzon_token';

const FRIENDLY_STATUS: Record<number, string> = {
  401: 'Tu sesión expiró o no es válida. Inicia sesión de nuevo.',
  403: 'No tienes permiso para realizar esta acción.',
  404: 'No encontramos el recurso solicitado.',
  409: 'Hay un conflicto con los datos enviados. Es posible que el registro ya exista.',
  422: 'Revisa el formulario. Hay campos obligatorios o inválidos.',
  500: 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.',
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function looksInternal(message: string): boolean {
  return /stack|traceback|exception|sqlstate|at\s+\w+\.|internal server/i.test(message);
}

function messageFromBody(body: unknown, fallback: string): string {
  if (!body || typeof body !== 'object') return fallback;
  const record = body as Record<string, unknown>;
  const candidates = [record.message, record.detail, record.error];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim() && !looksInternal(value)) {
      return value.trim();
    }
  }
  return fallback;
}

export function getApiErrorMessage(err: unknown, fallback = 'No se pudo completar la operación.'): string {
  if (err instanceof ApiError) return err.message || fallback;
  if (err instanceof Error && err.message && !looksInternal(err.message)) return err.message;
  return fallback;
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(path, { ...options, headers });
  const body = await parseBody(res);

  if (!res.ok) {
    if (res.status === 401) {
      setStoredToken(null);
    }
    const fallback = FRIENDLY_STATUS[res.status] || `No se pudo completar la solicitud (${res.status}).`;
    throw new ApiError(messageFromBody(body, fallback), res.status);
  }

  return body as T;
}

export function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

export function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return [];
}
