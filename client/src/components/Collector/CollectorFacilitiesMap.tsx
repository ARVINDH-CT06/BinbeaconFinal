import React from "react";
import { GlassCard } from "@/components/ui/glassmorphism";
import { Button } from "@/components/ui/button";
import { InteractiveMap } from "@/components/Maps/InteractiveMap";
import { CHENNAI_CENTER } from "@/data/mockData";

type Facility = {
  id: string;
  name: string;
  type: "biomethanization" | "wte" | "recycling" | "scrap";
  lat: number;
  lng: number;
  description: string;
};

const facilities: Facility[] = [
  {
    id: "F-01",
    name: "Zone Biogas / Biomethanization Plant",
    type: "biomethanization",
    lat: CHENNAI_CENTER.lat + 0.01,
    lng: CHENNAI_CENTER.lng + 0.01,
    description: "Wet waste (organic) processing – linked to nearby wards.",
  },
  {
    id: "F-02",
    name: "Waste-to-Energy Plant",
    type: "wte",
    lat: CHENNAI_CENTER.lat - 0.008,
    lng: CHENNAI_CENTER.lng + 0.015,
    description: "Non-recyclable dry waste sent here for power generation.",
  },
  {
    id: "F-03",
    name: "Material Recovery Facility (Recycling Centre)",
    type: "recycling",
    lat: CHENNAI_CENTER.lat + 0.004,
    lng: CHENNAI_CENTER.lng - 0.012,
    description: "Segregated plastic, paper and metal received from ULB.",
  },
  {
    id: "F-04",
    name: "Authorised Scrap Shop Cluster",
    type: "scrap",
    lat: CHENNAI_CENTER.lat - 0.012,
    lng: CHENNAI_CENTER.lng - 0.006,
    description: "Registered scrap dealers integrated with ULB system.",
  },
];

function getIconForFacility(type: Facility["type"]): string {
  switch (type) {
    case "biomethanization":
      return "🔋";
    case "wte":
      return "🔥";
    case "recycling":
      return "♻️";
    case "scrap":
      return "🧺";
    default:
      return "🏭";
  }
}

export function CollectorFacilitiesMap({ onClose }: { onClose: () => void }) {
  const markers = facilities.map((f) => ({
    id: f.id,
    lat: f.lat,
    lng: f.lng,
    icon: getIconForFacility(f.type),
    popup: `${f.name}`,
  }));

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Waste Management Facilities Map
          </h2>
          <p className="text-sm text-muted-foreground">
            Biomethanization plant, Waste-to-Energy plant, recycling centres and
            authorised scrap shops connected to this ULB. Collectors can see
            where each waste stream finally goes.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-xs"
        >
          ✖ Close
        </Button>
      </div>

      <div className="h-72 rounded-2xl overflow-hidden glassmorphism border border-border/60">
        <InteractiveMap
          center={{ lat: CHENNAI_CENTER.lat, lng: CHENNAI_CENTER.lng }}
          markers={markers}
          height="100%"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 text-xs">
        {facilities.map((f) => (
          <div
            key={f.id}
            className="rounded-xl bg-background/40 border border-border/60 p-3 flex gap-2"
          >
            <div className="text-lg">
              {getIconForFacility(f.type)}
            </div>
            <div>
              <p className="font-semibold text-foreground">{f.name}</p>
              <p className="text-muted-foreground">{f.description}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Note: In a live deployment, these coordinates will be linked directly to
        actual ULB facilities and used for planning transfer routes for different
        waste fractions (wet, dry, hazardous).
      </p>
    </GlassCard>
  );
}

export default CollectorFacilitiesMap;
