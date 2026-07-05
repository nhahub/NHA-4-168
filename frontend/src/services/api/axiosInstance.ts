import axios, { type AxiosError, type AxiosResponse } from 'axios';

// Will be injected at runtime via interceptor setup
let getToken: (() => string | null) | null = null;
let logout: (() => void) | null = null;

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

// Request interceptor: Add Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken?.();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      logout?.();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Initialize getToken and logout callbacks
export function setupAuthInterceptor(
  getTokenFn: () => string | null,
  logoutFn: () => void
) {
  getToken = getTokenFn;
  logout = logoutFn;
}

export default axiosInstance;
