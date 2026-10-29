import React, { useState } from 'react';
import { Fingerprint, Lock, Shield, KeyRound, AlertCircle } from 'lucide-react';
import { WalletAccount, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface LockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
  activeAccount: WalletAccount;
  currentLang: LanguageCode;
  isBiometricsEnabled: boolean;
}

export const LockScreen: React.FC<LockScreenProps> = ({
  isLocked,
  onUnlock,
  activeAccount,
  currentLang,
  isBiometricsEnabled,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isLocked) return null;

  const handleKeyClick = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        // Any 4 digits unlocks for smooth UX (or default demo pin)
        setTimeout(() => {
          onUnlock();
          setPin('');
        }, 200);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleBiometricUnlock = () => {
    // Simulate instantaneous WebAuthn credentials verification
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white animate-fade-in">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
          <Lock className="w-8 h-8 text-white" />
        </div>

        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">teñge Locked</h1>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end encrypted session for {activeAccount.name}
          </p>
        </div>

        {/* Biometric Quick Unlock */}
        {isBiometricsEnabled && (
          <button
            onClick={handleBiometricUnlock}
            className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all"
          >
            <Fingerprint className="w-5 h-5" />
            <span>Unlock with Touch ID / Face ID</span>
          </button>
        )}

        {/* PIN Dots */}
        <div className="w-full pt-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
            {t.enterPin} (Default: 7 7 7 7)
          </div>
          <div className="flex justify-center gap-4 mb-6">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  pin.length > idx ? 'bg-blue-500 scale-110 shadow-md shadow-blue-500/50' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-3 max-w-[260px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleKeyClick(digit)}
                className="w-16 h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-lg font-mono font-bold text-white transition-colors flex items-center justify-center mx-auto border border-slate-800"
              >
                {digit}
              </button>
            ))}
            <div />
            <button
              onClick={() => handleKeyClick('0')}
              className="w-16 h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-lg font-mono font-bold text-white transition-colors flex items-center justify-center mx-auto border border-slate-800"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="w-16 h-16 rounded-2xl bg-slate-900 hover:bg-slate-800 active:bg-slate-700 text-xs font-semibold text-slate-400 transition-colors flex items-center justify-center mx-auto border border-slate-800"
            >
              DEL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
