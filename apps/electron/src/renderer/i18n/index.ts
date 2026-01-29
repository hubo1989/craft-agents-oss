import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@locales/en/chat.json'
import commonEn from '@locales/en/common.json'
import onboardingEn from '@locales/en/onboarding.json'
import settingsEn from '@locales/en/settings.json'
import zh from '@locales/zh-CN/chat.json'
import commonZh from '@locales/zh-CN/common.json'
import onboardingZh from '@locales/zh-CN/onboarding.json'
import settingsZh from '@locales/zh-CN/settings.json'

// Get saved language preference or detect from system
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined' && window.electronAPI) {
    const saved = window.localStorage.getItem('craft-language')
    if (saved) return saved
  }
  // Detect from system
  const lang = navigator.language || 'en'
  return lang.startsWith('zh') ? 'zh-CN' : 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        chat: en,
        common: commonEn,
        onboarding: onboardingEn,
        settings: settingsEn,
      },
      'zh-CN': {
        chat: zh,
        common: commonZh,
        onboarding: onboardingZh,
        settings: settingsZh,
      },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'chat', 'onboarding', 'settings'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n
