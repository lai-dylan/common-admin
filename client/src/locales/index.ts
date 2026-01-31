import i18next from 'i18next'
import en from './en.json'
import zh from './zh.json'

export const supportedLanguages = [
  { code: 'zh', name: '中文', file: zh },
  { code: 'en', name: 'English', file: en },
]

export function initI18n() {
  const savedLanguage = localStorage.getItem('language') || 'zh'

  supportedLanguages.forEach(({ code, file }) => {
    i18next.addResources(code, 'translation', file)
  })

  i18next.init({
    lng: savedLanguage,
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false,
    },
  })

  return i18next
}

export function changeLanguage(lang: string) {
  i18next.changeLanguage(lang)
  localStorage.setItem('language', lang)
}

export function getCurrentLanguage() {
  return i18next.language
}
