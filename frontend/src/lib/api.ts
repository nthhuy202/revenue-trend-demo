const NO_CONTENT = 204;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : String(error));

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: init?.body ? { "content-type": "application/json", ...init.headers } : init?.headers,
  });
  if (response.status === NO_CONTENT) return undefined as T;

  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, body.error ?? `Request failed (${response.status})`);

  // The response shape is the API contract; callers pick T to match the endpoint.
  return body as T;
}
