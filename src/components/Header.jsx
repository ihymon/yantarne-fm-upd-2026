import { useEffect, useState } from 'react'
import logo from '../assets/logo.webp'
import { NAV } from '../data/station'

export default function Header({ view, onView }) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  return (
    <header id="header" className={scrolled ? 'scrolled' : ''}>
      <div className="wrap head">
        <a className="logo" href="#top" aria-label="На головну"><img src={logo} alt="Yantarne FM" width="111" height="44" /></a>
        <nav className="main" aria-label="Розділи">
          {NAV.map(([id, label]) => <a key={id} href={'#' + id}>{label}</a>)}
        </nav>
        <div className="head-r">
          <div className="vt" role="group" aria-label="Вигляд головної">
            <button type="button" aria-pressed={view === 'graphic'} onClick={() => onView('graphic')}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 18V12M9 18V6M14 18v-9M19 18v-4" /></svg><span className="vt-l">Графіка</span>
            </button>
            <button type="button" aria-pressed={view === 'photo'} onClick={() => onView('photo')}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><circle cx="9" cy="10" r="1.6" /><path d="m21 16-5-5-9 8" /></svg><span className="vt-l">Фото</span>
            </button>
          </div>
          <div className="live"><i></i>В ЕФІРІ</div>
        </div>
      </div>
    </header>
  )
}
