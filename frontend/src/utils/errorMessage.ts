function extractMessage(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nestedMessage = extractMessage(item);
      if (nestedMessage) {
        return nestedMessage;
      }
    }
    return null;
  }

  if (value && typeof value === 'object') {
    const candidate = value as Record<string, unknown>;

    for (const key of ['message', 'error', 'detail', 'title', 'errorMessage']) {
      const nestedMessage = extractMessage(candidate[key]);
      if (nestedMessage) {
        return nestedMessage;
      }
    }

    if (candidate.errors && typeof candidate.errors === 'object') {
      const errorValues = Object.values(candidate.errors as Record<string, unknown>);
      for (const errorValue of errorValues) {
        const nestedMessage = extractMessage(errorValue);
        if (nestedMessage) {
          return nestedMessage;
        }
      }
    }
  }

  return null;
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.') {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  const candidate = error as {
    response?: { data?: unknown };
    message?: unknown;
    code?: unknown;
  };

  const fromResponse = extractMessage(candidate.response?.data);
  if (fromResponse) {
    return fromResponse;
  }

  const fromMessage = extractMessage(candidate.message);
  if (fromMessage) {
    return fromMessage;
  }

  if (candidate.code === 'ERR_NETWORK') {
    return 'Network error. Please check your connection and try again.';
  }

  return fallback;
}
