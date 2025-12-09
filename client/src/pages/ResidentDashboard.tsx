import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/glassmorphism";
import { Header } from "@/components/Layout/Header";
import { ProfileDropdown } from "@/components/Common/ProfileDropdown";
import { BeaconScore } from "@/components/Common/BeaconScore";
import { StatusIndicator } from "@/components/Common/StatusIndicator";
import { GarCarTracker } from "@/components/Resident/GarCarTracker";
import { History } from "@/components/Resident/History";
import { OverflowReporting } from "@/components/Resident/OverflowReporting";
import { Connect } from "@/components/Resident/Connect";
import { Feedback } from "@/components/Resident/Feedback";
import { useLanguage } from "@/hooks/use-language";
import { useVoice } from "@/hooks/use-voice";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import type { Resident } from "@/types";
import ResidentTrainingHub from "@/components/ResidentTrainingHub";

export default function ResidentDashboard() {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { speak } = useVoice();
  const { user, profile, logout } = useApp();
  const { toast } = useToast();

  const [isAvailable, setIsAvailable] = useState(true);
  const [showBeaconScore, setShowBeaconScore] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [trainingCompleted, setTrainingCompleted] = useState(false);

  const residentProfile = profile as Resident;

  if (!user || !residentProfile) {
    setLocation("/");
    return null;
  }

  // Load training completion status from localStorage
  useEffect(() => {
    if (!residentProfile.id) return;
    const stored = localStorage.getItem(
      `binbeacon_resident_training_completed_${residentProfile.id}`
    );
    setTrainingCompleted(stored === "true");
  }, [residentProfile.id]);

  const handleStatusChange = async (available: boolean) => {
    if (available && residentProfile.beaconScore < 50) {
      toast({
        title: "Low Beacon Score",
        description: t("low-beacon-score"),
        variant: "destructive",
      });
      return;
    }

    setIsAvailable(available);
    speak(available ? "voice-available" : "voice-not-available");

    try {
      await fetch(`/api/residents/${residentProfile.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: available }),
      });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const openFeature = async (feature: string) => {
    setActiveFeature(feature);

    if (feature === "history") {
      try {
        const response = await fetch(
          `/api/residents/${residentProfile.id}/history`
        );
        const data = await response.json();
        setHistoryRecords(data);
      } catch (error) {
        console.error("History fetch failed:", error);
      }
    }
  };

  const closeFeature = () => {
    setActiveFeature(null);
  };

  const handleEmergency = () => {
    speak("voice-emergency");
    toast({
      title: "Emergency Alert",
      description: t("emergency-sent"),
      variant: "destructive",
    });
  };

  const renderFeatureModal = () => {
    if (!activeFeature) return null;

    const featureComponents = {
      tracker: <GarCarTracker onClose={closeFeature} />,
      history: React.createElement(History as any, { onClose: closeFeature, records: historyRecords }),
      overflow: <OverflowReporting onClose={closeFeature} />,
      connect: <Connect onClose={closeFeature} />,
      feedback: (
        <Feedback onClose={closeFeature} onEmergency={handleEmergency} />
      ),
      training: (
        <ResidentTrainingHub residentId={residentProfile.id} />
      ),
    };

    return (
      <Dialog open={!!activeFeature} onOpenChange={closeFeature}>
        <DialogContent className="glassmorphism border-0 max-w-4xl max-h-[90vh] overflow-y-auto">
          {featureComponents[activeFeature as keyof typeof featureComponents]}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen p-4">
      <Header />

      {/* Dashboard Header */}
      <GlassCard className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ProfileDropdown
              user={user}
              profile={residentProfile}
              isAvailable={isAvailable}
              onStatusChange={handleStatusChange}
              onShowBeaconScore={() => setShowBeaconScore(true)}
              onShowTraining={() => openFeature("training")}
              onEditProfile={() => {}}
              onLogout={handleLogout}
            />

            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {t("welcome")}
              </h1>
              <p className="text-muted-foreground">{t("resident-desc")}</p>
              <p className="text-xs mt-1">
                Training status:{" "}
                <span
                  className={
                    trainingCompleted
                      ? "inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/50"
                      : "inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/40"
                  }
                >
                  {trainingCompleted
                    ? "✅ Green Citizen Trained"
                    : "⏳ Training Pending"}
                </span>
              </p>
            </div>
          </div>

          {/* Status Toggle Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleStatusChange(true)}
              className={`px-6 py-3 rounded-xl transition-all transform hover:scale-105 ${
                isAvailable
                  ? "bg-primary text-primary-foreground"
                  : "glassmorphism border-0 text-foreground hover:bg-primary hover:text-primary-foreground"
              }`}
              data-testid="available-button"
            >
               {t("available")}
            </Button>
            <Button
              onClick={() => handleStatusChange(false)}
              className={`px-6 py-3 rounded-xl transition-all transform hover:scale-105 ${
                !isAvailable
                  ? "bg-destructive text-destructive-foreground"
                  : "glassmorphism border-0 text-foreground hover:bg-destructive hover:text-destructive-foreground"
              }`}
              data-testid="not-available-button"
            >
               {t("not-available")}
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* GarCar Tracker */}
        <button
          onClick={() => openFeature("tracker")}
          className="glassmorphism rounded-2xl p-6 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer transform hover:scale-105 group text-left"
          data-testid="feature-garcar-tracker"
        >
          <div className="text-4xl mb-4 group-hover:animate-bounce">🚛</div>
          <h3 className="text-xl font-semibold mb-2">
            {t("garcar-tracker")}
          </h3>
          <p className="text-sm text-muted-foreground group-hover:text-primary-foreground">
            {t("track-garbage-truck")}
          </p>
        </button>

        {/* History */}
        <button
          onClick={() => openFeature("history")}
          className="glassmorphism rounded-2xl p-6 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer transform hover:scale-105 group text-left"
          data-testid="feature-history"
        >
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">{t("history")}</h3>
          <p className="text-sm text-muted-foreground group-hover:text-primary-foreground">
            {t("view-past-pickups")}
          </p>
        </button>

        {/* Overflow Reporting */}
        <button
          onClick={() => openFeature("overflow")}
          className="glassmorphism rounded-2xl p-6 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer transform hover:scale-105 group text-left"
          data-testid="feature-overflow"
        >
          <div className="text-4xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2">
            {t("overflow-reporting")}
          </h3>
          <p className="text-sm text-muted-foreground group-hover:text-primary-foreground">
            {t("report-overflow")}
          </p>
        </button>

        {/* Connect */}
        <button
          onClick={() => openFeature("connect")}
          className="glassmorphism rounded-2xl p-6 hover:bg-primary hover:text-primary-foreground transition-all cursor-pointer transform hover:scale-105 group text-left"
          data-testid="feature-connect"
        >
          <div className="text-4xl mb-4">🤝</div>
          <h3 className="text-xl font-semibold mb-2">{t("connect")}</h3>
          <p className="text-sm text-muted-foreground group-hover:text-primary-foreground">
            {t("tips-chats-distribute")}
          </p>
        </button>
      </div>

      {/* Feedback & Emergency */}
      <div className="grid md:grid-cols-2 gap-6">
        <button
          onClick={() => openFeature("feedback")}
          className="glassmorphism rounded-xl p-6 hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer transform hover:scale-105 group"
          data-testid="feature-feedback"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">⭐</div>
            <div className="text-left">
              <h3 className="text-xl font-semibold mb-2">
                {t("feedback")} & {t("emergency")}
              </h3>
              <p className="text-sm text-muted-foreground group-hover:text-accent-foreground">
                Rate collectors and report emergencies
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Beacon Score Modal */}
      {showBeaconScore && (
        <BeaconScore
          score={residentProfile.beaconScore}
          name={user.name}
          doorNumber={residentProfile.doorNumber}
          address={residentProfile.address}
          onClose={() => setShowBeaconScore(false)}
        />
      )}

      {/* Feature Modals */}
      {renderFeatureModal()}
    </div>
  );
}
