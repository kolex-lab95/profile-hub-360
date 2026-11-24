import { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../i18n/I18n'
import { Languages } from './icons'

export function LanguageToggle() {
  const { language, setLanguage, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const openRef = useRef(open)
  const toggleRef = useRef(null)
  openRef.current = open

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key !== 'Escape' || !openRef.current) return
      setOpen(false)
      toggleRef.current?.focus()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [])

  const chooseLanguage = (nextLanguage) => {
    setLanguage(nextLanguage)
    setOpen(false)
    toggleRef.current?.focus()
  }

  return <div className="language-toggle" role="group" aria-label={t('language.label')}>
    <div className="language-toggle-expanded"><button type="button" className={language === 'fr' ? 'active' : ''} aria-pressed={language === 'fr'} onClick={() => chooseLanguage('fr')}>FR</button><button type="button" className={language === 'en' ? 'active' : ''} aria-pressed={language === 'en'} onClick={() => chooseLanguage('en')}>EN</button></div>
    <div className="language-toggle-compact"><button ref={toggleRef} type="button" className="language-toggle-trigger" aria-label={t('language.menu')} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}><Languages size={16} /><span className="language-toggle-current">{language.toUpperCase()}</span></button>{open && <div className="language-menu" role="menu" aria-label={t('language.menu')}><button type="button" role="menuitemradio" aria-checked={language === 'fr'} onClick={() => chooseLanguage('fr')}>{t('language.french')}</button><button type="button" role="menuitemradio" aria-checked={language === 'en'} onClick={() => chooseLanguage('en')}>{t('language.english')}</button></div>}</div>
  </div>
}
