import React from 'react';
import { X, ArrowUpRight, CreditCard, Sparkles, Send, Shield, Smartphone } from 'lucide-react';
import { FiatCurrency, LanguageCode, WalletAccount } from '../types';
import { formatFiat } from '../utils/currency';
import { TRANSLATIONS } from '../i18n/translations';

interface MobileWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalUsd: number;
  currentFiat: FiatCurrency;
  currentLang: LanguageCode;
  activeAccount: WalletAccount;
  onQuickSend: (tag: string) => void;
  onQuickBuy: () => void;
}

export const MobileWidgetModal: React.FC<MobileWidgetModalProps> = ({
  isOpen,
  onClose,
  totalUsd,
  currentFiat,
  currentLang,
  activeAccount,
  onQuickSend,
  onQuickBuy,
}) => {
  const t = TRANSLATIONS[currentLang];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-[42px] bg-slate-900 border-[8px] border-slate-800 p-6 shadow-2xl overflow-hidden flex flex-col justify-between aspect-[9/18]">
        {/* Phone Speaker & Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
        </div>

        {/* Top bar */}
        <div className="pt-6 flex items-center justify-between text-white/70 text-xs">
          <span className="font-semibold text-xs font-mono">09:41</span>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Home Screen Simulated Content */}
        <div className="space-y-4 my-auto">
          {/* iOS / Android ApexVault Home Screen Widget */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-800/95 to-slate-900/90 border border-white/15 shadow-2xl backdrop-blur-xl text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  ₸
                </div>
                <span className="text-xs font-bold tracking-tight lowercase">teñge Widget</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                LIVE
              </span>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">
                {activeAccount.name}
              </div>
              <div className="text-2xl font-extrabold font-mono tabular-nums tracking-tight text-white">
                {formatFiat(totalUsd, currentFiat)}
              </div>
              <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                ▲ +3.95% ($4,120) 24h
              </div>
            </div>

            {/* Quick Send to Favorites */}
            <div>
              <div className="text-[10px] text-slate-400 mb-1.5 uppercase font-semibold">
                Quick 1-Tap Transfer
              </div>
              <div className="flex items-center justify-between gap-1.5">
                {[
                  { tag: '@alex_crypto', label: 'Alex' },
                  { tag: '@daryn_kz', label: 'Daryn' },
                  { tag: '@family', label: 'Family' },
                ].map((f) => (
                  <button
                    key={f.tag}
                    onClick={() => {
                      onQuickSend(f.tag);
                      onClose();
                    }}
                    className="flex-1 py-1.5 px-1 rounded-xl bg-white/10 hover:bg-white/20 text-center transition-colors border border-white/5"
                  >
                    <div className="text-xs font-bold truncate">{f.label}</div>
                    <div className="text-[9px] text-slate-400 font-mono truncate">{f.tag}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Bar on Widget */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <button
                onClick={() => {
                  onQuickSend('@recipient');
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>

              <button
                onClick={() => {
                  onQuickBuy();
                  onClose();
                }}
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span> Pay</span>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400 font-medium px-4">
            Interactive preview of the mobile lock-screen & home-screen widget.
          </div>
        </div>

        {/* Bottom Home Bar */}
        <div className="pb-2 flex justify-center">
          <div className="w-32 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  );
};
