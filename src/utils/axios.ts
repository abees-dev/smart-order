import axios from "axios";
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      return Promise.reject(
        error.response?.data || { message: "Đã xảy ra lỗi" }
      );
    }
    // You can handle specific status codes here
    // Handle errors globally
    return Promise.reject(error);
  }
);

export default axiosInstance;
