// Professional Analysis Dashboard
// World-class financial analysis visualization with KPIs, charts, and insights

"use client";

import { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart, Scatter,
} from 'recharts';
import {
  AnalysisResult,
  YearlyFinancials,
  FinancialRatios,
  DCFValuation,
  ScenarioAnalysis,
} from '@/lib/analysis/financial-engine';
import { getCurrencySymbol, Currency } from '@/lib/models/financial-model';
import { KPIDashboard } from '@/components/dashboards/KPIDashboard';
import { ChartsDashboard } from '@/components/dashboards/ChartsDashboard';
import { RiskDashboard } from '@/components/dashboards/RiskDashboard';
import { LiquidityDashboard } from '@/components/dashboards/LiquidityDashboard';
import { StressTestingDashboard } from '@/components/dashboards/StressTestingDashboard';
import { ComparableValuation } from '@/components/dashboards/ComparableValuation';
import { FinanceDashboard } from '@/components/dashboards/FinanceDashboard';
import { TornadoChart } from '@/components/charts/TornadoChart';
import { SpiderChart } from '@/components/charts/SpiderChart';

// =============================================================================
// TYPES
// =============================================================================

interface AnalysisDashboardProps {
  analysis: AnalysisResult;
  currency: Currency;
}

type DashboardTab = 'overview' | 'finance' | 'kpis' | 'charts' | 'statements' | 'ratios' | 'valuation' | 'comparables' | 'scenarios' | 'sensitivity' | 'liquidity' | 'stress' | 'risk' | 'insights';

// =============================================================================
// CONSTANTS
// =============================================================================

const CHART_COLORS = {
  primary: '#FBBF24',
  secondary: '#60A5FA',
  tertiary: '#34D399',
  quaternary: '#F472B6',
  danger: '#EF4444',
  muted: '#6B7280',
};

const SCENARIO_COLORS: Record<string, string> = {
  base: '#FBBF24',
  upside: '#34D399',
  downside: '#EF4444',
  stress: '#F472B6',
  custom: '#60A5FA',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AnalysisDashboard({ analysis, currency }: AnalysisDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const symbol = getCurrencySymbol(currency);

  const tabs: { id: DashboardTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
    },
    {
      id: 'kpis',
      label: 'KPIs',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    },
    {
      id: 'charts',
      label: 'Charts',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>,
    },
    {
      id: 'statements',
      label: 'Statements',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
    },
    {
      id: 'ratios',
      label: 'Ratios',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    },
    {
      id: 'valuation',
      label: 'DCF',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      id: 'comparables',
      label: 'Comps',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    },
    {
      id: 'scenarios',
      label: 'Scenarios',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
    {
      id: 'sensitivity',
      label: 'Sensitivity',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
    },
    {
      id: 'liquidity',
      label: 'Liquidity',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    },
    {
      id: 'stress',
      label: 'Stress Test',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      id: 'risk',
      label: 'Risk',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex items-center gap-1 p-1 bg-white/[0.02] border border-white/5 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-amber-400/10 text-amber-400'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <OverviewTab analysis={analysis} symbol={symbol} />
        )}
        {activeTab === 'finance' && (
          <FinanceDashboard analysis={analysis} currency={currency} />
        )}
        {activeTab === 'kpis' && (
          <KPIDashboard analysis={analysis} currency={currency} />
        )}
        {activeTab === 'charts' && (
          <ChartsDashboard analysis={analysis} currency={currency} />
        )}
        {activeTab === 'statements' && (
          <StatementsTab analysis={analysis} symbol={symbol} />
        )}
        {activeTab === 'ratios' && (
          <RatiosTab ratios={analysis.baseCase.averageRatios} />
        )}
        {activeTab === 'valuation' && (
          <ValuationTab dcf={analysis.baseCase.dcfValuation} symbol={symbol} />
        )}
        {activeTab === 'comparables' && (
          <ComparableValuation analysis={analysis} currency={currency} />
        )}
        {activeTab === 'scenarios' && (
          <ScenariosTab scenarios={analysis.scenarios} symbol={symbol} />
        )}
        {activeTab === 'sensitivity' && (
          <div className="space-y-6">
            <TornadoChart analysis={analysis} currency={currency} />
            <SpiderChart analysis={analysis} />
          </div>
        )}
        {activeTab === 'liquidity' && (
          <LiquidityDashboard analysis={analysis} currency={currency} />
        )}
        {activeTab === 'stress' && (
          <StressTestingDashboard analysis={analysis} currency={currency} />
        )}
        {activeTab === 'risk' && (
          <RiskDashboard analysis={analysis} currency={currency} />
        )}
        {activeTab === 'insights' && (
          <InsightsTab analysis={analysis} />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({ analysis, symbol }: { analysis: AnalysisResult; symbol: string }) {
  const { yearlyFinancials, cagr, dcfValuation } = analysis.baseCase;
  const firstYear = yearlyFinancials[0];
  const lastYear = yearlyFinancials[yearlyFinancials.length - 1];

  // Prepare chart data
  const chartData = yearlyFinancials.map(y => ({
    year: y.year,
    revenue: y.revenue / 1e6,
    ebitda: y.ebitda / 1e6,
    netIncome: y.netIncome / 1e6,
    fcf: y.freeCashFlow / 1e6,
    grossMargin: y.grossMargin * 100,
    ebitdaMargin: y.ebitdaMargin * 100,
    netMargin: y.netMargin * 100,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(lastYear?.revenue || 0, symbol)}
          change={cagr.revenue}
          subtitle={`${yearlyFinancials.length}Y CAGR`}
        />
        <KPICard
          title="EBITDA"
          value={formatCurrency(lastYear?.ebitda || 0, symbol)}
          change={cagr.ebitda}
          subtitle={`${(lastYear?.ebitdaMargin * 100 || 0).toFixed(1)}% margin`}
        />
        <KPICard
          title="Net Income"
          value={formatCurrency(lastYear?.netIncome || 0, symbol)}
          change={cagr.netIncome}
          subtitle={`${(lastYear?.netMargin * 100 || 0).toFixed(1)}% margin`}
        />
        <KPICard
          title="Enterprise Value"
          value={formatCurrency(dcfValuation.enterpriseValue, symbol)}
          subtitle={`WACC: ${dcfValuation.wacc.toFixed(1)}%`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue & Profitability */}
        <ChartCard title="Revenue & Profitability" subtitle="In millions">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="year" stroke="#666" />
              <YAxis yAxisId="left" stroke="#666" />
              <YAxis yAxisId="right" orientation="right" stroke="#666" />
              <Tooltip content={<CustomTooltip symbol={symbol} />} />
              <Legend />
              <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="ebitda" name="EBITDA" stroke={CHART_COLORS.secondary} strokeWidth={2} />
              <Line yAxisId="left" type="monotone" dataKey="netIncome" name="Net Income" stroke={CHART_COLORS.tertiary} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Margin Trends */}
        <ChartCard title="Margin Trends" subtitle="Percentage">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="year" stroke="#666" />
              <YAxis stroke="#666" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip suffix="%" />} />
              <Legend />
              <Area type="monotone" dataKey="grossMargin" name="Gross Margin" fill={CHART_COLORS.primary} fillOpacity={0.2} stroke={CHART_COLORS.primary} />
              <Area type="monotone" dataKey="ebitdaMargin" name="EBITDA Margin" fill={CHART_COLORS.secondary} fillOpacity={0.2} stroke={CHART_COLORS.secondary} />
              <Area type="monotone" dataKey="netMargin" name="Net Margin" fill={CHART_COLORS.tertiary} fillOpacity={0.2} stroke={CHART_COLORS.tertiary} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Cash Flow Analysis */}
      <ChartCard title="Cash Flow Analysis" subtitle="In millions">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="year" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip content={<CustomTooltip symbol={symbol} />} />
            <Legend />
            <Bar dataKey="netIncome" name="Net Income" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="fcf" name="Free Cash Flow" fill={CHART_COLORS.tertiary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <MetricCard label="Gross Margin" value={`${(lastYear?.grossMargin * 100 || 0).toFixed(1)}%`} />
        <MetricCard label="EBITDA Margin" value={`${(lastYear?.ebitdaMargin * 100 || 0).toFixed(1)}%`} />
        <MetricCard label="Net Margin" value={`${(lastYear?.netMargin * 100 || 0).toFixed(1)}%`} />
        <MetricCard label="FCF Margin" value={`${(lastYear?.fcfMargin * 100 || 0).toFixed(1)}%`} />
        <MetricCard label="Revenue Growth" value={`${cagr.revenue.toFixed(1)}%`} />
        <MetricCard label="EPS" value={formatCurrency(lastYear?.eps || 0, symbol)} />
      </div>
    </div>
  );
}

// =============================================================================
// STATEMENTS TAB
// =============================================================================

function StatementsTab({ analysis, symbol }: { analysis: AnalysisResult; symbol: string }) {
  const { yearlyFinancials } = analysis.baseCase;
  const [statementType, setStatementType] = useState<'income' | 'balance' | 'cashflow'>('income');

  return (
    <div className="space-y-6">
      {/* Statement Selector */}
      <div className="flex gap-2">
        {[
          { id: 'income', label: 'Income Statement' },
          { id: 'balance', label: 'Balance Sheet' },
          { id: 'cashflow', label: 'Cash Flow' },
        ].map(stmt => (
          <button
            key={stmt.id}
            onClick={() => setStatementType(stmt.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              statementType === stmt.id
                ? 'bg-amber-400 text-black'
                : 'bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            {stmt.label}
          </button>
        ))}
      </div>

      {/* Statement Table */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {statementType === 'income' && (
            <IncomeStatementTable data={yearlyFinancials} symbol={symbol} />
          )}
          {statementType === 'balance' && (
            <BalanceSheetTable data={yearlyFinancials} symbol={symbol} />
          )}
          {statementType === 'cashflow' && (
            <CashFlowTable data={yearlyFinancials} symbol={symbol} />
          )}
        </div>
      </div>
    </div>
  );
}

function IncomeStatementTable({ data, symbol }: { data: YearlyFinancials[]; symbol: string }) {
  const rows = [
    { label: 'Revenue', key: 'revenue', bold: true },
    { label: 'Cost of Goods Sold', key: 'costOfGoodsSold', indent: true },
    { label: 'Gross Profit', key: 'grossProfit', bold: true },
    { label: 'Operating Expenses', key: 'operatingExpenses', indent: true },
    { label: 'EBITDA', key: 'ebitda', bold: true },
    { label: 'Depreciation', key: 'depreciation', indent: true },
    { label: 'Amortization', key: 'amortization', indent: true },
    { label: 'EBIT', key: 'ebit', bold: true },
    { label: 'Interest Expense', key: 'interestExpense', indent: true },
    { label: 'Interest Income', key: 'interestIncome', indent: true },
    { label: 'EBT', key: 'ebt', bold: true },
    { label: 'Taxes', key: 'taxes', indent: true },
    { label: 'Net Income', key: 'netIncome', bold: true, highlight: true },
  ];

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/10">
          <th className="text-left py-3 px-4 text-gray-400 font-medium">Line Item</th>
          {data.map(y => (
            <th key={y.year} className="text-right py-3 px-4 text-gray-400 font-medium">{y.year}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr
            key={row.key}
            className={`border-b border-white/5 ${row.highlight ? 'bg-amber-400/5' : ''}`}
          >
            <td className={`py-2.5 px-4 ${row.bold ? 'font-semibold text-white' : 'text-gray-300'} ${row.indent ? 'pl-8' : ''}`}>
              {row.label}
            </td>
            {data.map(y => (
              <td key={y.year} className={`text-right py-2.5 px-4 font-mono ${row.bold ? 'font-semibold text-white' : 'text-gray-300'}`}>
                {formatNumber((y as any)[row.key], symbol)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BalanceSheetTable({ data, symbol }: { data: YearlyFinancials[]; symbol: string }) {
  const rows = [
    { label: 'Total Current Assets', key: 'totalCurrentAssets', bold: true },
    { label: 'Total Non-Current Assets', key: 'totalNonCurrentAssets', bold: true },
    { label: 'Total Assets', key: 'totalAssets', bold: true, highlight: true },
    { label: '', key: 'divider' },
    { label: 'Total Current Liabilities', key: 'totalCurrentLiabilities', bold: true },
    { label: 'Total Non-Current Liabilities', key: 'totalNonCurrentLiabilities', bold: true },
    { label: 'Total Liabilities', key: 'totalLiabilities', bold: true },
    { label: '', key: 'divider2' },
    { label: 'Total Equity', key: 'totalEquity', bold: true, highlight: true },
    { label: '', key: 'divider3' },
    { label: 'Net Debt', key: 'netDebt' },
    { label: 'Working Capital', key: 'workingCapital' },
    { label: 'Invested Capital', key: 'investedCapital' },
  ];

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/10">
          <th className="text-left py-3 px-4 text-gray-400 font-medium">Line Item</th>
          {data.map(y => (
            <th key={y.year} className="text-right py-3 px-4 text-gray-400 font-medium">{y.year}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          row.key.startsWith('divider') ? (
            <tr key={row.key} className="h-4" />
          ) : (
            <tr
              key={row.key}
              className={`border-b border-white/5 ${row.highlight ? 'bg-amber-400/5' : ''}`}
            >
              <td className={`py-2.5 px-4 ${row.bold ? 'font-semibold text-white' : 'text-gray-300'}`}>
                {row.label}
              </td>
              {data.map(y => (
                <td key={y.year} className={`text-right py-2.5 px-4 font-mono ${row.bold ? 'font-semibold text-white' : 'text-gray-300'}`}>
                  {formatNumber((y as any)[row.key], symbol)}
                </td>
              ))}
            </tr>
          )
        ))}
      </tbody>
    </table>
  );
}

function CashFlowTable({ data, symbol }: { data: YearlyFinancials[]; symbol: string }) {
  const rows = [
    { label: 'Net Income', key: 'netIncome' },
    { label: 'Depreciation', key: 'depreciation', indent: true },
    { label: 'Change in Working Capital', key: 'changeInWorkingCapital', indent: true },
    { label: 'Operating Cash Flow', key: 'operatingCashFlow', bold: true },
    { label: '', key: 'divider' },
    { label: 'Capital Expenditures', key: 'capitalExpenditures' },
    { label: 'Free Cash Flow', key: 'freeCashFlow', bold: true, highlight: true },
    { label: '', key: 'divider2' },
    { label: 'Dividends Paid', key: 'dividendsPaid' },
    { label: 'Net Cash Flow', key: 'netCashFlow', bold: true },
    { label: 'Ending Cash', key: 'endingCash', bold: true, highlight: true },
  ];

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-white/10">
          <th className="text-left py-3 px-4 text-gray-400 font-medium">Line Item</th>
          {data.map(y => (
            <th key={y.year} className="text-right py-3 px-4 text-gray-400 font-medium">{y.year}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          row.key.startsWith('divider') ? (
            <tr key={row.key} className="h-4" />
          ) : (
            <tr
              key={row.key}
              className={`border-b border-white/5 ${row.highlight ? 'bg-amber-400/5' : ''}`}
            >
              <td className={`py-2.5 px-4 ${row.bold ? 'font-semibold text-white' : 'text-gray-300'} ${row.indent ? 'pl-8' : ''}`}>
                {row.label}
              </td>
              {data.map(y => (
                <td key={y.year} className={`text-right py-2.5 px-4 font-mono ${row.bold ? 'font-semibold text-white' : 'text-gray-300'}`}>
                  {formatNumber((y as any)[row.key], symbol)}
                </td>
              ))}
            </tr>
          )
        ))}
      </tbody>
    </table>
  );
}

// =============================================================================
// RATIOS TAB
// =============================================================================

function RatiosTab({ ratios }: { ratios: FinancialRatios }) {
  const ratioGroups = [
    {
      title: 'Profitability',
      icon: '📈',
      items: [
        { label: 'Gross Margin', value: ratios.grossMargin, format: 'percent' },
        { label: 'EBITDA Margin', value: ratios.ebitdaMargin, format: 'percent' },
        { label: 'EBIT Margin', value: ratios.ebitMargin, format: 'percent' },
        { label: 'Net Margin', value: ratios.netMargin, format: 'percent' },
        { label: 'Return on Equity', value: ratios.returnOnEquity, format: 'percent' },
        { label: 'Return on Assets', value: ratios.returnOnAssets, format: 'percent' },
        { label: 'Return on Invested Capital', value: ratios.returnOnInvestedCapital, format: 'percent' },
      ],
    },
    {
      title: 'Liquidity',
      icon: '💧',
      items: [
        { label: 'Current Ratio', value: ratios.currentRatio, format: 'ratio' },
        { label: 'Quick Ratio', value: ratios.quickRatio, format: 'ratio' },
        { label: 'Cash Ratio', value: ratios.cashRatio, format: 'ratio' },
      ],
    },
    {
      title: 'Leverage',
      icon: '⚖️',
      items: [
        { label: 'Debt to Equity', value: ratios.debtToEquity, format: 'ratio' },
        { label: 'Debt to Assets', value: ratios.debtToAssets, format: 'ratio' },
        { label: 'Net Debt / EBITDA', value: ratios.netDebtToEbitda, format: 'ratio' },
        { label: 'Interest Coverage', value: ratios.interestCoverage, format: 'ratio' },
        { label: 'Equity Multiplier', value: ratios.equityMultiplier, format: 'ratio' },
      ],
    },
    {
      title: 'Efficiency',
      icon: '⚡',
      items: [
        { label: 'Asset Turnover', value: ratios.assetTurnover, format: 'ratio' },
        { label: 'Inventory Turnover', value: ratios.inventoryTurnover, format: 'ratio' },
        { label: 'Receivables Turnover', value: ratios.receivablesTurnover, format: 'ratio' },
        { label: 'Days Sales Outstanding', value: ratios.daysSalesOutstanding, format: 'days' },
        { label: 'Days Inventory', value: ratios.daysInventoryOutstanding, format: 'days' },
        { label: 'Cash Conversion Cycle', value: ratios.cashConversionCycle, format: 'days' },
      ],
    },
    {
      title: 'Growth',
      icon: '🚀',
      items: [
        { label: 'Revenue Growth', value: ratios.revenueGrowth, format: 'percent' },
        { label: 'EBITDA Growth', value: ratios.ebitdaGrowth, format: 'percent' },
        { label: 'Net Income Growth', value: ratios.netIncomeGrowth, format: 'percent' },
        { label: 'EPS Growth', value: ratios.epsGrowth, format: 'percent' },
        { label: 'Asset Growth', value: ratios.assetGrowth, format: 'percent' },
      ],
    },
  ];

  // Prepare radar chart data
  const radarData = [
    { metric: 'Profitability', value: Math.min(100, ratios.netMargin * 3) },
    { metric: 'Growth', value: Math.min(100, ratios.revenueGrowth * 3) },
    { metric: 'Efficiency', value: Math.min(100, ratios.assetTurnover * 50) },
    { metric: 'Liquidity', value: Math.min(100, ratios.currentRatio * 30) },
    { metric: 'Leverage', value: Math.max(0, 100 - ratios.debtToEquity * 30) },
  ];

  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <ChartCard title="Financial Health Radar" subtitle="Normalized scores (0-100)">
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#333" />
            <PolarAngleAxis dataKey="metric" stroke="#666" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#666" />
            <Radar name="Score" dataKey="value" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.4} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Ratio Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ratioGroups.map(group => (
          <div key={group.title} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>{group.icon}</span>
              {group.title}
            </h3>
            <div className="space-y-3">
              {group.items.map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{item.label}</span>
                  <span className="text-sm font-mono font-semibold text-white">
                    {item.format === 'percent' && `${item.value.toFixed(1)}%`}
                    {item.format === 'ratio' && `${item.value.toFixed(2)}x`}
                    {item.format === 'days' && `${item.value.toFixed(0)} days`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// VALUATION TAB
// =============================================================================

function ValuationTab({ dcf, symbol }: { dcf: DCFValuation; symbol: string }) {
  return (
    <div className="space-y-6">
      {/* Valuation Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Enterprise Value"
          value={formatCurrency(dcf.enterpriseValue, symbol)}
          subtitle="Total firm value"
        />
        <KPICard
          title="Equity Value"
          value={formatCurrency(dcf.equityValue, symbol)}
          subtitle="After net debt"
        />
        <KPICard
          title="Implied Share Price"
          value={formatCurrency(dcf.impliedSharePrice, symbol)}
          subtitle="Per share"
        />
        <KPICard
          title="WACC"
          value={`${dcf.wacc.toFixed(2)}%`}
          subtitle="Discount rate"
        />
      </div>

      {/* DCF Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost of Capital */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Cost of Capital</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Cost of Equity</span>
              <span className="font-mono text-white">{dcf.costOfEquity.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cost of Debt (Pre-tax)</span>
              <span className="font-mono text-white">{dcf.costOfDebt.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tax Shield</span>
              <span className="font-mono text-white">{dcf.taxShield.toFixed(0)}%</span>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between">
              <span className="text-white font-semibold">WACC</span>
              <span className="font-mono text-amber-400 font-semibold">{dcf.wacc.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Value Bridge */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Value Bridge</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">PV of FCF</span>
              <span className="font-mono text-white">{formatCurrency(dcf.sumPVFCF, symbol)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Terminal Value (PV)</span>
              <span className="font-mono text-white">{formatCurrency(dcf.terminalValuePV, symbol)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Enterprise Value</span>
              <span className="font-mono text-white">{formatCurrency(dcf.enterpriseValue, symbol)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Less: Net Debt</span>
              <span className="font-mono text-red-400">({formatCurrency(dcf.netDebt, symbol)})</span>
            </div>
            <div className="pt-3 border-t border-white/10 flex justify-between">
              <span className="text-white font-semibold">Equity Value</span>
              <span className="font-mono text-amber-400 font-semibold">{formatCurrency(dcf.equityValue, symbol)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sensitivity Matrix */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Sensitivity Analysis</h3>
        <p className="text-sm text-gray-400 mb-4">Implied share price by WACC and terminal growth rate</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2 px-3 text-gray-400">WACC \ Growth</th>
                {dcf.sensitivityGrowth.map(g => (
                  <th key={g} className="text-center py-2 px-3 text-gray-400">{g.toFixed(1)}%</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dcf.sensitivityMatrix.map((row, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-2 px-3 text-gray-400">{dcf.sensitivityWACC[i].toFixed(1)}%</td>
                  {row.map((val, j) => {
                    const isBase = i === 2 && j === 2;
                    return (
                      <td
                        key={j}
                        className={`text-center py-2 px-3 font-mono ${
                          isBase ? 'bg-amber-400/20 text-amber-400 font-semibold' : 'text-gray-300'
                        }`}
                      >
                        {formatCurrency(val, symbol)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FCF Projection */}
      <ChartCard title="Free Cash Flow Projection" subtitle="Present value analysis">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dcf.projectedFCF.map((fcf, i) => ({
            year: i + 1,
            fcf: fcf / 1e6,
            pvFcf: dcf.presentValueFCF[i] / 1e6,
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="year" stroke="#666" label={{ value: 'Year', position: 'bottom' }} />
            <YAxis stroke="#666" />
            <Tooltip content={<CustomTooltip symbol={symbol} />} />
            <Legend />
            <Bar dataKey="fcf" name="FCF" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
            <Bar dataKey="pvFcf" name="Present Value" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// =============================================================================
// SCENARIOS TAB
// =============================================================================

function ScenariosTab({ scenarios, symbol }: { scenarios: ScenarioAnalysis[]; symbol: string }) {
  if (scenarios.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        No scenarios configured. Add scenarios in the input form.
      </div>
    );
  }

  // Prepare comparison data
  const comparisonData = scenarios[0]?.yearlyFinancials.map((_, i) => {
    const year = scenarios[0].yearlyFinancials[i].year;
    const point: any = { year };
    scenarios.forEach(s => {
      point[`${s.scenarioName}_revenue`] = s.yearlyFinancials[i]?.revenue / 1e6 || 0;
      point[`${s.scenarioName}_netIncome`] = s.yearlyFinancials[i]?.netIncome / 1e6 || 0;
    });
    return point;
  });

  return (
    <div className="space-y-6">
      {/* Scenario Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map(scenario => (
          <div
            key={scenario.scenarioId}
            className="bg-white/[0.02] border border-white/5 rounded-xl p-5"
            style={{ borderColor: SCENARIO_COLORS[scenario.scenarioType] + '40' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: SCENARIO_COLORS[scenario.scenarioType] }}
              />
              <h3 className="text-lg font-semibold text-white">{scenario.scenarioName}</h3>
              <span className="ml-auto text-xs text-gray-400">{scenario.probability}% prob.</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Enterprise Value</span>
                <span className="font-mono text-white">{formatCurrency(scenario.dcfValuation.enterpriseValue, symbol)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Equity Value</span>
                <span className="font-mono text-white">{formatCurrency(scenario.dcfValuation.equityValue, symbol)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">NPV</span>
                <span className={`font-mono ${scenario.npv >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(scenario.npv, symbol)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">IRR</span>
                <span className="font-mono text-white">{scenario.irr.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Comparison */}
      <ChartCard title="Revenue Comparison by Scenario" subtitle="In millions">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis dataKey="year" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip content={<CustomTooltip symbol={symbol} />} />
            <Legend />
            {scenarios.map(s => (
              <Line
                key={s.scenarioId}
                type="monotone"
                dataKey={`${s.scenarioName}_revenue`}
                name={`${s.scenarioName}`}
                stroke={SCENARIO_COLORS[s.scenarioType]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Probability-Weighted Value */}
      <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Probability-Weighted Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-400">Expected Enterprise Value</p>
            <p className="text-xl font-bold text-amber-400">
              {formatCurrency(
                scenarios.reduce((s, sc) => s + sc.dcfValuation.enterpriseValue * (sc.probability / 100), 0),
                symbol
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Expected Equity Value</p>
            <p className="text-xl font-bold text-amber-400">
              {formatCurrency(
                scenarios.reduce((s, sc) => s + sc.dcfValuation.equityValue * (sc.probability / 100), 0),
                symbol
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Expected NPV</p>
            <p className="text-xl font-bold text-amber-400">
              {formatCurrency(
                scenarios.reduce((s, sc) => s + sc.npv * (sc.probability / 100), 0),
                symbol
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400">Expected IRR</p>
            <p className="text-xl font-bold text-amber-400">
              {scenarios.reduce((s, sc) => s + sc.irr * (sc.probability / 100), 0).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// INSIGHTS TAB
// =============================================================================

function InsightsTab({ analysis }: { analysis: AnalysisResult }) {
  const { executiveSummary, riskMetrics, comparableAnalysis } = analysis;

  const ratingColors: Record<string, string> = {
    strong_buy: 'text-green-400 bg-green-400/10',
    buy: 'text-green-300 bg-green-300/10',
    hold: 'text-amber-400 bg-amber-400/10',
    sell: 'text-orange-400 bg-orange-400/10',
    strong_sell: 'text-red-400 bg-red-400/10',
  };

  const ratingLabels: Record<string, string> = {
    strong_buy: 'Strong Buy',
    buy: 'Buy',
    hold: 'Hold',
    sell: 'Sell',
    strong_sell: 'Strong Sell',
  };

  return (
    <div className="space-y-6">
      {/* Investment Rating */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Investment Rating</h3>
            <p className="text-sm text-gray-400">Based on financial analysis</p>
          </div>
          <div className={`px-4 py-2 rounded-lg text-lg font-bold ${ratingColors[executiveSummary.investmentRating]}`}>
            {ratingLabels[executiveSummary.investmentRating]}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-400">Confidence:</span>
          <span className={`text-sm font-medium ${
            executiveSummary.confidenceLevel === 'high' ? 'text-green-400' :
            executiveSummary.confidenceLevel === 'medium' ? 'text-amber-400' : 'text-red-400'
          }`}>
            {executiveSummary.confidenceLevel.charAt(0).toUpperCase() + executiveSummary.confidenceLevel.slice(1)}
          </span>
        </div>
      </div>

      {/* Key Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-amber-400">📊</span> Key Highlights
          </h3>
          <ul className="space-y-2">
            {executiveSummary.keyHighlights.map((highlight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-amber-400 mt-0.5">•</span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-green-400">✓</span> Strengths & Opportunities
          </h3>
          <ul className="space-y-2">
            {executiveSummary.strengthsOpportunities.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-green-400 mt-0.5">+</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-red-400">⚠</span> Risks & Threats
          </h3>
          <ul className="space-y-2">
            {executiveSummary.risksThreats.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-red-400 mt-0.5">−</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-blue-400">💡</span> Recommendations
          </h3>
          <ul className="space-y-2">
            {executiveSummary.recommendations.length > 0 ? (
              executiveSummary.recommendations.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-blue-400 mt-0.5">→</span>
                  {item}
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-400">No specific recommendations at this time.</li>
            )}
          </ul>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard label="Volatility" value={`${riskMetrics.volatility.toFixed(1)}%`} />
          <MetricCard label="Max Drawdown" value={`${riskMetrics.maxDrawdown.toFixed(1)}%`} />
          <MetricCard label="VaR (95%)" value={formatCurrency(riskMetrics.valueAtRisk95, '$')} />
          <MetricCard label="Sharpe Ratio" value={riskMetrics.sharpeRatio.toFixed(2)} />
          <MetricCard label="Operating Leverage" value={`${riskMetrics.operatingLeverage.toFixed(2)}x`} />
          <MetricCard label="Financial Leverage" value={`${riskMetrics.financialLeverage.toFixed(2)}x`} />
          <MetricCard label="Combined Leverage" value={`${riskMetrics.combinedLeverage.toFixed(2)}x`} />
          <MetricCard label="Break-even Year" value={riskMetrics.breakEvenYear?.toString() || 'N/A'} />
        </div>
      </div>

      {/* Industry Comparison */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Industry Benchmarking</h3>
        <div className="space-y-4">
          {comparableAnalysis.metrics.map((metric, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Metric {i + 1}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  metric.rating === 'excellent' ? 'bg-green-400/10 text-green-400' :
                  metric.rating === 'above_average' ? 'bg-blue-400/10 text-blue-400' :
                  metric.rating === 'average' ? 'bg-amber-400/10 text-amber-400' :
                  'bg-red-400/10 text-red-400'
                }`}>
                  {metric.rating.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-amber-400 rounded-full"
                  style={{ width: `${metric.percentile}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Low: {metric.industryLow.toFixed(1)}</span>
                <span>Company: {metric.companyValue.toFixed(1)}</span>
                <span>High: {metric.industryHigh.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function KPICard({
  title,
  value,
  change,
  subtitle,
}: {
  title: string;
  value: string;
  change?: number;
  subtitle?: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      <div className="mt-2 flex items-center gap-2">
        {change !== undefined && (
          <span className={`text-sm font-medium ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
          </span>
        )}
        {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
  symbol,
  suffix,
}: any) {
  if (!active || !payload) return null;

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3 shadow-xl">
      <p className="text-sm font-semibold text-white mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: {symbol && formatNumber(entry.value * 1e6, symbol)}
          {suffix && `${entry.value.toFixed(1)}${suffix}`}
          {!symbol && !suffix && entry.value.toFixed(2)}
        </p>
      ))}
    </div>
  );
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function formatCurrency(value: number, symbol: string): string {
  if (Math.abs(value) >= 1e9) return `${symbol}${(value / 1e9).toFixed(1)}B`;
  if (Math.abs(value) >= 1e6) return `${symbol}${(value / 1e6).toFixed(1)}M`;
  if (Math.abs(value) >= 1e3) return `${symbol}${(value / 1e3).toFixed(1)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

function formatNumber(value: number, symbol: string): string {
  if (Math.abs(value) >= 1e9) return `${symbol}${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `${symbol}${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `${symbol}${(value / 1e3).toFixed(2)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

export default AnalysisDashboard;
