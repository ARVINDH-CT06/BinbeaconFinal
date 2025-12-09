// client/src/components/CollectorTrainingHub.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  collectorTrainingModules,
  type TrainingModule,
} from "@/data/trainingModules";
import { useToast } from "@/hooks/use-toast";

type ModuleProgress = {
  moduleId: string;
  completed: boolean;
  score: number;
};

type Props = {
  collectorId?: string;
};

const CollectorTrainingHub: React.FC<Props> = ({ collectorId }) => {
  const { toast } = useToast();

  const [progress, setProgress] = useState<ModuleProgress[]>([]);
  const [activeModule, setActiveModule] = useState<TrainingModule | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Record<string, number>>(
    {}
  );
  const [showQuiz, setShowQuiz] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  const overallCompletion = useMemo(() => {
    if (collectorTrainingModules.length === 0) return 0;
    const completedCount = progress.filter((p) => p.completed).length;
    return Math.round(
      (completedCount / collectorTrainingModules.length) * 100
    );
  }, [progress]);

  const isAllCompleted = overallCompletion === 100;

  // 🔐 Save completion info in localStorage so dashboard can read it
  useEffect(() => {
    if (!collectorId) return;
    if (isAllCompleted) {
      localStorage.setItem(
        `binbeacon_collector_training_completed_${collectorId}`,
        "true"
      );
    }
  }, [isAllCompleted, collectorId]);

  const handleStartModule = (module: TrainingModule) => {
    setActiveModule(module);
    setCurrentAnswers({});
    setShowQuiz(false);
    setShowCertificate(false);
  };

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    setCurrentAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleStartQuiz = () => {
    setShowQuiz(true);
  };

  const calculateScore = (module: TrainingModule): number => {
    let correct = 0;
    module.questions.forEach((q) => {
      if (currentAnswers[q.id] === q.correctIndex) {
        correct += 1;
      }
    });
    const total = module.questions.length || 1;
    return Math.round((correct / total) * 100);
  };

  const handleSubmitQuiz = () => {
    if (!activeModule) return;

    const score = calculateScore(activeModule);

    setProgress((prev) => {
      const existing = prev.find((p) => p.moduleId === activeModule.id);
      if (existing) {
        return prev.map((p) =>
          p.moduleId === activeModule.id
            ? { ...p, completed: true, score }
            : p
        );
      }
      return [
        ...prev,
        { moduleId: activeModule.id, completed: true, score },
      ];
    });

    toast({
      title: "Training Completed",
      description: `You scored ${score}% for "${activeModule.shortTitle}".`,
    });

    setShowQuiz(false);
  };

  const getModuleProgress = (moduleId: string): ModuleProgress | undefined =>
    progress.find((p) => p.moduleId === moduleId);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-2xl bg-white/10 backdrop-blur shadow-lg border border-white/20 p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-white">
            Worker Training Hub – Safety & SOPs
          </h2>
          <p className="text-sm text-white/70">
            Complete all modules to become a certified Safe & Dignified Waste
            Worker.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm text-white/80">
            Overall completion: {overallCompletion}%
          </span>
          <div className="w-40 h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all"
              style={{ width: `${overallCompletion}%` }}
            />
          </div>
          {isAllCompleted && (
            <button
              type="button"
              onClick={() => setShowCertificate(true)}
              className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-900 bg-emerald-300 px-2 py-1 rounded-full font-semibold shadow"
            >
              🎓 View Training Certificate
            </button>
          )}
        </div>
      </div>

      {/* Certificate view */}
      {showCertificate && isAllCompleted && (
        <div className="rounded-2xl bg-black/60 border border-emerald-400/70 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-emerald-200">
              Certificate of Completion
            </h3>
            <button
              onClick={() => setShowCertificate(false)}
              className="text-xs text-white/70 hover:text-white"
            >
              ✖ Close
            </button>
          </div>
          <p className="text-sm text-white/80">
            This collector has successfully completed the{" "}
            <span className="font-semibold">Safe & Dignified Waste Worker</span>{" "}
            training modules in BinBeacon, including:
          </p>
          <ul className="text-xs text-white/70 list-disc list-inside space-y-1">
            <li>Personal Protective Equipment & Safety</li>
            <li>Standard Operating Procedures for collection</li>
            <li>Dignity, rights and welfare of sanitation workers</li>
          </ul>
          <p className="text-[11px] text-white/60 mt-2">
            In production, this can be converted into a digitally signed
            certificate issued by the ULB / Municipal Authority.
          </p>
        </div>
      )}

      {/* Modules grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {collectorTrainingModules.map((module) => {
          const mp = getModuleProgress(module.id);
          return (
            <button
              key={module.id}
              onClick={() => handleStartModule(module)}
              className="text-left group rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-400/60 hover:bg-white/10 transition-all p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base md:text-lg font-semibold text-white">
                  {module.shortTitle}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-200 border border-emerald-500/40">
                  {module.level === "basic" ? "Basic" : "Advanced"}
                </span>
              </div>
              <p className="text-xs md:text-sm text-white/70 line-clamp-2">
                {module.description}
              </p>
              <div className="flex items-center justify-between text-xs text-white/60 mt-1">
                <span>⏱ {module.estimatedMinutes} min</span>
                {mp?.completed ? (
                  <span className="inline-flex items-center gap-1 text-emerald-300">
                    ✅ Completed ({mp.score}%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1">
                    📚 Not completed
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active module + quiz */}
      {activeModule && (
        <div className="mt-4 rounded-2xl bg-black/30 border border-white/10 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {activeModule.title}
              </h3>
              <p className="text-xs md:text-sm text-white/70">
                {activeModule.description}
              </p>
            </div>
            <button
              className="text-xs text-white/60 hover:text-white"
              onClick={() => setActiveModule(null)}
            >
              ✖ Close
            </button>
          </div>

          {activeModule.videoSrc && (
            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
              <video
                src={activeModule.videoSrc}
                controls
                className="w-full max-h-64 object-cover"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {!showQuiz ? (
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <p className="text-sm text-white/70">
                After watching/reading the module, click below to take a short
                quiz. Passing the quiz will mark the module as completed.
              </p>
              <button
                onClick={handleStartQuiz}
                className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-sm font-semibold text-black shadow-md"
              >
                Start Quiz
              </button>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {activeModule.questions.map((q) => (
                <div
                  key={q.id}
                  className="rounded-xl bg-white/5 border border-white/10 p-3 space-y-2"
                >
                  <p className="text-sm text-white">{q.text}</p>
                  <div className="flex flex-col gap-1">
                    {q.options.map((opt, idx) => {
                      const selected = currentAnswers[q.id] === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAnswerChange(q.id, idx)}
                          className={`text-left text-xs md:text-sm px-3 py-2 rounded-full border transition-all ${
                            selected
                              ? "bg-emerald-500/80 border-emerald-400 text-black"
                              : "bg-black/30 border-white/20 text-white/80 hover:border-emerald-400/60"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowQuiz(false)}
                  className="px-3 py-2 rounded-full text-xs md:text-sm border border-white/30 text-white/80 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitQuiz}
                  className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-xs md:text-sm font-semibold text-black shadow-md"
                >
                  Submit Quiz & Save Progress
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollectorTrainingHub;
