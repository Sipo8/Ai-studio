export type ChainId =
  | 'bitcoin'
  | 'ethereum'
  | 'solana'
  | 'base'
  | 'monad'
  | 'bsc'
  | 'arbitrum'
  | 'polygon'
  | 'near'
  | 'ton'
  | 'morph'
  | 'plasma'
  | 'robinhood'
  | 'mantle'
  | 'tron'
  | 'circle';

export type FiatCurrency = 'USD' | 'EUR' | 'KZT' | 'RUB' | 'KGS' | 'UZS';

export type LanguageCode = 'en' | 'ru' | 'kz' | 'uz' | 'kg';

export interface ChainInfo {
  id: ChainId;
  name: string;
  symbol: string;
  iconBg: string;
  type: 'UTXO' | 'EVM' | 'SVM' | 'TVM' | 'NEAR';
  rpcStatus: 'online' | 'congested' | 'fast';
  gasLabel: string;
  blockTime: string;
  explorerUrl: string;
}

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  chainId: ChainId;
  balance: number;
  usdPrice: number;
  change24h: number;
  iconBg: string;
  contractAddress?: string;
  isStakable?: boolean;
  stakedAmount?: number;
  apy?: number;
  decimals: number;
  lastPriceDelta?: number;
  priceFlash?: 'up' | 'down' | null;
}

export interface FiatRateInfo {
  rate: number;
  symbol: string;
  name: string;
  prefix: boolean;
  change24h?: number;
  lastDelta?: number;
  priceFlash?: 'up' | 'down' | null;
}

export type FiatRateMap = Record<FiatCurrency, FiatRateInfo>;

export interface NFTItem {
  id: string;
  name: string;
  collection: string;
  chainId: ChainId;
  imageUrl: string;
  floorPrice: number;
  floorCurrency: string;
  estimatedUsd: number;
  rarityScore: number;
  rarityRank: string;
  tokenId: string;
  attributes: { trait_type: string; value: string }[];
}

export interface Transaction {
  id: string;
  hash: string;
  type: 'send' | 'receive' | 'swap' | 'stake' | 'unstake' | 'buy' | 'reward';
  chainId: ChainId;
  assetSymbol: string;
  amount: number;
  usdValue: number;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
  from: string;
  to: string;
  feeUsd: number;
  category: 'Transfers' | 'Trading' | 'Staking' | 'Shopping' | 'Family Budget' | 'Gas Fees';
  note?: string;
  recipientTag?: string;
  recipientPhone?: string;
}

export interface StakingPool {
  id: string;
  assetSymbol: string;
  chainId: ChainId;
  validatorName: string;
  apy: number;
  totalStakedUsd: number;
  userStaked: number;
  rewardsPending: number;
  lockupPeriod: string;
  status: 'active' | 'cooldown';
}

export interface WalletAccount {
  id: string;
  name: string;
  type: 'personal' | 'trading' | 'family' | 'hardware';
  address: string;
  cryptoTag: string;
  phoneNumber?: string;
  color: string;
  dailySpendingLimit?: number;
  monthlySpendingLimit?: number;
  currentDailySpent: number;
  currentMonthlySpent: number;
  isHardware?: boolean;
  hardwareDevice?: 'Ledger Nano X' | 'Trezor Safe 3' | 'Keystone 3 Pro';
}

export interface BudgetCategory {
  id: string;
  name: string;
  limitUsd: number;
  spentUsd: number;
  color: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  type: 'tx_success' | 'tx_received' | 'limit_alert' | 'price_alert' | 'security';
  read: boolean;
  txHash?: string;
}

export interface HardwareDeviceConnection {
  name: string;
  model: string;
  status: 'disconnected' | 'connecting' | 'connected';
  firmware: string;
  battery?: number;
}
