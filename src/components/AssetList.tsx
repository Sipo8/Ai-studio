import React, { useState } from 'react';
import { Search, ArrowUpRight, ArrowLeftRight, TrendingUp, TrendingDown, Percent, Zap } from 'lucide-react';
import { CryptoAsset, ChainId, FiatCurrency, LanguageCode, FiatRateMap } from '../types';
import { formatCrypto, formatFiat, formatPercent } from '../utils/currency';
import { TRANSLATIONS } from '../i18n/translations';
import { CHAINS_CONFIG } from '../data/mockData';

interface AssetListProps {
  assets: CryptoAsset[];
  selectedChain: ChainId | 'all';
  currentFiat: FiatCurrency;
  fiatRates?: FiatRateMap;
  currentLang: LanguageCode;
  onSendAsset: (asset: CryptoAsset) => void;
  onReceiveAsset: (asset: CryptoAsset) => void;
  onSwapAsset: (asset: CryptoAsset) => void;
  onStakeAsset: (asset: CryptoAsset) => void;
}

export const AssetList: React.FC<AssetListProps> = ({
  assets,
  selectedChain,
  currentFiat,
  fiatRates,
  currentLang,
  onSendAsset,
  onReceiveAsset,
  onSwapAsset,
  onStakeAsset,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = assets.filter((asset) => {
    const matchesChain = selectedChain === 'all' || asset.chainId === selectedChain;
    const matchesQuery =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.chainId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChain && matchesQuery;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{t.assets}</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            {filteredAssets.length} tokens active on {selectedChain === 'all' ? '16 chains' : CHAINS_CONFIG[selectedChain]?.name}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchAssets}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Asset Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/30">
              <th className="py-3 px-4 sm:px-6">Asset & Chain</th>
              <th className="py-3 px-4">{t.price}</th>
              <th className="py-3 px-4">{t.change24h}</th>
              <th className="py-3 px-4 text-right">{t.holdings}</th>
              <th className="py-3 px-4 sm:px-6 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {filteredAssets.map((asset) => {
              const chain = CHAINS_CONFIG[asset.chainId];
              const totalValUsd = asset.balance * asset.usdPrice;
              const isPositive = asset.change24h >= 0;

              return (
                <tr
                  key={asset.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                >
                  {/* Asset & Chain */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                        style={{ backgroundColor: asset.iconBg }}
                      >
                        {asset.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{asset.name}</span>
                          {asset.isStakable && (
                            <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50">
                              {asset.apy}% APY
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            {asset.symbol}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: chain?.iconBg || '#94A3B8' }}
                            />
                            {chain?.name || asset.chainId}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-mono font-semibold tabular-nums px-1.5 py-0.5 rounded transition-all duration-300 ${
                          asset.priceFlash === 'up'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold'
                            : asset.priceFlash === 'down'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {formatFiat(asset.usdPrice, currentFiat, 2, fiatRates)}
                      </span>
                      {asset.priceFlash && (
                        <span
                          className={`text-[9px] font-mono font-extrabold ${
                            asset.priceFlash === 'up' ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                        >
                          {asset.priceFlash === 'up' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 24h Change */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-0.5 font-mono font-semibold tabular-nums ${
                        isPositive ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {formatPercent(asset.change24h)}
                    </span>
                  </td>

                  {/* Holdings & Value */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatFiat(totalValUsd, currentFiat, 2, fiatRates)}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                      {formatCrypto(asset.balance, asset.symbol)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onSendAsset(asset)}
                        title={t.send}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-blue-400 transition-colors"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onSwapAsset(asset)}
                        title={t.swap}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                      </button>

                      {asset.isStakable && (
                        <button
                          onClick={() => onStakeAsset(asset)}
                          title={t.stakeNow}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 dark:text-amber-300 transition-colors"
                        >
                          <Percent className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
