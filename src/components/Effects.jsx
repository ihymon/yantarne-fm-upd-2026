import { useEffect, useRef } from 'react'

// Смужка прогресу прокрутки
export function ScrollProgress() {
  const ref = useRef(null)
  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (ref.current) ref.current.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%'
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on) }
  }, [])
  return <div className="progress" ref={ref} />
}

// Лише для десктопу з мишею: курсор-кільце, «магнітні» кнопки, нахил карток
export function DesktopFx() {
  const cursor = useRef(null)
  useEffect(() => {
    if (!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return
    let magnet = null, tilt = null
    const reset = el => { if (el) el.style.transform = '' }
    const move = e => {
      const c = cursor.current
      if (c) { c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px' }
      const t = e.target instanceof Element ? e.target : null
      c?.classList.toggle('big', !!t?.closest('a,button,.slot,.song'))

      const m = t?.closest('.magnet') || null
      if (m !== magnet) { reset(magnet); magnet = m }
      if (m) {
        const r = m.getBoundingClientRect()
        m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.25}px) scale(1.05)`
      }
      const tl = t?.closest('.tilt') || null
      if (tl !== tilt) { reset(tilt); tilt = tl }
      if (tl) {
        const r = tl.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5
        tl.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-8px)`
      }
    }
    const out = e => { if (!e.relatedTarget) { reset(magnet); reset(tilt); magnet = tilt = null } }
    window.addEventListener('mousemove', move)
    document.addEventListener('mouseout', out)
    return () => { window.removeEventListener('mousemove', move); document.removeEventListener('mouseout', out) }
  }, [])
  return <div className="cursor" ref={cursor} aria-hidden="true" />
}
