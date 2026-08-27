'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { translations, type Language, type TranslationSchema } from '@/lib/i18n/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: TranslationSchema
  isZh: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('omnilink_lang') as Language | null
        if (stored === 'zh' || stored === 'en') {
          return stored
        }
      } catch {}
    }
    return 'zh'
  })

  useEffect(() => {
    try {
      document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
    } catch {}
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('omnilink_lang', lang)
      document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    } catch {}
  }

  const toggleLanguage = () => {
    setLanguageState((prev) => {
      const next = prev === 'zh' ? 'en' : 'zh'
      try {
        localStorage.setItem('omnilink_lang', next)
        document.documentElement.lang = next === 'zh' ? 'zh-CN' : 'en'
      } catch {}
      return next
    })
  }

  const t: TranslationSchema = translations[language] || translations.zh

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        isZh: language === 'zh',
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext)
  if (!context) {
    return {
      language: 'zh',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: translations.zh,
      isZh: true,
    }
  }
  return context
}
