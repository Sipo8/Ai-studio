import React, { useState } from 'react';
import {
  X,
  ArrowUpRight,
  AtSign,
  Phone,
  QrCode,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CryptoAsset, ChainId, FiatCurrency, LanguageCode, Transaction, WalletAccount } from '../types';
import { formatFiat, formatCrypto, convertUsdToFiat } from '../utils/currency';
import { TRANSLATIONS } from '../i18n/translations';
import { CHAINS_CONFIG } from '../data/mockData';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: CryptoAsset[];
  initialAsset?: CryptoAsset;
  currentFiat: FiatCurrency;
  currentLang: LanguageCode;
  onConfirmSend: (tx: Transaction, updatedAsset: CryptoAsset) => void;
  activeAccount: WalletAccount;
  is2FAEnabled: boolean;
}

type SendMode = 'address' | 'tag' | 'phone' | 'qr';

export const SendModal: React.FC<SendModalProps> = ({
  isOpen,
  onClose,
  assets,
  initialAsset,
  currentFiat,
  currentLang,
  onConfirmSend,
  activeAccount,
  is2FAEnabled,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>(initialAsset || assets[0]);
  const [sendMode, setSendMode] = useState<SendMode>('tag');
  const [recipientInput, setRecipientInput] = useState('@alex_crypto');
  const [amountInput, setAmountInput] = useState('');
  const [gasTier, setGasTier] = useState<'slow' | 'normal' | 'fast'>('fast');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentChain = CHAINS_CONFIG[selectedAsset.chainId];
  const numAmount = parseFloat(amountInput) || 0;
  const fiatVal = convertUsdToFiat(numAmount * selectedAsset.usdPrice, currentFiat);

  const gasFeeUsd = gasTier === 'fast' ? 0.45 : gasTier === 'normal' ? 0.25 : 0.08;

  const handleMax = () => {
    setAmountInput(selectedAsset.balance.toString());
  };

  const handleSend = () => {
    setErrorMsg('');
    if (!recipientInput.trim()) {
      setErrorMsg('Please specify a valid recipient address, tag, or phone number.');
      return;
    }
    if (numAmount <= 0) {
      setErrorMsg('Please enter a valid transfer amount greater than 0.');
      return;
    }
    if (numAmount > selectedAsset.balance) {
      setErrorMsg('Insufficient balance for this transaction.');
      return;
    }
    if (is2FAEnabled && twoFactorCode.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit 2FA authentication code.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);

      // Create new transaction
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        type: 'send',
        chainId: selectedAsset.chainId,
        assetSymbol: selectedAsset.symbol,
        amount: numAmount,
        usdValue: numAmount * selectedAsset.usdPrice,
        timestamp: Date.now(),
        status: 'completed',
        from: activeAccount.address,
        to: recipientInput,
        feeUsd: gasFeeUsd,
        category: 'Transfers',
        note: `Sent via ${sendMode.toUpperCase()} transfer`,
        recipientTag: sendMode === 'tag' ? recipientInput : undefined,
        recipientPhone: sendMode === 'phone' ? recipientInput : undefined,
      };

      const updatedAsset: CryptoAsset = {
        ...selectedAsset,
        balance: Math.max(0, selectedAsset.balance - numAmount),
      };

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      onConfirmSend(newTx, updatedAsset);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t.sendCrypto}
              </h3>
              <p className="text-[11px] text-slate-400">
                Instant multi-chain transfer with zero-lag routing
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

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Asset & Chain Selection */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Select Token & Network
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedAsset.id}
                onChange={(e) => {
                  const a = assets.find((x) => x.id === e.target.value);
                  if (a) setSelectedAsset(a);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.symbol} ({asset.name}) · {CHAINS_CONFIG[asset.chainId]?.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-end px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
                <span className="text-slate-400 mr-1.5">{t.available}:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatCrypto(selectedAsset.balance, selectedAsset.symbol)}
                </span>
              </div>
            </div>
          </div>

          {/* Transfer Mode Tabs */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Recipient Destination
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setSendMode('tag');
                  setRecipientInput('@alex_crypto');
                }}
                className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sendMode === 'tag'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <AtSign className="w-3.5 h-3.5" />
                <span className="truncate">Tag</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSendMode('phone');
                  setRecipientInput('+7 701 555 4321');
                }}
                className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sendMode === 'phone'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="truncate">Phone</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSendMode('address');
                  setRecipientInput('0x71C...b412');
                }}
                className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sendMode === 'address'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Wallet className="w-3.5 h-3.5" />
                <span className="truncate">Address</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSendMode('qr');
                  setRecipientInput('0xQR_SCANNED_ADDR_894');
                }}
                className={`flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  sendMode === 'qr'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span className="truncate">QR Code</span>
              </button>
            </div>

            <div className="mt-2">
              <input
                type="text"
                value={recipientInput}
                onChange={(e) => setRecipientInput(e.target.value)}
                placeholder={
                  sendMode === 'tag'
                    ? '@username (e.g. @satoshi, @daryn_kz)'
                    : sendMode === 'phone'
                    ? '+7 701 ... or +998 ...'
                    : 'Enter recipient public blockchain address'
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              <span>{t.amount}</span>
              <span className="font-mono tabular-nums text-slate-600 dark:text-slate-300">
                ≈ {formatFiat(numAmount * selectedAsset.usdPrice, currentFiat)}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0.00"
                className="w-full pl-3.5 pr-20 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-mono font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleMax}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-bold uppercase transition-colors"
              >
                {t.max}
              </button>
            </div>
          </div>

          {/* Gas Fee Selector */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {t.estimatedGas} ({currentChain?.name}):
              </span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {formatFiat(gasFeeUsd, currentFiat)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'slow', label: 'Economy', time: '~3 min' },
                { id: 'normal', label: 'Standard', time: '~30 sec' },
                { id: 'fast', label: 'Instant Fast', time: '< 2 sec' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setGasTier(tier.id as any)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-all ${
                    gasTier === tier.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div>{tier.label}</div>
                  <div className="text-[10px] text-slate-400">{tier.time}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2FA Verification if enabled */}
          {is2FAEnabled && (
            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/40">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                2FA Security Protection Required
              </div>
              <input
                type="text"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit TOTP (e.g. 123456)"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 rounded-lg text-xs font-mono tracking-widest text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2">
            <button
              onClick={handleSend}
              disabled={isVerifying}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 active:scale-98 transition-all disabled:opacity-60"
            >
              {isVerifying ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isVerifying ? 'Signing on Blockchain...' : t.confirmSend}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
