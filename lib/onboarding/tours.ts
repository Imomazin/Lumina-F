/**
 * Interactive Guided Tours Module
 *
 * Provides step-by-step onboarding experiences for new users
 * with contextual help and feature discovery
 */

// ============================================================================
// TYPES
// ============================================================================

export interface TourStep {
  id: string;
  target: string; // CSS selector for element to highlight
  title: string;
  content: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: TourAction;
  waitFor?: string; // CSS selector to wait for before showing
  highlightPadding?: number;
  allowInteraction?: boolean;
  nextButton?: string;
  prevButton?: string;
  skipButton?: string;
  onShow?: () => void;
  onHide?: () => void;
}

export interface TourAction {
  type: 'click' | 'input' | 'scroll' | 'navigate' | 'custom';
  target?: string;
  value?: string;
  delay?: number;
}

export interface Tour {
  id: string;
  name: string;
  description: string;
  category: TourCategory;
  steps: TourStep[];
  prerequisites?: string[];
  estimatedTime: number; // In minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completionReward?: string;
}

export type TourCategory =
  | 'getting-started'
  | 'inputs'
  | 'analysis'
  | 'valuation'
  | 'advanced'
  | 'export'
  | 'collaboration';

export interface TourProgress {
  tourId: string;
  currentStep: number;
  completed: boolean;
  startedAt: string;
  completedAt?: string;
  skippedSteps: number[];
}

export interface TourState {
  activeTour: Tour | null;
  currentStep: number;
  isVisible: boolean;
  progress: Map<string, TourProgress>;
}

// ============================================================================
// TOUR DEFINITIONS
// ============================================================================

export const TOURS: Tour[] = [
  // =========================================================================
  // GETTING STARTED TOUR
  // =========================================================================
  {
    id: 'welcome',
    name: 'Welcome to Lumina F',
    description: 'A quick introduction to the financial modeling platform',
    category: 'getting-started',
    steps: [
      {
        id: 'welcome-1',
        target: 'body',
        title: 'Welcome to Lumina F! 🎉',
        content: 'Lumina F is a professional financial modeling platform that helps you build sophisticated valuations, forecasts, and analyses. Let\'s take a quick tour!',
        placement: 'center',
        nextButton: 'Start Tour',
      },
      {
        id: 'welcome-2',
        target: '[data-tour="navigation"]',
        title: 'Navigation',
        content: 'Use the navigation bar to move between different sections: Dashboard, Inputs, Analysis, and Reports.',
        placement: 'bottom',
      },
      {
        id: 'welcome-3',
        target: '[data-tour="dashboard"]',
        title: 'Dashboard',
        content: 'The Dashboard shows your current session status, quick actions, and saved analyses. It\'s your home base.',
        placement: 'right',
      },
      {
        id: 'welcome-4',
        target: '[data-tour="quick-actions"]',
        title: 'Quick Actions',
        content: 'Use these shortcuts to quickly create new analyses, import data, or access recent work.',
        placement: 'bottom',
      },
      {
        id: 'welcome-5',
        target: 'body',
        title: 'Ready to Begin!',
        content: 'You\'re all set! Start by entering your company data in the Inputs section, or explore more tours in the Help menu.',
        placement: 'center',
        nextButton: 'Finish',
      },
    ],
    estimatedTime: 2,
    difficulty: 'beginner',
    completionReward: 'welcome_completed',
  },

  // =========================================================================
  // INPUTS TOUR
  // =========================================================================
  {
    id: 'inputs-basics',
    name: 'Entering Financial Data',
    description: 'Learn how to input company financials and assumptions',
    category: 'inputs',
    prerequisites: ['welcome'],
    steps: [
      {
        id: 'inputs-1',
        target: '[data-tour="inputs-form"]',
        title: 'Financial Inputs Form',
        content: 'This is where you enter all the data needed for your financial model. The form is organized into logical sections.',
        placement: 'right',
      },
      {
        id: 'inputs-2',
        target: '[data-tour="company-section"]',
        title: 'Company Information',
        content: 'Start by entering the company name, industry, and currency. This helps with benchmarking and report generation.',
        placement: 'bottom',
      },
      {
        id: 'inputs-3',
        target: '[data-tour="revenue-section"]',
        title: 'Revenue & Growth',
        content: 'Enter the current revenue and your growth assumptions. The system will use these to project future financials.',
        placement: 'bottom',
        allowInteraction: true,
      },
      {
        id: 'inputs-4',
        target: '[data-tour="costs-section"]',
        title: 'Cost Structure',
        content: 'Input COGS and operating expenses. You can enter absolute values or percentages of revenue.',
        placement: 'bottom',
      },
      {
        id: 'inputs-5',
        target: '[data-tour="capital-section"]',
        title: 'Capital & Financing',
        content: 'Enter debt, interest rates, tax rates, and capital expenditures. These affect your valuation significantly.',
        placement: 'bottom',
      },
      {
        id: 'inputs-6',
        target: '[data-tour="confidence-indicator"]',
        title: 'Confidence Levels',
        content: 'Use confidence indicators to mark how certain you are about each assumption. This helps with sensitivity analysis.',
        placement: 'left',
      },
      {
        id: 'inputs-7',
        target: '[data-tour="save-button"]',
        title: 'Save Your Work',
        content: 'Don\'t forget to save! Your data is preserved locally and you can always come back to it.',
        placement: 'top',
        nextButton: 'Got it!',
      },
    ],
    estimatedTime: 5,
    difficulty: 'beginner',
  },

  // =========================================================================
  // ANALYSIS TOUR
  // =========================================================================
  {
    id: 'analysis-overview',
    name: 'Understanding Your Analysis',
    description: 'Learn how to interpret financial projections and metrics',
    category: 'analysis',
    prerequisites: ['inputs-basics'],
    steps: [
      {
        id: 'analysis-1',
        target: '[data-tour="analysis-tabs"]',
        title: 'Analysis Sections',
        content: 'The analysis is organized into tabs: Forecast, Valuation, Sensitivity, and Insights. Each provides different perspectives.',
        placement: 'bottom',
      },
      {
        id: 'analysis-2',
        target: '[data-tour="forecast-chart"]',
        title: 'Financial Forecast',
        content: 'This chart shows your projected revenue, profits, and margins over the forecast period. Hover for details.',
        placement: 'bottom',
      },
      {
        id: 'analysis-3',
        target: '[data-tour="key-metrics"]',
        title: 'Key Metrics',
        content: 'These summary cards show the most important metrics: valuation, growth rate, margins, and returns.',
        placement: 'bottom',
      },
      {
        id: 'analysis-4',
        target: '[data-tour="dcf-section"]',
        title: 'DCF Valuation',
        content: 'The Discounted Cash Flow analysis calculates enterprise and equity value based on projected cash flows.',
        placement: 'right',
      },
      {
        id: 'analysis-5',
        target: '[data-tour="sensitivity-tab"]',
        title: 'Sensitivity Analysis',
        content: 'See how changes in key assumptions affect your valuation. Great for stress-testing your model.',
        placement: 'bottom',
      },
      {
        id: 'analysis-6',
        target: '[data-tour="insights-tab"]',
        title: 'AI Insights',
        content: 'Our AI generates intelligent insights and recommendations based on your financial data.',
        placement: 'bottom',
      },
    ],
    estimatedTime: 4,
    difficulty: 'beginner',
  },

  // =========================================================================
  // VALUATION DEEP DIVE
  // =========================================================================
  {
    id: 'valuation-deep-dive',
    name: 'Mastering Valuation',
    description: 'Deep dive into DCF, multiples, and valuation methodology',
    category: 'valuation',
    prerequisites: ['analysis-overview'],
    steps: [
      {
        id: 'val-1',
        target: '[data-tour="dcf-inputs"]',
        title: 'DCF Inputs',
        content: 'The DCF model uses WACC (cost of capital) and terminal growth rate. These are the most sensitive assumptions.',
        placement: 'right',
      },
      {
        id: 'val-2',
        target: '[data-tour="wacc-breakdown"]',
        title: 'WACC Calculation',
        content: 'WACC combines cost of equity (from CAPM) and after-tax cost of debt, weighted by capital structure.',
        placement: 'bottom',
      },
      {
        id: 'val-3',
        target: '[data-tour="terminal-value"]',
        title: 'Terminal Value',
        content: 'Terminal value captures all cash flows beyond the forecast period. It often represents 60-80% of total value.',
        placement: 'bottom',
      },
      {
        id: 'val-4',
        target: '[data-tour="multiples"]',
        title: 'Implied Multiples',
        content: 'See what multiples your DCF implies: EV/Revenue, EV/EBITDA, P/E. Compare these to industry benchmarks.',
        placement: 'right',
      },
      {
        id: 'val-5',
        target: '[data-tour="dupont"]',
        title: 'DuPont Analysis',
        content: 'Decompose ROE into its components: profit margin, asset turnover, and leverage. Identify value drivers.',
        placement: 'bottom',
      },
      {
        id: 'val-6',
        target: '[data-tour="eva"]',
        title: 'Economic Value Added',
        content: 'EVA shows whether the company creates value above its cost of capital. Positive EVA = value creation.',
        placement: 'bottom',
      },
    ],
    estimatedTime: 6,
    difficulty: 'intermediate',
  },

  // =========================================================================
  // ADVANCED FEATURES
  // =========================================================================
  {
    id: 'advanced-features',
    name: 'Advanced Modeling',
    description: 'Explore Monte Carlo, LBO modeling, and portfolio analysis',
    category: 'advanced',
    prerequisites: ['valuation-deep-dive'],
    steps: [
      {
        id: 'adv-1',
        target: '[data-tour="monte-carlo"]',
        title: 'Monte Carlo Simulation',
        content: 'Run thousands of scenarios to understand the range of possible outcomes and their probabilities.',
        placement: 'right',
      },
      {
        id: 'adv-2',
        target: '[data-tour="lbo-model"]',
        title: 'LBO Modeling',
        content: 'Build leveraged buyout models with custom debt structures, returns analysis, and exit scenarios.',
        placement: 'bottom',
      },
      {
        id: 'adv-3',
        target: '[data-tour="comps"]',
        title: 'Comparable Companies',
        content: 'Analyze peer companies to triangulate valuation using trading multiples.',
        placement: 'bottom',
      },
      {
        id: 'adv-4',
        target: '[data-tour="three-statement"]',
        title: 'Three-Statement Model',
        content: 'View integrated Income Statement, Balance Sheet, and Cash Flow projections that automatically link.',
        placement: 'right',
      },
      {
        id: 'adv-5',
        target: '[data-tour="portfolio"]',
        title: 'Portfolio Analysis',
        content: 'Manage multiple companies, track performance, and analyze diversification.',
        placement: 'bottom',
      },
    ],
    estimatedTime: 8,
    difficulty: 'advanced',
  },

  // =========================================================================
  // EXPORT & SHARING
  // =========================================================================
  {
    id: 'export-sharing',
    name: 'Exporting & Sharing',
    description: 'Learn how to export reports and collaborate with others',
    category: 'export',
    steps: [
      {
        id: 'export-1',
        target: '[data-tour="export-button"]',
        title: 'Export Options',
        content: 'Export your analysis to Excel, PDF, or CSV formats. Great for presentations and further analysis.',
        placement: 'bottom',
      },
      {
        id: 'export-2',
        target: '[data-tour="excel-export"]',
        title: 'Excel Export',
        content: 'The Excel export includes all worksheets: Inputs, Forecast, Statements, Valuation, and Sensitivity.',
        placement: 'right',
      },
      {
        id: 'export-3',
        target: '[data-tour="pdf-report"]',
        title: 'PDF Reports',
        content: 'Generate professional PDF reports with executive summary, charts, and detailed analysis.',
        placement: 'right',
      },
      {
        id: 'export-4',
        target: '[data-tour="share-button"]',
        title: 'Share Analysis',
        content: 'Share your analysis with colleagues via link or by adding them as collaborators.',
        placement: 'bottom',
      },
    ],
    estimatedTime: 3,
    difficulty: 'beginner',
  },
];

// ============================================================================
// TOUR MANAGER CLASS
// ============================================================================

export class TourManager {
  private state: TourState = {
    activeTour: null,
    currentStep: 0,
    isVisible: false,
    progress: new Map(),
  };

  private listeners: Set<(state: TourState) => void> = new Set();

  constructor() {
    this.loadProgress();
  }

  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================

  private loadProgress(): void {
    try {
      const saved = localStorage.getItem('lumina_tour_progress');
      if (saved) {
        const data = JSON.parse(saved);
        this.state.progress = new Map(Object.entries(data));
      }
    } catch (e) {
      console.error('Failed to load tour progress:', e);
    }
  }

  private saveProgress(): void {
    try {
      const data = Object.fromEntries(this.state.progress);
      localStorage.setItem('lumina_tour_progress', JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save tour progress:', e);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener({ ...this.state }));
  }

  subscribe(listener: (state: TourState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getState(): TourState {
    return { ...this.state };
  }

  // =========================================================================
  // TOUR LIFECYCLE
  // =========================================================================

  startTour(tourId: string): boolean {
    const tour = TOURS.find(t => t.id === tourId);
    if (!tour) {
      console.error(`Tour not found: ${tourId}`);
      return false;
    }

    // Check prerequisites
    if (tour.prerequisites) {
      for (const prereq of tour.prerequisites) {
        const progress = this.state.progress.get(prereq);
        if (!progress?.completed) {
          console.warn(`Prerequisite tour not completed: ${prereq}`);
          return false;
        }
      }
    }

    // Initialize progress
    if (!this.state.progress.has(tourId)) {
      this.state.progress.set(tourId, {
        tourId,
        currentStep: 0,
        completed: false,
        startedAt: new Date().toISOString(),
        skippedSteps: [],
      });
    }

    this.state.activeTour = tour;
    this.state.currentStep = 0;
    this.state.isVisible = true;

    this.saveProgress();
    this.notifyListeners();

    return true;
  }

  nextStep(): void {
    if (!this.state.activeTour) return;

    const tour = this.state.activeTour;
    if (this.state.currentStep < tour.steps.length - 1) {
      this.state.currentStep++;
      this.updateProgress();
      this.notifyListeners();
    } else {
      this.completeTour();
    }
  }

  prevStep(): void {
    if (!this.state.activeTour) return;

    if (this.state.currentStep > 0) {
      this.state.currentStep--;
      this.notifyListeners();
    }
  }

  skipStep(): void {
    if (!this.state.activeTour) return;

    const progress = this.state.progress.get(this.state.activeTour.id);
    if (progress) {
      progress.skippedSteps.push(this.state.currentStep);
    }

    this.nextStep();
  }

  goToStep(stepIndex: number): void {
    if (!this.state.activeTour) return;

    if (stepIndex >= 0 && stepIndex < this.state.activeTour.steps.length) {
      this.state.currentStep = stepIndex;
      this.notifyListeners();
    }
  }

  private updateProgress(): void {
    if (!this.state.activeTour) return;

    const progress = this.state.progress.get(this.state.activeTour.id);
    if (progress) {
      progress.currentStep = this.state.currentStep;
      this.saveProgress();
    }
  }

  completeTour(): void {
    if (!this.state.activeTour) return;

    const progress = this.state.progress.get(this.state.activeTour.id);
    if (progress) {
      progress.completed = true;
      progress.completedAt = new Date().toISOString();
    }

    this.state.isVisible = false;
    this.state.activeTour = null;
    this.state.currentStep = 0;

    this.saveProgress();
    this.notifyListeners();
  }

  exitTour(): void {
    this.state.isVisible = false;
    this.state.activeTour = null;
    this.state.currentStep = 0;
    this.notifyListeners();
  }

  // =========================================================================
  // TOUR QUERIES
  // =========================================================================

  getAllTours(): Tour[] {
    return [...TOURS];
  }

  getToursByCategory(category: TourCategory): Tour[] {
    return TOURS.filter(t => t.category === category);
  }

  getTourProgress(tourId: string): TourProgress | undefined {
    return this.state.progress.get(tourId);
  }

  isCompleted(tourId: string): boolean {
    return this.state.progress.get(tourId)?.completed ?? false;
  }

  getCompletedTours(): string[] {
    return Array.from(this.state.progress.entries())
      .filter(([_, progress]) => progress.completed)
      .map(([id]) => id);
  }

  getAvailableTours(): Tour[] {
    return TOURS.filter(tour => {
      if (!tour.prerequisites) return true;
      return tour.prerequisites.every(prereq => this.isCompleted(prereq));
    });
  }

  getRecommendedTour(): Tour | null {
    const available = this.getAvailableTours();
    const incomplete = available.filter(t => !this.isCompleted(t.id));

    if (incomplete.length === 0) return null;

    // Prioritize by difficulty
    const beginner = incomplete.find(t => t.difficulty === 'beginner');
    if (beginner) return beginner;

    return incomplete[0];
  }

  getOverallProgress(): { completed: number; total: number; percentage: number } {
    const completed = this.getCompletedTours().length;
    const total = TOURS.length;
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    };
  }

  resetProgress(): void {
    this.state.progress.clear();
    this.saveProgress();
    this.notifyListeners();
  }

  // =========================================================================
  // CURRENT STEP HELPERS
  // =========================================================================

  getCurrentStep(): TourStep | null {
    if (!this.state.activeTour) return null;
    return this.state.activeTour.steps[this.state.currentStep] || null;
  }

  getStepCount(): number {
    return this.state.activeTour?.steps.length ?? 0;
  }

  isFirstStep(): boolean {
    return this.state.currentStep === 0;
  }

  isLastStep(): boolean {
    if (!this.state.activeTour) return true;
    return this.state.currentStep === this.state.activeTour.steps.length - 1;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let tourManager: TourManager | null = null;

export function getTourManager(): TourManager {
  if (!tourManager) {
    tourManager = new TourManager();
  }
  return tourManager;
}

// ============================================================================
// CONTEXTUAL HELP
// ============================================================================

export interface HelpTip {
  id: string;
  target: string;
  title: string;
  content: string;
  learnMoreUrl?: string;
  relatedTour?: string;
}

export const HELP_TIPS: HelpTip[] = [
  {
    id: 'revenue-growth',
    target: '[data-help="revenue-growth"]',
    title: 'Revenue Growth Rate',
    content: 'Enter the expected annual revenue growth rate as a percentage. Consider historical growth, market size, and competitive position.',
    relatedTour: 'inputs-basics',
  },
  {
    id: 'wacc',
    target: '[data-help="wacc"]',
    title: 'Weighted Average Cost of Capital',
    content: 'WACC represents the blended cost of all capital sources. It\'s used to discount future cash flows to present value.',
    learnMoreUrl: '/docs/wacc',
    relatedTour: 'valuation-deep-dive',
  },
  {
    id: 'terminal-growth',
    target: '[data-help="terminal-growth"]',
    title: 'Terminal Growth Rate',
    content: 'The perpetual growth rate assumed after the forecast period. Should not exceed long-term GDP growth (typically 2-3%).',
    relatedTour: 'valuation-deep-dive',
  },
  {
    id: 'dcf-value',
    target: '[data-help="dcf-value"]',
    title: 'DCF Enterprise Value',
    content: 'The sum of all discounted future cash flows plus terminal value. Represents the total value of the business.',
    relatedTour: 'valuation-deep-dive',
  },
  {
    id: 'confidence-level',
    target: '[data-help="confidence-level"]',
    title: 'Assumption Confidence',
    content: 'Mark your confidence in each assumption: Grounded (backed by data), Reasoned (logical estimate), or Exploratory (uncertain).',
    relatedTour: 'inputs-basics',
  },
];

export function getHelpTip(id: string): HelpTip | undefined {
  return HELP_TIPS.find(tip => tip.id === id);
}

export function getHelpTipsForPage(selectors: string[]): HelpTip[] {
  return HELP_TIPS.filter(tip =>
    selectors.some(selector => document.querySelector(tip.target))
  );
}
