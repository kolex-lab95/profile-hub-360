import { Sparkles } from './icons'

export function Brand({ compact = false }) {
  return <div className="brand" aria-label="Portfolio Hub">
    <span className="brand-mark"><Sparkles size={compact ? 16 : 19} strokeWidth={2.5} /></span>
    {!compact && <span><strong>portfolio</strong><em>hub</em></span>}
  </div>
}
