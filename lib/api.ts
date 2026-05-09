
import axios from "axios";
import { getAccessToken, logout, setAccessToken } from "@/hooks/useAuth";

const api = axios.create({
  baseURL: "http://localhost:5113/api",
  withCredentials: true,
});

const EXCLUDED_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/refresh-token",
  "/auth/activate",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/public",
];

const shouldSkipRefresh = (url: string): boolean => {
  return EXCLUDED_ENDPOINTS.some((endpoint) => url.includes(endpoint));
};

api.interceptors.request.use(
  (config) => {
    const access_token = getAccessToken();
    if (access_token) {
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor with Refresh Logic ───
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔍 Skip refresh logic for excluded endpoints
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !shouldSkipRefresh(originalRequest.url)
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh-token");
        console.log("Token refreshed successfully:", data);
        const access_token = data.accessToken;

        setAccessToken(access_token);
        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshErr: any) {
        console.error("Token refresh failed:", refreshErr);
        processQueue(refreshErr, null);
        logout();

        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;