import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hotelpro_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors and token expiry
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        if (refreshRes.data?.data?.accessToken) {
          localStorage.setItem('hotelpro_token', refreshRes.data.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${refreshRes.data.data.accessToken}`;
          return axios(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem('hotelpro_token');
        localStorage.removeItem('hotelpro_user');
      }
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;
