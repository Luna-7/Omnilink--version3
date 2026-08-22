/**
 * Store base currency constants and helpers
 * Demo scope: CNY and USD only
 */

export type StoreBaseCurrency = 'CNY' | 'USD'

export interface CurrencyConfig {
  code: StoreBaseCurrency
  labelZh: string
  labelEn: string
  symbol: string
  nameZh: string
  nameEn: string
}

export const SUPPORTED_STORE_CURRENCIES: Record<StoreBaseCurrency, CurrencyConfig> = {
  CNY: {
    code: 'CNY',
    labelZh: 'CNY (人民币 ¥)',
    labelEn: 'CNY (Chinese Yuan ¥)',
    symbol: '¥',
    nameZh: '人民币',
    nameEn: 'Chinese Yuan',
  },
  USD: {
    code: 'USD',
    labelZh: 'USD (美元 $)',
    labelEn: 'USD (US Dollar $)',
    symbol: '$',
    nameZh: '美元',
    nameEn: 'US Dollar',
  },
}

export const DEMO_EXCHANGE_RATES = {
  USD_TO_CNY: 7.20,
  CNY_TO_USD: 0.1389,
}

export function convertPrice(
  price: number | string,
  fromCurrency: string = 'CNY',
  toCurrency: string = 'CNY'
): number {
  const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0
  const from = (fromCurrency || 'CNY').toUpperCase()
  const to = (toCurrency || 'CNY').toUpperCase()

  if (from === to) {
    return numPrice
  }

  if (from === 'USD' && to === 'CNY') {
    return Math.round(numPrice * DEMO_EXCHANGE_RATES.USD_TO_CNY * 100) / 100
  }

  if (from === 'CNY' && to === 'USD') {
    return Math.round(numPrice * DEMO_EXCHANGE_RATES.CNY_TO_USD * 100) / 100
  }

  return numPrice
}

export function formatPriceWithCurrency(
  price: number | string,
  currency: string = 'CNY',
  locale: 'zh' | 'en' = 'zh'
): string {
  const numPrice = typeof price === 'number' ? price : parseFloat(price) || 0
  const upperCurr = (currency || 'CNY').toUpperCase()
  const symbol = upperCurr === 'USD' ? '$' : '¥'

  return `${symbol}${numPrice.toFixed(2)}`
}

