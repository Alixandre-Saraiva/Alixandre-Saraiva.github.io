"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { ProfessionalSummary } from "@/lib/types";
import { formatDistance } from "@/lib/utils";

const pin = L.divIcon({
  className: "",
  html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#0F9DA8;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.25)"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
});

const me = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#F4C542;border:3px solid #fff;box-shadow:0 0 0 6px rgba(244,197,66,.35)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface MapViewProps {
  pros: ProfessionalSummary[];
  center?: { lat: number; lng: number } | null;
  /** Mostra um raio aproximado em vez do ponto exato (privacidade). */
  approximate?: boolean;
  className?: string;
}

export default function MapView({ pros, center, approximate, className }: MapViewProps) {
  const located = pros.filter((p) => p.lat != null && p.lng != null);
  const start = center ?? (located[0] ? { lat: located[0].lat!, lng: located[0].lng! } : { lat: -14.235, lng: -51.925 });
  const zoom = center || located.length ? (approximate ? 13 : 11) : 4;

  return (
    <MapContainer center={[start.lat, start.lng]} zoom={zoom} scrollWheelZoom={false} className={className ?? "h-[60vh] w-full"}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {center && !approximate && <Marker position={[center.lat, center.lng]} icon={me} />}
      {located.map((p) =>
        approximate ? (
          <Circle key={p.id} center={[p.lat!, p.lng!]} radius={900} pathOptions={{ color: "#0F9DA8", fillColor: "#0F9DA8", fillOpacity: 0.2 }} />
        ) : (
          <Marker key={p.id} position={[p.lat!, p.lng!]} icon={pin}>
            <Popup>
              <Link href={`/profissional/${p.id}`} style={{ fontWeight: 600, color: "#0F9DA8" }}>
                {p.nome}
              </Link>
              <br />
              {p.profissao}
              {p.distancia_km != null && <> · {formatDistance(p.distancia_km)}</>}
            </Popup>
          </Marker>
        ),
      )}
    </MapContainer>
  );
}
