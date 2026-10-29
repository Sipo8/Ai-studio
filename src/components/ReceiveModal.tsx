import React, { useState } from 'react';
import { X, Copy, Check, Share2, QrCode, Globe, Shield } from 'lucide-react';
import { ChainId, CryptoAsset, FiatCurrency, LanguageCode, WalletAccount } from '../types';
import { QRCodeSVG } from '../utils/qr';
import { TRANSLATIONS } from '../i18n/translations';
import { CHAINS_CONFIG } from '../data/mockData';
import { formatFiat } from '../utils/currency';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: CryptoAsset[];
  initialChain?: ChainId;
  currentFiat: FiatCurrency;
  currentLang: LanguageCode;
  activeAccount: WalletAccount;
}

export const ReceiveModal: React.FC<ReceiveModalProps> = ({
  isOpen,
  onClose,
  assets,
  initialChain = 'ethereum',
  currentFiat,
  currentLang,
  activeAccount,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [selectedChain, setSelectedChain] = useState<ChainId>(initialChain);
  const [requestedAmount, setRequestedAmount] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const chain = CHAINS_CONFIG[selectedChain] || CHAINS_CONFIG.ethereum;

  // Generate appropriate address format depending on chain
  let displayAddress = activeAccount.address;
  if (chain.type === 'SVM') {
    displayAddress = '7xXk9vApexSolanaP6qM4tU2bL1a89v';
  } else if (chain.type === 'TVM' && chain.id === 'ton') {
    displayAddress = 'EQD-teñgeTonkeeper7789xK34m912vPq';
  } else if (chain.type === 'TVM' && chain.id === 'tron') {
    displayAddress = 'TRX94BfateñgeTronScanTRC20Official94';
  } else if (chain.type === 'UTXO') {
    displayAddress = 'bc1qtengebtcsegwit942k8l19m4z';
  } else if (chain.type === 'NEAR') {
    displayAddress = 'tenge.near';
  }

  const qrPayload = requestedAmount
    ? `${selectedChain}:${displayAddress}?amount=${requestedAmount}`
    : `${selectedChain}:${displayAddress}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Receive payment on ${chain.name}`,
          text: `Pay to ${activeAccount.cryptoTag} on ${chain.name}: ${displayAddress}`,
          url: `https://tenge.app/pay/${displayAddress}`,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.receiveCrypto}
              </h3>
              <p className="text-[11px] text-slate-400">
                Deposit to {activeAccount.name}
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
          {/* Chain Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              {t.selectNetwork}
            </label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value as ChainId)}
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(CHAINS_CONFIG).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol}) · {c.type}
                </option>
              ))}
            </select>
          </div>

          {/* QR Code Canvas */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="p-2.5 bg-white rounded-2xl shadow-sm">
              <QRCodeSVG value={qrPayload} size={180} fgColor="#0F172A" />
            </div>

            <div className="mt-3 text-center">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                {activeAccount.cryptoTag}
              </span>
              {activeAccount.phoneNumber && (
                <div className="text-[11px] text-slate-400 font-mono">
                  Linked phone: {activeAccount.phoneNumber}
                </div>
              )}
            </div>
          </div>

          {/* Address Box */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              <span>Deposit Address ({chain.name})</span>
              <span className="text-emerald-500 font-mono text-[10px]">Verified</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="font-mono text-xs text-slate-800 dark:text-slate-200 truncate flex-1">
                {displayAddress}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 shadow-sm shrink-0 transition-all"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Optional Amount Specification */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Specify Requested Amount (Optional)
            </label>
            <input
              type="number"
              step="any"
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value)}
              placeholder="e.g. 0.5 or 100"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t.shareQr}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
