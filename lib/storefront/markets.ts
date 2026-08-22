/**
 * Storefront Preview Markets
 * Demo Scope: China (CN) + United States (US) ONLY
 * Completely decoupled from language selection.
 */

export interface PreviewMarket {
  code: 'CN' | 'US'
  nameZh: string
  nameEn: string
  currency: 'CNY' | 'USD'
  currencySymbol: string
  defaultLanguage: 'zh' | 'en'
  flag: string
}

export const PREVIEW_MARKETS: PreviewMarket[] = [
  {
    code: 'CN',
    nameZh: '中国 (China)',
    nameEn: 'China (CN)',
    currency: 'CNY',
    currencySymbol: '¥',
    defaultLanguage: 'zh',
    flag: '🇨🇳',
  },
  {
    code: 'US',
    nameZh: '美国 (United States)',
    nameEn: 'United States (US)',
    currency: 'USD',
    currencySymbol: '$',
    defaultLanguage: 'en',
    flag: '🇺🇸',
  },
] as const

export function getMarketByCode(code: string): PreviewMarket {
  const found = PREVIEW_MARKETS.find((m) => m.code.toUpperCase() === code.toUpperCase())
  return found || PREVIEW_MARKETS[0]
}
