import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { InteractiveMap, DirectionsButton } from "@/components/Maps/InteractiveMap";
import { GlassCard } from "@/components/ui/glassmorphism";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { CHENNAI_CENTER } from "@/data/mockData";

interface AlertsProps {
  onClose: () => void;
}

export function Alerts({ onClose }: AlertsProps) {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch overflow reports from backend
  useEffect(() => {
    fetch("/api/overflow-reports")
      .then(res => res.json())
      .then(data => {
        setReports(data.reports || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleResolve = async (reportId: string) => {
    try {
      const response = await fetch(`/api/overflow-reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "resolved" }),
      });

      if (!response.ok) throw new Error();

      // Remove resolved from UI
      setReports(prev => prev.filter(r => r._id !== reportId));

      toast({
        title: "Resolved",
        description: "Overflow marked as resolved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  const mapMarkers = reports.map(report => ({
    id: report._id,
    lat: report.location.coordinates[1],
    lng: report.location.coordinates[0],
    icon: "🚨",
    popup: `${report.overflowType} overflow reported`,
  }));

  if (loading) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Loading alerts...
      </div>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-foreground">Overflow {t("alerts")}</DialogTitle>
      </DialogHeader>

      <div className="space-y-6">
        {/* Map */}
        <InteractiveMap
          center={CHENNAI_CENTER}
          markers={mapMarkers}
          height="300px"
          showOverflowCircles={true}
          className="rounded-xl"
        />

        {/* Alert List */}
        {reports.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <div className="text-5xl mb-3">🎉</div>
            All overflow alerts are resolved!
          </div>
        )}

        {reports.map(report => (
          <GlassCard key={report._id}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground capitalize">
                  {report.overflowType} Overflow
                </h4>
                <p className="text-sm text-muted-foreground">
                  Location: {report.location.coordinates[1].toFixed(4)}, {report.location.coordinates[0].toFixed(4)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Resident: {report.resident?.name || "Unknown"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Reported {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <DirectionsButton destination="Overflow Location" />
                <Button
                  onClick={() => handleResolve(report._id)}
                  className="bg-green-600 text-white hover:bg-green-700 px-3 py-1"
                >
                  Resolve
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}

        {/* Close Button */}
        <Button onClick={onClose} variant="outline" className="w-full glassmorphism border-0">
          Close
        </Button>
      </div>
    </>
  );
}
