import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Percent,
  CheckCircle2,
  Lock,
  Unlock,
  Coins,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StakingPool, CryptoAsset, FiatCurrency, LanguageCode, Transaction, WalletAccount } from '../types';
import { formatCrypto, formatFiat } from '../utils/currency';
import { TRANSLATIONS } from '../i18n/translations';
import { CHAINS_CONFIG } from '../data/mockData';

interface StakingTabProps {
  stakingPools: StakingPool[];
  assets: CryptoAsset[];
  currentFiat: FiatCurrency;
  currentLang: LanguageCode;
  activeAccount: WalletAccount;
  onUpdatePools: (pools: StakingPool[], newTx?: Transaction, updatedAsset?: CryptoAsset) => void;
}

export const StakingTab: React.FC<StakingTabProps> = ({
  stakingPools,
  assets,
  currentFiat,
  currentLang,
  activeAccount,
  onUpdatePools,
}) => {
  const t = TRANSLATIONS[currentLang];

  const [activeModal, setActiveModal] = useState<{ pool: StakingPool; action: 'stake' | 'unstake' } | null>(null);
  const [modalAmount, setModalAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live reward tick simulation
  useEffect(() => {
    const timer = setInterval(() => {
      const updated = stakingPools.map((p) => {
        if (p.userStaked > 0) {
          const perSecondGrowth = (p.userStaked * (p.apy / 100)) / (365 * 24 * 3600);
          return {
            ...p,
            rewardsPending: p.rewardsPending + perSecondGrowth * 2,
          };
        }
        return p;
      });
      onUpdatePools(updated);
    }, 2000);

    return () => clearInterval(timer);
  }, [stakingPools]);

  const totalStakedUsd = stakingPools.reduce((sum, p) => {
    const asset = assets.find((a) => a.symbol === p.assetSymbol);
    const price = asset?.usdPrice || 1;
    return sum + p.userStaked * price;
  }, 0);

  const totalRewardsUsd = stakingPools.reduce((sum, p) => {
    const asset = assets.find((a) => a.symbol === p.assetSymbol);
    const price = asset?.usdPrice || 1;
    return sum + p.rewardsPending * price;
  }, 0);

  const handleClaim = (pool: StakingPool) => {
    if (pool.rewardsPending <= 0) return;

    const asset = assets.find((a) => a.symbol === pool.assetSymbol);
    if (!asset) return;

    const claimed = pool.rewardsPending;
    const usdVal = claimed * asset.usdPrice;

    const updatedPools = stakingPools.map((p) =>
      p.id === pool.id ? { ...p, rewardsPending: 0 } : p
    );

    const updatedAsset: CryptoAsset = {
      ...asset,
      balance: asset.balance + claimed,
    };

    const newTx: Transaction = {
      id: `tx-reward-${Date.now()}`,
      hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
      type: 'reward',
      chainId: pool.chainId,
      assetSymbol: pool.assetSymbol,
      amount: claimed,
      usdValue: usdVal,
      timestamp: Date.now(),
      status: 'completed',
      from: `${pool.validatorName} Staking Contract`,
      to: activeAccount.address,
      feeUsd: 0.0,
      category: 'Staking',
      note: `Claimed ${claimed.toFixed(4)} ${pool.assetSymbol} staking rewards`,
    };

    try {
      confetti({ particleCount: 70, spread: 50, origin: { y: 0.7 } });
    } catch {
      // ignore
    }

    onUpdatePools(updatedPools, newTx, updatedAsset);
  };

  const handleModalSubmit = () => {
    if (!activeModal) return;
    const amt = parseFloat(modalAmount) || 0;
    if (amt <= 0) return;

    const pool = activeModal.pool;
    const asset = assets.find((a) => a.symbol === pool.assetSymbol);
    if (!asset) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      let updatedPools = [...stakingPools];
      let updatedAsset = { ...asset };

      if (activeModal.action === 'stake') {
        if (amt > asset.balance) return;
        updatedAsset.balance = Math.max(0, asset.balance - amt);
        updatedPools = updatedPools.map((p) =>
          p.id === pool.id ? { ...p, userStaked: p.userStaked + amt } : p
        );
      } else {
        if (amt > pool.userStaked) return;
        updatedAsset.balance = asset.balance + amt;
        updatedPools = updatedPools.map((p) =>
          p.id === pool.id ? { ...p, userStaked: Math.max(0, p.userStaked - amt) } : p
        );
      }

      const newTx: Transaction = {
        id: `tx-stake-${Date.now()}`,
        hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        type: activeModal.action === 'stake' ? 'stake' : 'unstake',
        chainId: pool.chainId,
        assetSymbol: pool.assetSymbol,
        amount: amt,
        usdValue: amt * asset.usdPrice,
        timestamp: Date.now(),
        status: 'completed',
        from: activeModal.action === 'stake' ? activeAccount.address : `${pool.validatorName} Vault`,
        to: activeModal.action === 'stake' ? `${pool.validatorName} Vault` : activeAccount.address,
        feeUsd: 0.08,
        category: 'Staking',
        note: `${activeModal.action === 'stake' ? 'Staked' : 'Unstaked'} ${amt} ${pool.assetSymbol}`,
      };

      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }

      onUpdatePools(updatedPools, newTx, updatedAsset);
      setActiveModal(null);
      setModalAmount('');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.stakingTitle}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Audited PoS Yield
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {t.stakingDesc}
          </p>
        </div>

        {/* Global Staking Stats */}
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400">Total Active Stake</div>
            <div className="text-base font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatFiat(totalStakedUsd, currentFiat)}
            </div>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div>
            <div className="text-[10px] font-semibold uppercase text-slate-400">Accrued Rewards</div>
            <div className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatFiat(totalRewardsUsd, currentFiat)}
            </div>
          </div>
        </div>
      </div>

      {/* Pools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stakingPools.map((pool) => {
          const chain = CHAINS_CONFIG[pool.chainId];
          const asset = assets.find((a) => a.symbol === pool.assetSymbol);
          const price = asset?.usdPrice || 1;
          const userStakedUsd = pool.userStaked * price;
          const rewardsUsd = pool.rewardsPending * price;

          return (
            <div
              key={pool.id}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all group"
            >
              <div>
                {/* Pool Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0"
                      style={{ backgroundColor: chain?.iconBg || '#3B82F6' }}
                    >
                      {pool.assetSymbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {pool.assetSymbol} Staking
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-emerald-500" />
                        <span>{pool.validatorName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase font-semibold">APY</div>
                    <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {pool.apy}%
                    </div>
                  </div>
                </div>

                {/* Staked & Rewards Details */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-2 mb-4 text-xs">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                    <span>{t.userStaked}:</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatCrypto(pool.userStaked, pool.assetSymbol)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Stake Value:</span>
                    <span className="font-mono">{formatFiat(userStakedUsd, currentFiat)}</span>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-700" />
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Pending Rewards:
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {pool.rewardsPending.toFixed(5)} {pool.assetSymbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Lockup: {pool.lockupPeriod}
                    </span>
                    <span className="font-mono">≈ {formatFiat(rewardsUsd, currentFiat)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleClaim(pool)}
                  disabled={pool.rewardsPending <= 0}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 dark:text-emerald-300 transition-colors disabled:opacity-40"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{t.claimRewards}</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveModal({ pool, action: 'stake' })}
                    className="py-2 px-3 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors text-center"
                  >
                    {t.stakeMore}
                  </button>

                  <button
                    onClick={() => setActiveModal({ pool, action: 'unstake' })}
                    disabled={pool.userStaked <= 0}
                    className="py-2 px-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-center disabled:opacity-40"
                  >
                    {t.unstake}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stake / Unstake Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize mb-1">
              {activeModal.action} {activeModal.pool.assetSymbol}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {activeModal.pool.validatorName} ({activeModal.pool.apy}% APY)
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>Enter Amount</span>
                  <span className="font-mono">
                    {activeModal.action === 'stake' ? 'Wallet Balance' : 'Active Stake'}:{' '}
                    {activeModal.action === 'stake'
                      ? formatCrypto(
                          assets.find((a) => a.symbol === activeModal.pool.assetSymbol)?.balance || 0,
                          activeModal.pool.assetSymbol
                        )
                      : formatCrypto(activeModal.pool.userStaked, activeModal.pool.assetSymbol)}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={modalAmount}
                    onChange={(e) => setModalAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (activeModal.action === 'stake') {
                        const bal = assets.find((a) => a.symbol === activeModal.pool.assetSymbol)?.balance || 0;
                        setModalAmount(bal.toString());
                      } else {
                        setModalAmount(activeModal.pool.userStaked.toString());
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  >
                    MAX
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setActiveModal(null)}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleModalSubmit}
                  disabled={isSubmitting || parseFloat(modalAmount) <= 0}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Confirming...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
