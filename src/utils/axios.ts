import axios from "axios";
import { refreshTokenQueue } from "./refresh-token-queue";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  // Add auth token to requests
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    console.log("Error response:", error.response);
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Use the refresh token queue to handle concurrent refresh requests
        const newToken = await refreshTokenQueue.addRefreshRequest(async () => {
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              },
              withCredentials: true,
            }
          );

          const { accessToken } = refreshResponse.data;
          localStorage.setItem("auth_token", accessToken);

          return accessToken;
        });

        // Update the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // // Refresh failed, redirect to login
        // localStorage.removeItem("auth_token");

        // // Import auth store and clear auth state
        // import("@/stores/auth.store").then(({ useAuthStore }) => {
        //   useAuthStore.getState().clearAuth();
        // });

        // // Redirect to login page
        // if (typeof window !== "undefined") {
        //   window.location.href = "/auth/login";
        // }

        return Promise.reject(refreshError);
      }
    }

    if (error.response) {
      return Promise.reject(
        error.response?.data || { message: "Đã xảy ra lỗi" }
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
