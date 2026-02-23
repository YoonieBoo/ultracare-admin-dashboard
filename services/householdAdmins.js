// services/householdAdmins.js
import api from "./api";

/**
 * Expected backend response examples:
 *  A) { ok: true, users: [...] }
 *  B) { ok: true, householdAdmins: [...] }
 *  C) { ok: true, data: [...] }
 *
 * We'll support A/B/C safely.
 */
export async function getHouseholdAdmins() {
  const res = await api.get("/household-admins");
  const body = res.data;

  const list =
    body?.users ??
    body?.householdAdmins ??
    body?.data ??
    body ??
    [];

  return { raw: body, users: Array.isArray(list) ? list : [] };
}