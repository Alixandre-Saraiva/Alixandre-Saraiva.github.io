"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { saveLocation } from "@/actions/profile";
import { LOCATION_COOKIE } from "@/lib/geo";
import type { UserLocation } from "@/lib/types";

async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=${lat}&lon=${lng}&accept-language=pt-BR`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { address?: Record<string, string> };
    const a = data.address ?? {};
    return a.city ?? a.town ?? a.village ?? a.municipality ?? null;
  } catch {
    return null;
  }
}

/**
 * Detecta a posição do usuário, descobre a cidade e guarda tudo em um cookie
 * para que o servidor ordene por distância.
 */
export function useGeolocation() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "denied" | "error">("idle");

  const detect = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      return Promise.resolve<UserLocation | null>(null);
    }
    setStatus("loading");
    return new Promise<UserLocation | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          const lat = Math.round(coords.latitude * 1e4) / 1e4;
          const lng = Math.round(coords.longitude * 1e4) / 1e4;
          const cidade = await reverseGeocode(lat, lng);
          const loc: UserLocation = { lat, lng, cidade };
          document.cookie = `${LOCATION_COOKIE}=${encodeURIComponent(JSON.stringify(loc))}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
          await saveLocation(lat, lng, cidade).catch(() => undefined);
          setStatus("idle");
          router.refresh();
          resolve(loc);
        },
        (err) => {
          setStatus(err.code === err.PERMISSION_DENIED ? "denied" : "error");
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10_000, maximumAge: 10 * 60_000 },
      );
    });
  }, [router]);

  return { detect, status };
}
