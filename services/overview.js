import api from "@/services/api";

export async function getOverview() {
  return (await api.get("/health")).data;
}
