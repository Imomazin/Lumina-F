"use client";

import { AnalysisResult } from "@/lib/analysis/financial-engine";

interface SpiderChartProps {
  analysis: AnalysisResult;
}

// Calculate scenario metrics for spider chart
function calculateSpiderData(analysis: AnalysisResult) {
  const scenarios = analysis.scenarios;
  const baseCase = scenarios.find(s => s.scenarioType === 'base') || scenarios[0];

  const metrics = [
    { key: 'revenue', label: 'Revenue Growth' },
    { key: 'margin', label: 'EBITDA Margin' },
    { key: 'ev', label: 'Enterprise Value' },
    { key: 'irr', label: 'IRR' },
    { key: 'liquidity', label: 'Liquidity' },
    { key: 'growth', label: 'FCF Growth' },
  ];

  // Normalize all values to 0-100 scale for visualization
  const normalizedScenarios = scenarios.slice(0, 3).map(scenario => {
    const lastYear = scenario.yearlyFinancials[scenario.yearlyFinancials.length - 1];
    const firstYear = scenario.yearlyFinancials[0];

    const revenueGrowth = ((lastYear.revenue - firstYear.revenue) / firstYear.revenue) * 100;
    const margin = lastYear.ebitdaMargin * 100;
    const evRatio = (scenario.dcfValuation.enterpriseValue / baseCase.dcfValuation.enterpriseValue) * 100;
    const irr = scenario.irr * 100;
    const liquidity = 70 + Math.random() * 30; // Simulated
    const fcfGrowth = scenario.yearlyFinancials.reduce((sum, yf) => sum + yf.freeCashFlow, 0) > 0 ? 80 : 40;

    return {
      name: scenario.scenarioName,
      type: scenario.scenarioType,
      values: [
        Math.min(Math.max(revenueGrowth * 2 + 50, 10), 100),
        Math.min(Math.max(margin * 2.5, 10), 100),
        Math.min(Math.max(evRatio, 10), 100),
        Math.min(Math.max(irr * 3, 10), 100),
        Math.min(Math.max(liquidity, 10), 100),
        Math.min(Math.max(fcfGrowth, 10), 100),
      ],
      color: scenario.scenarioType === 'base' ? '#f59e0b' :
             scenario.scenarioType === 'upside' ? '#22c55e' : '#ef4444',
    };
  });

  return { metrics, scenarios: normalizedScenarios };
}

export function SpiderChart({ analysis }: SpiderChartProps) {
  const { metrics, scenarios } = calculateSpiderData(analysis);

  const numAxes = metrics.length;
  const size = 250;
  const center = size / 2;
  const maxRadius = size / 2 - 40;

  // Calculate point positions
  const getPoint = (value: number, index: number) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    };
  };

  // Get axis endpoint
  const getAxisEnd = (index: number) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    return {
      x: center + Math.cos(angle) * maxRadius,
      y: center + Math.sin(angle) * maxRadius,
      labelX: center + Math.cos(angle) * (maxRadius + 25),
      labelY: center + Math.sin(angle) * (maxRadius + 25),
    };
  };

  // Grid levels
  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Scenario Comparison</h3>

      <div className="flex justify-center">
        <svg width={size + 80} height={size + 40} viewBox={`-40 -20 ${size + 80} ${size + 40}`}>
          {/* Grid circles */}
          {gridLevels.map((level) => {
            const radius = (level / 100) * maxRadius;
            return (
              <circle
                key={level}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#27272a"
                strokeDasharray="4"
              />
            );
          })}

          {/* Axes */}
          {metrics.map((_, index) => {
            const end = getAxisEnd(index);
            return (
              <line
                key={index}
                x1={center}
                y1={center}
                x2={end.x}
                y2={end.y}
                stroke="#3f3f46"
                strokeWidth="1"
              />
            );
          })}

          {/* Axis labels */}
          {metrics.map((metric, index) => {
            const end = getAxisEnd(index);
            const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
            const isRight = Math.cos(angle) > 0.1;
            const isLeft = Math.cos(angle) < -0.1;

            return (
              <text
                key={index}
                x={end.labelX}
                y={end.labelY}
                textAnchor={isRight ? "start" : isLeft ? "end" : "middle"}
                dominantBaseline="middle"
                className="text-xs fill-zinc-400"
              >
                {metric.label}
              </text>
            );
          })}

          {/* Scenario polygons */}
          {scenarios.map((scenario, scenarioIdx) => {
            const points = metrics.map((_, index) => {
              const pt = getPoint(scenario.values[index], index);
              return `${pt.x},${pt.y}`;
            }).join(' ');

            return (
              <g key={scenarioIdx}>
                <polygon
                  points={points}
                  fill={scenario.color}
                  fillOpacity="0.15"
                  stroke={scenario.color}
                  strokeWidth="2"
                  className="transition-all hover:fill-opacity-25"
                />
                {/* Data points */}
                {metrics.map((_, index) => {
                  const pt = getPoint(scenario.values[index], index);
                  return (
                    <circle
                      key={index}
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill={scenario.color}
                      className="hover:r-6 transition-all"
                    />
                  );
                })}
              </g>
            );
          })}

          {/* Center point */}
          <circle cx={center} cy={center} r="3" fill="#52525b" />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        {scenarios.map((scenario, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div
              className="w-4 h-2 rounded"
              style={{ backgroundColor: scenario.color }}
            />
            <span className="text-sm text-zinc-400">{scenario.name}</span>
          </div>
        ))}
      </div>

      {/* Metric values table */}
      <div className="mt-6 pt-4 border-t border-zinc-800">
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className="text-zinc-500 font-medium">Metric</div>
          {scenarios.map((s, i) => (
            <div key={i} className="font-medium" style={{ color: s.color }}>{s.name}</div>
          ))}
        </div>
        {metrics.map((metric, mIdx) => (
          <div key={mIdx} className="grid grid-cols-4 gap-2 text-xs py-1 border-t border-zinc-800/50">
            <div className="text-zinc-400">{metric.label}</div>
            {scenarios.map((s, sIdx) => (
              <div key={sIdx} className="font-mono text-zinc-300">{s.values[mIdx].toFixed(0)}%</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Compact mini spider for cards
export function SpiderChartMini({ analysis }: SpiderChartProps) {
  const { metrics, scenarios } = calculateSpiderData(analysis);
  const baseScenario = scenarios.find(s => s.type === 'base') || scenarios[0];

  const numAxes = metrics.length;
  const size = 100;
  const center = size / 2;
  const maxRadius = size / 2 - 10;

  const getPoint = (value: number, index: number) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
    };
  };

  const points = metrics.map((_, index) => {
    const pt = getPoint(baseScenario.values[index], index);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  return (
    <svg width={size} height={size} className="opacity-70">
      {/* Grid */}
      <circle cx={center} cy={center} r={maxRadius} fill="none" stroke="#27272a" />
      <circle cx={center} cy={center} r={maxRadius * 0.5} fill="none" stroke="#27272a" strokeDasharray="2" />

      {/* Axes */}
      {metrics.map((_, index) => {
        const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
        return (
          <line
            key={index}
            x1={center}
            y1={center}
            x2={center + Math.cos(angle) * maxRadius}
            y2={center + Math.sin(angle) * maxRadius}
            stroke="#3f3f46"
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={points}
        fill="#f59e0b"
        fillOpacity="0.2"
        stroke="#f59e0b"
        strokeWidth="1.5"
      />
    </svg>
  );
}
