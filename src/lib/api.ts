import "server-only";

const API_BASE = (process.env.ABP_API_BASE_URL ?? "http://localhost:44300").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as {
      error?: { message?: string };
      message?: string;
    };
    return data.error?.message ?? data.message ?? response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function apiGet<T>(path: string, revalidateSeconds = 30): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: revalidateSeconds, tags: ["posts"] },
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }

  return (await response.json()) as T;
}

export async function apiGetOrNull<T>(path: string, revalidateSeconds = 30): Promise<T | null> {
  try {
    return await apiGet<T>(path, revalidateSeconds);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      return null;
    }
    throw error;
  }
}

export async function apiSend<T>(
  path: string,
  options: {
    method: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    visitorToken?: string;
  },
): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.visitorToken) {
    headers.Authorization = `Bearer ${options.visitorToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function getApiBaseUrl() {
  return API_BASE;
}
