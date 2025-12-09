import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glassmorphism";
import { InteractiveMap, DirectionsButton } from "@/components/Maps/InteractiveMap";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { mockHouseMarkers } from "@/data/mockData";

type DumpsProps = {
  onClose: () => void;
};

type HouseStatus = "available" | "collected" | "skipped";

type DumpHouse = {
  id: string;
  name: string;
  phone: string;
  doorNumber: string;
  address: string;
  lat: number;
  lng: number;
  beaconScore: number;
  status: HouseStatus;
};

type SegregationStep = "idle" | "ask" | "upload";

export function Dumps({ onClose }: DumpsProps) {
  const { toast } = useToast();
  const { t } = useLanguage();

  // Initialise houses from mock markers
  const [houses, setHouses] = useState<DumpHouse[]>(
    () =>
      mockHouseMarkers.map((h) => ({
        id: h.id,
        name: h.householder || "Resident",
        phone: h.phone || "",
        doorNumber: h.doorNumber || h.id,
        address: (h as any).address || "Not specified",
        lat: h.lat,
        lng: h.lng,
        beaconScore: h.beaconScore ?? 80,
        status: "available" as HouseStatus,
      })) || []
  );

  const [selectedHouseId, setSelectedHouseId] = useState<string | null>(
    houses.length ? houses[0].id : null
  );

  const [segregationStep, setSegregationStep] = useState<SegregationStep>("idle");
  const [pendingHouseId, setPendingHouseId] = useState<string | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedHouse = useMemo(
    () => houses.find((h) => h.id === selectedHouseId) || null,
    [houses, selectedHouseId]
  );

  const availableHouses = useMemo(
    () => houses.filter((h) => h.status === "available"),
    [houses]
  );

  const center = useMemo(() => {
    if (!selectedHouse) return { lat: 13.0827, lng: 80.2707 }; // default Chennai
    return { lat: selectedHouse.lat, lng: selectedHouse.lng };
  }, [selectedHouse]);

  const markers = useMemo(
    () =>
      houses
        .filter((h) => h.status === "available")
        .map((h) => ({
          id: h.id,
          lat: h.lat,
          lng: h.lng,
          icon: "resident" as const,
          popup: `${h.doorNumber} – ${h.address}`,
          onClick: () => setSelectedHouseId(h.id),
        })),
    [houses]
  );

  const handleCall = (house: DumpHouse) => {
    toast({
      title: "Calling resident…",
      description: `${house.name} (${house.phone || house.doorNumber})`,
    });
  };

  const handleSms = (house: DumpHouse) => {
    toast({
      title: "SMS sent",
      description: `Reminder sent to ${house.doorNumber} about timely, segregated disposal.`,
    });
  };

  const handleReport = (house: DumpHouse) => {
    toast({
      title: "Report created",
      description: `Preliminary report created for ${house.doorNumber}. Green Champions can review later.`,
      variant: "destructive",
    });
  };

  // When collector taps "Collected"
  const handleCollectedClick = (house: DumpHouse) => {
    setPendingHouseId(house.id);
    setSegregationStep("ask");
    setEvidenceFile(null);
  };

  const handleSegregationYes = async () => {
    if (!pendingHouseId) return;
    const house = houses.find((h) => h.id === pendingHouseId);
    if (!house) return;

    // Call backend to mark collection complete (optional, safe if API missing)
    try {
      await fetch("/api/collector/collection-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ houseId: house.id }),
      });
    } catch (err) {
      console.error("collection-complete failed:", err);
    }

    // Update local state: mark as collected → remove from map list
    setHouses((prev) =>
      prev.map((h) =>
        h.id === house.id
          ? {
              ...h,
              status: "collected",
            }
          : h
      )
    );

    toast({
      title: "Collection recorded",
      description: `Waste collected from ${house.doorNumber} (segregated properly).`,
    });

    setSegregationStep("idle");
    setPendingHouseId(null);
  };

  const handleSegregationNoClick = () => {
    setSegregationStep("upload");
  };

  const handleEvidenceSubmit = async () => {
    if (!pendingHouseId) return;
    const house = houses.find((h) => h.id === pendingHouseId);
    if (!house) return;

    if (!evidenceFile) {
      toast({
        title: "Evidence required",
        description: "Please upload a photo as proof of improper segregation.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Prototype: we only simulate sending evidence.
      // In future: connect to /api/collector/report-house with FormData or image upload.
      await fetch("/api/collector/report-house", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          houseId: house.id,
          reason: "Improper segregation - fine recommended",
        }),
      });

      // Locally reduce beacon score (e.g. -10, min 0)
      setHouses((prev) =>
        prev.map((h) =>
          h.id === house.id
            ? {
                ...h,
                beaconScore: Math.max(0, h.beaconScore - 10),
                status: "skipped", // collection not done due to violation
              }
            : h
        )
      );

      toast({
        title: "Violation recorded",
        description:
          "Beacon Score reduced. Photo sent for Green Champion verification. Authority can decide fine.",
        variant: "destructive",
      });

      setSegregationStep("idle");
      setPendingHouseId(null);
      setEvidenceFile(null);
    } catch (err) {
      console.error("report-house failed:", err);
      toast({
        title: "Failed to submit evidence",
        description: "Please try again or contact Green Champion.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          🏠 {t("dumps") || "Dumps"} – Household Collections
        </h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ✕ Close
        </Button>
      </div>

      {/* Main layout */}
      <div className="grid md:grid-cols-[2fr,1.5fr] gap-4">
        {/* Map section */}
        <GlassCard className="p-3 md:p-4">
          <p className="text-sm text-muted-foreground mb-2">
            Tap a house marker or select from the list to view details.
          </p>
          <InteractiveMap
            center={{ lat: center.lat, lng: center.lng }}
            markers={markers}
            height="320px"
            className="rounded-xl"
          />
        </GlassCard>

        {/* Details + list */}
        <div className="space-y-3">
          <GlassCard className="p-3 md:p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Nearby Houses ({availableHouses.length} pending)
            </h3>
            <div className="max-h-44 overflow-y-auto space-y-1">
              {houses.map((house) => (
                <button
                  key={house.id}
                  onClick={() => setSelectedHouseId(house.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between ${
                    selectedHouseId === house.id
                      ? "bg-primary/10 border border-primary/40"
                      : "bg-background/40 hover:bg-background/70"
                  }`}
                >
                  <div>
                    <p className="font-medium">
                      {house.doorNumber} – {house.name}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {house.address}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p
                      className={
                        house.beaconScore >= 80
                          ? "text-green-500"
                          : house.beaconScore >= 50
                          ? "text-yellow-500"
                          : "text-red-500"
                      }
                    >
                      Beacon: {house.beaconScore}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {house.status === "available"
                        ? "Pending"
                        : house.status === "collected"
                        ? "Collected"
                        : "Violation"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Selected house details */}
          {selectedHouse && (
            <GlassCard className="p-3 md:p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {selectedHouse.doorNumber} – {selectedHouse.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedHouse.address}
                  </p>
                  <p className="text-xs mt-1">
                    Beacon Score:{" "}
                    <span
                      className={
                        selectedHouse.beaconScore >= 80
                          ? "text-green-500"
                          : selectedHouse.beaconScore >= 50
                          ? "text-yellow-500"
                          : "text-red-500"
                      }
                    >
                      {selectedHouse.beaconScore}
                    </span>
                  </p>
                </div>
                <DirectionsButton
                  className="text-xs px-3 py-1"
                  destination={selectedHouse.address}
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCall(selectedHouse)}
                >
                  📞 Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSms(selectedHouse)}
                >
                  💬 SMS
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReport(selectedHouse)}
                >
                  ⚠ Report
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => handleCollectedClick(selectedHouse)}
                  disabled={selectedHouse.status !== "available"}
                >
                  ✅ Mark Collected
                </Button>
              </div>

              {/* New segregation + evidence flow */}
              {pendingHouseId === selectedHouse.id && (
                <div className="mt-3 border-t border-border pt-3 space-y-3">
                  {segregationStep === "ask" && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Did the resident segregate the waste properly?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleSegregationYes}
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          ✅ Yes, properly segregated
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleSegregationNoClick}
                        >
                          ❌ No, not segregated
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        If you select "No", you will need to upload a photo.
                        Green Champions will verify before any fine is imposed.
                      </p>
                    </div>
                  )}

                  {segregationStep === "upload" && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        Upload photo proof of improper segregation
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setEvidenceFile(e.target.files?.[0] || null)
                        }
                        className="text-xs"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleEvidenceSubmit}
                          disabled={submitting}
                        >
                          {submitting ? "Submitting…" : "Submit evidence"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSegregationStep("idle");
                            setPendingHouseId(null);
                            setEvidenceFile(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Photo will be stored for Green Champions and Authority
                        review. Beacon Score is reduced only after this step.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
