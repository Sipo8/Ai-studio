import React, { useState } from 'react';
import {
  PieChart,
  AlertTriangle,
  Sliders,
  Plus,
  TrendingDown,
  Check,
  ShieldAlert,
  Users,
} from 'lucide-react';
import {
  BudgetCategory,
  CryptoAsset,
  FiatCurrency,
  LanguageCode,
  WalletAccount,
} from '../types';
import { formatFiat } from '../utils/currency';
import { TRANSLATIONS } from '../i18n/translations';

interface AnalyticsTabProps {
  assets: CryptoAsset[];
  categories: BudgetCategory[];
  currentFiat: FiatCurrency;
  currentLang: LanguageCode;
  activeAccount: WalletAccount;
  onUpdateCategories: (categories: BudgetCategory[]) => void;
  onUpdateAccountLimits: (dailyLimit: number, monthlyLimit: number) => void;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  assets,
  categories,
  currentFiat,
  currentLang,
  activeAccount,
  onUpdateCategories,
  onUpdateAccountLimits,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [dailyLimitInput, setDailyLimitInput] = useState<number>(activeAccount.dailySpendingLimit || 5000);
  const [monthlyLimitInput, setMonthlyLimitInput] = useState<number>(activeAccount.monthlySpendingLimit || 30000);
  const [isSavedLimits, setIsSavedLimits] = useState(false);

  const [newCatName, setNewCatName] = useState('');
  const [newCatLimit, setNewCatLimit] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  // Total net worth
  const totalPortfolioUsd = assets.reduce((sum, a) => sum + a.balance * a.usdPrice, 0);

  // Asset distribution for donut
  const assetSlices = assets
    .map((a) => ({
      name: a.symbol,
      usd: a.balance * a.usdPrice,
      color: a.iconBg,
      percent: totalPortfolioUsd > 0 ? ((a.balance * a.usdPrice) / totalPortfolioUsd) * 100 : 0,
    }))
    .filter((s) => s.usd > 10)
    .sort((a, b) => b.usd - a.usd);

  // Family budget spending percentages
  const dailySpent = activeAccount.currentDailySpent;
  const monthlySpent = activeAccount.currentMonthlySpent;
  const dailyPercent = Math.min(100, (dailySpent / dailyLimitInput) * 100);
  const monthlyPercent = Math.min(100, (monthlySpent / monthlyLimitInput) * 100);

  const isDailyWarning = dailyPercent >= 80;
  const isMonthlyWarning = monthlyPercent >= 80;

  const handleSaveLimits = () => {
    onUpdateAccountLimits(dailyLimitInput, monthlyLimitInput);
    setIsSavedLimits(true);
    setTimeout(() => setIsSavedLimits(false), 2000);
  };

  const handleAddCategory = () => {
    if (!newCatName.trim() || !newCatLimit) return;
    const newCat: BudgetCategory = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      limitUsd: parseFloat(newCatLimit) || 1000,
      spentUsd: 0,
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };
    onUpdateCategories([...categories, newCat]);
    setNewCatName('');
    setNewCatLimit('');
    setShowAddCat(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.analytics}</span>
            {activeAccount.type === 'family' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Family Shared Controls
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time capital distribution, cashflow velocity, and spending limit enforcement
          </p>
        </div>

        {(isDailyWarning || isMonthlyWarning) && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <span>{t.limitWarning}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Asset Allocation Donut Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Portfolio Asset Allocation
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Total {formatFiat(totalPortfolioUsd, currentFiat)}
            </span>
          </div>

          {/* SVG Donut Visualizer */}
          <div className="flex flex-col sm:flex-row items-center gap-6 justify-center py-4">
            <div className="relative w-44 h-44 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {(() => {
                  let accumulatedPercent = 0;
                  return assetSlices.slice(0, 6).map((slice, idx) => {
                    const strokeDasharray = `${slice.percent} ${100 - slice.percent}`;
                    const strokeDashoffset = -accumulatedPercent;
                    accumulatedPercent += slice.percent;
                    return (
                      <circle
                        key={idx}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="transparent"
                        stroke={slice.color}
                        strokeWidth="16"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all hover:opacity-80"
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-semibold text-slate-400">Largest</span>
                <span className="text-base font-bold font-mono text-slate-900 dark:text-white">
                  {assetSlices[0]?.name || 'BTC'}
                </span>
                <span className="text-xs text-emerald-500 font-mono font-semibold">
                  {assetSlices[0]?.percent.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2 w-full max-w-xs text-xs">
              {assetSlices.slice(0, 5).map((slice, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {slice.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-400">{slice.percent.toFixed(1)}%</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatFiat(slice.usd, currentFiat)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Spending Limits & Guardrails */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.familyBudget}
              </h3>
              <p className="text-[11px] text-slate-400">
                Guardrails for {activeAccount.name}
              </p>
            </div>
            <button
              onClick={handleSaveLimits}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              {isSavedLimits ? <Check className="w-3.5 h-3.5" /> : <Sliders className="w-3.5 h-3.5" />}
              <span>{isSavedLimits ? 'Saved!' : 'Save Limits'}</span>
            </button>
          </div>

          {/* Daily Limit Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {t.dailyLimit}
              </span>
              <span className="font-mono text-slate-500">
                {formatFiat(dailySpent, currentFiat)} / {formatFiat(dailyLimitInput, currentFiat)} (
                {dailyPercent.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isDailyWarning ? 'bg-amber-500' : 'bg-blue-600'
                }`}
                style={{ width: `${dailyPercent}%` }}
              />
            </div>
            <div className="pt-1">
              <input
                type="range"
                min="500"
                max="25000"
                step="500"
                value={dailyLimitInput}
                onChange={(e) => setDailyLimitInput(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
          </div>

          {/* Monthly Limit Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {t.monthlyLimit}
              </span>
              <span className="font-mono text-slate-500">
                {formatFiat(monthlySpent, currentFiat)} / {formatFiat(monthlyLimitInput, currentFiat)} (
                {monthlyPercent.toFixed(0)}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isMonthlyWarning ? 'bg-rose-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${monthlyPercent}%` }}
              />
            </div>
            <div className="pt-1">
              <input
                type="range"
                min="2000"
                max="100000"
                step="1000"
                value={monthlyLimitInput}
                onChange={(e) => setMonthlyLimitInput(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Spending by Category Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Spending by Category
            </h3>
            <p className="text-xs text-slate-400">
              Granular expense classification and allowance monitoring
            </p>
          </div>
          <button
            onClick={() => setShowAddCat(!showAddCat)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Category</span>
          </button>
        </div>

        {showAddCat && (
          <div className="p-4 mb-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-3 text-xs">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Category Name (e.g. Travel, Investments)"
              className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs flex-1 text-slate-900 dark:text-white"
            />
            <input
              type="number"
              value={newCatLimit}
              onChange={(e) => setNewCatLimit(e.target.value)}
              placeholder="Budget Limit ($)"
              className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs w-36 text-slate-900 dark:text-white"
            />
            <button
              onClick={handleAddCategory}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
            >
              Create
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => {
            const pct = Math.min(100, (cat.spentUsd / cat.limitUsd) * 100);
            return (
              <div
                key={cat.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {pct.toFixed(0)}% used
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct > 90 ? '#EF4444' : cat.color,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500 dark:text-slate-400">
                    Spent: {formatFiat(cat.spentUsd, currentFiat)}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    Cap: {formatFiat(cat.limitUsd, currentFiat)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
