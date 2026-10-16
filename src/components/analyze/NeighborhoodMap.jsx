import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useLang } from "@/lib/i18n";
import { cityMeta, neighborhoods } from "@/lib/analyzeData";
import { scoreHex } from "./badges";

export default function NeighborhoodMap({ cityId, scores }) {
  const { t, lang } = useLang();
  const meta = cityMeta[cityId] || cityMeta.hcmc;
  const hoods = neighborhoods[cityId] || [];

  return (
    <section className="rounded-lg border border-border p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("result.map")}</p>
      <p className="mt-2 text-xs text-muted-foreground">{t("result.mapHint")}</p>
      <div className="relative z-0 mt-5 overflow-hidden rounded-md border border-border">
        <MapContainer
          center={meta.center}
          zoom={meta.zoom}
          scrollWheelZoom={false}
          className="h-[420px] w-full"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
            subdomains="abcd"
          />
          {hoods.map((nb) => {
            const s = (scores || []).find((x) => x.name === nb.name);
            const score = s?.score ?? 0;
            const color = scoreHex(score);
            return (
              <CircleMarker
                key={nb.name}
                center={[nb.lat, nb.lng]}
                radius={10 + (score / 100) * 18}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.35, weight: 1.5 }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  <span className="font-mono text-xs">
                    {lang === "vi" ? nb.vi : nb.name} · {score}
                  </span>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </section>
  );
}