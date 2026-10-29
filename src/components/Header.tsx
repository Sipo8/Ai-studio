import React, { useState } from 'react';
import {
  Shield,
  Bell,
  Lock,
  Moon,
  Sun,
  Smartphone,
  ChevronDown,
  Globe,
  Wifi,
  WifiOff,
  User,
  Users,
  Briefcase,
  HardDrive,
} from 'lucide-react';
import { FiatCurrency, LanguageCode, WalletAccount, ChainId, FiatRateMap } from '../types';
import { FIAT_RATES } from '../utils/currency';
import { TRANSLATIONS } from '../i18n/translations';
import { CHAINS_CONFIG } from '../data/mockData';

interface HeaderProps {
  currentFiat: FiatCurrency;
  onSelectFiat: (fiat: FiatCurrency) => void;
  fiatRates?: FiatRateMap;
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  selectedChain: ChainId | 'all';
  onSelectChain: (chain: ChainId | 'all') => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  onLockWallet: () => void;
  onOpenMobileWidget: () => void;
  activeAccount: WalletAccount;
  accounts: WalletAccount[];
  onSelectAccount: (acc: WalletAccount) => void;
  isOnline: boolean;
  onToggleOnline: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentFiat,
  onSelectFiat,
  fiatRates,
  currentLang,
  onSelectLang,
  isDark,
  onToggleTheme,
  selectedChain,
  onSelectChain,
  unreadCount,
  onOpenNotifications,
  onLockWallet,
  onOpenMobileWidget,
  activeAccount,
  accounts,
  onSelectAccount,
  isOnline,
  onToggleOnline,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [fiatDropdownOpen, setFiatDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [chainDropdownOpen, setChainDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  const getAccountIcon = (type: WalletAccount['type']) => {
    switch (type) {
      case 'personal':
        return <User className="w-3.5 h-3.5" />;
      case 'family':
        return <Users className="w-3.5 h-3.5" />;
      case 'trading':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'hardware':
        return <HardDrive className="w-3.5 h-3.5" />;
    }
  };

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold text-lg">
            ₸
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-lg text-slate-900 dark:text-white leading-tight lowercase">
              teñge
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-wider uppercase">
              Web3 & Multi-Fiat
            </span>
          </div>
        </div>

        {/* Center Zone: Network Switcher & Account Selector */}
        <div className="hidden md:flex items-center gap-2">
          {/* Account Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setAccountDropdownOpen(!accountDropdownOpen);
                setChainDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              <span style={{ color: activeAccount.color }}>{getAccountIcon(activeAccount.type)}</span>
              <span className="max-w-[130px] truncate">{activeAccount.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {accountDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                  Switch Vault Account
                </div>
                {accounts.map((acc) => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      onSelectAccount(acc);
                      setAccountDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors ${
                      acc.id === activeAccount.id ? 'bg-blue-50/50 dark:bg-blue-900/20 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: acc.color }}
                      />
                      <div>
                        <div className="text-slate-900 dark:text-white flex items-center gap-1.5">
                          {acc.name}
                          {acc.isHardware && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                              HW
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{acc.cryptoTag}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chain Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setChainDropdownOpen(!chainDropdownOpen);
                setAccountDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
            >
              {selectedChain === 'all' ? (
                <>
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t.allChains}</span>
                </>
              ) : (
                <>
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CHAINS_CONFIG[selectedChain]?.iconBg }}
                  />
                  <span>{CHAINS_CONFIG[selectedChain]?.name}</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {chainDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 max-h-80 overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
                <button
                  onClick={() => {
                    onSelectChain('all');
                    setChainDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 ${
                    selectedChain === 'all' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-medium' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>{t.allChains} (16 Networks)</span>
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                {Object.values(CHAINS_CONFIG).map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => {
                      onSelectChain(chain.id);
                      setChainDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 ${
                      selectedChain === chain.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-medium' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: chain.iconBg }}
                      />
                      <span>{chain.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{chain.gasLabel}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Network Sync Status Toggle */}
          <button
            onClick={onToggleOnline}
            title={isOnline ? 'Online - Cloud Sync Active' : 'Offline Mode - Local Encrypted Vault'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              isOnline
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>

        {/* Right Zone: Currency, Language, Theme, Notifications, Mobile Widget, Lock */}
        <div className="flex items-center gap-2">
          {/* Currency Switcher */}
          <div className="relative">
            {(() => {
              const activeRates = fiatRates || FIAT_RATES;
              const activeFiatInfo = activeRates[currentFiat] || FIAT_RATES[currentFiat];
              return (
                <>
                  <button
                    onClick={() => {
                      setFiatDropdownOpen(!fiatDropdownOpen);
                      setLangDropdownOpen(false);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors ${
                      activeFiatInfo.priceFlash === 'up'
                        ? 'ring-1 ring-emerald-500'
                        : activeFiatInfo.priceFlash === 'down'
                        ? 'ring-1 ring-rose-500'
                        : ''
                    }`}
                  >
                    <span>{currentFiat}</span>
                    <span className="text-slate-400 text-[10px]">({activeFiatInfo.symbol})</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {fiatDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
                      <div className="px-3 py-1.5 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-100 dark:border-slate-700/60">
                        Live Fiat Rates (vs USD)
                      </div>
                      {(Object.keys(activeRates) as FiatCurrency[]).map((fiat) => {
                        const item = activeRates[fiat];
                        return (
                          <button
                            key={fiat}
                            onClick={() => {
                              onSelectFiat(fiat);
                              setFiatDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors ${
                              currentFiat === fiat
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-semibold'
                                : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {fiat} ({item.symbol})
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-[11px] font-mono font-bold tabular-nums">
                              {item.rate >= 1000
                                ? Math.round(item.rate).toLocaleString()
                                : item.rate.toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </div>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setFiatDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors uppercase"
            >
              <span>{currentLang}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-50">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'ru', label: 'Русский' },
                  { code: 'kz', label: 'Қазақша' },
                  { code: 'uz', label: "O'zbekcha" },
                  { code: 'kg', label: 'Кыргызча' },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      onSelectLang(item.code as LanguageCode);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/60 ${
                      currentLang === item.code ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-semibold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Widget Preview Button */}
          <button
            onClick={onOpenMobileWidget}
            title={t.mobileWidget}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? t.lightMode : t.darkMode}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>

          {/* Lock Vault Button */}
          <button
            onClick={onLockWallet}
            title={t.lockWallet}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors shrink-0"
          >
            <Lock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.lockWallet}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
