import { useTranslation } from '../i18n/I18n'

export function LanguageToggle() {
  const { language, setLanguage, t } = useTranslation()
  return <div className="language-toggle" role="group" aria-label={t('language.label')}><button type="button" className={language === 'fr' ? 'active' : ''} aria-pressed={language === 'fr'} onClick={() => setLanguage('fr')}>FR</button><button type="button" className={language === 'en' ? 'active' : ''} aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button></div>
}
