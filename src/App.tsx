import React, { useState, useEffect } from 'react';
import {
  ChainId,
  CryptoAsset,
  FiatCurrency,
  LanguageCode,
  NFTItem,
  NotificationItem,
  StakingPool,
  Transaction,
  WalletAccount,
  BudgetCategory,
  HardwareDeviceConnection,
  FiatRateMap,
} from './types';
import { FIAT_RATES } from './utils/currency';
import {
  INITIAL_ACCOUNTS,
  INITIAL_ASSETS,
  INITIAL_CATEGORIES,
  INITIAL_NFTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STAKING_POOLS,
  INITIAL_TRANSACTIONS,
} from './data/mockData';
import { Header } from './components/Header';
import { LiveTickerBar } from './components/LiveTickerBar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { PortfolioOverview } from './components/PortfolioOverview';
import { AssetList } from './components/AssetList';
import { SendModal } from './components/SendModal';
import { ReceiveModal } from './components/ReceiveModal';
import { BuyModal } from './components/BuyModal';
import { SwapTab } from './components/SwapTab';
import { StakingTab } from './components/StakingTab';
import { NftGallery } from './components/NftGallery';
import { AnalyticsTab } from './components/AnalyticsTab';
import { HistoryTab } from './components/HistoryTab';
import { SecurityTab } from './components/SecurityTab';
import { MobileWidgetModal } from './components/MobileWidgetModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LockScreen } from './components/LockScreen';
import { AddAccountModal } from './components/AddAccountModal';

export default function App() {
  // Theme state (Dark mode default for Web3 aesthetic)
  const [isDark, setIsDark] = useState<boolean>(true);

  // Localization and Currency
  const [currentFiat, setCurrentFiat] = useState<FiatCurrency>('USD');
  const [fiatRates, setFiatRates] = useState<FiatRateMap>(FIAT_RATES);
  const [isLiveUpdating, setIsLiveUpdating] = useState<boolean>(true);
  const [lastRatesUpdated, setLastRatesUpdated] = useState<Date>(new Date());
  const [currentLang, setCurrentLang] = useState<LanguageCode>('ru');

  // Network filter & Active Tab
  const [selectedChain, setSelectedChain] = useState<ChainId | 'all'>('all');
  const [activeTab, setActiveTab] = useState<ActiveTab>('portfolio');

  // Multi-Vault / Family Accounts
  const [accounts, setAccounts] = useState<WalletAccount[]>(INITIAL_ACCOUNTS);
  const [activeAccount, setActiveAccount] = useState<WalletAccount>(INITIAL_ACCOUNTS[0]);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);

  // Crypto Assets & Staking & NFTs
  const [assets, setAssets] = useState<CryptoAsset[]>(INITIAL_ASSETS);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>(INITIAL_STAKING_POOLS);
  const [nfts, setNfts] = useState<NFTItem[]>(INITIAL_NFTS);

  // Ledger Transactions & Categories
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [categories, setCategories] = useState<BudgetCategory[]>(INITIAL_CATEGORIES);

  // Security & Hardware
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(true);
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [hardwareDevice, setHardwareDevice] = useState<HardwareDeviceConnection>({
    name: 'Ledger Nano X',
    model: 'Nano X (BLE + USB)',
    status: 'connected',
    firmware: 'v2.2.4',
    battery: 94,
  });

  // Offline / Cloud Sync
  const [isOnline, setIsOnline] = useState(true);
  const [syncToast, setSyncToast] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = useState(false);

  // Modals
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [sendTargetAsset, setSendTargetAsset] = useState<CryptoAsset | undefined>(undefined);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [receiveTargetChain, setReceiveTargetChain] = useState<ChainId>('ethereum');
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isMobileWidgetOpen, setIsMobileWidgetOpen] = useState(false);

  // Sync theme class to document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Real-time market rates and crypto prices ticker (every 2.5s)
  useEffect(() => {
    if (!isLiveUpdating) return;

    const interval = setInterval(() => {
      setLastRatesUpdated(new Date());

      // 1. Simulate live micro-fluctuations in fiat currency forex rates
      setFiatRates((prev) => {
        const next: FiatRateMap = { ...prev };

        // KZT (Kazakhstani Tenge, ~512.4)
        const kztDelta = (Math.random() - 0.49) * 0.42;
        const newKzt = Math.max(505, Math.min(520, prev.KZT.rate + kztDelta));
        next.KZT = {
          ...prev.KZT,
          rate: parseFloat(newKzt.toFixed(2)),
          lastDelta: kztDelta,
          change24h: parseFloat(((prev.KZT.change24h || 0) + kztDelta * 0.1).toFixed(2)),
          priceFlash: kztDelta > 0.05 ? 'up' : kztDelta < -0.05 ? 'down' : null,
        };

        // EUR (Euro, ~0.92)
        const eurDelta = (Math.random() - 0.49) * 0.0016;
        const newEur = Math.max(0.90, Math.min(0.94, prev.EUR.rate + eurDelta));
        next.EUR = {
          ...prev.EUR,
          rate: parseFloat(newEur.toFixed(4)),
          lastDelta: eurDelta,
          change24h: parseFloat(((prev.EUR.change24h || 0) + eurDelta * 10).toFixed(2)),
          priceFlash: eurDelta > 0.0003 ? 'up' : eurDelta < -0.0003 ? 'down' : null,
        };

        // RUB (Russian Ruble, ~96.2)
        const rubDelta = (Math.random() - 0.49) * 0.12;
        const newRub = Math.max(94, Math.min(99, prev.RUB.rate + rubDelta));
        next.RUB = {
          ...prev.RUB,
          rate: parseFloat(newRub.toFixed(2)),
          lastDelta: rubDelta,
          change24h: parseFloat(((prev.RUB.change24h || 0) + rubDelta * 0.15).toFixed(2)),
          priceFlash: rubDelta > 0.02 ? 'up' : rubDelta < -0.02 ? 'down' : null,
        };

        // KGS (Kyrgyzstani Som, ~87.3)
        const kgsDelta = (Math.random() - 0.49) * 0.08;
        const newKgs = Math.max(85, Math.min(90, prev.KGS.rate + kgsDelta));
        next.KGS = {
          ...prev.KGS,
          rate: parseFloat(newKgs.toFixed(2)),
          lastDelta: kgsDelta,
          change24h: parseFloat(((prev.KGS.change24h || 0) + kgsDelta * 0.15).toFixed(2)),
          priceFlash: kgsDelta > 0.015 ? 'up' : kgsDelta < -0.015 ? 'down' : null,
        };

        // UZS (Uzbekistani Som, ~12850)
        const uzsDelta = (Math.random() - 0.49) * 12;
        const newUzs = Math.max(12700, Math.min(13000, prev.UZS.rate + uzsDelta));
        next.UZS = {
          ...prev.UZS,
          rate: Math.round(newUzs),
          lastDelta: uzsDelta,
          change24h: parseFloat(((prev.UZS.change24h || 0) + uzsDelta * 0.005).toFixed(2)),
          priceFlash: uzsDelta > 2 ? 'up' : uzsDelta < -2 ? 'down' : null,
        };

        return next;
      });

      // 2. Simulate live micro-fluctuations in cryptocurrency token prices
      setAssets((prev) => {
        // Select 3 to 7 random tokens to tick in this cycle
        const countToUpdate = Math.floor(Math.random() * 5) + 3;
        const indicesToUpdate = new Set<number>();
        while (indicesToUpdate.size < countToUpdate && indicesToUpdate.size < prev.length) {
          indicesToUpdate.add(Math.floor(Math.random() * prev.length));
        }

        return prev.map((asset, idx) => {
          if (!indicesToUpdate.has(idx)) {
            return { ...asset, priceFlash: null };
          }

          const isStable = ['USDC', 'USDT'].includes(asset.symbol);
          const maxVariance = isStable ? 0.04 : 0.45;
          const deltaPct = (Math.random() - 0.49) * maxVariance;
          const newPrice = Math.max(0.0001, asset.usdPrice * (1 + deltaPct / 100));
          const newChange24h = asset.change24h + deltaPct * 0.25;

          return {
            ...asset,
            usdPrice: parseFloat(newPrice.toFixed(isStable ? 4 : newPrice > 500 ? 1 : 2)),
            change24h: parseFloat(newChange24h.toFixed(2)),
            lastPriceDelta: deltaPct,
            priceFlash: deltaPct > 0.01 ? 'up' : deltaPct < -0.01 ? 'down' : null,
          };
        });
      });

      // Clear price pulse flash after 850ms for smooth transitions
      setTimeout(() => {
        setAssets((prev) =>
          prev.map((a) => (a.priceFlash ? { ...a, priceFlash: null } : a))
        );
        setFiatRates((prev) => {
          const reset: FiatRateMap = { ...prev };
          (Object.keys(reset) as FiatCurrency[]).forEach((f) => {
            if (reset[f].priceFlash) reset[f].priceFlash = null;
          });
          return reset;
        });
      }, 850);
    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveUpdating]);

  const handleManualRefreshRates = () => {
    setLastRatesUpdated(new Date());
    setAssets((prev) =>
      prev.map((a) => {
        const deltaPct = (Math.random() - 0.48) * 0.5;
        const newPrice = Math.max(0.0001, a.usdPrice * (1 + deltaPct / 100));
        return {
          ...a,
          usdPrice: parseFloat(newPrice.toFixed(a.usdPrice > 500 ? 1 : 2)),
          priceFlash: deltaPct >= 0 ? 'up' : 'down',
        };
      })
    );
    setSyncToast('Live exchange rates refreshed from decentralized oracles.');
    setTimeout(() => setSyncToast(''), 2500);
  };

  // Total net worth USD
  const totalNetWorthUsd = assets.reduce((sum, a) => sum + a.balance * a.usdPrice, 0);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Notification helper
  const addNotification = (title: string, message: string, type: NotificationItem['type']) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: Date.now(),
      type,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Handlers for Send
  const handleConfirmSend = (tx: Transaction, updatedAsset: CryptoAsset) => {
    setTransactions((prev) => [tx, ...prev]);
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));

    // Update active account spending metrics
    setActiveAccount((prev) => {
      const newDaily = prev.currentDailySpent + tx.usdValue;
      const newMonthly = prev.currentMonthlySpent + tx.usdValue;

      // Check if limits exceeded
      if (prev.dailySpendingLimit && newDaily >= prev.dailySpendingLimit * 0.8) {
        addNotification(
          'Daily Budget Limit Warning',
          `Vault ${prev.name} has utilized 80%+ of daily limit ($${newDaily.toFixed(0)} / $${prev.dailySpendingLimit}).`,
          'limit_alert'
        );
      }

      return {
        ...prev,
        currentDailySpent: newDaily,
        currentMonthlySpent: newMonthly,
      };
    });

    addNotification(
      'Payment Sent Successfully',
      `Sent ${tx.amount} ${tx.assetSymbol} ($${tx.usdValue.toFixed(2)}) to ${tx.to}.`,
      'tx_success'
    );
  };

  // Handlers for Buy (Apple Pay / Google Pay)
  const handleConfirmBuy = (tx: Transaction, updatedAsset: CryptoAsset) => {
    setTransactions((prev) => [tx, ...prev]);
    setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    addNotification(
      'Crypto Onramp Settled',
      `Purchased ${tx.amount.toFixed(4)} ${tx.assetSymbol} via ${tx.from}.`,
      'tx_success'
    );
  };

  // Handlers for Swap
  const handleExecuteSwap = (tx: Transaction, updatedFrom: CryptoAsset, updatedTo: CryptoAsset) => {
    setTransactions((prev) => [tx, ...prev]);
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === updatedFrom.id) return updatedFrom;
        if (a.id === updatedTo.id) return updatedTo;
        return a;
      })
    );
    addNotification(
      'DEX Swap Executed',
      `${tx.note}`,
      'tx_success'
    );
  };

  // Handlers for Staking
  const handleUpdatePools = (updatedPools: StakingPool[], newTx?: Transaction, updatedAsset?: CryptoAsset) => {
    setStakingPools(updatedPools);
    if (newTx) {
      setTransactions((prev) => [newTx, ...prev]);
      addNotification(
        newTx.type === 'reward' ? 'Staking Rewards Credited' : 'Staking Position Updated',
        newTx.note || `${newTx.amount} ${newTx.assetSymbol}`,
        'tx_success'
      );
    }
    if (updatedAsset) {
      setAssets((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
    }
  };

  // Handlers for NFT transfer
  const handleTransferNft = (nft: NFTItem, recipient: string, newTx: Transaction) => {
    setNfts((prev) => prev.filter((item) => item.id !== nft.id));
    setTransactions((prev) => [newTx, ...prev]);
    addNotification(
      'NFT Collectible Transferred',
      `Transferred ${nft.name} to ${recipient}.`,
      'tx_success'
    );
  };

  // Handlers for Account Limits
  const handleUpdateAccountLimits = (daily: number, monthly: number) => {
    setActiveAccount((prev) => ({
      ...prev,
      dailySpendingLimit: daily,
      monthlySpendingLimit: monthly,
    }));
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === activeAccount.id
          ? { ...acc, dailySpendingLimit: daily, monthlySpendingLimit: monthly }
          : acc
      )
    );
    addNotification(
      'Spending Limits Saved',
      `Daily limit set to $${daily.toLocaleString()} and monthly to $${monthly.toLocaleString()}.`,
      'security'
    );
  };

  // Online / Offline toggle with simulated sync
  const handleToggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (nextState) {
      setSyncToast('Connected! Syncing local encrypted keystore with cloud backup...');
      setTimeout(() => setSyncToast('Cloud synchronization completed with zero conflicts.'), 2000);
      setTimeout(() => setSyncToast(''), 4500);
    } else {
      setSyncToast('Offline Mode: Transactions will be signed and encrypted locally.');
      setTimeout(() => setSyncToast(''), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Sync Toast if any */}
      {syncToast && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-2xl animate-fade-in flex items-center gap-2 border border-slate-700">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentFiat={currentFiat}
        onSelectFiat={setCurrentFiat}
        fiatRates={fiatRates}
        currentLang={currentLang}
        onSelectLang={setCurrentLang}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        selectedChain={selectedChain}
        onSelectChain={setSelectedChain}
        unreadCount={unreadNotifsCount}
        onOpenNotifications={() => setIsNotifDrawerOpen(true)}
        onLockWallet={() => setIsLocked(true)}
        onOpenMobileWidget={() => setIsMobileWidgetOpen(true)}
        activeAccount={activeAccount}
        accounts={accounts}
        onSelectAccount={setActiveAccount}
        isOnline={isOnline}
        onToggleOnline={handleToggleOnline}
      />

      {/* Real-time Ticker Bar for Crypto & Fiat */}
      <LiveTickerBar
        assets={assets}
        fiatRates={fiatRates}
        currentFiat={currentFiat}
        isLiveUpdating={isLiveUpdating}
        onToggleLive={() => setIsLiveUpdating(!isLiveUpdating)}
        onManualRefresh={handleManualRefreshRates}
        lastUpdated={lastRatesUpdated}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentLang={currentLang}
          activeAccount={activeAccount}
          onAddNewAccount={() => setIsAddAccountOpen(true)}
          isHardwareConnected={hardwareDevice.status === 'connected'}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-x-hidden">
          {activeTab === 'portfolio' && (
            <>
              <PortfolioOverview
                totalUsd={totalNetWorthUsd}
                currentFiat={currentFiat}
                fiatRates={fiatRates}
                currentLang={currentLang}
                onOpenSend={() => {
                  setSendTargetAsset(undefined);
                  setIsSendOpen(true);
                }}
                onOpenReceive={() => setIsReceiveOpen(true)}
                onOpenBuy={() => setIsBuyOpen(true)}
                onGoToSwap={() => setActiveTab('swap')}
                onGoToStaking={() => setActiveTab('staking')}
              />

              <AssetList
                assets={assets}
                selectedChain={selectedChain}
                currentFiat={currentFiat}
                fiatRates={fiatRates}
                currentLang={currentLang}
                onSendAsset={(asset) => {
                  setSendTargetAsset(asset);
                  setIsSendOpen(true);
                }}
                onReceiveAsset={(asset) => {
                  setReceiveTargetChain(asset.chainId);
                  setIsReceiveOpen(true);
                }}
                onSwapAsset={(asset) => {
                  setActiveTab('swap');
                }}
                onStakeAsset={(asset) => {
                  setActiveTab('staking');
                }}
              />
            </>
          )}

          {activeTab === 'swap' && (
            <SwapTab
              assets={assets}
              currentFiat={currentFiat}
              currentLang={currentLang}
              activeAccount={activeAccount}
              onExecuteSwap={handleExecuteSwap}
            />
          )}

          {activeTab === 'staking' && (
            <StakingTab
              stakingPools={stakingPools}
              assets={assets}
              currentFiat={currentFiat}
              currentLang={currentLang}
              activeAccount={activeAccount}
              onUpdatePools={handleUpdatePools}
            />
          )}

          {activeTab === 'nfts' && (
            <NftGallery
              nfts={nfts}
              currentFiat={currentFiat}
              currentLang={currentLang}
              activeAccount={activeAccount}
              onTransferNft={handleTransferNft}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              assets={assets}
              categories={categories}
              currentFiat={currentFiat}
              currentLang={currentLang}
              activeAccount={activeAccount}
              onUpdateCategories={setCategories}
              onUpdateAccountLimits={handleUpdateAccountLimits}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab
              transactions={transactions}
              currentFiat={currentFiat}
              currentLang={currentLang}
              activeAccount={activeAccount}
              totalNetWorth={totalNetWorthUsd}
            />
          )}

          {activeTab === 'security' && (
            <SecurityTab
              currentLang={currentLang}
              isBiometricsEnabled={isBiometricsEnabled}
              onToggleBiometrics={() => {
                const nextState = !isBiometricsEnabled;
                setIsBiometricsEnabled(nextState);
                addNotification(
                  'Biometric Passkey',
                  nextState ? 'Touch ID / Face ID quick unlock enabled.' : 'Biometric unlock disabled.',
                  'security'
                );
              }}
              is2FAEnabled={is2FAEnabled}
              onToggle2FA={(code) => {
                if (is2FAEnabled) {
                  setIs2FAEnabled(false);
                  addNotification('2FA Security', 'Two-Factor Authentication disabled.', 'security');
                  return true;
                } else {
                  setIs2FAEnabled(true);
                  addNotification('2FA Security', 'Two-Factor Authentication successfully activated.', 'security');
                  return true;
                }
              }}
              hardwareDevice={hardwareDevice}
              onPairHardware={(device) => {
                setHardwareDevice({
                  name: device,
                  model: `${device} USB/BLE`,
                  status: 'connected',
                  firmware: 'v2.2.4',
                  battery: 98,
                });
                addNotification('Hardware Key Attached', `${device} paired and ready for cold signing.`, 'security');
              }}
              onDisconnectHardware={() => {
                setHardwareDevice((prev) => ({ ...prev, status: 'disconnected' }));
                addNotification('Hardware Key Disconnected', 'Ledger disconnected from active session.', 'security');
              }}
            />
          )}
        </main>
      </div>

      {/* Modals & Drawers */}
      <SendModal
        isOpen={isSendOpen}
        onClose={() => setIsSendOpen(false)}
        assets={assets}
        initialAsset={sendTargetAsset}
        currentFiat={currentFiat}
        currentLang={currentLang}
        onConfirmSend={handleConfirmSend}
        activeAccount={activeAccount}
        is2FAEnabled={is2FAEnabled}
      />

      <ReceiveModal
        isOpen={isReceiveOpen}
        onClose={() => setIsReceiveOpen(false)}
        assets={assets}
        initialChain={receiveTargetChain}
        currentFiat={currentFiat}
        currentLang={currentLang}
        activeAccount={activeAccount}
      />

      <BuyModal
        isOpen={isBuyOpen}
        onClose={() => setIsBuyOpen(false)}
        assets={assets}
        currentFiat={currentFiat}
        currentLang={currentLang}
        activeAccount={activeAccount}
        onConfirmBuy={handleConfirmBuy}
      />

      <MobileWidgetModal
        isOpen={isMobileWidgetOpen}
        onClose={() => setIsMobileWidgetOpen(false)}
        totalUsd={totalNetWorthUsd}
        currentFiat={currentFiat}
        currentLang={currentLang}
        activeAccount={activeAccount}
        onQuickSend={(tag) => {
          setIsSendOpen(true);
        }}
        onQuickBuy={() => {
          setIsBuyOpen(true);
        }}
      />

      <NotificationDrawer
        isOpen={isNotifDrawerOpen}
        onClose={() => setIsNotifDrawerOpen(false)}
        notifications={notifications}
        currentLang={currentLang}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onClearAll={() => setNotifications([])}
      />

      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        onAddAccount={(newAcc) => {
          setAccounts((prev) => [...prev, newAcc]);
          setActiveAccount(newAcc);
          addNotification(
            'New Vault Created',
            `Created ${newAcc.name} (${newAcc.cryptoTag}) with $${newAcc.dailySpendingLimit?.toLocaleString()} daily limit.`,
            'security'
          );
        }}
      />

      {/* Lock Screen */}
      <LockScreen
        isLocked={isLocked}
        onUnlock={() => setIsLocked(false)}
        activeAccount={activeAccount}
        currentLang={currentLang}
        isBiometricsEnabled={isBiometricsEnabled}
      />
    </div>
  );
}
