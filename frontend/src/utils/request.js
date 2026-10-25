// Backend origin. Empty = same origin (Docker image, or `npm start` via the dev proxy)
export const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/$/, '');
const BASE_URL = `${BACKEND_URL}/api`;

// Turn { q: 'abc', skip: 0, empty: '' } into "?q=abc&skip=0"
const toQueryString = (params) => {
  if (!params) return '';
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.append(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
};

// FastAPI errors look like {detail: "msg"} or {detail: [{msg: "..."}]}
const errorMessage = (body, response) => {
  const detail = body?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail.length) {
    return detail.map((d) => `${(d.loc || []).slice(-1)[0] || 'field'}: ${d.msg}`).join(', ');
  }
  return `Request failed (${response.status})`;
};

// Response interceptor
const responseInterceptor = async (response) => {
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(errorMessage(body, response));
  }
  return body;
};

// Main request function
const request = async (endpoint, { params, body, ...options } = {}) => {
  const url = `${BASE_URL}${endpoint}${toQueryString(params)}`;
  const config = { ...options, headers: { ...options.headers } };

  if (body instanceof FormData) {
    // Let the browser set the multipart boundary
    config.body = body;
  } else if (body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (error) {
    throw new Error('Cannot reach the server. Check your connection.');
  }
  return responseInterceptor(response);
};

// HTTP method helpers
export const http = {
  get: (endpoint, params) => request(endpoint, { method: 'GET', params }),
  post: (endpoint, data) => request(endpoint, { method: 'POST', body: data }),
  put: (endpoint, data) => request(endpoint, { method: 'PUT', body: data }),
  patch: (endpoint, data) => request(endpoint, { method: 'PATCH', body: data }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export default http;
