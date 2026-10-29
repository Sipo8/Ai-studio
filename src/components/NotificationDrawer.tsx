import React, { useState } from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Trash2,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { NotificationItem, LanguageCode } from '../types';
import { TRANSLATIONS } from '../i18n/translations';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  currentLang: LanguageCode;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  currentLang,
  onMarkAllAsRead,
  onClearAll,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefTx, setPrefTx] = useState(true);
  const [prefLimit, setPrefLimit] = useState(true);
  const [prefPrice, setPrefPrice] = useState(true);

  if (!isOpen) return null;

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'tx_received':
      case 'tx_success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'limit_alert':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'price_alert':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'security':
        return <Shield className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Push Notifications
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowPrefs(!showPrefs)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notification Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preferences Subpanel */}
          {showPrefs && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-xs space-y-2.5">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                Alert Preferences
              </div>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-600 dark:text-slate-400">Transaction Confirmations</span>
                <input
                  type="checkbox"
                  checked={prefTx}
                  onChange={(e) => setPrefTx(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-600 dark:text-slate-400">Budget Limit Thresholds</span>
                <input
                  type="checkbox"
                  checked={prefLimit}
                  onChange={(e) => setPrefLimit(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-600 dark:text-slate-400">Market Volatility (&gt;5%)</span>
                <input
                  type="checkbox"
                  checked={prefPrice}
                  onChange={(e) => setPrefPrice(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Bell className="w-10 h-10 stroke-1 mb-2 text-slate-300 dark:text-slate-600" />
                <div className="text-sm font-semibold">No Notifications</div>
                <div className="text-xs">Your balance alerts and transfer receipts will appear here.</div>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border transition-colors flex items-start gap-3 ${
                    notif.read
                      ? 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-75'
                      : 'bg-blue-50/40 dark:bg-slate-800 border-blue-200 dark:border-blue-900/50'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={onMarkAllAsRead}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Mark All Read
            </button>
            <button
              onClick={onClearAll}
              className="p-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Clear All Notifications"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
