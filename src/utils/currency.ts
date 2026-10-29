import { FiatCurrency, FiatRateMap } from '../types';

export const FIAT_RATES: FiatRateMap = {
  USD: { rate: 1.0, symbol: '$', name: 'US Dollar', prefix: true, change24h: 0.0 },
  EUR: { rate: 0.92, symbol: '€', name: 'Euro', prefix: false, change24h: 0.12 },
  KZT: { rate: 512.4, symbol: '₸', name: 'Kazakhstani Tenge', prefix: false, change24h: -0.28 },
  RUB: { rate: 96.2, symbol: '₽', name: 'Russian Ruble', prefix: false, change24h: 0.35 },
  KGS: { rate: 87.3, symbol: 'сом', name: 'Kyrgyzstani Som', prefix: false, change24h: -0.05 },
  UZS: { rate: 12850, symbol: "so'm", name: 'Uzbekistani Som', prefix: false, change24h: 0.08 },
};

export function convertUsdToFiat(
  amountUsd: number,
  targetFiat: FiatCurrency,
  dynamicRates?: FiatRateMap
): number {
  const rates = dynamicRates || FIAT_RATES;
  const rate = rates[targetFiat]?.rate || 1.0;
  return amountUsd * rate;
}

export function convertFiatToUsd(
  amountFiat: number,
  fromFiat: FiatCurrency,
  dynamicRates?: FiatRateMap
): number {
  const rates = dynamicRates || FIAT_RATES;
  const rate = rates[fromFiat]?.rate || 1.0;
  return amountFiat / rate;
}

export function formatFiat(
  amountUsd: number,
  currency: FiatCurrency,
  decimals: number = 2,
  dynamicRates?: FiatRateMap
): string {
  const rates = dynamicRates || FIAT_RATES;
  const config = rates[currency] || rates.USD;
  const value = convertUsdToFiat(amountUsd, currency, rates);

  // Large values like UZS or KZT usually don't need cents if large
  let formattedNumber: string;
  if (currency === 'UZS' || (currency === 'KZT' && value > 1000)) {
    formattedNumber = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(Math.round(value));
  } else {
    formattedNumber = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(value);
  }

  if (config.prefix) {
    return `${config.symbol}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${config.symbol}`;
  }
}

export function formatCrypto(amount: number, symbol: string, maxDecimals: number = 6): string {
  const decimals = amount >= 1000 ? 2 : amount >= 1 ? 4 : maxDecimals;
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 2,
  }).format(amount);
  return `${formatted} ${symbol}`;
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
