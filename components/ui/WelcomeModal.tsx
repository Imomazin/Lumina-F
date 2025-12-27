"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface WelcomeModalProps {
  onClose: () => void;
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Lumina F",
      description:
        "Your private, browser-based financial analysis platform. Let's take a quick tour of what you can do.",
      icon: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Enter Your Financial Data",
      description:
        "Start by entering company details, revenue projections, costs, and financing assumptions in the Inputs section.",
      icon: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <svg
            className="h-8 w-8 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Review Your Analysis",
      description:
        "See calculated metrics, visual charts, and key insights automatically generated from your data.",
      icon: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <svg
            className="h-8 w-8 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Generate Reports",
      description:
        "Export professional, board-ready reports with executive summaries and detailed financial tables.",
      icon: (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-surface p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          {currentStep.icon}
          <h2 className="mt-6 text-xl font-semibold text-foreground">
            {currentStep.title}
          </h2>
          <p className="mt-3 text-sm text-foreground-muted">
            {currentStep.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="mt-8 flex justify-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setStep(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === step
                  ? "w-6 bg-primary"
                  : index < step
                    ? "bg-primary/50"
                    : "bg-border"
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
            >
              Back
            </button>
          )}
          {isLastStep ? (
            <Link
              href="/inputs"
              onClick={onClose}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Get Started
            </Link>
          ) : (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Next
            </button>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-sm text-foreground-muted transition-colors hover:text-foreground"
        >
          Skip tour
        </button>
      </div>
    </div>
  );
}

const ONBOARDING_KEY = "lumina_onboarding_complete";

export function useOnboarding() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setShowWelcome(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowWelcome(false);
  };

  return { showWelcome, completeOnboarding };
}
