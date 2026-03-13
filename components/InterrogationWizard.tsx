"use client";

import React, { useState, useCallback } from "react";
import { FinancialModel } from "@/lib/models/financial-model";

interface InterrogationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (model: Partial<FinancialModel>) => void;
  existingModel?: FinancialModel | null;
}

type WizardPhase = 1 | 2 | 3 | 4 | 5 | 6;

interface PhaseData {
  phase1: {
    businessModelType: string;
    currency: string;
    reportingPeriod: string;
    fiscalYearEnd: string;
    accountingBasis: string;
    hasHistoricalData: boolean;
    forecastYears: number;
  };
  phase2: {
    revenueStreams: Array<{
      name: string;
      type: string;
      pricingModel: string;
      volumeDriver: string;
      baseAmount: number;
      growthRate: number;
      churnRate: number;
      seasonality: string;
    }>;
  };
  phase3: {
    fixedCosts: Array<{ name: string; amount: number; growthRate: number }>;
    variableCosts: Array<{ name: string; percentOfRevenue: number }>;
    oneTimeCosts: Array<{ name: string; amount: number; year: number }>;
  };
  phase4: {
    accountsReceivableDays: number;
    accountsPayableDays: number;
    inventoryDays: number;
    cashAndEquivalents: number;
    shortTermDebt: number;
    longTermDebt: number;
    interestRate: number;
    depreciation: number;
  };
  phase5: {
    taxJurisdiction: string;
    corporateTaxRate: number;
    hasTaxCredits: boolean;
    taxCreditsAmount: number;
  };
  phase6: {
    wacc: number;
    terminalGrowthRate: number;
    riskFreeRate: number;
    equityRiskPremium: number;
    betaLevered: number;
  };
}

const initialPhaseData: PhaseData = {
  phase1: {
    businessModelType: "saas",
    currency: "USD",
    reportingPeriod: "yearly",
    fiscalYearEnd: "December",
    accountingBasis: "accrual",
    hasHistoricalData: false,
    forecastYears: 5,
  },
  phase2: {
    revenueStreams: [{ name: "", type: "subscription", pricingModel: "monthly", volumeDriver: "users", baseAmount: 0, growthRate: 10, churnRate: 5, seasonality: "none" }],
  },
  phase3: {
    fixedCosts: [{ name: "Salaries & Benefits", amount: 0, growthRate: 3 }],
    variableCosts: [{ name: "Cost of Goods Sold", percentOfRevenue: 20 }],
    oneTimeCosts: [],
  },
  phase4: {
    accountsReceivableDays: 45,
    accountsPayableDays: 30,
    inventoryDays: 0,
    cashAndEquivalents: 0,
    shortTermDebt: 0,
    longTermDebt: 0,
    interestRate: 5,
    depreciation: 10,
  },
  phase5: {
    taxJurisdiction: "US",
    corporateTaxRate: 21,
    hasTaxCredits: false,
    taxCreditsAmount: 0,
  },
  phase6: {
    wacc: 10,
    terminalGrowthRate: 2.5,
    riskFreeRate: 4,
    equityRiskPremium: 5,
    betaLevered: 1.2,
  },
};

const phaseInfo = [
  { phase: 1, title: "Enterprise Context", icon: "🏢", description: "Business model, currency, reporting period" },
  { phase: 2, title: "Revenue Streams", icon: "💰", description: "Define your revenue sources and drivers" },
  { phase: 3, title: "Cost Structure", icon: "📊", description: "Fixed, variable, and one-time costs" },
  { phase: 4, title: "Balance Sheet", icon: "⚖️", description: "Working capital, debt, and depreciation" },
  { phase: 5, title: "Tax & Regulation", icon: "📋", description: "Tax rates and incentives" },
  { phase: 6, title: "Valuation Assumptions", icon: "🎯", description: "WACC, terminal growth, risk parameters" },
];

// Phase components
function Phase1Form({ data, onChange }: { data: PhaseData['phase1']; onChange: (data: PhaseData['phase1']) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Business Model Type</label>
        <select
          value={data.businessModelType}
          onChange={(e) => onChange({ ...data, businessModelType: e.target.value })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
        >
          <option value="saas">SaaS / Subscription</option>
          <option value="ecommerce">E-Commerce / Transactional</option>
          <option value="marketplace">Marketplace / Platform</option>
          <option value="service">Professional Services</option>
          <option value="manufacturing">Manufacturing / Product</option>
          <option value="hybrid">Hybrid Model</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Currency</label>
          <select
            value={data.currency}
            onChange={(e) => onChange({ ...data, currency: e.target.value })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="JPY">JPY - Japanese Yen</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Reporting Period</label>
          <select
            value={data.reportingPeriod}
            onChange={(e) => onChange({ ...data, reportingPeriod: e.target.value })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Fiscal Year End</label>
          <select
            value={data.fiscalYearEnd}
            onChange={(e) => onChange({ ...data, fiscalYearEnd: e.target.value })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          >
            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Accounting Basis</label>
          <select
            value={data.accountingBasis}
            onChange={(e) => onChange({ ...data, accountingBasis: e.target.value })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="accrual">Accrual</option>
            <option value="cash">Cash</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Forecast Horizon (Years)</label>
        <input
          type="number"
          min="1"
          max="10"
          value={data.forecastYears}
          onChange={(e) => onChange({ ...data, forecastYears: parseInt(e.target.value) || 5 })}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

function Phase2Form({ data, onChange }: { data: PhaseData['phase2']; onChange: (data: PhaseData['phase2']) => void }) {
  const addStream = () => {
    onChange({
      revenueStreams: [...data.revenueStreams, { name: "", type: "subscription", pricingModel: "monthly", volumeDriver: "users", baseAmount: 0, growthRate: 10, churnRate: 5, seasonality: "none" }]
    });
  };

  const updateStream = (index: number, field: string, value: string | number) => {
    const updated = [...data.revenueStreams];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ revenueStreams: updated });
  };

  const removeStream = (index: number) => {
    if (data.revenueStreams.length > 1) {
      onChange({ revenueStreams: data.revenueStreams.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="space-y-6">
      {data.revenueStreams.map((stream, idx) => (
        <div key={idx} className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-amber-400">Revenue Stream #{idx + 1}</span>
            {data.revenueStreams.length > 1 && (
              <button onClick={() => removeStream(idx)} className="text-red-400 hover:text-red-300 text-sm">Remove</button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Stream Name</label>
              <input
                type="text"
                value={stream.name}
                onChange={(e) => updateStream(idx, 'name', e.target.value)}
                placeholder="e.g., Enterprise Subscriptions"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Revenue Type</label>
              <select
                value={stream.type}
                onChange={(e) => updateStream(idx, 'type', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="subscription">Subscription (Recurring)</option>
                <option value="transactional">Transactional (One-time)</option>
                <option value="usage">Usage-Based</option>
                <option value="license">License Fee</option>
                <option value="service">Service Revenue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Base Amount (Annual)</label>
              <input
                type="number"
                value={stream.baseAmount}
                onChange={(e) => updateStream(idx, 'baseAmount', parseFloat(e.target.value) || 0)}
                placeholder="1000000"
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Growth Rate (%)</label>
              <input
                type="number"
                value={stream.growthRate}
                onChange={(e) => updateStream(idx, 'growthRate', parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            {stream.type === 'subscription' && (
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Churn Rate (%)</label>
                <input
                  type="number"
                  value={stream.churnRate}
                  onChange={(e) => updateStream(idx, 'churnRate', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Volume Driver</label>
              <select
                value={stream.volumeDriver}
                onChange={(e) => updateStream(idx, 'volumeDriver', e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="users">Users</option>
                <option value="transactions">Transactions</option>
                <option value="units">Units</option>
                <option value="seats">Seats</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={addStream}
        className="w-full py-2 border border-dashed border-zinc-600 rounded-lg text-zinc-400 hover:text-white hover:border-amber-500 transition-colors"
      >
        + Add Revenue Stream
      </button>
    </div>
  );
}

function Phase3Form({ data, onChange }: { data: PhaseData['phase3']; onChange: (data: PhaseData['phase3']) => void }) {
  const addFixedCost = () => {
    onChange({ ...data, fixedCosts: [...data.fixedCosts, { name: "", amount: 0, growthRate: 3 }] });
  };

  const addVariableCost = () => {
    onChange({ ...data, variableCosts: [...data.variableCosts, { name: "", percentOfRevenue: 0 }] });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-zinc-300">Fixed Costs</h4>
          <button onClick={addFixedCost} className="text-xs text-amber-400 hover:text-amber-300">+ Add</button>
        </div>
        <div className="space-y-2">
          {data.fixedCosts.map((cost, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={cost.name}
                onChange={(e) => {
                  const updated = [...data.fixedCosts];
                  updated[idx] = { ...updated[idx], name: e.target.value };
                  onChange({ ...data, fixedCosts: updated });
                }}
                placeholder="Cost name"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
              <input
                type="number"
                value={cost.amount}
                onChange={(e) => {
                  const updated = [...data.fixedCosts];
                  updated[idx] = { ...updated[idx], amount: parseFloat(e.target.value) || 0 };
                  onChange({ ...data, fixedCosts: updated });
                }}
                placeholder="Amount"
                className="w-32 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
              <input
                type="number"
                value={cost.growthRate}
                onChange={(e) => {
                  const updated = [...data.fixedCosts];
                  updated[idx] = { ...updated[idx], growthRate: parseFloat(e.target.value) || 0 };
                  onChange({ ...data, fixedCosts: updated });
                }}
                placeholder="Growth %"
                className="w-20 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-zinc-300">Variable Costs (% of Revenue)</h4>
          <button onClick={addVariableCost} className="text-xs text-amber-400 hover:text-amber-300">+ Add</button>
        </div>
        <div className="space-y-2">
          {data.variableCosts.map((cost, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={cost.name}
                onChange={(e) => {
                  const updated = [...data.variableCosts];
                  updated[idx] = { ...updated[idx], name: e.target.value };
                  onChange({ ...data, variableCosts: updated });
                }}
                placeholder="Cost name"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
              <input
                type="number"
                value={cost.percentOfRevenue}
                onChange={(e) => {
                  const updated = [...data.variableCosts];
                  updated[idx] = { ...updated[idx], percentOfRevenue: parseFloat(e.target.value) || 0 };
                  onChange({ ...data, variableCosts: updated });
                }}
                placeholder="% of Revenue"
                className="w-32 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Phase4Form({ data, onChange }: { data: PhaseData['phase4']; onChange: (data: PhaseData['phase4']) => void }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <h4 className="text-sm font-medium text-amber-400 mb-4">Working Capital Assumptions</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">A/R Days (DSO)</label>
            <input
              type="number"
              value={data.accountsReceivableDays}
              onChange={(e) => onChange({ ...data, accountsReceivableDays: parseInt(e.target.value) || 0 })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">A/P Days (DPO)</label>
            <input
              type="number"
              value={data.accountsPayableDays}
              onChange={(e) => onChange({ ...data, accountsPayableDays: parseInt(e.target.value) || 0 })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Inventory Days (DIO)</label>
            <input
              type="number"
              value={data.inventoryDays}
              onChange={(e) => onChange({ ...data, inventoryDays: parseInt(e.target.value) || 0 })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <h4 className="text-sm font-medium text-amber-400 mb-4">Balance Sheet Items</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Cash & Equivalents</label>
            <input
              type="number"
              value={data.cashAndEquivalents}
              onChange={(e) => onChange({ ...data, cashAndEquivalents: parseFloat(e.target.value) || 0 })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Short-Term Debt</label>
            <input
              type="number"
              value={data.shortTermDebt}
              onChange={(e) => onChange({ ...data, shortTermDebt: parseFloat(e.target.value) || 0 })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Long-Term Debt</label>
            <input
              type="number"
              value={data.longTermDebt}
              onChange={(e) => onChange({ ...data, longTermDebt: parseFloat(e.target.value) || 0 })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Interest Rate (%)</label>
            <input
              type="number"
              value={data.interestRate}
              onChange={(e) => onChange({ ...data, interestRate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Phase5Form({ data, onChange }: { data: PhaseData['phase5']; onChange: (data: PhaseData['phase5']) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Tax Jurisdiction</label>
          <select
            value={data.taxJurisdiction}
            onChange={(e) => onChange({ ...data, taxJurisdiction: e.target.value })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          >
            <option value="US">United States</option>
            <option value="UK">United Kingdom</option>
            <option value="EU">European Union</option>
            <option value="APAC">Asia Pacific</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Corporate Tax Rate (%)</label>
          <input
            type="number"
            value={data.corporateTaxRate}
            onChange={(e) => onChange({ ...data, corporateTaxRate: parseFloat(e.target.value) || 0 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.hasTaxCredits}
            onChange={(e) => onChange({ ...data, hasTaxCredits: e.target.checked })}
            className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
          />
          <span className="text-sm text-zinc-300">Company has tax credits/incentives</span>
        </label>

        {data.hasTaxCredits && (
          <div className="mt-4">
            <label className="block text-xs text-zinc-400 mb-1">Annual Tax Credits Amount</label>
            <input
              type="number"
              value={data.taxCreditsAmount}
              onChange={(e) => onChange({ ...data, taxCreditsAmount: parseFloat(e.target.value) || 0 })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function Phase6Form({ data, onChange }: { data: PhaseData['phase6']; onChange: (data: PhaseData['phase6']) => void }) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <p className="text-sm text-amber-400">
          These assumptions drive your DCF valuation. Default values are based on typical market conditions.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">WACC (%)</label>
          <input
            type="number"
            step="0.1"
            value={data.wacc}
            onChange={(e) => onChange({ ...data, wacc: parseFloat(e.target.value) || 0 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          />
          <p className="text-xs text-zinc-500 mt-1">Weighted average cost of capital</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Terminal Growth Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={data.terminalGrowthRate}
            onChange={(e) => onChange({ ...data, terminalGrowthRate: parseFloat(e.target.value) || 0 })}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
          />
          <p className="text-xs text-zinc-500 mt-1">Long-term sustainable growth</p>
        </div>
      </div>

      <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
        <h4 className="text-sm font-medium text-amber-400 mb-4">Advanced CAPM Inputs</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Risk-Free Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={data.riskFreeRate}
              onChange={(e) => onChange({ ...data, riskFreeRate: parseFloat(e.target.value) || 0 })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Equity Risk Premium (%)</label>
            <input
              type="number"
              step="0.1"
              value={data.equityRiskPremium}
              onChange={(e) => onChange({ ...data, equityRiskPremium: parseFloat(e.target.value) || 0 })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Levered Beta</label>
            <input
              type="number"
              step="0.1"
              value={data.betaLevered}
              onChange={(e) => onChange({ ...data, betaLevered: parseFloat(e.target.value) || 0 })}
              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-zinc-800 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Calculated Cost of Equity</span>
          <span className="text-lg font-bold text-amber-400">
            {(data.riskFreeRate + data.betaLevered * data.equityRiskPremium).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export function InterrogationWizard({ isOpen, onClose, onComplete, existingModel }: InterrogationWizardProps) {
  const [currentPhase, setCurrentPhase] = useState<WizardPhase>(1);
  const [phaseData, setPhaseData] = useState<PhaseData>(initialPhaseData);

  const handleNext = () => {
    if (currentPhase < 6) {
      setCurrentPhase((currentPhase + 1) as WizardPhase);
    } else {
      // Complete wizard - convert to financial model
      const modelData = convertToFinancialModel(phaseData);
      onComplete(modelData);
      onClose();
    }
  };

  const handleBack = () => {
    if (currentPhase > 1) {
      setCurrentPhase((currentPhase - 1) as WizardPhase);
    }
  };

  const convertToFinancialModel = (data: PhaseData): Partial<FinancialModel> => {
    // Convert wizard data to partial FinancialModel format
    // This returns data that will be merged with a base model template
    const wizardOutput = {
      profile: {
        companyName: "New Company",
        ticker: "",
        industry: "technology",
        subIndustry: "",
        revenueModel: "subscription",
        companyStage: "growth",
        headquarters: "",
        operatingCountries: 1,
        employees: 0,
        currency: data.phase1.currency,
        fiscalYearEnd: "dec",
        reportingBasis: "gaap",
        baseYear: new Date().getFullYear(),
        forecastYears: data.phase1.forecastYears,
        historicalYears: 0,
      },
      // Store raw wizard data for later conversion
      _wizardData: {
        phase1: data.phase1,
        phase2: data.phase2,
        phase3: data.phase3,
        phase4: data.phase4,
        phase5: data.phase5,
        phase6: data.phase6,
      },
    };
    // Use unknown cast to bypass strict typing - the caller will merge with a complete model
    return wizardOutput as unknown as Partial<FinancialModel>;
  };

  if (!isOpen) return null;

  const PhaseComponents: Record<WizardPhase, React.ReactElement> = {
    1: <Phase1Form data={phaseData.phase1} onChange={(d) => setPhaseData({ ...phaseData, phase1: d })} />,
    2: <Phase2Form data={phaseData.phase2} onChange={(d) => setPhaseData({ ...phaseData, phase2: d })} />,
    3: <Phase3Form data={phaseData.phase3} onChange={(d) => setPhaseData({ ...phaseData, phase3: d })} />,
    4: <Phase4Form data={phaseData.phase4} onChange={(d) => setPhaseData({ ...phaseData, phase4: d })} />,
    5: <Phase5Form data={phaseData.phase5} onChange={(d) => setPhaseData({ ...phaseData, phase5: d })} />,
    6: <Phase6Form data={phaseData.phase6} onChange={(d) => setPhaseData({ ...phaseData, phase6: d })} />,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl mx-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-zinc-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Financial Model Wizard</h2>
              <p className="text-sm text-zinc-400 mt-1">Guided data capture for comprehensive analysis</p>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2 mt-6">
            {phaseInfo.map((p) => (
              <div
                key={p.phase}
                className={`flex-1 h-1 rounded-full transition-all ${
                  p.phase <= currentPhase ? 'bg-amber-500' : 'bg-zinc-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Phase indicator */}
        <div className="flex gap-1 px-6 py-3 bg-zinc-800/50 overflow-x-auto">
          {phaseInfo.map((p) => (
            <button
              key={p.phase}
              onClick={() => setCurrentPhase(p.phase as WizardPhase)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                p.phase === currentPhase
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : p.phase < currentPhase
                  ? 'text-green-400 bg-green-500/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>{p.icon}</span>
              <span>{p.title}</span>
              {p.phase < currentPhase && <span>✓</span>}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">{phaseInfo[currentPhase - 1].icon}</span>
              Phase {currentPhase}: {phaseInfo[currentPhase - 1].title}
            </h3>
            <p className="text-sm text-zinc-400">{phaseInfo[currentPhase - 1].description}</p>
          </div>

          {PhaseComponents[currentPhase]}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-zinc-800 bg-zinc-900">
          <button
            onClick={handleBack}
            disabled={currentPhase === 1}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              currentPhase === 1
                ? 'text-zinc-600 cursor-not-allowed'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            ← Back
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Phase {currentPhase} of 6</span>
          </div>

          <button
            onClick={handleNext}
            className="px-6 py-2 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
          >
            {currentPhase === 6 ? 'Complete & Analyze' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
