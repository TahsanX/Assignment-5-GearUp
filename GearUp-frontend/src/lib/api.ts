import type { ApiResponse } from './types';
import { getToken } from './auth';

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

/**
 * Error carrying the backend's structured failure envelope so the UI can show
 * a real message (and field-level details) instead of a generic failure.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details ?? null;
  }

  /** Zod issues come back as `[{ path, message }]`; map them onto form fields. */
  get fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    if (Array.isArray(this.details)) {
      for (const issue of this.details) {
        if (issue && typeof issue === 'object' && 'path' in issue && 'message' in issue) {
          const path = (issue as { path: unknown }).path;
          const key = Array.isArray(path) ? String(path[path.length - 1]) : String(path);
          if (key) out[key] = String((issue as { message: unknown }).message);
        }
      }
    }
    return out;
  }
}

type RequestOptions = Omit<RequestInit, 'body' | 'method'> & {
  method?: string;
  body?: unknown;
  /** Explicit token — needed in Server Components where cookies aren't ambient. */
  token?: string | null;
  /** Next.js fetch caching controls. */
  next?: { revalidate?: number; tags?: string[] };
};

export async function apiFetch<T>(
  path: string,
  { method = 'GET', body, token, headers, ...rest }: RequestOptions = {},
): Promise<T> {
  const authToken = token !== undefined ? token : getToken();

  const finalHeaders: Record<string, string> = {
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...((headers as Record<string, string>) ?? {}),
  };

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network-level failure: the server is unreachable, so there is no envelope.
    throw new ApiError(
      'Cannot reach the GearUp server. Check your connection and try again.',
      0,
    );
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!res.ok || !payload?.success) {
    throw new ApiError(
      payload?.message ?? `Request failed with status ${res.status}`,
      res.status,
      payload?.errorDetails,
    );
  }

  return payload.data as T;
}

/** Turns any thrown value into a message safe to show a user. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.message;
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}
