// client/src/components/Authority/TrainingAnalytics.tsx
import React from "react";

const mockTrainingAnalytics = {
  totalResidents: 120,
  trainedResidents: 84,
  totalCollectors: 12,
  trainedCollectors: 9,
  wards: [
    {
      name: "Ward 1 – Anna Nagar",
      residentsTrainedPct: 92,
      collectorsTrainedPct: 100,
    },
    {
      name: "Ward 2 – T Nagar",
      residentsTrainedPct: 78,
      collectorsTrainedPct: 80,
    },
    {
      name: "Ward 3 – KK Nagar",
      residentsTrainedPct: 61,
      collectorsTrainedPct: 67,
    },
    {
      name: "Ward 4 – Vadapalani",
      residentsTrainedPct: 50,
      collectorsTrainedPct: 50,
    },
  ],
};

const AuthorityTrainingAnalytics: React.FC = () => {
  const {
    totalResidents,
    trainedResidents,
    totalCollectors,
    trainedCollectors,
    wards,
  } = mockTrainingAnalytics;

  const residentPct =
    totalResidents === 0
      ? 0
      : Math.round((trainedResidents / totalResidents) * 100);
  const collectorPct =
    totalCollectors === 0
      ? 0
      : Math.round((trainedCollectors / totalCollectors) * 100);

  const colourForPct = (pct: number) => {
    if (pct >= 80) return "bg-emerald-400";
    if (pct >= 50) return "bg-amber-400";
    return "bg-red-400";
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-2xl bg-white/10 backdrop-blur shadow-lg border border-white/20 p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            Training Analytics – Green Citizen & Worker Readiness
          </h2>
          <p className="text-sm text-white/70">
            Monitor training completion across citizens and waste workers, and
            identify wards that need special focus.
          </p>
        </div>
        <div className="flex flex-col items-end text-xs text-white/60">
          <span>Updated: demo data (final build can use live DB)</span>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-black/30 border border-white/15 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Citizen Training Coverage
              </h3>
              <p className="text-xs text-white/60">
                Mandatory training for all waste generators
              </p>
            </div>
            <span className="text-lg font-semibold text-emerald-300">
              {residentPct}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
            <div
              className={`h-full ${colourForPct(
                residentPct
              )} transition-all`}
              style={{ width: `${residentPct}%` }}
            />
          </div>
          <p className="text-xs text-white/70">
            {trainedResidents} / {totalResidents} households completed the
            Green Citizen training modules.
          </p>
        </div>

        <div className="rounded-2xl bg-black/30 border border-white/15 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Waste Worker Training Coverage
              </h3>
              <p className="text-xs text-white/60">
                Safety, SOP & dignity training for collectors
              </p>
            </div>
            <span className="text-lg font-semibold text-emerald-300">
              {collectorPct}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
            <div
              className={`h-full ${colourForPct(
                collectorPct
              )} transition-all`}
              style={{ width: `${collectorPct}%` }}
            />
          </div>
          <p className="text-xs text-white/70">
            {trainedCollectors} / {totalCollectors} registered collectors have
            completed core training.
          </p>
        </div>
      </div>

      {/* Wards table */}
      <div className="rounded-2xl bg-black/30 border border-white/15 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">
            Ward-wise Training Status
          </h3>
          <p className="text-xs text-white/60">
            Focus on red and amber wards for special campaigns.
          </p>
        </div>

        <div className="space-y-3">
          {wards.map((ward) => (
            <div
              key={ward.name}
              className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-2"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <p className="text-sm font-medium text-white">{ward.name}</p>
                <div className="flex gap-3 text-xs text-white/70">
                  <span>
                    Citizens:{" "}
                    <span className="font-semibold">
                      {ward.residentsTrainedPct}%
                    </span>
                  </span>
                  <span>
                    Collectors:{" "}
                    <span className="font-semibold">
                      {ward.collectorsTrainedPct}%
                    </span>
                  </span>
                </div>
              </div>

              {/* dual bars */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-white/60">
                  <span>Citizens trained</span>
                  <span>{ward.residentsTrainedPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/12 overflow-hidden">
                  <div
                    className={`h-full ${colourForPct(
                      ward.residentsTrainedPct
                    )}`}
                    style={{ width: `${ward.residentsTrainedPct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/60 mt-1">
                  <span>Collectors trained</span>
                  <span>{ward.collectorsTrainedPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/12 overflow-hidden">
                  <div
                    className={`h-full ${colourForPct(
                      ward.collectorsTrainedPct
                    )}`}
                    style={{ width: `${ward.collectorsTrainedPct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interpretation note for judges */}
      <div className="text-[11px] text-white/60">
        <p className="mb-1">
          ✅ Green (&gt;= 80%): Wards where almost everyone is trained.
        </p>
        <p className="mb-1">
          🟡 Amber (50–79%): Wards that need targeted IEC campaigns.
        </p>
        <p>
          🔴 Red (&lt; 50%): High-priority wards for enforcement and special
          drives.
        </p>
      </div>
    </div>
  );
};

export default AuthorityTrainingAnalytics;
