// Base URL for API requests
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';



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

    const headers = {
        'Content-Type': 'application/json',
    }
    const options = {
        headers
    }

    // Make the request
    const response = await fetch(url, options);

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
    body: JSON.stringify(data),
  }),
  put: (endpoint, data, options = {}) => request(endpoint, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  patch: (endpoint, data, options = {}) => request(endpoint, {
    ...options,
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default http;
