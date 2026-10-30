import { useCallback, useEffect, useRef, useState } from 'react'
import { HERO_SLIDES } from '../data/content'
import { ArrowLeft, ArrowRight } from './Icons'

const DUR = 6000

// Фото-слайдер у hero (режим «Фото»). Гортається автоматично; пауза лише коли вкладка прихована.
export default function HeroSlider({ active, heroRef }) {
  const [i, setI] = useState(0)
  const [run, setRun] = useState(0) // перезапуск анімації смужки прогресу
  const [paused, setPaused] = useState(false)
  const timer = useRef(null)
  const started = useRef(0)
  const left = useRef(DUR)
  const reset = useRef(false)
  const n = HERO_SLIDES.length
  // завантажуємо лише показані фото і наступне: решта не тягнеться, поки до неї не дійде черга
  const [ready, setReady] = useState(() => new Set([0, 1]))
  useEffect(() => {
    if (!active) return
    setReady(r => (r.has(i) && r.has((i + 1) % n) ? r : new Set([...r, i, (i + 1) % n])))
  }, [i, active, n])

  const go = useCallback(k => {
    setI(((k % n) + n) % n)
    setRun(r => r + 1)
    reset.current = true
  }, [n])

  // при перемиканні на «Фото» починаємо показ заново
  useEffect(() => { if (active) go(i) }, [active]) // eslint-disable-line react-hooks/exhaustive-deps

  // планування наступного слайда
  useEffect(() => {
    clearTimeout(timer.current)
    if (reset.current) { left.current = DUR; reset.current = false }
    if (!active || paused) return
    started.current = Date.now()
    timer.current = setTimeout(() => go(i + 1), left.current)
    return () => {
      clearTimeout(timer.current)
      left.current = Math.max(0, left.current - (Date.now() - started.current))
    }
  }, [active, paused, i, run, go])

  // слайди гортаються завжди, навіть коли курсор на фото;
  // пауза лише коли вкладка браузера прихована (щоб не «наздоганяти» слайди після повернення)
  useEffect(() => {
    const vis = () => setPaused(document.hidden)
    document.addEventListener('visibilitychange', vis)
    return () => document.removeEventListener('visibilitychange', vis)
  }, [])

  // стрілки клавіатури та свайп
  useEffect(() => {
    const hero = heroRef.current
    if (!active || !hero) return
    const key = e => {
      if (window.scrollY > hero.offsetHeight * 0.5) return
      if (e.key === 'ArrowLeft') go(i - 1)
      if (e.key === 'ArrowRight') go(i + 1)
    }
    let sx = null
    const ts = e => { sx = e.touches[0].clientX }
    const te = e => {
      if (sx === null) return
      const dx = e.changedTouches[0].clientX - sx
      if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1))
      sx = null
    }
    window.addEventListener('keydown', key)
    hero.addEventListener('touchstart', ts, { passive: true })
    hero.addEventListener('touchend', te, { passive: true })
    return () => {
      window.removeEventListener('keydown', key)
      hero.removeEventListener('touchstart', ts)
      hero.removeEventListener('touchend', te)
    }
  }, [active, i, go, heroRef])

  useEffect(() => { heroRef.current?.classList.toggle('slider-paused', paused) }, [paused, heroRef])

  return (
    <>
      <div className="slider" aria-roledescription="carousel" aria-label="Фото">
        {HERO_SLIDES.map((s, k) => (
          <div key={s.src} className={'slide' + (k === i ? ' on' : '')} aria-hidden={k !== i}>
            {active && ready.has(k) && <img src={s.src} alt={s.alt} decoding="async" fetchPriority={k === i ? 'high' : 'low'} />}
          </div>
        ))}
      </div>
      <div className="sl-ui">
        <div className="sl-count" aria-live="polite"><b>{i + 1}</b> / {n}</div>
        <div className="sl-dots" style={{ '--dur': DUR / 1000 + 's' }}>
          {HERO_SLIDES.map((s, k) => (
            <button key={s.src} type="button" aria-label={'Фото ' + (k + 1)} className={k === i ? 'on' : k < i ? 'done' : ''} onClick={() => go(k)}>
              <i key={k === i ? 'on' + run : 'off'} />
            </button>
          ))}
        </div>
        <div className="sl-nav">
          <button type="button" className="sl-arrow" aria-label="Попереднє фото" onClick={() => go(i - 1)}><ArrowLeft /></button>
          <button type="button" className="sl-arrow" aria-label="Наступне фото" onClick={() => go(i + 1)}><ArrowRight /></button>
        </div>
      </div>
    </>
  )
}
