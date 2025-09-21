import axios from "axios";

export const AUTH_TOKEN_KEY = "access_token";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Add a request interceptor to include the auth token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;