import { useState, useEffect } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { mockCollectionHistory } from "@/data/mockData";
import { useApp } from "@/contexts/AppContext";

interface HistoryProps {
  onClose: () => void;
}

export function History({ onClose }: HistoryProps) {
  const { t } = useLanguage();
  const { profile } = useApp(); // for future backend filtering
  const [history, setHistory] = useState(mockCollectionHistory);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    // 🔥 future backend call (auto-ready)
    // fetch(`/api/history/${profile.id}`)
    //   .then(res => res.json())
    //   .then(data => setHistory(data));
  }, []);

  const filteredHistory =
    filter === "all" ? history : history.filter((h) => h.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "collected":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "reported":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "collected":
        return "✅";
      case "pending":
        return "⏳";
      case "reported":
        return "⚠️";
      default:
        return "❓";
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-foreground">{t("history")}</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* 🔥 Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {["all", "collected", "pending", "reported"].map((btn) => (
            <Button
              key={btn}
              onClick={() => setFilter(btn)}
              variant="outline"
              size="sm"
              className={`glassmorphism border-0 ${
                filter === btn ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {btn.charAt(0).toUpperCase() + btn.slice(1)}
            </Button>
          ))}
        </div>

        {/* 🔥 History Table */}
        <div className="glassmorphism rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/20">
                <tr>
                  <th className="py-3 px-4 text-left text-foreground font-medium">Date</th>
                  <th className="py-3 px-4 text-left text-foreground font-medium">Type</th>
                  <th className="py-3 px-4 text-left text-foreground font-medium">Status</th>
                  <th className="py-3 px-4 text-left text-foreground font-medium">Collector</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border hover:bg-muted/10 transition-colors"
                  >
                    <td className="py-3 px-4 text-foreground">{item.date}</td>
                    <td className="py-3 px-4 text-foreground">{item.wasteType}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>{getStatusIcon(item.status)}</span>
                        <span
                          className={`font-medium capitalize ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-foreground">{item.collector}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🔥 Summary */}
        <div className="glassmorphism rounded-xl p-4">
          <h4 className="font-semibold text-foreground mb-3">Summary</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-500">
                {history.filter((h) => h.status === "collected").length}
              </div>
              <div className="text-sm text-muted-foreground">Collected</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {history.filter((h) => h.status === "pending").length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-500">
                {history.filter((h) => h.status === "reported").length}
              </div>
              <div className="text-sm text-muted-foreground">Reported</div>
            </div>
          </div>
        </div>

        <Button onClick={onClose} variant="outline" className="w-full glassmorphism border-0">
          Close
        </Button>
      </div>
    </>
  );
}
