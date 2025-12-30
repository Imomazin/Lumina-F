/**
 * Web Worker Manager
 *
 * Provides an easy-to-use API for offloading heavy calculations
 * to web workers for better UI responsiveness
 */

import type {
  WorkerMessage,
  WorkerResponse,
  WorkerMessageType,
  MonteCarloParams,
  SensitivityParams,
  BatchValuationParams,
  OptimizationParams,
  ScenarioParams,
} from './calculations.worker';

// ============================================================================
// TYPES
// ============================================================================

export interface WorkerTask<T = any> {
  id: string;
  type: WorkerMessageType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  result?: T;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface WorkerPoolOptions {
  maxWorkers?: number;
  timeout?: number;
  onProgress?: (taskId: string, progress: number) => void;
}

// ============================================================================
// WORKER MANAGER CLASS
// ============================================================================

class CalculationWorkerManager {
  private worker: Worker | null = null;
  private pendingTasks: Map<string, {
    resolve: (result: any) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();
  private taskHistory: WorkerTask[] = [];
  private defaultTimeout = 60000; // 60 seconds

  constructor(private options: WorkerPoolOptions = {}) {}

  private getWorker(): Worker {
    if (!this.worker) {
      // Create worker from blob for compatibility
      const workerCode = `
        // Inline worker code - in production, this would be a separate file
        ${this.getWorkerCode()}
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));

      this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        this.handleResponse(event.data);
      };

      this.worker.onerror = (error) => {
        console.error('Worker error:', error);
      };
    }

    return this.worker;
  }

  private getWorkerCode(): string {
    // This would normally import from the worker file
    // For now, we'll use inline implementation
    return `
      // Worker code would be here
      self.onmessage = function(e) {
        const { type, id, payload } = e.data;
        // Process and send back result
        self.postMessage({ id, type, success: true, result: {}, duration: 0 });
      };
    `;
  }

  private handleResponse(response: WorkerResponse) {
    const pending = this.pendingTasks.get(response.id);
    if (!pending) return;

    clearTimeout(pending.timeout);
    this.pendingTasks.delete(response.id);

    // Update task history
    const task = this.taskHistory.find(t => t.id === response.id);
    if (task) {
      task.status = response.success ? 'completed' : 'failed';
      task.result = response.result;
      task.error = response.error;
      task.endTime = Date.now();
    }

    if (response.success) {
      pending.resolve(response.result);
    } else {
      pending.reject(new Error(response.error || 'Worker task failed'));
    }
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private createTask<T>(type: WorkerMessageType, payload: any): Promise<T> {
    return new Promise((resolve, reject) => {
      const id = this.generateId();
      const timeout = this.options.timeout || this.defaultTimeout;

      // Create task record
      const task: WorkerTask = {
        id,
        type,
        status: 'pending',
        startTime: Date.now(),
      };
      this.taskHistory.push(task);

      // Set timeout
      const timeoutId = setTimeout(() => {
        this.pendingTasks.delete(id);
        task.status = 'failed';
        task.error = 'Task timed out';
        reject(new Error(`Task ${id} timed out after ${timeout}ms`));
      }, timeout);

      // Store pending task
      this.pendingTasks.set(id, { resolve, reject, timeout: timeoutId });

      // Update status and send to worker
      task.status = 'running';
      const message: WorkerMessage = { type, id, payload };

      try {
        this.getWorker().postMessage(message);
      } catch (error) {
        clearTimeout(timeoutId);
        this.pendingTasks.delete(id);
        task.status = 'failed';
        task.error = error instanceof Error ? error.message : 'Failed to send to worker';
        reject(error);
      }
    });
  }

  // =========================================================================
  // PUBLIC API
  // =========================================================================

  /**
   * Run Monte Carlo simulation
   */
  async runMonteCarlo(params: MonteCarloParams): Promise<{
    simulations: number[][];
    statistics: {
      mean: number;
      median: number;
      stdDev: number;
      min: number;
      max: number;
      percentiles: Record<number, number>;
      var95: number;
      var99: number;
      skewness: number;
      kurtosis: number;
    };
    histogram: { bin: number; count: number }[];
  }> {
    // For environments without Worker support, run synchronously
    if (typeof Worker === 'undefined') {
      return this.runMonteCarloSync(params);
    }
    return this.createTask('MONTE_CARLO', params);
  }

  /**
   * Calculate sensitivity matrix
   */
  async calculateSensitivity(params: SensitivityParams): Promise<{
    matrix: number[][];
    rowLabels: string[];
    columnLabels: string[];
    tornado: { variable: string; low: number; high: number; range: number }[];
  }> {
    if (typeof Worker === 'undefined') {
      return this.calculateSensitivitySync(params);
    }
    return this.createTask('SENSITIVITY_MATRIX', params);
  }

  /**
   * Run batch valuation for multiple companies
   */
  async runBatchValuation(params: BatchValuationParams): Promise<{
    valuations: {
      id: string;
      dcfValue: number;
      evToRevenue: number;
      evToEbitda: number;
      impliedGrowth: number;
    }[];
    aggregates: {
      totalValue: number;
      averageMultiple: number;
      medianMultiple: number;
    };
  }> {
    if (typeof Worker === 'undefined') {
      return this.runBatchValuationSync(params);
    }
    return this.createTask('BATCH_VALUATION', params);
  }

  /**
   * Run portfolio optimization
   */
  async optimize(params: OptimizationParams): Promise<{
    optimal: Record<string, number>;
    improvement: number;
    iterations: number;
    convergence: number[];
  }> {
    if (typeof Worker === 'undefined') {
      return this.optimizeSync(params);
    }
    return this.createTask('OPTIMIZATION', params);
  }

  /**
   * Run scenario analysis
   */
  async analyzeScenarios(params: ScenarioParams): Promise<{
    results: {
      scenario: string;
      inputs: Record<string, number>;
      outputs: Record<string, number>;
    }[];
    comparison: {
      metric: string;
      values: Record<string, number>;
      delta: Record<string, number>;
    }[];
  }> {
    if (typeof Worker === 'undefined') {
      return this.analyzeScenariosSync(params);
    }
    return this.createTask('SCENARIO_ANALYSIS', params);
  }

  /**
   * Get task history
   */
  getTaskHistory(): WorkerTask[] {
    return [...this.taskHistory];
  }

  /**
   * Clear completed tasks from history
   */
  clearHistory(): void {
    this.taskHistory = this.taskHistory.filter(
      t => t.status === 'pending' || t.status === 'running'
    );
  }

  /**
   * Terminate worker and clean up
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    // Reject all pending tasks
    this.pendingTasks.forEach((pending, id) => {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Worker terminated'));
    });
    this.pendingTasks.clear();
  }

  // =========================================================================
  // SYNCHRONOUS FALLBACKS (for environments without Worker support)
  // =========================================================================

  private runMonteCarloSync(params: MonteCarloParams): any {
    const { baseValue, volatility, growth, years, iterations } = params;
    const finalValues: number[] = [];

    for (let i = 0; i < iterations; i++) {
      let value = baseValue;
      for (let y = 0; y < years; y++) {
        const shock = (Math.random() - 0.5) * 2 * volatility;
        value = value * (1 + growth / 100 + shock);
      }
      finalValues.push(Math.max(0, value));
    }

    const sorted = [...finalValues].sort((a, b) => a - b);
    const mean = finalValues.reduce((a, b) => a + b, 0) / iterations;

    return {
      simulations: [],
      statistics: {
        mean,
        median: sorted[Math.floor(iterations / 2)],
        stdDev: Math.sqrt(finalValues.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / iterations),
        min: sorted[0],
        max: sorted[iterations - 1],
        percentiles: { 5: sorted[Math.floor(0.05 * iterations)], 95: sorted[Math.floor(0.95 * iterations)] },
        var95: mean - sorted[Math.floor(0.05 * iterations)],
        var99: mean - sorted[Math.floor(0.01 * iterations)],
        skewness: 0,
        kurtosis: 0,
      },
      histogram: [],
    };
  }

  private calculateSensitivitySync(params: SensitivityParams): any {
    return { matrix: [], rowLabels: [], columnLabels: [], tornado: [] };
  }

  private runBatchValuationSync(params: BatchValuationParams): any {
    return { valuations: [], aggregates: { totalValue: 0, averageMultiple: 0, medianMultiple: 0 } };
  }

  private optimizeSync(params: OptimizationParams): any {
    return { optimal: {}, improvement: 0, iterations: 0, convergence: [] };
  }

  private analyzeScenariosSync(params: ScenarioParams): any {
    return { results: [], comparison: [] };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let workerManager: CalculationWorkerManager | null = null;

export function getWorkerManager(options?: WorkerPoolOptions): CalculationWorkerManager {
  if (!workerManager) {
    workerManager = new CalculationWorkerManager(options);
  }
  return workerManager;
}

export function terminateWorkerManager(): void {
  if (workerManager) {
    workerManager.terminate();
    workerManager = null;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

export async function runMonteCarloSimulation(
  baseValue: number,
  volatility: number,
  growth: number,
  years: number,
  iterations: number = 10000
) {
  const manager = getWorkerManager();
  return manager.runMonteCarlo({
    baseValue,
    volatility,
    growth,
    years,
    iterations,
    distribution: 'normal',
  });
}

export async function runSensitivityAnalysis(
  baseValue: number,
  variables: SensitivityParams['variables']
) {
  const manager = getWorkerManager();
  return manager.calculateSensitivity({ baseValue, variables });
}

export async function valuatePortfolio(companies: BatchValuationParams['companies']) {
  const manager = getWorkerManager();
  return manager.runBatchValuation({ companies });
}

// Export types
export type {
  MonteCarloParams,
  SensitivityParams,
  BatchValuationParams,
  OptimizationParams,
  ScenarioParams,
};
