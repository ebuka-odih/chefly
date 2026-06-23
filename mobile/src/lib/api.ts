import Constants from 'expo-constants';

type ApiRequestOptions = Omit<RequestInit, 'body' | 'headers'> & {
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
};

type ExpoExtra = {
  publicApiBaseUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;
const configuredBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  extra.publicApiBaseUrl ??
  'https://chefly.eecollective.ink';

export const API_BASE_URL = configuredBaseUrl.replace(/\/+$/, '');

async function parseErrorMessage(response: Response) {
  try {
    const data = await response.json();
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail) && data.detail.length > 0) return data.detail[0]?.msg ?? 'Request failed';
    if (typeof data?.message === 'string') return data.message;
  } catch {
    // Fall through to status text.
  }
  return response.statusText || 'Request failed';
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, headers, token, ...rest } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : null),
      ...(token ? { Authorization: `Bearer ${token}` } : null),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
