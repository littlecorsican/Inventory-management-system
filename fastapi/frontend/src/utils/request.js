// Base URL for API requests
const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// Default headers
const defaultHeaders = {
  'Content-Type': 'application/json',
};

// Request interceptor
const requestInterceptor = (config) => {
  // Get token from localStorage if it exists
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
};

// Response interceptor
const responseInterceptor = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Something went wrong');
  }
  return response.json();
};

// Main request function
const request = async (endpoint, options = {}) => {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    // Apply request interceptor
    const interceptedConfig = requestInterceptor(config);

    // Make the request
    const response = await fetch(url, interceptedConfig);

    // Apply response interceptor
    return await responseInterceptor(response);
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
};

// HTTP method helpers
export const http = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options = {}) => request(endpoint, {
    ...options,
    method: 'POST',
    body: data,
  }),
  put: (endpoint, data, options = {}) => request(endpoint, {
    ...options,
    method: 'PUT',
    body: data,
  }),
  patch: (endpoint, data, options = {}) => request(endpoint, {
    ...options,
    method: 'PATCH',
    body: data,
  }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default http;

