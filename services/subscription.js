import api from "@/services/api";

export async function getMySubscription() {
  return (await api.get("/subscription/me")).data;
}
