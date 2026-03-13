"use client";

import { AnalysisResult } from "@/lib/analysis/financial-engine";

interface LiquidityDashboardProps {
  analysis: AnalysisResult;
  currency: string;
}

function formatCurrency(value: number, currency: string = "USD"): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", CAD: "C$", AUD: "A$",
  };
  const symbol = symbols[currency] || "$";
  const absValue = Math.abs(value);
  if (absValue >= 1e9) return `${symbol}${(value / 1e9).toFixed(1)}B`;
  if (absValue >= 1e6) return `${symbol}${(value / 1e6).toFixed(1)}M`;
  if (absValue >= 1e3) return `${symbol}${(value / 1e3).toFixed(0)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

// Calculate liquidity metrics from analysis
function calculateLiquidityMetrics(analysis: AnalysisResult) {
  const yearlyFinancials = analysis.baseCase.yearlyFinancials;
  const ratios = analysis.baseCase.averageRatios;

  // Cash runway calculation
  const lastYear = yearlyFinancials[yearlyFinancials.length - 1];
  const firstYear = yearlyFinancials[0];

  const avgMonthlyBurn = yearlyFinancials.reduce((sum, yf) => {
    const operatingCashFlow = yf.ebitda - (yf.revenue * 0.1); // Simplified OCF
    return sum + (operatingCashFlow < 0 ? Math.abs(operatingCashFlow) / 12 : 0);
  }, 0) / yearlyFinancials.length;

  const currentCash = firstYear.revenue * 0.15; // Estimated cash position
  const cashRunwayMonths = avgMonthlyBurn > 0 ? currentCash / avgMonthlyBurn : 999;

  // Working capital cycle
  const dso = ratios.daysSalesOutstanding || 45;
  const dio = ratios.daysInventoryOutstanding || 30;
  const dpo = ratios.daysPayableOutstanding || 35;
  const cashConversionCycle = dso + dio - dpo;

  // Burn rate
  const annualBurnRate = avgMonthlyBurn * 12;
  const monthlyBurnRate = avgMonthlyBurn;

  // Liquidity ratios over time
  const liquidityTrend = yearlyFinancials.map((yf, idx) => ({
    year: idx + 1,
    currentRatio: 1.5 + (Math.random() * 0.5 - 0.25), // Simulated
    quickRatio: 1.1 + (Math.random() * 0.4 - 0.2),
    cashRatio: 0.4 + (Math.random() * 0.2 - 0.1),
  }));

  // Cash flow waterfall
  const cashFlowWaterfall = yearlyFinancials.map((yf, idx) => ({
    year: idx + 1,
    operatingCF: yf.ebitda * 0.7,
    investingCF: -yf.revenue * 0.08,
    financingCF: idx === 0 ? yf.revenue * 0.1 : -yf.revenue * 0.02,
    netCF: yf.ebitda * 0.7 - yf.revenue * 0.08 + (idx === 0 ? yf.revenue * 0.1 : -yf.revenue * 0.02),
  }));

  // Days cash on hand
  const dailyOperatingExpenses = (firstYear.revenue - firstYear.grossProfit) / 365;
  const daysCashOnHand = dailyOperatingExpenses > 0 ? currentCash / dailyOperatingExpenses : 999;

  return {
    cashRunwayMonths: Math.min(cashRunwayMonths, 999),
    monthlyBurnRate,
    annualBurnRate,
    cashConversionCycle,
    dso,
    dio,
    dpo,
    currentRatio: ratios.currentRatio,
    quickRatio: ratios.quickRatio,
    cashRatio: ratios.cashRatio,
    daysCashOnHand: Math.min(daysCashOnHand, 999),
    liquidityTrend,
    cashFlowWaterfall,
    currentCash,
  };
}

// Liquidity gauge component
function LiquidityGauge({ value, max, label, status }: { value: number; max: number; label: string; status: 'healthy' | 'warning' | 'critical' }) {
  const percentage = Math.min((value / max) * 100, 100);
  const colors = {
    healthy: { bar: 'bg-green-500', text: 'text-green-400', border: 'border-green-500/30' },
    warning: { bar: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/30' },
    critical: { bar: 'bg-red-500', text: 'text-red-400', border: 'border-red-500/30' },
  };
  const c = colors[status];

  return (
    <div className={`rounded-xl border ${c.border} bg-zinc-900/50 p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-400">{label}</span>
        <span className={`text-lg font-bold ${c.text}`}>{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${c.bar} rounded-full transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

// Cash flow waterfall chart
function CashFlowWaterfall({ data, currency }: { data: { year: number; operatingCF: number; investingCF: number; financingCF: number; netCF: number }[]; currency: string }) {
  const maxValue = Math.max(...data.map(d => Math.max(Math.abs(d.operatingCF), Math.abs(d.investingCF), Math.abs(d.financingCF), Math.abs(d.netCF))));
  const scale = 150 / maxValue;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Cash Flow Components</h3>
      <div className="space-y-4">
        {data.slice(0, 5).map((d) => (
          <div key={d.year} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Year {d.year}</span>
              <span className={`text-sm font-mono ${d.netCF >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                Net: {formatCurrency(d.netCF, currency)}
              </span>
            </div>
            <div className="flex gap-2 h-6">
              <div className="flex-1 flex items-center gap-1">
                <div
                  className="h-4 bg-blue-500 rounded"
                  style={{ width: `${Math.abs(d.operatingCF) * scale}px` }}
                  title={`Operating: ${formatCurrency(d.operatingCF, currency)}`}
                />
                <div
                  className="h-4 bg-purple-500 rounded"
                  style={{ width: `${Math.abs(d.investingCF) * scale}px` }}
                  title={`Investing: ${formatCurrency(d.investingCF, currency)}`}
                />
                <div
                  className="h-4 bg-amber-500 rounded"
                  style={{ width: `${Math.abs(d.financingCF) * scale}px` }}
                  title={`Financing: ${formatCurrency(d.financingCF, currency)}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded" /><span className="text-zinc-400">Operating</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-500 rounded" /><span className="text-zinc-400">Investing</span></div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-amber-500 rounded" /><span className="text-zinc-400">Financing</span></div>
      </div>
    </div>
  );
}

// Working capital cycle visualization
function WorkingCapitalCycle({ dso, dio, dpo, ccc }: { dso: number; dio: number; dpo: number; ccc: number }) {
  const total = dso + dio;
  const dsoPercent = (dso / total) * 100;
  const dioPercent = (dio / total) * 100;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Working Capital Cycle</h3>

      <div className="flex items-center justify-center mb-6">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* DSO arc */}
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeDasharray={`${dsoPercent * 2.51} 251`}
              className="opacity-80"
            />
            {/* DIO arc */}
            <circle
              cx="50" cy="50" r="40"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="8"
              strokeDasharray={`${dioPercent * 2.51} 251`}
              strokeDashoffset={`-${dsoPercent * 2.51}`}
              className="opacity-80"
            />
            {/* DPO (subtracted) */}
            <circle
              cx="50" cy="50" r="30"
              fill="none"
              stroke="#22c55e"
              strokeWidth="6"
              strokeDasharray={`${(dpo / total) * 100 * 1.88} 188`}
              className="opacity-80"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{ccc.toFixed(0)}</span>
            <span className="text-xs text-zinc-400">days CCC</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold text-blue-400">{dso.toFixed(0)}</div>
          <div className="text-xs text-zinc-500">DSO (days)</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-400">{dio.toFixed(0)}</div>
          <div className="text-xs text-zinc-500">DIO (days)</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-400">{dpo.toFixed(0)}</div>
          <div className="text-xs text-zinc-500">DPO (days)</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
        <div className="text-xs text-zinc-400 text-center">
          Cash Conversion Cycle = DSO + DIO - DPO = <span className="text-amber-400 font-medium">{ccc.toFixed(0)} days</span>
        </div>
      </div>
    </div>
  );
}

// Cash runway visualization
function CashRunwayChart({ months, burnRate, currentCash, currency }: { months: number; burnRate: number; currentCash: number; currency: string }) {
  const projectedMonths = Math.min(Math.ceil(months), 24);
  const data = Array.from({ length: projectedMonths + 1 }, (_, i) => ({
    month: i,
    cash: Math.max(currentCash - (burnRate * i), 0),
  }));

  const maxCash = currentCash;
  const height = 120;
  const width = 300;

  const points = data.map((d, i) => {
    const x = (i / projectedMonths) * width;
    const y = height - (d.cash / maxCash) * height;
    return `${x},${y}`;
  }).join(' ');

  const zeroMonth = months > projectedMonths ? projectedMonths : months;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-2">Cash Runway Projection</h3>
      <p className="text-sm text-zinc-400 mb-4">
        At current burn rate of <span className="text-amber-400">{formatCurrency(burnRate, currency)}/mo</span>
      </p>

      <div className="relative">
        <svg width={width} height={height} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p) => (
            <line
              key={p}
              x1="0" y1={height * (1 - p)}
              x2={width} y2={height * (1 - p)}
              stroke="#27272a"
              strokeDasharray="4"
            />
          ))}

          {/* Area fill */}
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill="url(#cashGradient)"
            opacity="0.3"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
          />

          {/* Zero line marker */}
          {months <= projectedMonths && (
            <line
              x1={(zeroMonth / projectedMonths) * width}
              y1="0"
              x2={(zeroMonth / projectedMonths) * width}
              y2={height}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="4"
            />
          )}

          <defs>
            <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <div className="flex justify-between mt-2 text-xs text-zinc-500">
          <span>Now</span>
          <span>{projectedMonths} months</span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
        <span className="text-sm text-zinc-400">Runway</span>
        <span className={`text-lg font-bold ${months > 12 ? 'text-green-400' : months > 6 ? 'text-amber-400' : 'text-red-400'}`}>
          {months >= 999 ? '∞' : `${months.toFixed(0)} months`}
        </span>
      </div>
    </div>
  );
}

// Liquidity alerts
function LiquidityAlerts({ metrics }: { metrics: ReturnType<typeof calculateLiquidityMetrics> }) {
  const alerts: { type: 'critical' | 'warning' | 'info'; message: string }[] = [];

  if (metrics.cashRunwayMonths < 6) {
    alerts.push({ type: 'critical', message: `Critical: Only ${metrics.cashRunwayMonths.toFixed(0)} months of cash runway remaining` });
  } else if (metrics.cashRunwayMonths < 12) {
    alerts.push({ type: 'warning', message: `Warning: ${metrics.cashRunwayMonths.toFixed(0)} months of cash runway - consider raising capital` });
  }

  if (metrics.currentRatio < 1) {
    alerts.push({ type: 'critical', message: 'Critical: Current ratio below 1.0 - potential liquidity crisis' });
  } else if (metrics.currentRatio < 1.5) {
    alerts.push({ type: 'warning', message: 'Warning: Current ratio below 1.5 - monitor working capital' });
  }

  if (metrics.cashConversionCycle > 90) {
    alerts.push({ type: 'warning', message: `Cash conversion cycle of ${metrics.cashConversionCycle.toFixed(0)} days is high` });
  }

  if (metrics.quickRatio < 1) {
    alerts.push({ type: 'warning', message: 'Quick ratio below 1.0 - may struggle with short-term obligations' });
  }

  if (alerts.length === 0) {
    alerts.push({ type: 'info', message: 'Liquidity position is healthy - no immediate concerns' });
  }

  const icons = {
    critical: '🚨',
    warning: '⚠️',
    info: '✅',
  };

  const colors = {
    critical: 'border-red-500/30 bg-red-500/10 text-red-400',
    warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    info: 'border-green-500/30 bg-green-500/10 text-green-400',
  };

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Liquidity Alerts</h3>
      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg border ${colors[alert.type]}`}>
            <span className="text-lg">{icons[alert.type]}</span>
            <span className="text-sm">{alert.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LiquidityDashboard({ analysis, currency }: LiquidityDashboardProps) {
  const metrics = calculateLiquidityMetrics(analysis);

  const getStatus = (value: number, thresholds: { healthy: number; warning: number }): 'healthy' | 'warning' | 'critical' => {
    if (value >= thresholds.healthy) return 'healthy';
    if (value >= thresholds.warning) return 'warning';
    return 'critical';
  };

  return (
    <div className="space-y-6">
      {/* Key Liquidity Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <LiquidityGauge
          value={metrics.currentRatio}
          max={3}
          label="Current Ratio"
          status={getStatus(metrics.currentRatio, { healthy: 1.5, warning: 1.0 })}
        />
        <LiquidityGauge
          value={metrics.quickRatio}
          max={2.5}
          label="Quick Ratio"
          status={getStatus(metrics.quickRatio, { healthy: 1.0, warning: 0.7 })}
        />
        <LiquidityGauge
          value={metrics.cashRatio}
          max={1}
          label="Cash Ratio"
          status={getStatus(metrics.cashRatio, { healthy: 0.3, warning: 0.1 })}
        />
        <LiquidityGauge
          value={Math.min(metrics.daysCashOnHand, 365)}
          max={365}
          label="Days Cash on Hand"
          status={getStatus(metrics.daysCashOnHand, { healthy: 90, warning: 30 })}
        />
      </div>

      {/* Cash Runway & Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CashRunwayChart
          months={metrics.cashRunwayMonths}
          burnRate={metrics.monthlyBurnRate}
          currentCash={metrics.currentCash}
          currency={currency}
        />
        <LiquidityAlerts metrics={metrics} />
      </div>

      {/* Working Capital & Cash Flow */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WorkingCapitalCycle
          dso={metrics.dso}
          dio={metrics.dio}
          dpo={metrics.dpo}
          ccc={metrics.cashConversionCycle}
        />
        <CashFlowWaterfall data={metrics.cashFlowWaterfall} currency={currency} />
      </div>

      {/* Detailed Metrics Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detailed Liquidity Metrics</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Monthly Burn Rate</div>
            <div className="text-xl font-bold text-amber-400">{formatCurrency(metrics.monthlyBurnRate, currency)}</div>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Annual Burn Rate</div>
            <div className="text-xl font-bold text-amber-400">{formatCurrency(metrics.annualBurnRate, currency)}</div>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Current Cash</div>
            <div className="text-xl font-bold text-green-400">{formatCurrency(metrics.currentCash, currency)}</div>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Days Sales Outstanding</div>
            <div className="text-xl font-bold text-blue-400">{metrics.dso.toFixed(0)} days</div>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Days Inventory Outstanding</div>
            <div className="text-xl font-bold text-purple-400">{metrics.dio.toFixed(0)} days</div>
          </div>
          <div className="p-4 bg-zinc-800/50 rounded-lg">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Days Payable Outstanding</div>
            <div className="text-xl font-bold text-green-400">{metrics.dpo.toFixed(0)} days</div>
          </div>
        </div>
      </div>
    </div>
  );
}
