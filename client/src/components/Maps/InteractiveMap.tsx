import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";

// Fix marker images for Leaflet
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  icon: string; // "resident" | "collector" | "authority" | "overflow" | custom emoji
  popup?: string;
  onClick?: () => void;
}

interface InteractiveMapProps {
  center?: MapLocation;
  markers?: MapMarker[];
  onMapClick?: (location: MapLocation) => void;
  height?: string;
  className?: string;
  showTruckAnimation?: boolean;
  showOverflowCircles?: boolean;
}

// emoji theme
const ICON_MAP: Record<string, string> = {
  resident: "🏠",
  collector: "🚛",
  authority: "🏢",
  overflow: "🔥",
  dustbin: "🗑️",
};

export function InteractiveMap({
  center = { lat: 28.6139, lng: 77.2090 }, // ★ New Delhi
  markers = [],
  onMapClick,
  height = "400px",
  className = "",
  showTruckAnimation = false,
  showOverflowCircles = false,
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // prevent map reuse crash
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // create new map instance
    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    mapInstanceRef.current = map;

    // base layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // markers
    markers.forEach((marker) => {
      const emoji = ICON_MAP[marker.icon] || marker.icon;

      const markerIcon = L.divIcon({
        html: `
          <div style="
            font-size: 26px;
            width: 38px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: 50%;
            box-shadow: 0px 0px 6px rgba(0,0,0,0.25);
          ">
            ${emoji}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        className: "",
      });

      const leafletMarker = L.marker([marker.lat, marker.lng], { icon: markerIcon }).addTo(map);
      if (marker.popup) leafletMarker.bindPopup(marker.popup);
      if (marker.onClick) leafletMarker.on("click", marker.onClick);
    });

    if (onMapClick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onMapClick({
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        });
      });
    }

    // ✅ Safe invalidateSize with cleanup
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        try {
          map.invalidateSize();
        } catch (err) {
          console.warn("Map invalidateSize failed:", err);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [center.lat, center.lng, JSON.stringify(markers), onMapClick]);

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ height }}>
      {/* map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* moving truck animation */}
      {showTruckAnimation && (
        <div className="absolute top-4 right-4 text-4xl animate-truck-move z-20">
          🚛
        </div>
      )}

      {/* overflow alert */}
      {showOverflowCircles && (
        <>
          <div className="absolute top-1/4 left-1/3 w-8 h-8 overflow-circle z-20" />
          <div className="absolute top-1/2 left-1/2 w-8 h-8 overflow-circle z-20" />
        </>
      )}

      {/* click hint */}
      {onMapClick && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
          <p className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
            Tap anywhere to pin location
          </p>
        </div>
      )}
    </div>
  );
}

// directions button unchanged
export function DirectionsButton({
  destination,
  className = "",
}: {
  destination?: string;
  className?: string;
}) {
  const handleGetDirections = () => {
    const baseUrl = "https://www.google.com/maps/dir/";
    const currentLocation = "Current+Location";
    const dest = destination || "New Delhi, Delhi, India";
    window.open(`${baseUrl}${currentLocation}/${encodeURIComponent(dest)}`, "_blank");
  };

  return (
    <Button
      onClick={handleGetDirections}
      className={`bg-primary text-primary-foreground hover:bg-primary/90 ${className}`}
      data-testid="get-directions"
    >
      🗺️ Get Directions
    </Button>
  );
}
