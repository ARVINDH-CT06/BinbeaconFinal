import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/glassmorphism";
import { InteractiveMap } from "@/components/Maps/InteractiveMap";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import { CHENNAI_CENTER } from "@/data/mockData";
import type { Resident } from "@/types";

type Props = {
  onClose: () => void;
};

type LocationState = {
  lat: number;
  lng: number;
  address?: string;
} | null;

export function OverflowReporting({ onClose }: Props) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { profile, user } = useApp();
  const residentProfile = profile as Resident;

  const [overflowType, setOverflowType] = useState<string>("garbage");
  const [location, setLocation] = useState<LocationState>(null);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // NEW: photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    setLocation({ lat, lng });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    // Simple type check – images only
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (jpeg, png, etc.).",
        variant: "destructive",
      });
      return;
    }

    setPhotoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
  };

  const handleSubmit = async () => {
    if (!location) {
      toast({
        title: "Location required",
        description: "Please tap on the map to mark the overflow location.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // For now we send JSON only.
      // hasPhoto + photoName are for future real image storage.
      const payload = {
        residentId: residentProfile.id,
        overflowType,
        remarks,
        location: {
          lat: location.lat,
          lng: location.lng,
          address: location.address ?? "",
        },
        hasPhoto: !!photoFile,
        photoName: photoFile?.name ?? null,
      };

      const res = await fetch("/api/overflow-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to submit report");
      }

      toast({
        title: t("overflow-submitted-title") || "Overflow report sent",
        description:
          t("overflow-submitted-desc") ||
          "Your geo-tagged overflow report has been sent to the authority.",
      });

      onClose();
    } catch (error) {
      console.error("Overflow report failed:", error);
      toast({
        title: "Failed to submit",
        description:
          "Something went wrong while sending your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {t("overflow-reporting") || "Report Overflow / Illegal Dumping"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("overflow-desc") ||
              "Tap on the map to mark the location, choose overflow type, and optionally attach a photo as proof."}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ✖ Close
        </button>
      </div>

      {/* Overflow type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t("overflow-type") || "Overflow type"}
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          {[
            { id: "garbage", label: "Garbage Overflow", emoji: "🗑️" },
            { id: "plastic", label: "Plastic Dump", emoji: "♻️" },
            { id: "sewage", label: "Sewage / Drain", emoji: "💧" },
            { id: "other", label: "Other", emoji: "⚠️" },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setOverflowType(opt.id)}
              className={`px-3 py-2 rounded-full border text-left transition-all ${
                overflowType === opt.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background/40 text-foreground border-border hover:border-primary/60"
              }`}
            >
              <span className="mr-1">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t("select-location") || "Select overflow location on the map"}
        </label>
        <div className="h-64 rounded-2xl overflow-hidden glassmorphism border border-border/60">
          <InteractiveMap
            center={CHENNAI_CENTER}
            markers={
              location
                ? [
                    {
                      id: "overflow-marker",
                      lat: location.lat,
                      lng: location.lng,
                      popup: "Overflow location",
                      icon: "⚠️",
                    },
                  ]
                : []
            }
            onMapClick={(loc) => handleMapClick(loc.lat, loc.lng)}
            height="100%"
            showOverflowCircles={false}
            showTruckAnimation={false}
          />
        </div>
        {location && (
          <p className="text-xs text-muted-foreground">
            Selected: {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </p>
        )}
      </div>

      {/* Photo upload – NEW */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Geo-tagged photo (optional)
        </label>
        <p className="text-xs text-muted-foreground">
          Attach a clear photo of the overflow spot. It will be linked with the
          map location you selected.
        </p>
        <div className="flex flex-col md:flex-row gap-3 items-start">
          <Input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="md:max-w-xs cursor-pointer"
          />
          {photoPreview && (
            <div className="rounded-xl overflow-hidden border border-border/60 max-w-[160px] max-h-[120px]">
              <img
                src={photoPreview}
                alt="Overflow preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        {photoFile && (
          <p className="text-[11px] text-muted-foreground">
            Selected file: <span className="font-medium">{photoFile.name}</span>
          </p>
        )}
      </div>

      {/* Remarks */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {t("remarks") || "Remarks (optional)"}
        </label>
        <Textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder={
            t("overflow-remarks-placeholder") ||
            "Example: Not collected for 3 days, attracting stray animals."
          }
          className="min-h-[80px]"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={submitting}
        >
          {t("cancel") || "Cancel"}
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting
            ? t("submitting") || "Submitting..."
            : t("submit-report") || "Submit Report"}
        </Button>
      </div>
    </GlassCard>
  );
}

export default OverflowReporting;
