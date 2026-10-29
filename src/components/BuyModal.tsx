import React, { useState } from 'react';
import {
  X,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CryptoAsset, FiatCurrency, LanguageCode, Transaction, WalletAccount } from '../types';
import { convertFiatToUsd, convertUsdToFiat, formatFiat } from '../utils/currency';
import { TRANSLATIONS } from '../i18n/translations';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: CryptoAsset[];
  currentFiat: FiatCurrency;
  currentLang: LanguageCode;
  activeAccount: WalletAccount;
  onConfirmBuy: (tx: Transaction, updatedAsset: CryptoAsset) => void;
}

type PaymentMethod = 'apple_pay' | 'google_pay' | 'card' | 'kaspi';

export const BuyModal: React.FC<BuyModalProps> = ({
  isOpen,
  onClose,
  assets,
  currentFiat,
  currentLang,
  activeAccount,
  onConfirmBuy,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('apple_pay');
  const [fiatAmount, setFiatAmount] = useState<number>(
    currentFiat === 'KZT' ? 100000 : currentFiat === 'UZS' ? 2500000 : 200
  );
  const [targetAssetId, setTargetAssetId] = useState<string>('usdc-circle');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const targetAsset = assets.find((a) => a.id === targetAssetId) || assets[0];
  const usdAmount = convertFiatToUsd(fiatAmount, currentFiat);
  const cryptoReceived = usdAmount / targetAsset.usdPrice;
  const processingFee = fiatAmount * 0.015; // 1.5% fiat processor fee

  const handleExecutePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      const newTx: Transaction = {
        id: `tx-buy-${Date.now()}`,
        hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        type: 'buy',
        chainId: targetAsset.chainId,
        assetSymbol: targetAsset.symbol,
        amount: cryptoReceived,
        usdValue: usdAmount,
        timestamp: Date.now(),
        status: 'completed',
        from:
          paymentMethod === 'apple_pay'
            ? 'Apple Pay (Biometric Auth)'
            : paymentMethod === 'google_pay'
            ? 'Google Pay (1-Tap Checkout)'
            : paymentMethod === 'kaspi'
            ? 'Kaspi Gold (KZT Direct Onramp)'
            : 'Visa / Mastercard Secure',
        to: activeAccount.address,
        feeUsd: convertFiatToUsd(processingFee, currentFiat),
        category: 'Transfers',
        note: `Instant onramp via ${paymentMethod.replace('_', ' ').toUpperCase()}`,
      };

      const updatedAsset: CryptoAsset = {
        ...targetAsset,
        balance: targetAsset.balance + cryptoReceived,
      };

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore
      }

      onConfirmBuy(newTx, updatedAsset);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.appleGooglePay}
              </h3>
              <p className="text-[11px] text-slate-400">
                Instant fiat to crypto checkout with zero gas slippage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Payment Method Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Select Payment Gateway
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'apple_pay', label: ' Apple Pay', desc: 'Face ID' },
                { id: 'google_pay', label: 'G Pay', desc: 'Google Pay' },
                { id: 'kaspi', label: 'Kaspi Gold', desc: '0% KZT Fee' },
                { id: 'card', label: 'Bank Card', desc: 'Visa / MC' },
              ].map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setPaymentMethod(pm.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    paymentMethod === pm.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs truncate">{pm.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{pm.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Spend Fiat Amount */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              <span>Spend ({currentFiat})</span>
              <span className="font-mono text-slate-500 dark:text-slate-400">
                Fee: {formatFiat(convertFiatToUsd(processingFee, currentFiat), currentFiat)}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="10"
                value={fiatAmount}
                onChange={(e) => setFiatAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                {currentFiat}
              </span>
            </div>

            {/* Quick amount pills */}
            <div className="flex items-center gap-1.5 mt-2">
              {[
                currentFiat === 'KZT' ? [50000, 100000, 250000, 500000] : [50, 100, 250, 500],
              ][0].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setFiatAmount(amt)}
                  className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Receive Crypto Asset */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Receive Asset in {activeAccount.name}
            </label>
            <select
              value={targetAssetId}
              onChange={(e) => setTargetAssetId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.symbol}) · 1 {asset.symbol} = {formatFiat(asset.usdPrice, currentFiat)}
                </option>
              ))}
            </select>
          </div>

          {/* Summary Box */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Estimated Output:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                ≈ {cryptoReceived.toFixed(4)} {targetAsset.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Delivery Network:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {targetAsset.chainId.toUpperCase()} (Direct L1/L2)
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>Settlement Speed:</span>
              <span className="text-emerald-500 font-medium">Instant (&lt; 3 seconds)</span>
            </div>
          </div>

          {/* Submit Checkout Button */}
          <button
            onClick={handleExecutePayment}
            disabled={isProcessing || fiatAmount <= 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-lg active:scale-98 transition-all disabled:opacity-50"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-slate-400 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <span>
              {isProcessing
                ? 'Processing Biometric Payment...'
                : paymentMethod === 'apple_pay'
                ? `Pay with  Apple Pay (${fiatAmount.toLocaleString()} ${currentFiat})`
                : paymentMethod === 'google_pay'
                ? `Pay with G Pay (${fiatAmount.toLocaleString()} ${currentFiat})`
                : `Confirm Onramp (${fiatAmount.toLocaleString()} ${currentFiat})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
