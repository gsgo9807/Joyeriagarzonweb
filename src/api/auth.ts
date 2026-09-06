import { apiRequest, setStoredToken } from './client';

function extractToken(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  const nested = record.data && typeof record.data === 'object'
    ? (record.data as Record<string, unknown>)
    : null;

  const candidates = [
    record.access_token,
    record.token,
    record.accessToken,
    nested?.access_token,
    nested?.token,
    nested?.accessToken,
  ];

  for (const value of candidates) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export async function login(username: string, password: string): Promise<string> {
  const payload = await apiRequest<unknown>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  const token = extractToken(payload);
  if (!token) {
    throw new Error('El servidor no devolvió un token de acceso.');
  }

  setStoredToken(token);
  return token;
}

export async function testAuth(): Promise<boolean> {
  try {
    await apiRequest('/api/auth/test');
    return true;
  } catch {
    setStoredToken(null);
    return false;
  }
}

export function logout() {
  setStoredToken(null);
}
