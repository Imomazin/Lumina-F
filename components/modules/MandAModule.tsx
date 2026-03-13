"use client";

import { useState, useMemo } from "react";

// Local format helpers
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

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

interface DealStructure {
  targetName: string;
  targetRevenue: number;
  targetEbitda: number;
  purchasePrice: number;
  cashComponent: number; // percentage
  stockComponent: number; // percentage
  debtComponent: number; // percentage
  synergiesRevenue: number;
  synergiesCost: number;
  integrationCosts: number;
  timeToRealize: number; // years
}

interface MandAModuleProps {
  acquirerRevenue: number;
  acquirerEbitda: number;
  acquirerShares: number;
  acquirerSharePrice: number;
  currency: string;
}

const defaultDeal: DealStructure = {
  targetName: "Target Co.",
  targetRevenue: 50000000,
  targetEbitda: 7500000,
  purchasePrice: 75000000,
  cashComponent: 40,
  stockComponent: 40,
  debtComponent: 20,
  synergiesRevenue: 5000000,
  synergiesCost: 3000000,
  integrationCosts: 5000000,
  timeToRealize: 2,
};

export function MandAModule({
  acquirerRevenue,
  acquirerEbitda,
  acquirerShares,
  acquirerSharePrice,
  currency,
}: MandAModuleProps) {
  const [deal, setDeal] = useState<DealStructure>(defaultDeal);
  const [activeTab, setActiveTab] = useState<"structure" | "synergies" | "accretion">("structure");

  // Calculate deal metrics
  const dealMetrics = useMemo(() => {
    const cashPaid = deal.purchasePrice * (deal.cashComponent / 100);
    const stockPaid = deal.purchasePrice * (deal.stockComponent / 100);
    const debtUsed = deal.purchasePrice * (deal.debtComponent / 100);

    const newSharesIssued = stockPaid / acquirerSharePrice;
    const postDealShares = acquirerShares + newSharesIssued;
    const dilutionPercent = newSharesIssued / postDealShares;

    // Multiples
    const evToRevenue = deal.purchasePrice / deal.targetRevenue;
    const evToEbitda = deal.purchasePrice / deal.targetEbitda;

    // Combined company
    const combinedRevenue = acquirerRevenue + deal.targetRevenue + deal.synergiesRevenue;
    const combinedEbitda = acquirerEbitda + deal.targetEbitda + deal.synergiesCost - (deal.integrationCosts / deal.timeToRealize);

    // Accretion/Dilution (simplified)
    const acquirerEps = acquirerEbitda * 0.7 / acquirerShares; // Simplified net income
    const targetNetIncome = deal.targetEbitda * 0.7;
    const synergyNetIncome = (deal.synergiesRevenue * 0.3 + deal.synergiesCost) * 0.7;
    const debtCost = debtUsed * 0.06 * 0.7; // 6% interest, tax-affected
    const foregoneInterest = cashPaid * 0.03 * 0.7; // 3% opportunity cost

    const proFormaNetIncome = (acquirerEbitda * 0.7) + targetNetIncome + synergyNetIncome - debtCost - foregoneInterest - (deal.integrationCosts / deal.timeToRealize * 0.7);
    const proFormaEps = proFormaNetIncome / postDealShares;
    const accretionDilution = (proFormaEps - acquirerEps) / acquirerEps;

    return {
      cashPaid,
      stockPaid,
      debtUsed,
      newSharesIssued,
      postDealShares,
      dilutionPercent,
      evToRevenue,
      evToEbitda,
      combinedRevenue,
      combinedEbitda,
      acquirerEps,
      proFormaEps,
      accretionDilution,
      totalSynergies: deal.synergiesRevenue + deal.synergiesCost,
      netSynergies: deal.synergiesRevenue + deal.synergiesCost - deal.integrationCosts,
    };
  }, [deal, acquirerRevenue, acquirerEbitda, acquirerShares, acquirerSharePrice]);

  const updateDeal = (field: keyof DealStructure, value: number | string) => {
    setDeal((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">M&A Analysis</h2>
          <p className="text-sm text-zinc-400">
            Model acquisition scenarios, synergies, and accretion/dilution
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors">
            Save Scenario
          </button>
          <button className="px-4 py-2 rounded-lg bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors">
            Run Analysis
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-zinc-800/50 rounded-lg w-fit">
        {[
          { id: "structure", label: "Deal Structure" },
          { id: "synergies", label: "Synergies" },
          { id: "accretion", label: "Accretion/Dilution" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Deal Structure Tab */}
      {activeTab === "structure" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Target Details */}
          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Target Company</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Company Name</label>
                <input
                  type="text"
                  value={deal.targetName}
                  onChange={(e) => updateDeal("targetName", e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Target Revenue</label>
                  <input
                    type="number"
                    value={deal.targetRevenue}
                    onChange={(e) => updateDeal("targetRevenue", parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-1">Target EBITDA</label>
                  <input
                    type="number"
                    value={deal.targetEbitda}
                    onChange={(e) => updateDeal("targetEbitda", parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Purchase Price</label>
                <input
                  type="number"
                  value={deal.purchasePrice}
                  onChange={(e) => updateDeal("purchasePrice", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* Deal Metrics */}
          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Deal Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-zinc-900 rounded-lg">
                <div className="text-sm text-zinc-400">EV/Revenue</div>
                <div className="text-xl font-bold text-white">{dealMetrics.evToRevenue.toFixed(1)}x</div>
              </div>
              <div className="p-3 bg-zinc-900 rounded-lg">
                <div className="text-sm text-zinc-400">EV/EBITDA</div>
                <div className="text-xl font-bold text-white">{dealMetrics.evToEbitda.toFixed(1)}x</div>
              </div>
              <div className="p-3 bg-zinc-900 rounded-lg">
                <div className="text-sm text-zinc-400">Ownership Dilution</div>
                <div className="text-xl font-bold text-amber-400">{formatPercent(dealMetrics.dilutionPercent)}</div>
              </div>
              <div className="p-3 bg-zinc-900 rounded-lg">
                <div className="text-sm text-zinc-400">New Shares Issued</div>
                <div className="text-xl font-bold text-white">{(dealMetrics.newSharesIssued / 1000000).toFixed(1)}M</div>
              </div>
            </div>
          </div>

          {/* Consideration Mix */}
          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-5 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Consideration Mix</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Cash ({deal.cashComponent}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={deal.cashComponent}
                  onChange={(e) => {
                    const cash = parseInt(e.target.value);
                    const remaining = 100 - cash;
                    updateDeal("cashComponent", cash);
                    updateDeal("stockComponent", Math.round(remaining * (deal.stockComponent / (deal.stockComponent + deal.debtComponent || 1))));
                    updateDeal("debtComponent", remaining - Math.round(remaining * (deal.stockComponent / (deal.stockComponent + deal.debtComponent || 1))));
                  }}
                  className="w-full"
                />
                <div className="text-lg font-semibold text-green-400 mt-1">
                  {formatCurrency(dealMetrics.cashPaid, currency)}
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Stock ({deal.stockComponent}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max={100 - deal.cashComponent}
                  value={deal.stockComponent}
                  onChange={(e) => {
                    const stock = parseInt(e.target.value);
                    updateDeal("stockComponent", stock);
                    updateDeal("debtComponent", 100 - deal.cashComponent - stock);
                  }}
                  className="w-full"
                />
                <div className="text-lg font-semibold text-blue-400 mt-1">
                  {formatCurrency(dealMetrics.stockPaid, currency)}
                </div>
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Debt ({deal.debtComponent}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max={100 - deal.cashComponent - deal.stockComponent}
                  value={deal.debtComponent}
                  onChange={(e) => updateDeal("debtComponent", parseInt(e.target.value))}
                  className="w-full"
                  disabled
                />
                <div className="text-lg font-semibold text-red-400 mt-1">
                  {formatCurrency(dealMetrics.debtUsed, currency)}
                </div>
              </div>
            </div>

            {/* Visual bar */}
            <div className="mt-4 h-4 rounded-full overflow-hidden flex">
              <div className="bg-green-500" style={{ width: `${deal.cashComponent}%` }} />
              <div className="bg-blue-500" style={{ width: `${deal.stockComponent}%` }} />
              <div className="bg-red-500" style={{ width: `${deal.debtComponent}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Synergies Tab */}
      {activeTab === "synergies" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Synergies</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Cross-sell Opportunities</label>
                <input
                  type="number"
                  value={deal.synergiesRevenue}
                  onChange={(e) => updateDeal("synergiesRevenue", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="text-sm text-green-400">Revenue Uplift</div>
                <div className="text-xl font-bold text-green-400">
                  +{formatPercent(deal.synergiesRevenue / deal.targetRevenue)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Cost Synergies</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Annual Cost Savings</label>
                <input
                  type="number"
                  value={deal.synergiesCost}
                  onChange={(e) => updateDeal("synergiesCost", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="text-sm text-blue-400">Margin Improvement</div>
                <div className="text-xl font-bold text-blue-400">
                  +{formatPercent(deal.synergiesCost / dealMetrics.combinedRevenue)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Integration Costs</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">One-time Integration Costs</label>
                <input
                  type="number"
                  value={deal.integrationCosts}
                  onChange={(e) => updateDeal("integrationCosts", parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Time to Realize (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={deal.timeToRealize}
                  onChange={(e) => updateDeal("timeToRealize", parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Synergy Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-zinc-700">
                <span className="text-zinc-400">Total Annual Synergies</span>
                <span className="text-white font-medium">{formatCurrency(dealMetrics.totalSynergies, currency)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-700">
                <span className="text-zinc-400">Less: Integration Costs</span>
                <span className="text-red-400">({formatCurrency(deal.integrationCosts, currency)})</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-white font-medium">Net Synergy Value</span>
                <span className={`font-bold ${dealMetrics.netSynergies >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {formatCurrency(dealMetrics.netSynergies, currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accretion/Dilution Tab */}
      {activeTab === "accretion" && (
        <div className="space-y-6">
          {/* Main Accretion Card */}
          <div className={`p-6 rounded-xl border ${
            dealMetrics.accretionDilution >= 0
              ? "bg-green-500/10 border-green-500/30"
              : "bg-red-500/10 border-red-500/30"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">
                  {dealMetrics.accretionDilution >= 0 ? "Accretive" : "Dilutive"} Transaction
                </h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Impact on earnings per share
                </p>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${
                  dealMetrics.accretionDilution >= 0 ? "text-green-400" : "text-red-400"
                }`}>
                  {dealMetrics.accretionDilution >= 0 ? "+" : ""}{formatPercent(dealMetrics.accretionDilution)}
                </div>
                <div className="text-sm text-zinc-400 mt-1">Year 1 Impact</div>
              </div>
            </div>
          </div>

          {/* EPS Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-5">
              <h4 className="text-sm text-zinc-400 mb-2">Standalone EPS</h4>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(dealMetrics.acquirerEps, currency)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">Before acquisition</div>
            </div>
            <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-5 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-5">
              <h4 className="text-sm text-zinc-400 mb-2">Pro Forma EPS</h4>
              <div className={`text-2xl font-bold ${
                dealMetrics.proFormaEps > dealMetrics.acquirerEps ? "text-green-400" : "text-red-400"
              }`}>
                {formatCurrency(dealMetrics.proFormaEps, currency)}
              </div>
              <div className="text-xs text-zinc-500 mt-1">After acquisition</div>
            </div>
          </div>

          {/* Combined Company */}
          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Combined Company Profile</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-zinc-900 rounded-lg">
                <div className="text-sm text-zinc-400">Combined Revenue</div>
                <div className="text-xl font-bold text-white mt-1">
                  {formatCurrency(dealMetrics.combinedRevenue, currency)}
                </div>
                <div className="text-xs text-green-400 mt-1">
                  +{formatPercent((dealMetrics.combinedRevenue - acquirerRevenue) / acquirerRevenue)} growth
                </div>
              </div>
              <div className="p-4 bg-zinc-900 rounded-lg">
                <div className="text-sm text-zinc-400">Combined EBITDA</div>
                <div className="text-xl font-bold text-white mt-1">
                  {formatCurrency(dealMetrics.combinedEbitda, currency)}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  {formatPercent(dealMetrics.combinedEbitda / dealMetrics.combinedRevenue)} margin
                </div>
              </div>
              <div className="p-4 bg-zinc-900 rounded-lg">
                <div className="text-sm text-zinc-400">Total Shares</div>
                <div className="text-xl font-bold text-white mt-1">
                  {(dealMetrics.postDealShares / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-amber-400 mt-1">
                  +{(dealMetrics.newSharesIssued / 1000000).toFixed(1)}M new
                </div>
              </div>
              <div className="p-4 bg-zinc-900 rounded-lg">
                <div className="text-sm text-zinc-400">Synergy NPV</div>
                <div className="text-xl font-bold text-white mt-1">
                  {formatCurrency(dealMetrics.totalSynergies * 5, currency)}
                </div>
                <div className="text-xs text-zinc-400 mt-1">5-year value</div>
              </div>
            </div>
          </div>

          {/* Sensitivity */}
          <div className="bg-zinc-800/50 rounded-xl border border-zinc-700 p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Breakeven Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-zinc-400 mb-3">
                  Synergies required to make the deal accretive in Year 1:
                </p>
                <div className="text-2xl font-bold text-amber-400">
                  {formatCurrency(
                    Math.max(0, (dealMetrics.acquirerEps * dealMetrics.postDealShares - acquirerEbitda * 0.7 - deal.targetEbitda * 0.7) / 0.7),
                    currency
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-zinc-400 mb-3">
                  Maximum purchase price for an accretive deal:
                </p>
                <div className="text-2xl font-bold text-amber-400">
                  {formatCurrency(
                    deal.purchasePrice * (1 + dealMetrics.accretionDilution * 2),
                    currency
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
