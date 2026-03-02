"use client";

import { useState, useEffect } from "react";
import { PremiumButton, GlassPanel, ProgressRing } from "./design-system";

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  illustration?: React.ReactNode;
  features?: string[];
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const steps: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to Lumina F",
    subtitle: "Financial Intelligence Platform",
    description: "Transform your financial data into actionable insights with enterprise-grade analysis, AI-powered recommendations, and beautiful visualizations.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    features: [
      "DCF Valuation & 50+ Financial Ratios",
      "Scenario Analysis with Monte Carlo",
      "AI-Powered Insights & Recommendations",
      "Executive-Ready Reports",
    ],
  },
  {
    id: "journey",
    title: "Guided Financial Journey",
    subtitle: "6 Steps to Strategic Clarity",
    description: "Follow our structured approach to build comprehensive financial models. Each step builds on the last, ensuring nothing is missed.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    illustration: (
      <div className="flex items-center justify-center gap-2 py-4">
        {["Configure", "Model", "Scenarios", "Compare", "Decide", "Monitor"].map((step, i) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold
              ${i === 0 ? "bg-amber-500 text-black" : "bg-zinc-800 text-zinc-400"}
            `}>
              {i + 1}
            </div>
            {i < 5 && (
              <div className="w-8 h-0.5 bg-zinc-800" />
            )}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "command-centre",
    title: "Command Centre",
    subtitle: "Your Financial Control Room",
    description: "Start every session with a clear view of financial health. Health scores, alerts, and quick actions—all in one place.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    features: [
      "Health Score with 5 Key Factors",
      "Real-time Alerts & Warnings",
      "Executive Snapshot Dashboard",
      "One-Click Actions",
    ],
  },
  {
    id: "ai-copilot",
    title: "Financial Co-Pilot",
    subtitle: "AI That Understands Finance",
    description: "Get contextual guidance, learn financial concepts, and receive intelligent recommendations as you work.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    features: [
      "Contextual Tips & Insights",
      "Financial Term Explanations",
      "Smart Recommendations",
      "Ask Any Question",
    ],
  },
  {
    id: "ready",
    title: "You're Ready!",
    subtitle: "Let's Build Something Great",
    description: "Load our demo company to explore, or start fresh with your own data. Press Cmd+K anytime for quick navigation.",
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
];

export function OnboardingWizard({ isOpen, onClose, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      onClose();
      localStorage.setItem("lumina-onboarding-complete", "true");
    } else {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 200);
    }
  };

  const handleSkip = () => {
    onClose();
    localStorage.setItem("lumina-onboarding-complete", "true");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowRight" || e.key === "Enter") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") handleSkip();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep, isLastStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with animated gradient */}
      <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl">
        {/* Animated background orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      {/* Modal */}
      <div className="relative w-full max-w-2xl animate-[scaleIn_0.3s_ease-out]">
        <GlassPanel variant="elevated" padding="none" glow="amber">
          {/* Header */}
          <div className="relative px-8 pt-8 pb-4">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-800 rounded-t-2xl overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === currentStep
                        ? "w-6 bg-amber-500"
                        : i < currentStep
                        ? "bg-amber-500/50"
                        : "bg-zinc-700"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={handleSkip}
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                Skip tour
              </button>
            </div>

            {/* Icon */}
            <div className={`
              inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4
              bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30
              text-amber-400 transition-all duration-300
              ${isAnimating ? "opacity-0 scale-90" : "opacity-100 scale-100"}
            `}>
              {step.icon}
            </div>

            {/* Title */}
            <h2 className={`text-2xl font-bold text-white mb-1 transition-all duration-300 ${
              isAnimating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
            }`}>
              {step.title}
            </h2>
            <p className={`text-amber-400/80 font-medium mb-4 transition-all duration-300 ${
              isAnimating ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"
            }`} style={{ transitionDelay: "50ms" }}>
              {step.subtitle}
            </p>
          </div>

          {/* Content */}
          <div className={`px-8 pb-6 transition-all duration-300 ${
            isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          }`} style={{ transitionDelay: "100ms" }}>
            <p className="text-zinc-400 leading-relaxed mb-6">
              {step.description}
            </p>

            {/* Illustration */}
            {step.illustration && (
              <div className="mb-6">
                {step.illustration}
              </div>
            )}

            {/* Features */}
            {step.features && (
              <div className="grid sm:grid-cols-2 gap-3">
                {step.features.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50"
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-sm text-zinc-300">{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-8 py-4 border-t border-zinc-800/50">
            <div>
              {currentStep > 0 && (
                <PremiumButton variant="ghost" onClick={handlePrev}>
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </PremiumButton>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500">
                {currentStep + 1} of {steps.length}
              </span>
              <PremiumButton variant="primary" onClick={handleNext}>
                {isLastStep ? "Get Started" : "Continue"}
                {!isLastStep && (
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </PremiumButton>
            </div>
          </div>
        </GlassPanel>

        {/* Keyboard hints */}
        <div className="flex justify-center gap-4 mt-4">
          <span className="text-xs text-zinc-600 flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">←</kbd>
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">→</kbd>
            navigate
          </span>
          <span className="text-xs text-zinc-600 flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">↵</kbd>
            continue
          </span>
          <span className="text-xs text-zinc-600 flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">esc</kbd>
            skip
          </span>
        </div>
      </div>
    </div>
  );
}

// Hook to manage onboarding state
export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem("lumina-onboarding-complete");
    if (!completed) {
      setHasCompleted(false);
      // Small delay for smoother UX
      setTimeout(() => setShowOnboarding(true), 500);
    }
  }, []);

  const resetOnboarding = () => {
    localStorage.removeItem("lumina-onboarding-complete");
    setHasCompleted(false);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    setShowOnboarding,
    hasCompleted,
    resetOnboarding,
  };
}
