// Professional Financial Input Form
// Comprehensive multi-section form for world-class financial modeling

"use client";

import { useState, useCallback } from 'react';
import {
  FinancialModel,
  CompanyProfile,
  IncomeStatement,
  BalanceSheet,
  CashFlowAssumptions,
  ValuationAssumptions,
  RevenueStream,
  CostItem,
  Scenario,
  INDUSTRIES,
  CURRENCIES,
  REVENUE_MODELS,
  COMPANY_STAGES,
  FISCAL_YEAR_ENDS,
  getIndustryLabel,
  getCurrencySymbol,
  createDefaultFinancialModel,
} from '@/lib/models/financial-model';

// =============================================================================
// TYPES
// =============================================================================

type FormSection =
  | 'profile'
  | 'revenue'
  | 'costs'
  | 'balance_sheet'
  | 'cash_flow'
  | 'valuation'
  | 'scenarios';

interface FormSectionConfig {
  id: FormSection;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

interface FinancialInputFormProps {
  initialData?: Partial<FinancialModel>;
  onSave: (model: FinancialModel) => void;
  onCancel?: () => void;
}

// =============================================================================
// SECTION CONFIGURATIONS
// =============================================================================

const FORM_SECTIONS: FormSectionConfig[] = [
  {
    id: 'profile',
    title: 'Company Profile',
    subtitle: 'Basic company information and settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    id: 'revenue',
    title: 'Revenue Streams',
    subtitle: 'Revenue sources and growth assumptions',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    id: 'costs',
    title: 'Cost Structure',
    subtitle: 'COGS and operating expenses',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'balance_sheet',
    title: 'Balance Sheet',
    subtitle: 'Assets, liabilities, and equity',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
      </svg>
    ),
  },
  {
    id: 'cash_flow',
    title: 'Cash Flow',
    subtitle: 'Working capital and capital expenditures',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'valuation',
    title: 'Valuation',
    subtitle: 'DCF and cost of capital assumptions',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'scenarios',
    title: 'Scenarios',
    subtitle: 'Scenario modeling and sensitivity',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function FinancialInputForm({ initialData, onSave, onCancel }: FinancialInputFormProps) {
  const [activeSection, setActiveSection] = useState<FormSection>('profile');
  const [formData, setFormData] = useState<Partial<FinancialModel>>(() => ({
    ...createDefaultFinancialModel(),
    ...initialData,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  // Update form data
  const updateField = useCallback(<K extends keyof FinancialModel>(
    section: K,
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value,
      },
    }));
    setIsDirty(true);
    // Clear error for this field
    setErrors(prev => {
      const next = { ...prev };
      delete next[`${section}.${field}`];
      return next;
    });
  }, []);

  // Handle save
  const handleSave = useCallback(() => {
    const now = new Date();
    const model: FinancialModel = {
      id: formData.id || `model-${Date.now()}`,
      version: (formData.version || 0) + 1,
      createdAt: formData.createdAt || now,
      updatedAt: now,
      profile: formData.profile as CompanyProfile,
      incomeStatement: formData.incomeStatement as IncomeStatement,
      balanceSheet: formData.balanceSheet as BalanceSheet,
      cashFlowAssumptions: formData.cashFlowAssumptions as CashFlowAssumptions,
      valuationAssumptions: formData.valuationAssumptions as ValuationAssumptions,
      scenarios: formData.scenarios || [],
      activeScenarioId: formData.activeScenarioId,
      notes: formData.notes,
      keyAssumptions: formData.keyAssumptions,
    };
    onSave(model);
    setIsDirty(false);
  }, [formData, onSave]);

  // Navigate sections
  const goToSection = (section: FormSection) => setActiveSection(section);
  const currentIndex = FORM_SECTIONS.findIndex(s => s.id === activeSection);
  const goNext = () => {
    if (currentIndex < FORM_SECTIONS.length - 1) {
      setActiveSection(FORM_SECTIONS[currentIndex + 1].id);
    }
  };
  const goPrev = () => {
    if (currentIndex > 0) {
      setActiveSection(FORM_SECTIONS[currentIndex - 1].id);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-12rem)]">
      {/* Sidebar Navigation */}
      <nav className="lg:w-64 flex-shrink-0">
        <div className="sticky top-24 space-y-1">
          {FORM_SECTIONS.map((section, index) => (
            <button
              key={section.id}
              onClick={() => goToSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                activeSection === section.id
                  ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                activeSection === section.id ? 'bg-amber-400/20' : 'bg-white/5'
              }`}>
                {section.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{section.title}</p>
                <p className="text-xs text-gray-500 truncate">{section.subtitle}</p>
              </div>
              <span className="text-xs text-gray-600">{index + 1}/{FORM_SECTIONS.length}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Form Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 lg:p-8">
          {/* Section Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">
              {FORM_SECTIONS.find(s => s.id === activeSection)?.title}
            </h2>
            <p className="mt-1 text-gray-400">
              {FORM_SECTIONS.find(s => s.id === activeSection)?.subtitle}
            </p>
          </div>

          {/* Section Forms */}
          {activeSection === 'profile' && (
            <ProfileSection
              data={formData.profile}
              onChange={(field, value) => updateField('profile', field, value)}
              errors={errors}
            />
          )}

          {activeSection === 'revenue' && (
            <RevenueSection
              data={formData.incomeStatement}
              forecastYears={formData.profile?.forecastYears || 5}
              onChange={(field, value) => updateField('incomeStatement', field, value)}
              errors={errors}
            />
          )}

          {activeSection === 'costs' && (
            <CostsSection
              data={formData.incomeStatement}
              onChange={(field, value) => updateField('incomeStatement', field, value)}
              errors={errors}
            />
          )}

          {activeSection === 'balance_sheet' && (
            <BalanceSheetSection
              data={formData.balanceSheet}
              currency={formData.profile?.currency || 'USD'}
              onChange={(field, value) => updateField('balanceSheet', field, value)}
              errors={errors}
            />
          )}

          {activeSection === 'cash_flow' && (
            <CashFlowSection
              data={formData.cashFlowAssumptions}
              onChange={(field, value) => updateField('cashFlowAssumptions', field, value)}
              errors={errors}
            />
          )}

          {activeSection === 'valuation' && (
            <ValuationSection
              data={formData.valuationAssumptions}
              onChange={(field, value) => updateField('valuationAssumptions', field, value)}
              errors={errors}
            />
          )}

          {activeSection === 'scenarios' && (
            <ScenariosSection
              data={formData.scenarios || []}
              activeScenarioId={formData.activeScenarioId}
              onChange={(scenarios) => setFormData(prev => ({ ...prev, scenarios }))}
              onSetActive={(id) => setFormData(prev => ({ ...prev, activeScenarioId: id }))}
              errors={errors}
            />
          )}

          {/* Navigation Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-3">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-semibold rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-400/25"
              >
                {isDirty ? 'Save Changes' : 'Saved'}
              </button>
            </div>

            <button
              onClick={goNext}
              disabled={currentIndex === FORM_SECTIONS.length - 1}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// PROFILE SECTION
// =============================================================================

function ProfileSection({
  data,
  onChange,
  errors,
}: {
  data?: Partial<CompanyProfile>;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-6">
      {/* Company Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Company Name"
          required
          error={errors['profile.companyName']}
        >
          <input
            type="text"
            value={data?.companyName || ''}
            onChange={(e) => onChange('companyName', e.target.value)}
            placeholder="Enter company name"
            className="form-input"
          />
        </FormField>

        <FormField label="Ticker Symbol">
          <input
            type="text"
            value={data?.ticker || ''}
            onChange={(e) => onChange('ticker', e.target.value.toUpperCase())}
            placeholder="e.g., AAPL"
            className="form-input"
            maxLength={10}
          />
        </FormField>

        <FormField label="Industry" required>
          <select
            value={data?.industry || 'technology'}
            onChange={(e) => onChange('industry', e.target.value)}
            className="form-select"
          >
            {INDUSTRIES.map(ind => (
              <option key={ind} value={ind}>{getIndustryLabel(ind)}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Sub-Industry">
          <input
            type="text"
            value={data?.subIndustry || ''}
            onChange={(e) => onChange('subIndustry', e.target.value)}
            placeholder="e.g., Enterprise Software"
            className="form-input"
          />
        </FormField>

        <FormField label="Revenue Model" required>
          <select
            value={data?.revenueModel || 'subscription'}
            onChange={(e) => onChange('revenueModel', e.target.value)}
            className="form-select"
          >
            {REVENUE_MODELS.map(model => (
              <option key={model} value={model}>
                {model.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Company Stage" required>
          <select
            value={data?.companyStage || 'growth'}
            onChange={(e) => onChange('companyStage', e.target.value)}
            className="form-select"
          >
            {COMPANY_STAGES.map(stage => (
              <option key={stage} value={stage}>
                {stage.charAt(0).toUpperCase() + stage.slice(1)}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Financial Settings */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Financial Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Currency" required>
            <select
              value={data?.currency || 'USD'}
              onChange={(e) => onChange('currency', e.target.value)}
              className="form-select"
            >
              {CURRENCIES.map(curr => (
                <option key={curr} value={curr}>
                  {curr} ({getCurrencySymbol(curr)})
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Fiscal Year End">
            <select
              value={data?.fiscalYearEnd || 'dec'}
              onChange={(e) => onChange('fiscalYearEnd', e.target.value)}
              className="form-select"
            >
              {FISCAL_YEAR_ENDS.map(month => (
                <option key={month} value={month}>
                  {month.charAt(0).toUpperCase() + month.slice(1)}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Reporting Basis">
            <select
              value={data?.reportingBasis || 'gaap'}
              onChange={(e) => onChange('reportingBasis', e.target.value)}
              className="form-select"
            >
              <option value="gaap">US GAAP</option>
              <option value="ifrs">IFRS</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        </div>
      </div>

      {/* Time Horizon */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Forecast Horizon</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Base Year" required>
            <input
              type="number"
              value={data?.baseYear || new Date().getFullYear()}
              onChange={(e) => onChange('baseYear', parseInt(e.target.value))}
              min={2000}
              max={2100}
              className="form-input"
            />
          </FormField>

          <FormField label="Forecast Years" required>
            <select
              value={data?.forecastYears || 5}
              onChange={(e) => onChange('forecastYears', parseInt(e.target.value))}
              className="form-select"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <option key={n} value={n}>{n} year{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Historical Years">
            <select
              value={data?.historicalYears || 0}
              onChange={(e) => onChange('historicalYears', parseInt(e.target.value))}
              className="form-select"
            >
              {[0, 1, 2, 3, 4, 5].map(n => (
                <option key={n} value={n}>{n} year{n !== 1 ? 's' : ''}</option>
              ))}
            </select>
          </FormField>
        </div>
      </div>

      {/* Additional Info */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Headquarters">
            <input
              type="text"
              value={data?.headquarters || ''}
              onChange={(e) => onChange('headquarters', e.target.value)}
              placeholder="e.g., San Francisco, CA"
              className="form-input"
            />
          </FormField>

          <FormField label="Number of Employees">
            <input
              type="number"
              value={data?.employees || ''}
              onChange={(e) => onChange('employees', parseInt(e.target.value) || undefined)}
              placeholder="e.g., 500"
              className="form-input"
              min={0}
            />
          </FormField>

          <FormField label="Founded Year">
            <input
              type="number"
              value={data?.foundedYear || ''}
              onChange={(e) => onChange('foundedYear', parseInt(e.target.value) || undefined)}
              placeholder="e.g., 2015"
              className="form-input"
              min={1800}
              max={2100}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// REVENUE SECTION
// =============================================================================

function RevenueSection({
  data,
  forecastYears,
  onChange,
  errors,
}: {
  data?: Partial<IncomeStatement>;
  forecastYears: number;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}) {
  const streams = data?.revenueStreams || [];

  const addStream = () => {
    const newStream: RevenueStream = {
      id: `stream-${Date.now()}`,
      name: `Revenue Stream ${streams.length + 1}`,
      type: 'product',
      baseAmount: 0,
      growthRates: Array(forecastYears).fill(10),
    };
    onChange('revenueStreams', [...streams, newStream]);
  };

  const updateStream = (index: number, field: keyof RevenueStream, value: any) => {
    const updated = [...streams];
    updated[index] = { ...updated[index], [field]: value };
    onChange('revenueStreams', updated);
  };

  const removeStream = (index: number) => {
    onChange('revenueStreams', streams.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Revenue Streams */}
      <div className="space-y-4">
        {streams.map((stream, index) => (
          <div
            key={stream.id}
            className="p-5 bg-white/[0.02] border border-white/10 rounded-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <h4 className="text-sm font-semibold text-white">
                Revenue Stream {index + 1}
              </h4>
              {streams.length > 1 && (
                <button
                  onClick={() => removeStream(index)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Stream Name">
                <input
                  type="text"
                  value={stream.name}
                  onChange={(e) => updateStream(index, 'name', e.target.value)}
                  className="form-input"
                />
              </FormField>

              <FormField label="Type">
                <select
                  value={stream.type}
                  onChange={(e) => updateStream(index, 'type', e.target.value)}
                  className="form-select"
                >
                  <option value="product">Product</option>
                  <option value="service">Service</option>
                  <option value="subscription">Subscription</option>
                  <option value="licensing">Licensing</option>
                  <option value="other">Other</option>
                </select>
              </FormField>

              <FormField label="Base Year Revenue">
                <input
                  type="number"
                  value={stream.baseAmount}
                  onChange={(e) => updateStream(index, 'baseAmount', parseFloat(e.target.value) || 0)}
                  className="form-input"
                  min={0}
                />
              </FormField>
            </div>

            {/* Growth Rates */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Annual Growth Rates (%)
              </label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {stream.growthRates.slice(0, forecastYears).map((rate, yearIndex) => (
                  <div key={yearIndex} className="text-center">
                    <span className="block text-xs text-gray-500 mb-1">Y{yearIndex + 1}</span>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => {
                        const newRates = [...stream.growthRates];
                        newRates[yearIndex] = parseFloat(e.target.value) || 0;
                        updateStream(index, 'growthRates', newRates);
                      }}
                      className="form-input text-center text-sm py-1.5"
                      step={0.1}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addStream}
        className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-amber-400/30 transition-all"
      >
        + Add Revenue Stream
      </button>

      {/* Other Income */}
      <div className="pt-6 border-t border-white/10">
        <FormField label="Other Income (Annual)">
          <input
            type="number"
            value={data?.otherIncome || 0}
            onChange={(e) => onChange('otherIncome', parseFloat(e.target.value) || 0)}
            className="form-input"
            min={0}
          />
        </FormField>
      </div>
    </div>
  );
}

// =============================================================================
// COSTS SECTION
// =============================================================================

function CostsSection({
  data,
  onChange,
  errors,
}: {
  data?: Partial<IncomeStatement>;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}) {
  const costItems = data?.costItems || [];

  const addCostItem = (category: CostItem['category']) => {
    const newItem: CostItem = {
      id: `cost-${Date.now()}`,
      name: '',
      category,
      costType: 'variable',
      baseAmount: 0,
      revenuePercent: 0,
    };
    onChange('costItems', [...costItems, newItem]);
  };

  const updateCostItem = (index: number, field: keyof CostItem, value: any) => {
    const updated = [...costItems];
    updated[index] = { ...updated[index], [field]: value };
    onChange('costItems', updated);
  };

  const removeCostItem = (index: number) => {
    onChange('costItems', costItems.filter((_, i) => i !== index));
  };

  const cogsItems = costItems.filter(c => c.category.startsWith('cogs_'));
  const opexItems = costItems.filter(c => c.category.startsWith('opex_'));

  return (
    <div className="space-y-8">
      {/* COGS Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Cost of Goods Sold</h3>
          <div className="flex gap-2">
            <button
              onClick={() => addCostItem('cogs_materials')}
              className="px-3 py-1 text-xs bg-white/5 text-gray-300 rounded-lg hover:bg-white/10"
            >
              + Materials
            </button>
            <button
              onClick={() => addCostItem('cogs_labor')}
              className="px-3 py-1 text-xs bg-white/5 text-gray-300 rounded-lg hover:bg-white/10"
            >
              + Labor
            </button>
            <button
              onClick={() => addCostItem('cogs_other')}
              className="px-3 py-1 text-xs bg-white/5 text-gray-300 rounded-lg hover:bg-white/10"
            >
              + Other
            </button>
          </div>
        </div>

        {cogsItems.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No COGS items added yet</p>
        ) : (
          <div className="space-y-3">
            {cogsItems.map((item, index) => {
              const realIndex = costItems.indexOf(item);
              return (
                <CostItemRow
                  key={item.id}
                  item={item}
                  onUpdate={(field, value) => updateCostItem(realIndex, field, value)}
                  onRemove={() => removeCostItem(realIndex)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Operating Expenses Section */}
      <div className="pt-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Operating Expenses</h3>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => addCostItem('opex_sales_marketing')}
              className="px-3 py-1 text-xs bg-white/5 text-gray-300 rounded-lg hover:bg-white/10"
            >
              + S&M
            </button>
            <button
              onClick={() => addCostItem('opex_research_development')}
              className="px-3 py-1 text-xs bg-white/5 text-gray-300 rounded-lg hover:bg-white/10"
            >
              + R&D
            </button>
            <button
              onClick={() => addCostItem('opex_general_admin')}
              className="px-3 py-1 text-xs bg-white/5 text-gray-300 rounded-lg hover:bg-white/10"
            >
              + G&A
            </button>
            <button
              onClick={() => addCostItem('opex_other')}
              className="px-3 py-1 text-xs bg-white/5 text-gray-300 rounded-lg hover:bg-white/10"
            >
              + Other
            </button>
          </div>
        </div>

        {opexItems.length === 0 ? (
          <p className="text-sm text-gray-500 py-4">No operating expense items added yet</p>
        ) : (
          <div className="space-y-3">
            {opexItems.map((item, index) => {
              const realIndex = costItems.indexOf(item);
              return (
                <CostItemRow
                  key={item.id}
                  item={item}
                  onUpdate={(field, value) => updateCostItem(realIndex, field, value)}
                  onRemove={() => removeCostItem(realIndex)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Tax Settings */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Tax & Interest</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Effective Tax Rate (%)">
            <input
              type="number"
              value={data?.effectiveTaxRate || 25}
              onChange={(e) => onChange('effectiveTaxRate', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
              max={100}
              step={0.1}
            />
          </FormField>

          <FormField label="Interest Expense Rate (%)">
            <input
              type="number"
              value={data?.interestExpenseRate || 5}
              onChange={(e) => onChange('interestExpenseRate', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
              max={30}
              step={0.1}
            />
          </FormField>

          <FormField label="NOL Carryforward">
            <input
              type="number"
              value={data?.nolCarryforward || 0}
              onChange={(e) => onChange('nolCarryforward', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}

function CostItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: CostItem;
  onUpdate: (field: keyof CostItem, value: any) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-lg">
      <input
        type="text"
        value={item.name}
        onChange={(e) => onUpdate('name', e.target.value)}
        placeholder="Cost item name"
        className="form-input flex-1"
      />
      <select
        value={item.costType}
        onChange={(e) => onUpdate('costType', e.target.value)}
        className="form-select w-32"
      >
        <option value="fixed">Fixed</option>
        <option value="variable">Variable</option>
        <option value="semi_variable">Semi-Variable</option>
      </select>
      {item.costType === 'variable' ? (
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={item.revenuePercent || 0}
            onChange={(e) => onUpdate('revenuePercent', parseFloat(e.target.value) || 0)}
            className="form-input w-20 text-center"
            step={0.1}
          />
          <span className="text-gray-500 text-sm">% rev</span>
        </div>
      ) : (
        <input
          type="number"
          value={item.baseAmount}
          onChange={(e) => onUpdate('baseAmount', parseFloat(e.target.value) || 0)}
          placeholder="Amount"
          className="form-input w-32"
        />
      )}
      <button
        onClick={onRemove}
        className="p-2 text-red-400 hover:text-red-300"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// =============================================================================
// BALANCE SHEET SECTION
// =============================================================================

function BalanceSheetSection({
  data,
  currency,
  onChange,
  errors,
}: {
  data?: Partial<BalanceSheet>;
  currency: string;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}) {
  const symbol = getCurrencySymbol(currency as any);

  return (
    <div className="space-y-8">
      {/* Current Assets */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-green-400">↑</span> Current Assets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label={`Cash & Equivalents (${symbol})`}>
            <input
              type="number"
              value={data?.cashAndEquivalents || 0}
              onChange={(e) => onChange('cashAndEquivalents', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Short-term Investments (${symbol})`}>
            <input
              type="number"
              value={data?.shortTermInvestments || 0}
              onChange={(e) => onChange('shortTermInvestments', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Accounts Receivable (${symbol})`}>
            <input
              type="number"
              value={data?.accountsReceivable || 0}
              onChange={(e) => onChange('accountsReceivable', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Inventory (${symbol})`}>
            <input
              type="number"
              value={data?.inventory || 0}
              onChange={(e) => onChange('inventory', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Prepaid Expenses (${symbol})`}>
            <input
              type="number"
              value={data?.prepaidExpenses || 0}
              onChange={(e) => onChange('prepaidExpenses', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Other Current Assets (${symbol})`}>
            <input
              type="number"
              value={data?.otherCurrentAssets || 0}
              onChange={(e) => onChange('otherCurrentAssets', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
        </div>
      </div>

      {/* Non-Current Assets */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-green-400">↑</span> Non-Current Assets
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label={`PP&E (Gross) (${symbol})`}>
            <input
              type="number"
              value={data?.propertyPlantEquipment || 0}
              onChange={(e) => onChange('propertyPlantEquipment', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Accumulated Depreciation (${symbol})`}>
            <input
              type="number"
              value={data?.accumulatedDepreciation || 0}
              onChange={(e) => onChange('accumulatedDepreciation', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Intangible Assets (${symbol})`}>
            <input
              type="number"
              value={data?.intangibleAssets || 0}
              onChange={(e) => onChange('intangibleAssets', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Goodwill (${symbol})`}>
            <input
              type="number"
              value={data?.goodwill || 0}
              onChange={(e) => onChange('goodwill', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Long-term Investments (${symbol})`}>
            <input
              type="number"
              value={data?.longTermInvestments || 0}
              onChange={(e) => onChange('longTermInvestments', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Other Non-Current Assets (${symbol})`}>
            <input
              type="number"
              value={data?.otherNonCurrentAssets || 0}
              onChange={(e) => onChange('otherNonCurrentAssets', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
        </div>
      </div>

      {/* Current Liabilities */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-red-400">↓</span> Current Liabilities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label={`Accounts Payable (${symbol})`}>
            <input
              type="number"
              value={data?.accountsPayable || 0}
              onChange={(e) => onChange('accountsPayable', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Short-term Debt (${symbol})`}>
            <input
              type="number"
              value={data?.shortTermDebt || 0}
              onChange={(e) => onChange('shortTermDebt', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Current Portion LTD (${symbol})`}>
            <input
              type="number"
              value={data?.currentPortionLongTermDebt || 0}
              onChange={(e) => onChange('currentPortionLongTermDebt', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Accrued Expenses (${symbol})`}>
            <input
              type="number"
              value={data?.accruedExpenses || 0}
              onChange={(e) => onChange('accruedExpenses', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Deferred Revenue (${symbol})`}>
            <input
              type="number"
              value={data?.deferredRevenue || 0}
              onChange={(e) => onChange('deferredRevenue', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Other Current Liabilities (${symbol})`}>
            <input
              type="number"
              value={data?.otherCurrentLiabilities || 0}
              onChange={(e) => onChange('otherCurrentLiabilities', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
        </div>
      </div>

      {/* Non-Current Liabilities */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-red-400">↓</span> Non-Current Liabilities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label={`Long-term Debt (${symbol})`}>
            <input
              type="number"
              value={data?.longTermDebt || 0}
              onChange={(e) => onChange('longTermDebt', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Deferred Tax Liabilities (${symbol})`}>
            <input
              type="number"
              value={data?.deferredTaxLiabilities || 0}
              onChange={(e) => onChange('deferredTaxLiabilities', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label={`Pension Obligations (${symbol})`}>
            <input
              type="number"
              value={data?.pensionObligations || 0}
              onChange={(e) => onChange('pensionObligations', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
        </div>
      </div>

      {/* Equity */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-blue-400">=</span> Shareholders' Equity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label={`Common Stock (${symbol})`}>
            <input
              type="number"
              value={data?.commonStock || 0}
              onChange={(e) => onChange('commonStock', parseFloat(e.target.value) || 0)}
              className="form-input"
            />
          </FormField>
          <FormField label={`Additional Paid-in Capital (${symbol})`}>
            <input
              type="number"
              value={data?.additionalPaidInCapital || 0}
              onChange={(e) => onChange('additionalPaidInCapital', parseFloat(e.target.value) || 0)}
              className="form-input"
            />
          </FormField>
          <FormField label={`Retained Earnings (${symbol})`}>
            <input
              type="number"
              value={data?.retainedEarnings || 0}
              onChange={(e) => onChange('retainedEarnings', parseFloat(e.target.value) || 0)}
              className="form-input"
            />
          </FormField>
          <FormField label={`Treasury Stock (${symbol})`}>
            <input
              type="number"
              value={data?.treasuryStock || 0}
              onChange={(e) => onChange('treasuryStock', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
          <FormField label="Shares Outstanding">
            <input
              type="number"
              value={data?.sharesOutstanding || 1000000}
              onChange={(e) => onChange('sharesOutstanding', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CASH FLOW SECTION
// =============================================================================

function CashFlowSection({
  data,
  onChange,
  errors,
}: {
  data?: Partial<CashFlowAssumptions>;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}) {
  return (
    <div className="space-y-8">
      {/* Working Capital */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Working Capital Days</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FormField label="Days Receivable (DSO)">
            <input
              type="number"
              value={data?.daysReceivable || 45}
              onChange={(e) => onChange('daysReceivable', parseInt(e.target.value) || 0)}
              className="form-input"
              min={0}
              max={365}
            />
          </FormField>
          <FormField label="Days Inventory (DIO)">
            <input
              type="number"
              value={data?.daysInventory || 60}
              onChange={(e) => onChange('daysInventory', parseInt(e.target.value) || 0)}
              className="form-input"
              min={0}
              max={365}
            />
          </FormField>
          <FormField label="Days Payable (DPO)">
            <input
              type="number"
              value={data?.daysPayable || 30}
              onChange={(e) => onChange('daysPayable', parseInt(e.target.value) || 0)}
              className="form-input"
              min={0}
              max={365}
            />
          </FormField>
          <FormField label="Days Deferred Revenue">
            <input
              type="number"
              value={data?.daysDeferred || 0}
              onChange={(e) => onChange('daysDeferred', parseInt(e.target.value) || 0)}
              className="form-input"
              min={0}
              max={365}
            />
          </FormField>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Cash Conversion Cycle: {(data?.daysReceivable || 45) + (data?.daysInventory || 60) - (data?.daysPayable || 30)} days
        </p>
      </div>

      {/* Capital Expenditures */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Capital Expenditures</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="CapEx Method">
            <select
              value={data?.capexMethod || 'revenue_percent'}
              onChange={(e) => onChange('capexMethod', e.target.value)}
              className="form-select"
            >
              <option value="fixed">Fixed Amount</option>
              <option value="revenue_percent">% of Revenue</option>
              <option value="growth_linked">Growth Linked</option>
            </select>
          </FormField>

          {data?.capexMethod === 'fixed' ? (
            <FormField label="Fixed CapEx Amount">
              <input
                type="number"
                value={data?.capexFixed || 0}
                onChange={(e) => onChange('capexFixed', parseFloat(e.target.value) || 0)}
                className="form-input"
                min={0}
              />
            </FormField>
          ) : (
            <FormField label="CapEx as % of Revenue">
              <input
                type="number"
                value={data?.capexRevenuePercent || 5}
                onChange={(e) => onChange('capexRevenuePercent', parseFloat(e.target.value) || 0)}
                className="form-input"
                min={0}
                max={50}
                step={0.1}
              />
            </FormField>
          )}

          <FormField label="Maintenance CapEx (% of total)">
            <input
              type="number"
              value={data?.maintenanceCapexPercent || 40}
              onChange={(e) => onChange('maintenanceCapexPercent', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
              max={100}
            />
          </FormField>
        </div>
      </div>

      {/* Depreciation */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Depreciation & Amortization</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Depreciation Method">
            <select
              value={data?.depreciationMethod || 'straight_line'}
              onChange={(e) => onChange('depreciationMethod', e.target.value)}
              className="form-select"
            >
              <option value="straight_line">Straight Line</option>
              <option value="declining_balance">Declining Balance</option>
              <option value="units_of_production">Units of Production</option>
            </select>
          </FormField>
          <FormField label="Depreciation Period (Years)">
            <input
              type="number"
              value={data?.depreciationYears || 10}
              onChange={(e) => onChange('depreciationYears', parseInt(e.target.value) || 1)}
              className="form-input"
              min={1}
              max={40}
            />
          </FormField>
          <FormField label="Amortization Period (Years)">
            <input
              type="number"
              value={data?.amortizationYears || 15}
              onChange={(e) => onChange('amortizationYears', parseInt(e.target.value) || 1)}
              className="form-input"
              min={1}
              max={40}
            />
          </FormField>
        </div>
      </div>

      {/* Dividends */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Dividend Policy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Dividend Policy">
            <select
              value={data?.dividendPolicy || 'none'}
              onChange={(e) => onChange('dividendPolicy', e.target.value)}
              className="form-select"
            >
              <option value="none">No Dividends</option>
              <option value="fixed">Fixed Amount</option>
              <option value="payout_ratio">Payout Ratio</option>
              <option value="residual">Residual</option>
            </select>
          </FormField>

          {data?.dividendPolicy === 'fixed' && (
            <FormField label="Fixed Dividend Amount">
              <input
                type="number"
                value={data?.dividendAmount || 0}
                onChange={(e) => onChange('dividendAmount', parseFloat(e.target.value) || 0)}
                className="form-input"
                min={0}
              />
            </FormField>
          )}

          {data?.dividendPolicy === 'payout_ratio' && (
            <FormField label="Payout Ratio (%)">
              <input
                type="number"
                value={data?.dividendPayoutRatio || 30}
                onChange={(e) => onChange('dividendPayoutRatio', parseFloat(e.target.value) || 0)}
                className="form-input"
                min={0}
                max={100}
              />
            </FormField>
          )}

          <FormField label="Minimum Cash Balance">
            <input
              type="number"
              value={data?.minimumCashBalance || 0}
              onChange={(e) => onChange('minimumCashBalance', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// VALUATION SECTION
// =============================================================================

function ValuationSection({
  data,
  onChange,
  errors,
}: {
  data?: Partial<ValuationAssumptions>;
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}) {
  const wacc = calculateWACC(data);

  return (
    <div className="space-y-8">
      {/* Cost of Equity */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Cost of Equity (CAPM)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <FormField label="Risk-Free Rate (%)">
            <input
              type="number"
              value={data?.riskFreeRate || 4}
              onChange={(e) => onChange('riskFreeRate', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
              max={20}
              step={0.1}
            />
          </FormField>
          <FormField label="Equity Risk Premium (%)">
            <input
              type="number"
              value={data?.equityRiskPremium || 5.5}
              onChange={(e) => onChange('equityRiskPremium', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
              max={15}
              step={0.1}
            />
          </FormField>
          <FormField label="Beta">
            <input
              type="number"
              value={data?.beta || 1}
              onChange={(e) => onChange('beta', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
              max={3}
              step={0.01}
            />
          </FormField>
          <FormField label="Company-Specific Risk (%)">
            <input
              type="number"
              value={data?.companySpecificRisk || 0}
              onChange={(e) => onChange('companySpecificRisk', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
              max={10}
              step={0.1}
            />
          </FormField>
        </div>
        <p className="mt-2 text-sm text-amber-400">
          Cost of Equity: {((data?.riskFreeRate || 4) + (data?.beta || 1) * (data?.equityRiskPremium || 5.5) + (data?.companySpecificRisk || 0)).toFixed(2)}%
        </p>
      </div>

      {/* Cost of Debt */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Cost of Debt</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Pre-Tax Cost of Debt (%)">
            <input
              type="number"
              value={data?.costOfDebt || 6}
              onChange={(e) => onChange('costOfDebt', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
              max={30}
              step={0.1}
            />
          </FormField>
          <FormField label="Tax Shield Enabled">
            <select
              value={data?.taxShieldEnabled ? 'yes' : 'no'}
              onChange={(e) => onChange('taxShieldEnabled', e.target.value === 'yes')}
              className="form-select"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </FormField>
          <FormField label="Target Debt Weight (%)">
            <input
              type="number"
              value={data?.targetDebtWeight || 30}
              onChange={(e) => onChange('targetDebtWeight', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
              max={100}
            />
          </FormField>
        </div>
      </div>

      {/* WACC Summary */}
      <div className="p-4 bg-amber-400/10 border border-amber-400/20 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">Weighted Average Cost of Capital (WACC)</span>
          <span className="text-2xl font-bold text-amber-400">{wacc.toFixed(2)}%</span>
        </div>
      </div>

      {/* Terminal Value */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Terminal Value</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField label="Terminal Value Method">
            <select
              value={data?.terminalMethod || 'gordon_growth'}
              onChange={(e) => onChange('terminalMethod', e.target.value)}
              className="form-select"
            >
              <option value="gordon_growth">Gordon Growth (Perpetuity)</option>
              <option value="exit_multiple">Exit Multiple</option>
              <option value="both">Both Methods</option>
            </select>
          </FormField>
          <FormField label="Terminal Growth Rate (%)">
            <input
              type="number"
              value={data?.terminalGrowthRate || 2.5}
              onChange={(e) => onChange('terminalGrowthRate', parseFloat(e.target.value) || 0)}
              className="form-input"
              min={0}
              max={10}
              step={0.1}
            />
          </FormField>
          {(data?.terminalMethod === 'exit_multiple' || data?.terminalMethod === 'both') && (
            <FormField label="Exit EV/EBITDA Multiple">
              <input
                type="number"
                value={data?.exitMultiple || 10}
                onChange={(e) => onChange('exitMultiple', parseFloat(e.target.value) || 0)}
                className="form-input"
                min={0}
                max={30}
                step={0.1}
              />
            </FormField>
          )}
        </div>
      </div>
    </div>
  );
}

function calculateWACC(data?: Partial<ValuationAssumptions>): number {
  const riskFree = data?.riskFreeRate || 4;
  const erp = data?.equityRiskPremium || 5.5;
  const beta = data?.beta || 1;
  const csr = data?.companySpecificRisk || 0;
  const costOfEquity = riskFree + beta * erp + csr;

  const costOfDebt = data?.costOfDebt || 6;
  const taxRate = 25; // Would come from income statement
  const afterTaxDebt = data?.taxShieldEnabled !== false ? costOfDebt * (1 - taxRate / 100) : costOfDebt;

  const debtWeight = (data?.targetDebtWeight || 30) / 100;
  const equityWeight = 1 - debtWeight;

  return equityWeight * costOfEquity + debtWeight * afterTaxDebt;
}

// =============================================================================
// SCENARIOS SECTION
// =============================================================================

function ScenariosSection({
  data,
  activeScenarioId,
  onChange,
  onSetActive,
  errors,
}: {
  data: Scenario[];
  activeScenarioId?: string;
  onChange: (scenarios: Scenario[]) => void;
  onSetActive: (id: string) => void;
  errors: Record<string, string>;
}) {
  const addScenario = () => {
    const newScenario: Scenario = {
      id: `scenario-${Date.now()}`,
      name: `Custom Scenario ${data.length + 1}`,
      type: 'custom',
      probability: 20,
      revenueMultiplier: 1,
      cogsMultiplier: 1,
      opexMultiplier: 1,
      growthRateAdjustment: 0,
      marginAdjustment: 0,
    };
    onChange([...data, newScenario]);
  };

  const updateScenario = (index: number, field: keyof Scenario, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const removeScenario = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {data.map((scenario, index) => (
        <div
          key={scenario.id}
          className={`p-5 border rounded-xl transition-all ${
            activeScenarioId === scenario.id
              ? 'bg-amber-400/10 border-amber-400/30'
              : 'bg-white/[0.02] border-white/10'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="activeScenario"
                checked={activeScenarioId === scenario.id}
                onChange={() => onSetActive(scenario.id)}
                className="w-4 h-4 text-amber-400"
              />
              <div>
                <input
                  type="text"
                  value={scenario.name}
                  onChange={(e) => updateScenario(index, 'name', e.target.value)}
                  className="text-lg font-semibold text-white bg-transparent border-none p-0 focus:ring-0"
                />
                <select
                  value={scenario.type}
                  onChange={(e) => updateScenario(index, 'type', e.target.value)}
                  className="text-xs text-gray-400 bg-transparent border-none p-0 ml-2"
                >
                  <option value="base">Base Case</option>
                  <option value="upside">Upside</option>
                  <option value="downside">Downside</option>
                  <option value="stress">Stress Test</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
            {data.length > 1 && (
              <button
                onClick={() => removeScenario(index)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <FormField label="Probability (%)">
              <input
                type="number"
                value={scenario.probability}
                onChange={(e) => updateScenario(index, 'probability', parseFloat(e.target.value) || 0)}
                className="form-input text-center"
                min={0}
                max={100}
              />
            </FormField>
            <FormField label="Revenue Mult.">
              <input
                type="number"
                value={scenario.revenueMultiplier}
                onChange={(e) => updateScenario(index, 'revenueMultiplier', parseFloat(e.target.value) || 1)}
                className="form-input text-center"
                min={0}
                max={3}
                step={0.01}
              />
            </FormField>
            <FormField label="COGS Mult.">
              <input
                type="number"
                value={scenario.cogsMultiplier}
                onChange={(e) => updateScenario(index, 'cogsMultiplier', parseFloat(e.target.value) || 1)}
                className="form-input text-center"
                min={0}
                max={3}
                step={0.01}
              />
            </FormField>
            <FormField label="OpEx Mult.">
              <input
                type="number"
                value={scenario.opexMultiplier}
                onChange={(e) => updateScenario(index, 'opexMultiplier', parseFloat(e.target.value) || 1)}
                className="form-input text-center"
                min={0}
                max={3}
                step={0.01}
              />
            </FormField>
            <FormField label="Growth Adj. (pp)">
              <input
                type="number"
                value={scenario.growthRateAdjustment}
                onChange={(e) => updateScenario(index, 'growthRateAdjustment', parseFloat(e.target.value) || 0)}
                className="form-input text-center"
                min={-50}
                max={50}
              />
            </FormField>
            <FormField label="Margin Adj. (pp)">
              <input
                type="number"
                value={scenario.marginAdjustment}
                onChange={(e) => updateScenario(index, 'marginAdjustment', parseFloat(e.target.value) || 0)}
                className="form-input text-center"
                min={-50}
                max={50}
              />
            </FormField>
          </div>
        </div>
      ))}

      <button
        onClick={addScenario}
        className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-gray-400 hover:text-white hover:border-amber-400/30 transition-all"
      >
        + Add Scenario
      </button>

      {/* Probability Check */}
      {data.length > 0 && (
        <div className={`p-3 rounded-lg text-sm ${
          Math.abs(data.reduce((s, sc) => s + sc.probability, 0) - 100) < 0.1
            ? 'bg-green-400/10 text-green-400'
            : 'bg-amber-400/10 text-amber-400'
        }`}>
          Total Probability: {data.reduce((s, sc) => s + sc.probability, 0).toFixed(0)}%
          {Math.abs(data.reduce((s, sc) => s + sc.probability, 0) - 100) >= 0.1 && ' (should equal 100%)'}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// FORM FIELD COMPONENT
// =============================================================================

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-amber-400 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

// =============================================================================
// EXPORT
// =============================================================================

export default FinancialInputForm;
