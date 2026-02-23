// services/devices.js
import api from "./api";

export async function getDevices() {
  const res = await api.get("/admin/devices");
  return res.data; // { ok, count, devices }
}