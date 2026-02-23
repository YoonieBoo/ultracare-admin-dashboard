import api from "@/services/api";

export async function getAlerts() {
  return (await api.get("/alerts")).data;
}
