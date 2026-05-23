import axios from "axios";

const api = axios.create({
  baseURL: "https://miray-visual-media-1.onrender.com/api",
  withCredentials: true,
  timeout: 30000, // 30 seconds timeout
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// AUTO REFRESH ON 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
  "https://miray-visual-media-1.onrender.com/api/auth/refresh",
  {},
  { withCredentials: true }
);

        const newToken = res.data.accessToken;

        sessionStorage.setItem("accessToken", newToken);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${newToken}`,
        };

        return axios(originalRequest);
      } catch (refreshError) {
        sessionStorage.removeItem("accessToken");
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;