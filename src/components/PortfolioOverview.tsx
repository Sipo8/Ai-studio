import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  ArrowLeftRight,
  TrendingUp,
  Percent,
} from 'lucide-react';
import { FiatCurrency, LanguageCode, FiatRateMap } from '../types';
import { formatFiat, formatPercent } from '../utils/currency';
import { TRANSLATIONS } from '../i18n/translations';

interface PortfolioOverviewProps {
  totalUsd: number;
  currentFiat: FiatCurrency;
  fiatRates?: FiatRateMap;
  currentLang: LanguageCode;
  onOpenSend: () => void;
  onOpenReceive: () => void;
  onOpenBuy: () => void;
  onGoToSwap: () => void;
  onGoToStaking: () => void;
}

type Timeframe = '1H' | '24H' | '7D' | '1M' | '1Y' | 'ALL';

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  totalUsd,
  currentFiat,
  fiatRates,
  currentLang,
  onOpenSend,
  onOpenReceive,
  onOpenBuy,
  onGoToSwap,
  onGoToStaking,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [timeframe, setTimeframe] = useState<Timeframe>('24H');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Timeframe price multipliers & historical curve points
  const pointsData: Record<Timeframe, { points: number[]; change: number }> = {
    '1H': { points: [0.995, 0.997, 0.996, 0.999, 1.002, 1.001, 1.0], change: 0.5 },
    '24H': { points: [0.962, 0.968, 0.955, 0.978, 0.985, 0.992, 1.0], change: 3.95 },
    '7D': { points: [0.91, 0.93, 0.92, 0.95, 0.94, 0.98, 1.0], change: 9.89 },
    '1M': { points: [0.84, 0.86, 0.89, 0.91, 0.95, 0.97, 1.0], change: 19.05 },
    '1Y': { points: [0.45, 0.52, 0.61, 0.72, 0.81, 0.92, 1.0], change: 122.2 },
    ALL: { points: [0.22, 0.38, 0.51, 0.69, 0.82, 0.94, 1.0], change: 354.5 },
  };

  const currentCurve = pointsData[timeframe];
  const activeChange = currentCurve.change;
  const changeUsd = totalUsd * (activeChange / 100);

  // Chart coordinates
  const width = 680;
  const height = 140;
  const points = currentCurve.points;
  const minVal = Math.min(...points) * 0.99;
  const maxVal = Math.max(...points) * 1.01;

  const svgPoints = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((val - minVal) / (maxVal - minVal)) * (height - 20) - 10;
    return { x, y, val };
  });

  const pathD = svgPoints.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  const hoveredPoint = hoverIndex !== null ? svgPoints[hoverIndex] : null;
  const displayValUsd = hoveredPoint ? totalUsd * hoveredPoint.val : totalUsd;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {t.totalBalance}
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatFiat(displayValUsd, currentFiat, 2, fiatRates)}
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs font-medium">
            <span
              className={`inline-flex items-center gap-0.5 tabular-nums font-semibold ${
                activeChange >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              {formatPercent(activeChange)} ({formatFiat(changeUsd, currentFiat, 2, fiatRates)})
            </span>
            <span className="text-slate-400">· {timeframe} overview</span>
          </div>
        </div>

        {/* Action Quick Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenSend}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all whitespace-nowrap"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{t.send}</span>
          </button>

          <button
            onClick={onOpenReceive}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 active:scale-95 transition-all whitespace-nowrap"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{t.receive}</span>
          </button>

          <button
            onClick={onOpenBuy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-95 transition-all whitespace-nowrap"
          >
            <CreditCard className="w-4 h-4" />
            <span>{t.buy}</span>
          </button>

          <button
            onClick={onGoToSwap}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-all whitespace-nowrap"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t.swap}</span>
          </button>

          <button
            onClick={onGoToStaking}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-all whitespace-nowrap"
          >
            <Percent className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.staking}</span>
          </button>
        </div>
      </div>

      {/* Chart Section */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-400 font-medium">Real-Time Valuation Curve</span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {(['1H', '24H', '7D', '1M', '1Y', 'ALL'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setTimeframe(tf);
                  setHoverIndex(null);
                }}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  timeframe === tf
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full h-[140px] overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#chartGradient)" />
            <path
              d={pathD}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {svgPoints.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r={hoverIndex === idx ? 5 : 3}
                className="cursor-pointer transition-all"
                fill={hoverIndex === idx ? '#2563EB' : '#3B82F6'}
                stroke="#FFFFFF"
                strokeWidth={hoverIndex === idx ? 2 : 1}
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
};
