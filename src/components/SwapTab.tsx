import React, { useState } from 'react';
import {
  ArrowDownUp,
  ArrowRight,
  Settings2,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CryptoAsset, FiatCurrency, LanguageCode, Transaction, WalletAccount } from '../types';
import { formatCrypto, formatFiat } from '../utils/currency';
import { TRANSLATIONS } from '../i18n/translations';
import { CHAINS_CONFIG } from '../data/mockData';

interface SwapTabProps {
  assets: CryptoAsset[];
  currentFiat: FiatCurrency;
  currentLang: LanguageCode;
  activeAccount: WalletAccount;
  onExecuteSwap: (tx: Transaction, updatedFrom: CryptoAsset, updatedTo: CryptoAsset) => void;
}

export const SwapTab: React.FC<SwapTabProps> = ({
  assets,
  currentFiat,
  currentLang,
  activeAccount,
  onExecuteSwap,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [fromAssetId, setFromAssetId] = useState<string>(assets[1]?.id || assets[0]?.id); // ETH
  const [toAssetId, setToAssetId] = useState<string>(assets[2]?.id || assets[1]?.id); // SOL
  const [fromAmount, setFromAmount] = useState<string>('0.5');
  const [slippage, setSlippage] = useState<number>(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<'uniswap' | 'jupiter' | '1inch'>('1inch');

  const fromAsset = assets.find((a) => a.id === fromAssetId) || assets[0];
  const toAsset = assets.find((a) => a.id === toAssetId) || assets[1];

  const numFrom = parseFloat(fromAmount) || 0;
  const fromUsd = numFrom * fromAsset.usdPrice;
  const toCrypto = toAsset.usdPrice > 0 ? fromUsd / toAsset.usdPrice : 0;
  const minReceived = toCrypto * (1 - slippage / 100);

  const isCrossChain = fromAsset.chainId !== toAsset.chainId;

  const handleFlipAssets = () => {
    setFromAssetId(toAssetId);
    setToAssetId(fromAssetId);
  };

  const handleSwap = () => {
    if (numFrom <= 0 || numFrom > fromAsset.balance) return;

    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);

      const newTx: Transaction = {
        id: `tx-swap-${Date.now()}`,
        hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        type: 'swap',
        chainId: fromAsset.chainId,
        assetSymbol: `${fromAsset.symbol} → ${toAsset.symbol}`,
        amount: numFrom,
        usdValue: fromUsd,
        timestamp: Date.now(),
        status: 'completed',
        from: activeAccount.address,
        to: `${selectedRoute.toUpperCase()} ${isCrossChain ? 'Cross-Chain Bridge' : 'DEX Aggregator'}`,
        feeUsd: isCrossChain ? 1.25 : 0.15,
        category: 'Trading',
        note: `Swapped ${numFrom} ${fromAsset.symbol} to ${toCrypto.toFixed(4)} ${toAsset.symbol}`,
      };

      const updatedFrom: CryptoAsset = {
        ...fromAsset,
        balance: Math.max(0, fromAsset.balance - numFrom),
      };

      const updatedTo: CryptoAsset = {
        ...toAsset,
        balance: toAsset.balance + toCrypto,
      };

      try {
        confetti({
          particleCount: 90,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      onExecuteSwap(newTx, updatedFrom, updatedTo);
      setFromAmount('');
    }, 1200);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        {/* Swap Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{t.swapTokens}</span>
              {isCrossChain && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Cross-Chain Bridge
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400">
              Optimal liquidity routing across 16 blockchains
            </p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>

        {/* Slippage Settings Panel */}
        {showSettings && (
          <div className="p-4 my-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="font-semibold text-slate-700 dark:text-slate-300">
              {t.slippage}
            </div>
            <div className="flex items-center gap-2">
              {[0.1, 0.5, 1.0, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSlippage(s)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-colors ${
                    slippage === s
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pay Box */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.payWith}</span>
            <span className="font-mono">
              {t.available}: {formatCrypto(fromAsset.balance, fromAsset.symbol)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="number"
              step="any"
              min="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder="0.0"
              className="w-full bg-transparent text-2xl font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
            />

            <select
              value={fromAssetId}
              onChange={(e) => setFromAssetId(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white shadow-sm shrink-0 focus:outline-none"
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.symbol} ({CHAINS_CONFIG[asset.chainId]?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>≈ {formatFiat(fromUsd, currentFiat)}</span>
            <button
              onClick={() => setFromAmount(fromAsset.balance.toString())}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
            >
              {t.max}
            </button>
          </div>
        </div>

        {/* Flip button */}
        <div className="flex justify-center -my-2.5 relative z-10">
          <button
            onClick={handleFlipAssets}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:scale-105 active:scale-95 transition-all"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        {/* Receive Box */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t.receiveToken}</span>
            <span className="font-mono">
              Balance: {formatCrypto(toAsset.balance, toAsset.symbol)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-full text-2xl font-mono font-bold text-slate-900 dark:text-white truncate">
              {toCrypto.toFixed(6)}
            </div>

            <select
              value={toAssetId}
              onChange={(e) => setToAssetId(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-900 dark:text-white shadow-sm shrink-0 focus:outline-none"
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.symbol} ({CHAINS_CONFIG[asset.chainId]?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            ≈ {formatFiat(toCrypto * toAsset.usdPrice, currentFiat)}
          </div>
        </div>

        {/* DEX Route Comparison Matrix */}
        <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            <span>{t.routingDEX}</span>
            <span className="text-emerald-500 font-mono">Best Rate Guaranteed</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: '1inch', name: '1inch Fusion', out: toCrypto * 1.002, speed: 'Fast' },
              { id: 'jupiter', name: 'Jupiter Agg', out: toCrypto * 0.999, speed: 'Optimal' },
              { id: 'uniswap', name: 'Uniswap v3', out: toCrypto * 0.995, speed: 'Standard' },
            ].map((route) => (
              <button
                key={route.id}
                type="button"
                onClick={() => setSelectedRoute(route.id as any)}
                className={`p-2 rounded-lg text-left border text-xs transition-all ${
                  selectedRoute === route.id
                    ? 'border-blue-500 bg-white dark:bg-slate-700 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="font-bold text-slate-900 dark:text-white truncate">
                  {route.name}
                </div>
                <div className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                  {route.out.toFixed(4)} {toAsset.symbol}
                </div>
              </button>
            ))}
          </div>

          <div className="text-[11px] space-y-1 text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span>Min. Received (after {slippage}% slippage):</span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                {minReceived.toFixed(4)} {toAsset.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Price Impact:</span>
              <span className="text-emerald-500 font-mono font-medium">&lt; 0.05%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Gas Estimate:</span>
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                {isCrossChain ? '$1.25 (Cross-Chain Relayer)' : '$0.15 (Direct L2)'}
              </span>
            </div>
          </div>
        </div>

        {/* Execute Button */}
        <div className="mt-5">
          <button
            onClick={handleSwap}
            disabled={isSwapping || numFrom <= 0 || numFrom > fromAsset.balance}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 active:scale-98 transition-all disabled:opacity-50"
          >
            {isSwapping ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            <span>
              {isSwapping
                ? 'Routing Transaction on DEX...'
                : numFrom > fromAsset.balance
                ? 'Insufficient Balance'
                : numFrom <= 0
                ? 'Enter an Amount to Swap'
                : `${t.executeSwap} (${fromAsset.symbol} → ${toAsset.symbol})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
