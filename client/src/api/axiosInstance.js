import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("echoMateLiteToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const isAuthRequest = requestUrl.includes("/auth/login") || requestUrl.includes("/auth/signup");

    if (error.response?.status === 401 && !isAuthRequest) {
      window.dispatchEvent(new CustomEvent("echomate:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
