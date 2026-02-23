// services/admin.js
import api from "./api";

export async function getAdminStats() {
  const res = await api.get("/admin/stats");
  return res.data;
}