import { useEffect, useMemo, useState } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Polygon,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L, { type LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type LayerKey = "forest" | "water" | "protected" | "landuse";

type FeaturePoint = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  category: LayerKey;
  tags: Record<string, string>;
};

type GisApplication = {
  application_id: string;
  project_name: string;
  state: string;
  district: string;
  coordinates: string;
  land_area: number;
  environmental_data: string;
};

type Props = {
  application: GisApplication;
};

const INDIA_CENTER: LatLngTuple = [22.9734, 78.6569];

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function safeParse(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

function RecenterMap({ center }: { center: LatLngTuple }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function haversineMeters(a: LatLngTuple, b: LatLngTuple): number {
  const earth = 6371000;
  const dLat = toRadians(b[0] - a[0]);
  const dLon = toRadians(b[1] - a[1]);
  const lat1 = toRadians(a[0]);
  const lat2 = toRadians(b[0]);
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  return 2 * earth * Math.asin(Math.sqrt(h));
}

function formatDistance(meters: number | null): string {
  if (meters === null || Number.isNaN(meters)) return "Not available";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function approximateSiteRadiusMeters(landAreaHectare: number): number {
  const sqm = Math.max(0, Number(landAreaHectare || 0)) * 10000;
  if (!sqm) return 120;
  return Math.max(120, Math.sqrt(sqm / Math.PI));
}

function parseCoordinates(raw: string): { center: LatLngTuple | null; polygon: LatLngTuple[] | null } {
  const text = String(raw || "").trim();
  if (!text) return { center: null, polygon: null };

  try {
    const parsed = JSON.parse(text) as unknown;
    if (Array.isArray(parsed) && parsed.length >= 2) {
      if (Array.isArray(parsed[0])) {
        const polygon = (parsed as unknown[])
          .map((pair) => (Array.isArray(pair) ? [Number(pair[0]), Number(pair[1])] : null))
          .filter((pair): pair is LatLngTuple => Boolean(pair && Number.isFinite(pair[0]) && Number.isFinite(pair[1])));
        if (polygon.length >= 3) {
          return { center: polygon[0], polygon };
        }
      }

      const lat = Number((parsed as unknown[])[0]);
      const lng = Number((parsed as unknown[])[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { center: [lat, lng], polygon: null };
      }
    }

    if (parsed && typeof parsed === "object") {
      const obj = parsed as Record<string, unknown>;
      const lat = Number(obj.lat ?? obj.latitude);
      const lng = Number(obj.lng ?? obj.lon ?? obj.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return { center: [lat, lng], polygon: null };
      }
    }
  } catch {
    // Continue with free-text parsing.
  }

  const values = text.match(/-?\d+(?:\.\d+)?/g)?.map(Number).filter(Number.isFinite) ?? [];
  if (values.length < 2) return { center: null, polygon: null };

  const pairs: LatLngTuple[] = [];
  for (let i = 0; i + 1 < values.length; i += 2) {
    const lat = values[i];
    const lng = values[i + 1];
    if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      pairs.push([lat, lng]);
    }
  }

  if (pairs.length >= 3) return { center: pairs[0], polygon: pairs };
  if (pairs.length) return { center: pairs[0], polygon: null };
  return { center: null, polygon: null };
}

async function geocodeDistrictState(district: string, state: string): Promise<LatLngTuple | null> {
  const query = [district, state, "India"].filter(Boolean).join(", ");
  if (!query.trim()) return null;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;

  const rows = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!rows?.length) return null;

  const lat = Number(rows[0].lat);
  const lng = Number(rows[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

async function fetchOverpassCategory(center: LatLngTuple, queryBody: string, category: LayerKey): Promise<FeaturePoint[]> {
  const [lat, lon] = center;
  const body = `[out:json][timeout:25];(${queryBody});out center tags 100;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body,
  });
  if (!res.ok) {
    throw new Error(`Failed to load ${category} layer near ${lat},${lon}.`);
  }

  const payload = (await res.json()) as {
    elements?: Array<{
      id: number;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags?: Record<string, string>;
    }>;
  };

  const elements = payload.elements ?? [];
  return elements
    .map((element) => {
      const pointLat = Number.isFinite(element.lat) ? element.lat : element.center?.lat;
      const pointLon = Number.isFinite(element.lon) ? element.lon : element.center?.lon;
      if (!Number.isFinite(pointLat) || !Number.isFinite(pointLon)) return null;
      const tags = element.tags ?? {};
      const fallbackName =
        tags.name || tags.landuse || tags.natural || tags.waterway || tags.boundary || "Unnamed feature";
      return {
        id: `${category}-${element.id}`,
        lat: pointLat,
        lng: pointLon,
        label: fallbackName,
        category,
        tags,
      } as FeaturePoint;
    })
    .filter((item): item is FeaturePoint => Boolean(item));
}

export function GisEnvironmentalVerificationPanel({ application }: Props) {
  const [center, setCenter] = useState<LatLngTuple>(INDIA_CENTER);
  const [sitePolygon, setSitePolygon] = useState<LatLngTuple[] | null>(null);
  const [mapView, setMapView] = useState<"satellite" | "standard">("satellite");
  const [layerVisibility, setLayerVisibility] = useState<Record<LayerKey, boolean>>({
    forest: true,
    water: true,
    protected: true,
    landuse: true,
  });
  const [layers, setLayers] = useState<Record<LayerKey, FeaturePoint[]>>({
    forest: [],
    water: [],
    protected: [],
    landuse: [],
  });
  const [isLoadingLayers, setIsLoadingLayers] = useState(false);
  const [layerError, setLayerError] = useState("");

  const env = useMemo(() => safeParse(application.environmental_data), [application.environmental_data]);
  const siteRadius = useMemo(() => approximateSiteRadiusMeters(application.land_area), [application.land_area]);

  useEffect(() => {
    let active = true;

    const loadLocation = async () => {
      const parsed = parseCoordinates(application.coordinates);
      if (parsed.center) {
        if (!active) return;
        setCenter(parsed.center);
        setSitePolygon(parsed.polygon);
        return;
      }

      try {
        const geocoded = await geocodeDistrictState(application.district, application.state);
        if (active && geocoded) {
          setCenter(geocoded);
          setSitePolygon(null);
        }
      } catch {
        if (active) {
          setCenter(INDIA_CENTER);
          setSitePolygon(null);
        }
      }
    };

    loadLocation();

    return () => {
      active = false;
    };
  }, [application.coordinates, application.district, application.state]);

  useEffect(() => {
    let active = true;
    const loadLayers = async () => {
      setIsLoadingLayers(true);
      setLayerError("");

      const [lat, lon] = center;
      const around10k = `(around:10000,${lat},${lon})`;
      const around15k = `(around:15000,${lat},${lon})`;
      const around8k = `(around:8000,${lat},${lon})`;

      const tasks = [
        fetchOverpassCategory(
          center,
          `nwr["landuse"="forest"]${around10k};nwr["natural"="wood"]${around10k};`,
          "forest",
        ),
        fetchOverpassCategory(
          center,
          `nwr["natural"="water"]${around10k};nwr["waterway"]${around10k};nwr["water"]${around10k};`,
          "water",
        ),
        fetchOverpassCategory(
          center,
          `nwr["boundary"="protected_area"]${around15k};nwr["leisure"="nature_reserve"]${around15k};nwr["protect_class"]${around15k};`,
          "protected",
        ),
        fetchOverpassCategory(
          center,
          `nwr["landuse"]${around8k};`,
          "landuse",
        ),
      ];

      const [forest, water, protectedAreas, landuse] = await Promise.allSettled(tasks);

      if (!active) return;

      setLayers({
        forest: forest.status === "fulfilled" ? forest.value : [],
        water: water.status === "fulfilled" ? water.value : [],
        protected: protectedAreas.status === "fulfilled" ? protectedAreas.value : [],
        landuse: landuse.status === "fulfilled" ? landuse.value : [],
      });

      const failures = [forest, water, protectedAreas, landuse].filter((x) => x.status === "rejected").length;
      if (failures > 0) {
        setLayerError("Some environmental overlays could not be fetched at the moment.");
      }

      setIsLoadingLayers(false);
    };

    loadLayers();

    return () => {
      active = false;
    };
  }, [center]);

  const nearest = (points: FeaturePoint[]): number | null => {
    if (!points.length) return null;
    return points.reduce<number>((best, item) => {
      const distance = haversineMeters(center, [item.lat, item.lng]);
      return Math.min(best, distance);
    }, Number.POSITIVE_INFINITY);
  };

  const nearestForest = nearest(layers.forest);
  const nearestWater = nearest(layers.water);
  const nearestProtected = nearest(layers.protected);
  const protectedOverlap = nearestProtected !== null && nearestProtected <= siteRadius;

  const sensitivityWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (protectedOverlap) warnings.push("Project site intersects or is very close to a protected zone.");
    if (nearestWater !== null && nearestWater < 1000) warnings.push("Water body within 1 km of project site.");
    if (nearestForest !== null && nearestForest < 2000) warnings.push("Forest cover detected within 2 km of project site.");
    return warnings;
  }, [nearestForest, nearestWater, protectedOverlap]);

  const riskLevel = useMemo(() => {
    let score = 0;
    if (protectedOverlap) score += 3;
    if (nearestWater !== null && nearestWater < 1000) score += 1;
    if (nearestForest !== null && nearestForest < 2000) score += 1;
    if (sensitivityWarnings.length > 1) score += 1;

    if (score >= 4) return "High";
    if (score >= 2) return "Medium";
    return "Low";
  }, [nearestForest, nearestWater, protectedOverlap, sensitivityWarnings.length]);

  const landUseTags = useMemo(() => {
    const labels = layers.landuse
      .map((item) => item.tags.landuse)
      .filter((value): value is string => Boolean(value));
    return Array.from(new Set(labels)).slice(0, 6);
  }, [layers.landuse]);

  const toggleLayer = (key: LayerKey) => {
    setLayerVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const tileUrl = mapView === "satellite"
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const tileAttribution = mapView === "satellite"
    ? "Tiles &copy; Esri"
    : "&copy; OpenStreetMap contributors";

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">GIS Environmental Verification Panel</h3>
          <p className="text-xs text-gray-600 mt-1">Read-only visual verification using submitted project location.</p>
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          <button
            className={`px-3 py-1.5 ${mapView === "satellite" ? "bg-[#1A5C1A] text-white" : "bg-white text-gray-700"}`}
            onClick={() => setMapView("satellite")}
          >
            Satellite
          </button>
          <button
            className={`px-3 py-1.5 ${mapView === "standard" ? "bg-[#1A5C1A] text-white" : "bg-white text-gray-700"}`}
            onClick={() => setMapView("standard")}
          >
            Standard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {([
          ["forest", "Forest cover"],
          ["water", "Water bodies"],
          ["protected", "Protected areas"],
          ["landuse", "Land use"],
        ] as Array<[LayerKey, string]>).map(([key, label]) => (
          <label key={key} className="inline-flex items-center gap-2 border border-gray-200 rounded-lg px-2 py-1.5">
            <input type="checkbox" checked={layerVisibility[key]} onChange={() => toggleLayer(key)} />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div className="h-[320px] rounded-lg overflow-hidden border border-gray-200">
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer attribution={tileAttribution} url={tileUrl} />
          <RecenterMap center={center} />

          <Marker position={center}>
            <Popup>
              <div className="text-xs">
                <p className="font-semibold">{application.project_name}</p>
                <p>{application.application_id}</p>
              </div>
            </Popup>
          </Marker>

          {sitePolygon && sitePolygon.length >= 3 ? (
            <Polygon positions={sitePolygon} pathOptions={{ color: "#ef4444", weight: 2 }} />
          ) : (
            <Circle center={center} radius={siteRadius} pathOptions={{ color: "#ef4444", fillOpacity: 0.12 }} />
          )}

          {layerVisibility.forest && layers.forest.map((item) => (
            <CircleMarker key={item.id} center={[item.lat, item.lng]} radius={5} pathOptions={{ color: "#16a34a" }}>
              <Popup>{item.label}</Popup>
            </CircleMarker>
          ))}

          {layerVisibility.water && layers.water.map((item) => (
            <CircleMarker key={item.id} center={[item.lat, item.lng]} radius={5} pathOptions={{ color: "#0284c7" }}>
              <Popup>{item.label}</Popup>
            </CircleMarker>
          ))}

          {layerVisibility.protected && layers.protected.map((item) => (
            <CircleMarker key={item.id} center={[item.lat, item.lng]} radius={5} pathOptions={{ color: "#dc2626" }}>
              <Popup>{item.label}</Popup>
            </CircleMarker>
          ))}

          {layerVisibility.landuse && layers.landuse.map((item) => (
            <CircleMarker key={item.id} center={[item.lat, item.lng]} radius={4} pathOptions={{ color: "#7c3aed" }}>
              <Popup>{item.tags.landuse || item.label}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
        <p className="text-sm font-semibold text-gray-800">Environmental Verification Summary</p>
        <ul className="mt-2 text-sm text-gray-700 space-y-1 list-disc pl-5">
          <li>Distance to Forest Area: {formatDistance(nearestForest)}</li>
          <li>Nearest Water Body: {formatDistance(nearestWater)}</li>
          <li>Protected Area Overlap: {protectedOverlap ? "Yes" : "No"}</li>
          <li>Environmental Risk Level: {riskLevel}</li>
        </ul>
        {sensitivityWarnings.length > 0 && (
          <ul className="mt-2 text-xs text-orange-700 list-disc pl-5 space-y-1">
            {sensitivityWarnings.map((warning, index) => (
              <li key={`${index}-${warning}`}>{warning}</li>
            ))}
          </ul>
        )}
        {landUseTags.length > 0 && (
          <p className="text-xs text-gray-600 mt-2">Land use classification nearby: {landUseTags.join(", ")}</p>
        )}
        {isLoadingLayers && <p className="text-xs text-gray-500 mt-2">Loading environmental overlays...</p>}
        {layerError && <p className="text-xs text-orange-700 mt-2">{layerError}</p>}
      </div>

      <div className="rounded-lg border border-gray-200 p-3">
        <p className="text-sm font-semibold text-gray-800">Submitted Location Details (Read-only)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 text-xs text-gray-700">
          <p><span className="font-medium">State:</span> {application.state || "-"}</p>
          <p><span className="font-medium">District:</span> {application.district || "-"}</p>
          <p className="md:col-span-2"><span className="font-medium">Coordinates:</span> {application.coordinates || "-"}</p>
          <p><span className="font-medium">Land Area:</span> {Number(application.land_area || 0).toLocaleString("en-IN")} ha</p>
          <p className="md:col-span-2"><span className="font-medium">Environmental Impact Description:</span> {String(env.impact || "-")}</p>
        </div>
      </div>
    </section>
  );
}
