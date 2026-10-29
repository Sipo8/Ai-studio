import React from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Pause,
  Play,
  Zap,
} from 'lucide-react';
import { CryptoAsset, FiatCurrency, FiatRateMap, LanguageCode } from '../types';
import { formatPercent } from '../utils/currency';

interface LiveTickerBarProps {
  assets: CryptoAsset[];
  fiatRates: FiatRateMap;
  currentFiat: FiatCurrency;
  isLiveUpdating: boolean;
  onToggleLive: () => void;
  onManualRefresh: () => void;
  lastUpdated: Date;
}

export const LiveTickerBar: React.FC<LiveTickerBarProps> = ({
  assets,
  fiatRates,
  currentFiat,
  isLiveUpdating,
  onToggleLive,
  onManualRefresh,
  lastUpdated,
}) => {
  // Key assets to showcase in the top ticker strip
  const topCryptos = assets.filter((a) =>
    ['BTC', 'ETH', 'SOL', 'TON'].includes(a.symbol)
  );

  // Key fiat rates to showcase
  const fiatItems = (['KZT', 'EUR', 'RUB', 'KGS', 'UZS'] as FiatCurrency[]).map((code) => ({
    code,
    ...fiatRates[code],
  }));

  return (
    <div className="bg-slate-900/90 dark:bg-slate-900/95 border-b border-slate-800 text-white px-4 py-2 text-xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Left Side: Live Feed status & controls */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              {isLiveUpdating && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isLiveUpdating ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-300 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              Real-Time Feed
            </span>
          </div>

          <div className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            {lastUpdated.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleLive}
              title={isLiveUpdating ? 'Pause live price feed' : 'Resume live price feed'}
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {isLiveUpdating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button
              onClick={onManualRefresh}
              title="Force instant rate poll"
              className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Center / Right: Scrolling ticker strip */}
        <div className="flex items-center gap-4 overflow-x-auto w-full md:w-auto py-0.5 no-scrollbar">
          {/* Fiat pair tickers */}
          <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
            {fiatItems.map((fiat) => {
              const isUp = (fiat.change24h || 0) >= 0;
              const flashClass =
                fiat.priceFlash === 'up'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : fiat.priceFlash === 'down'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'border-transparent text-slate-300';

              return (
                <div
                  key={fiat.code}
                  className={`px-2 py-0.5 rounded border transition-all duration-300 flex items-center gap-1.5 ${flashClass}`}
                >
                  <span className="font-semibold text-white">USD/{fiat.code}:</span>
                  <span className="font-bold tabular-nums">
                    {fiat.rate >= 1000 ? Math.round(fiat.rate).toLocaleString() : fiat.rate.toFixed(2)}{' '}
                    {fiat.symbol}
                  </span>
                  <span
                    className={`text-[10px] font-semibold tabular-nums flex items-center ${
                      isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {formatPercent(fiat.change24h || 0)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="h-3 w-px bg-slate-800 shrink-0 hidden lg:block" />

          {/* Crypto tokens tickers */}
          <div className="flex items-center gap-3 text-[11px] font-mono shrink-0">
            {topCryptos.map((asset) => {
              const isUp = asset.change24h >= 0;
              const flashClass =
                asset.priceFlash === 'up'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : asset.priceFlash === 'down'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'border-transparent text-slate-300';

              return (
                <div
                  key={asset.id}
                  className={`px-2 py-0.5 rounded border transition-all duration-300 flex items-center gap-1.5 ${flashClass}`}
                >
                  <span className="font-semibold text-white">{asset.symbol}:</span>
                  <span className="font-bold tabular-nums">
                    ${asset.usdPrice >= 100 ? asset.usdPrice.toFixed(1) : asset.usdPrice.toFixed(2)}
                  </span>
                  <span
                    className={`text-[10px] font-semibold tabular-nums flex items-center ${
                      isUp ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {formatPercent(asset.change24h)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
