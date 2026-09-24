import type { UserLocation } from "./types";

export const LOCATION_COOKIE = "da_loc";

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

export function parseLocationCookie(value: string | undefined): UserLocation | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as Partial<UserLocation>;
    if (typeof parsed.lat !== "number" || typeof parsed.lng !== "number") return null;
    return { lat: parsed.lat, lng: parsed.lng, cidade: parsed.cidade ?? null };
  } catch {
    return null;
  }
}
