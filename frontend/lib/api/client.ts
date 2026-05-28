export type ApiError = {
  status: number;
  message: string;
};

const DEFAULT_API_URL = 'http://localhost:3000';

function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) {
    return DEFAULT_API_URL;
  }

  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
}

function normalizeErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload === 'object' && payload !== null) {
    const maybeMessage = (payload as { message?: unknown }).message;

    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }

    if (Array.isArray(maybeMessage)) {
      const firstMessage = maybeMessage.find(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
      );
      if (firstMessage) {
        return firstMessage;
      }
    }
  }

  return fallback;
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit = {},
): Promise<TResponse> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const isJsonResponse =
    response.headers.get('content-type')?.includes('application/json') ?? false;

  const payload = isJsonResponse
    ? ((await response.json()) as unknown)
    : undefined;

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      message: normalizeErrorMessage(payload, 'Something went wrong. Please try again.'),
    };

    throw error;
  }

  return payload as TResponse;
}

export function withAuthHeaders(token: string | null | undefined): HeadersInit {
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export function toApiError(error: unknown): ApiError {
  if (typeof error === 'object' && error !== null) {
    const maybeStatus = (error as { status?: unknown }).status;
    const maybeMessage = (error as { message?: unknown }).message;

    if (typeof maybeStatus === 'number' && typeof maybeMessage === 'string') {
      return {
        status: maybeStatus,
        message: maybeMessage,
      };
    }
  }

  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message || 'Unexpected error.',
    };
  }

  return {
    status: 500,
    message: 'Unexpected error.',
  };
}
