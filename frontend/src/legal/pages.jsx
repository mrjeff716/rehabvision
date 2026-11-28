// =============================================================================
// pages.jsx — the policy pages, each in English, French and Arabic.
// The text lives in content/{en,fr,ar}.jsx; the app's language setting picks one.
//
// DRAFTS: have them reviewed by a lawyer before launch, and the French and
// Arabic by a native speaker. If the app changes what it collects or who it
// shares with, update all three languages.
// =============================================================================

import LegalLayout from './LegalLayout'
import en from './content/en'
import fr from './content/fr'
import ar from './content/ar'
import { useLang } from '../i18n/AppLanguage'

const CONTENT = { en, fr, ar }

const makePage = (key) => function LegalPage() {
  const { lang } = useLang()
  const page = (CONTENT[lang] ?? en)[key]
  return (
    <LegalLayout title={page.title}>
      <page.Body />
    </LegalLayout>
  )
}

export const PrivacyPage = makePage('privacy')
export const TermsPage = makePage('terms')
export const PricingPage = makePage('pricing')
export const CookiesPage = makePage('cookies')
export const AccessibilityPage = makePage('accessibility')
