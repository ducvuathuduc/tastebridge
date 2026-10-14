"use client";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
import type { CityData } from "@/lib/types";

function heatColor(a: number) {
  // saffron → ember
  const stops = [[245, 207, 142], [232, 163, 61], [201, 85, 30], [150, 30, 20]];
  const x = Math.max(0, Math.min(0.999, a)) * (stops.length - 1);
  const i = Math.floor(x), f = x - i;
  const c = stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * f));
  return `rgb(${c.join(",")})`;
}

function Fit({ city, center }: { city: CityData; center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    const pts = city.heat.map((h) => [h.lat, h.lng] as [number, number]);
    if (pts.length > 1) map.fitBounds(pts, { padding: [30, 30], maxZoom: 13 });
    else map.setView(center, 12);
  }, [city, center, map]);
  return null;
}

export default function HeatMapInner({ city, center, venueLabel }: { city: CityData; center: [number, number]; venueLabel: string }) {
  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="h-[380px] w-full sm:h-[440px]" attributionControl>
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors" maxZoom={16} />
      <Fit city={city} center={center} />
      {city.heat.map((h, i) => (
        <CircleMarker key={i} center={[h.lat, h.lng]} radius={8 + h.affinity * 18} pathOptions={{ color: heatColor(h.affinity), fillColor: heatColor(h.affinity), fillOpacity: 0.28 + h.affinity * 0.45, weight: 1 }}>
          <Tooltip>affinity {h.affinity.toFixed(2)} · popularity {h.popularity.toFixed(2)}</Tooltip>
        </CircleMarker>
      ))}
      {city.similar.filter((p) => p.lat != null).slice(0, 15).map((p) => (
        <CircleMarker key={p.id} center={[p.lat!, p.lng!]} radius={4} pathOptions={{ color: "#111a2c", fillColor: "#111a2c", fillOpacity: 0.9, weight: 1 }}>
          <Tooltip>{venueLabel}: {p.name}{p.affinity != null ? ` · ${p.affinity.toFixed(2)}` : ""}</Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
