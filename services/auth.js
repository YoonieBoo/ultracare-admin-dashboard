import api from "@/services/api";
import { saveToken } from "@/utils/auth";

function extractToken(payload) {
  return (
    payload?.token ||
    payload?.accessToken ||
    payload?.data?.token ||
    payload?.data?.accessToken ||
    payload?.user?.token ||
    null
  );
}

export async function loginAdmin(email, password) {
  const data = (await api.post("/auth/login", { email, password })).data;
  const token = extractToken(data);

  if (token) {
    saveToken(token);
  }

  return data;
}

export async function signupAdmin(payload) {
  const data = (await api.post("/auth/signup", payload)).data;
  const token = extractToken(data);

  if (token) {
    saveToken(token);
  }

  return data;
}
