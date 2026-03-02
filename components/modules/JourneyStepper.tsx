"use client";

import { useState } from "react";

export type JourneyPhase =
  | "configure"
  | "model"
  | "scenarios"
  | "compare"
  | "decide"
  | "monitor";

interface JourneyStep {
  id: JourneyPhase;
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: "completed" | "current" | "upcoming" | "locked";
}

interface JourneyStepperProps {
  currentPhase: JourneyPhase;
  completedPhases: JourneyPhase[];
  onPhaseSelect?: (phase: JourneyPhase) => void;
  variant?: "horizontal" | "vertical" | "compact";
}

const JOURNEY_STEPS: Omit<JourneyStep, "status">[] = [
  {
    id: "configure",
    number: 1,
    title: "Configure",
    description: "Set assumptions & drivers",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: "model",
    number: 2,
    title: "Build Model",
    description: "3-statement financials",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: "scenarios",
    number: 3,
    title: "Run Scenarios",
    description: "Stress test & simulate",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: "compare",
    number: 4,
    title: "Compare",
    description: "Evaluate outcomes",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
  },
  {
    id: "decide",
    number: 5,
    title: "Select Strategy",
    description: "Make decisions",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "monitor",
    number: 6,
    title: "Monitor",
    description: "Track performance",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

function getStepStatus(
  stepId: JourneyPhase,
  currentPhase: JourneyPhase,
  completedPhases: JourneyPhase[]
): "completed" | "current" | "upcoming" | "locked" {
  if (completedPhases.includes(stepId)) return "completed";
  if (stepId === currentPhase) return "current";

  const stepIndex = JOURNEY_STEPS.findIndex(s => s.id === stepId);
  const currentIndex = JOURNEY_STEPS.findIndex(s => s.id === currentPhase);

  // Allow clicking one step ahead or any completed step
  if (stepIndex === currentIndex + 1) return "upcoming";
  if (stepIndex < currentIndex) return "upcoming";

  return "locked";
}

export function JourneyStepper({
  currentPhase,
  completedPhases,
  onPhaseSelect,
  variant = "horizontal",
}: JourneyStepperProps) {
  const steps: JourneyStep[] = JOURNEY_STEPS.map(step => ({
    ...step,
    status: getStepStatus(step.id, currentPhase, completedPhases),
  }));

  const completionPercentage = Math.round((completedPhases.length / JOURNEY_STEPS.length) * 100);

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-1">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => step.status !== "locked" && onPhaseSelect?.(step.id)}
              disabled={step.status === "locked"}
              className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                step.status === "completed"
                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                  : step.status === "current"
                  ? "bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/50"
                  : step.status === "upcoming"
                  ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
              }`}
              title={`${step.number}. ${step.title}`}
            >
              {step.status === "completed" ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-xs font-bold">{step.number}</span>
              )}
            </button>
          ))}
        </div>
        <div className="flex-1 min-w-0 ml-2">
          <p className="text-xs font-medium text-white truncate">
            {steps.find(s => s.status === "current")?.title || "Complete"}
          </p>
          <p className="text-[10px] text-zinc-500">{completionPercentage}% complete</p>
        </div>
      </div>
    );
  }

  if (variant === "vertical") {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Planning Journey</h3>
          <span className="text-xs text-zinc-500">{completionPercentage}%</span>
        </div>

        {steps.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => step.status !== "locked" && onPhaseSelect?.(step.id)}
            disabled={step.status === "locked"}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
              step.status === "completed"
                ? "bg-green-500/10 border border-green-500/20 hover:bg-green-500/15"
                : step.status === "current"
                ? "bg-amber-500/10 border border-amber-500/30 ring-1 ring-amber-500/50"
                : step.status === "upcoming"
                ? "bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800"
                : "bg-zinc-900/30 border border-zinc-800/30 opacity-50 cursor-not-allowed"
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              step.status === "completed"
                ? "bg-green-500/20 text-green-400"
                : step.status === "current"
                ? "bg-amber-500/20 text-amber-400"
                : step.status === "upcoming"
                ? "bg-zinc-700 text-zinc-400"
                : "bg-zinc-800 text-zinc-600"
            }`}>
              {step.status === "completed" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.icon
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  step.status === "completed" ? "text-green-400" :
                  step.status === "current" ? "text-amber-400" :
                  step.status === "upcoming" ? "text-white" : "text-zinc-500"
                }`}>
                  {step.title}
                </span>
                {step.status === "current" && (
                  <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/20 text-amber-400 rounded">
                    CURRENT
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{step.description}</p>
            </div>
            {step.status !== "locked" && step.status !== "current" && (
              <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className="relative">
      {/* Progress bar background */}
      <div className="absolute top-6 left-0 right-0 h-0.5 bg-zinc-800" />
      <div
        className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-green-500 to-amber-500 transition-all duration-500"
        style={{ width: `${completionPercentage}%` }}
      />

      <div className="relative flex justify-between">
        {steps.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => step.status !== "locked" && onPhaseSelect?.(step.id)}
            disabled={step.status === "locked"}
            className="flex flex-col items-center group"
          >
            <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              step.status === "completed"
                ? "bg-green-500/20 text-green-400 border-2 border-green-500/50 group-hover:bg-green-500/30"
                : step.status === "current"
                ? "bg-amber-500/20 text-amber-400 border-2 border-amber-500 shadow-lg shadow-amber-500/20"
                : step.status === "upcoming"
                ? "bg-zinc-800 text-zinc-400 border-2 border-zinc-700 group-hover:border-zinc-600 group-hover:bg-zinc-700"
                : "bg-zinc-900 text-zinc-600 border-2 border-zinc-800 cursor-not-allowed"
            }`}>
              {step.status === "completed" ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.icon
              )}
            </div>

            <div className="mt-3 text-center">
              <p className={`text-xs font-medium ${
                step.status === "completed" ? "text-green-400" :
                step.status === "current" ? "text-amber-400" :
                step.status === "upcoming" ? "text-zinc-300" : "text-zinc-600"
              }`}>
                Step {step.number}
              </p>
              <p className={`text-sm font-semibold mt-0.5 ${
                step.status === "completed" ? "text-green-400" :
                step.status === "current" ? "text-white" :
                step.status === "upcoming" ? "text-zinc-400" : "text-zinc-600"
              }`}>
                {step.title}
              </p>
              <p className="text-[10px] text-zinc-500 mt-0.5 max-w-[80px]">{step.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Hook for managing journey state
export function useJourneyState(initialPhase: JourneyPhase = "configure") {
  const [currentPhase, setCurrentPhase] = useState<JourneyPhase>(initialPhase);
  const [completedPhases, setCompletedPhases] = useState<JourneyPhase[]>([]);

  const completePhase = (phase: JourneyPhase) => {
    if (!completedPhases.includes(phase)) {
      setCompletedPhases(prev => [...prev, phase]);
    }

    // Auto-advance to next phase
    const currentIndex = JOURNEY_STEPS.findIndex(s => s.id === phase);
    if (currentIndex < JOURNEY_STEPS.length - 1) {
      setCurrentPhase(JOURNEY_STEPS[currentIndex + 1].id);
    }
  };

  const goToPhase = (phase: JourneyPhase) => {
    const phaseIndex = JOURNEY_STEPS.findIndex(s => s.id === phase);
    const currentIndex = JOURNEY_STEPS.findIndex(s => s.id === currentPhase);

    // Can only go to completed phases or one step ahead
    if (completedPhases.includes(phase) || phaseIndex <= currentIndex + 1) {
      setCurrentPhase(phase);
    }
  };

  const resetJourney = () => {
    setCurrentPhase("configure");
    setCompletedPhases([]);
  };

  return {
    currentPhase,
    completedPhases,
    completePhase,
    goToPhase,
    resetJourney,
    isComplete: completedPhases.length === JOURNEY_STEPS.length,
    progress: Math.round((completedPhases.length / JOURNEY_STEPS.length) * 100),
  };
}
