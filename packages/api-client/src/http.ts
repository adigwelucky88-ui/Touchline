/**
 * Transport used by every generated function. Apps call `configureApiClient` once at start-up
 * with the API base URL and a token provider (Cognito session).
 */

export interface ApiClientConfig {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null> | string | null;
}

let config: ApiClientConfig = { baseUrl: '' };

export function configureApiClient(next: ApiClientConfig): void {
  config = next;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

export async function httpFetch<T>(url: string, options: RequestInit): Promise<T> {
  const token = await config.getAccessToken?.();
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${config.baseUrl}${url}`, { ...options, headers });
  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : undefined;
  if (!response.ok) throw new ApiError(response.status, data);
  return { data, status: response.status, headers: response.headers } as T;
}
