import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://ultracare-backend-jxny.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  let token = "";

  if (typeof window !== "undefined") {
    token = localStorage.getItem("ultracare_admin_token") || "";
  }

  config.headers.Authorization = "Bearer " + token;
  config.headers["x-api-key"] = process.env.NEXT_PUBLIC_API_KEY || "";

  return config;
});

export default api;
