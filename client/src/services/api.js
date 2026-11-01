const DEFAULT_API_URL = 'http://localhost:5000/api/v1';

const API_BASE = String(
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
).replace(/\/+$/, '');

function normalizePath(path) {
  return `/${String(path || '').replace(/^\/+/, '')}`;
}

function isAbortError(error) {
  return (
    error?.name === 'AbortError' ||
    error?.code === 'ABORT_ERR' ||
    error?.cause?.name === 'AbortError'
  );
}

async function readResponse(response) {
  if (response.status === 204) {
    return {};
  }

  const raw = await response.text();

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {
      message:
        raw.slice(0, 500) ||
        'The server returned an unreadable response.',
    };
  }
}

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});

  const hasBody =
    options.body !== undefined && options.body !== null;

  const isFormData =
    typeof FormData !== 'undefined' &&
    options.body instanceof FormData;

  if (
    hasBody &&
    !isFormData &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json');
  }

  headers.set('Accept', 'application/json');

  const url = `${API_BASE}${normalizePath(path)}`;

  let response;

  try {
    response = await fetch(url, {
      ...options,
      credentials: options.credentials ?? 'include',
      headers,
    });
  } catch (cause) {
    // Preserve canceled requests instead of reporting them as network failures.
    if (isAbortError(cause)) {
      throw cause;
    }

    const error = new Error(
      'Unable to reach TyagiJI services. Check your connection and try again.'
    );

    error.name = 'ApiNetworkError';
    error.code = 'NETWORK_ERROR';
    error.cause = cause;
    error.url = url;

    throw error;
  }

  let data;

  try {
    data = await readResponse(response);
  } catch (cause) {
    if (isAbortError(cause)) {
      throw cause;
    }

    const error = new Error(
      'Unable to read the server response. Please try again.'
    );

    error.code = 'RESPONSE_READ_ERROR';
    error.cause = cause;
    error.status = response.status;

    throw error;
  }

  if (!response.ok) {
    const error = new Error(
      data.message || `Request failed (${response.status}).`
    );

    error.name = 'ApiResponseError';
    error.status = response.status;
    error.code = data.code || 'REQUEST_FAILED';
    error.details = data.errors || data.details || [];
    error.data = data;

    throw error;
  }

  return data;
}

api.get = (path, options = {}) =>
  api(path, {
    ...options,
    method: 'GET',
  });

api.post = (path, body, options = {}) =>
  api(path, {
    ...options,
    method: 'POST',
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });

api.put = (path, body, options = {}) =>
  api(path, {
    ...options,
    method: 'PUT',
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });

api.patch = (path, body, options = {}) =>
  api(path, {
    ...options,
    method: 'PATCH',
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });

api.delete = (path, options = {}) =>
  api(path, {
    ...options,
    method: 'DELETE',
  });
