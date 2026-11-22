import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from './icons'
import { horizontalScrollState } from '../utils/scrollState'

export function SkillFilter({ skills, value, onChange }) {
  const scrollerRef = useRef(null)
  const [scrollState, setScrollState] = useState({ canScrollBack: false, canScrollForward: false })
  const measure = useCallback(() => {
    const scroller = scrollerRef.current
    if (scroller) setScrollState(horizontalScrollState(scroller))
  }, [])

  useEffect(() => {
    measure()
    const scroller = scrollerRef.current
    if (!scroller) return undefined
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(scroller)
    window.addEventListener('resize', measure)
    return () => { observer?.disconnect(); window.removeEventListener('resize', measure) }
  }, [skills, measure])

  const scroll = (direction) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    scroller.scrollBy({ left: direction * Math.max(scroller.clientWidth * 0.72, 160), behavior: 'smooth' })
    window.requestAnimationFrame(measure)
  }

  return <div className="skills-filter skill-filter-scrollable">
    <button className={`skill-filter-all ${!value ? 'active' : ''}`} onClick={() => onChange('')}>Toutes les compétences</button>
    <div className="skills-scroll-shell">
      {scrollState.canScrollBack && <button className="skill-scroll-control previous" onClick={() => scroll(-1)} aria-label="Voir les compétences précédentes"><ArrowLeft size={15} /></button>}
      <div ref={scrollerRef} className="skills-scroll" tabIndex="0" role="region" aria-label="Compétences" onScroll={measure} onKeyDown={(event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); scroll(-1) } if (event.key === 'ArrowRight') { event.preventDefault(); scroll(1) } }}>{skills.map((item) => <button key={item} className={value === item ? 'active' : ''} onClick={() => onChange(item)}>{item}</button>)}</div>
      {scrollState.canScrollForward && <button className="skill-scroll-control next" onClick={() => scroll(1)} aria-label="Voir les compétences suivantes"><ArrowRight size={15} /></button>}
    </div>
  </div>
}
