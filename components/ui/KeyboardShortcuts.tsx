"use client";

import { useEffect, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";

// ============================================================================
// TYPES
// ============================================================================

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  category: string;
}

// ============================================================================
// KEYBOARD SHORTCUTS HOOK
// ============================================================================

export function useKeyboardShortcuts(shortcuts: Shortcut[]): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : true;
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.altKey ? e.altKey : !e.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// ============================================================================
// DEFAULT APP SHORTCUTS
// ============================================================================

export function useAppShortcuts(): void {
  const router = useRouter();

  const shortcuts: Shortcut[] = [
    {
      key: "d",
      ctrlKey: true,
      action: () => router.push("/dashboard"),
      description: "Go to Dashboard",
      category: "Navigation",
    },
    {
      key: "i",
      ctrlKey: true,
      action: () => router.push("/inputs"),
      description: "Go to Inputs",
      category: "Navigation",
    },
    {
      key: "a",
      ctrlKey: true,
      action: () => router.push("/analysis"),
      description: "Go to Analysis",
      category: "Navigation",
    },
    {
      key: "r",
      ctrlKey: true,
      action: () => router.push("/reports"),
      description: "Go to Reports",
      category: "Navigation",
    },
    {
      key: "k",
      ctrlKey: true,
      action: () => {
        // Trigger command palette
        const event = new CustomEvent("openCommandPalette");
        window.dispatchEvent(event);
      },
      description: "Open Command Palette",
      category: "General",
    },
    {
      key: "?",
      shiftKey: true,
      action: () => {
        // Trigger help modal
        const event = new CustomEvent("openShortcutsModal");
        window.dispatchEvent(event);
      },
      description: "Show Keyboard Shortcuts",
      category: "General",
    },
  ];

  useKeyboardShortcuts(shortcuts);
}

// ============================================================================
// SHORTCUTS MODAL
// ============================================================================

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { category: "Navigation", items: [
      { keys: ["⌘", "D"], description: "Go to Dashboard" },
      { keys: ["⌘", "I"], description: "Go to Inputs" },
      { keys: ["⌘", "A"], description: "Go to Analysis" },
      { keys: ["⌘", "R"], description: "Go to Reports" },
    ]},
    { category: "General", items: [
      { keys: ["⌘", "K"], description: "Command Palette" },
      { keys: ["⌘", "S"], description: "Save" },
      { keys: ["⌘", "P"], description: "Print / Export" },
      { keys: ["?"], description: "Show Shortcuts" },
    ]},
    { category: "Editing", items: [
      { keys: ["⌘", "Z"], description: "Undo" },
      { keys: ["⌘", "⇧", "Z"], description: "Redo" },
      { keys: ["Tab"], description: "Next Field" },
      { keys: ["⇧", "Tab"], description: "Previous Field" },
    ]},
  ];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-surface border border-border rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">
              Keyboard Shortcuts
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 overflow-y-auto max-h-[60vh]">
            {shortcuts.map((section) => (
              <div key={section.category} className="mb-6 last:mb-0">
                <h3 className="text-sm font-medium text-foreground-muted mb-3">
                  {section.category}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2"
                    >
                      <span className="text-sm text-foreground">
                        {item.description}
                      </span>
                      <div className="flex gap-1">
                        {item.keys.map((key, keyIdx) => (
                          <kbd
                            key={keyIdx}
                            className="px-2 py-1 text-xs font-mono bg-surface-2 border border-border rounded"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border bg-surface-2">
            <p className="text-xs text-foreground-muted text-center">
              Press <kbd className="px-1.5 py-0.5 mx-1 bg-surface border border-border rounded text-xs">Esc</kbd> to close
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// CONFETTI ANIMATION
// ============================================================================

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  speedY: number;
  speedX: number;
  speedRotation: number;
}

export function Confetti({ trigger }: { trigger: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = [
      "#6366f1", // primary
      "#22c55e", // success
      "#f59e0b", // warning
      "#ec4899", // pink
      "#3b82f6", // blue
      "#8b5cf6", // purple
    ];

    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 100; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 8 + Math.random() * 8,
        speedY: 2 + Math.random() * 3,
        speedX: -1 + Math.random() * 2,
        speedRotation: -5 + Math.random() * 10,
      });
    }

    setPieces(newPieces);

    // Clear after animation
    const timer = setTimeout(() => setPieces([]), 4000);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: piece.size,
            height: piece.size * 0.6,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            animationDuration: `${3 + Math.random()}s`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-surface-2";

  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// ============================================================================
// TOOLTIP
// ============================================================================

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-2 py-1 text-xs text-white bg-foreground rounded whitespace-nowrap ${positionClasses[position]}`}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// PROGRESS BAR
// ============================================================================

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  variant = "default",
  showLabel = false,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantClasses = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  return (
    <div className={className}>
      <div className={`w-full bg-surface-2 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${variantClasses[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-foreground-muted mt-1">
          {percentage.toFixed(0)}%
        </p>
      )}
    </div>
  );
}
