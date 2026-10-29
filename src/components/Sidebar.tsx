import React from 'react';
import {
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  Image as ImageIcon,
  PieChart,
  History,
  ShieldCheck,
  PlusCircle,
  Cpu,
  Layers,
} from 'lucide-react';
import { LanguageCode, WalletAccount } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

export type ActiveTab =
  | 'portfolio'
  | 'swap'
  | 'staking'
  | 'nfts'
  | 'analytics'
  | 'history'
  | 'security';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  currentLang: LanguageCode;
  activeAccount: WalletAccount;
  onAddNewAccount: () => void;
  isHardwareConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentLang,
  activeAccount,
  onAddNewAccount,
  isHardwareConnected,
}) => {
  const t = TRANSLATIONS[currentLang];

  const navItems = [
    { id: 'portfolio' as ActiveTab, label: t.portfolio, icon: Wallet },
    { id: 'swap' as ActiveTab, label: t.swap, icon: ArrowLeftRight },
    { id: 'staking' as ActiveTab, label: t.staking, icon: TrendingUp },
    { id: 'nfts' as ActiveTab, label: t.nfts, icon: ImageIcon },
    { id: 'analytics' as ActiveTab, label: t.analytics, icon: PieChart },
    { id: 'history' as ActiveTab, label: t.history, icon: History },
    { id: 'security' as ActiveTab, label: t.security, icon: ShieldCheck },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-50/70 dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col justify-between shrink-0">
      <div>
        {/* Active Account Brief Card */}
        <div className="mb-6 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Active Vault
            </span>
            {activeAccount.isHardware && (
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-mono font-medium">
                <Cpu className="w-3 h-3" />
                Ledger
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: activeAccount.color }}
            />
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {activeAccount.name}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-mono truncate">
                {activeAccount.cryptoTag}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer in Sidebar */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={onAddNewAccount}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
          <span>Add Custom Vault / Budget</span>
        </button>

        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/40 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-emerald-500" />
              16 Networks
            </span>
            <span className="font-mono text-emerald-500 font-semibold">100% Synced</span>
          </div>
          <div className="text-[10px] text-slate-400">
            {isHardwareConnected ? 'Ledger HW Key Attached' : 'Passkey Protected'}
          </div>
        </div>
      </div>
    </aside>
  );
};
