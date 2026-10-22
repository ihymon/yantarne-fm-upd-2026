import { useEffect, useRef, useState } from 'react'
import { useJukebox, fmtLeft, daysWord, MIN_PRICE } from '../context/JukeboxContext'

export const initials = name => name.split(/\s+/).filter(w => /^[\p{L}]/u.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase()
const left01 = (p, now) => Math.max(0, Math.min(1, (p.until - now) / (p.days * 864e5)))

// Логотипи партнерів «підстрибують» на головному екрані.
// Під час завантаження сторінки вони падають згори; ті, що додаються потім, з'являються одразу на «підлозі»
// і просто підстрибують. Фізика: гравітація + відскок від підлоги і стін; затихло — новий поштовх угору.
export default function JukeboxBubbles() {
  const { partners, setOpen, focusId } = useJukebox()
  const layer = useRef(null)
  const els = useRef({})
  const bodies = useRef({})
  const hovered = useRef(null)
  const mountedAt = useRef(performance.now())
  const [tip, setTip] = useState(null)
  const [, setTick] = useState(0)
  useEffect(() => { const id = setInterval(() => setTick(t => t + 1), 30000); return () => clearInterval(id) }, [])
  const now = Date.now()
  const items = partners.filter(p => p.until > now).slice(0, 10)

  useEffect(() => {
    const box = layer.current
    if (!box) return
    const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches
    let raf, last = performance.now()

    const step = t => {
      const dt = Math.min(0.033, (t - last) / 1000)
      last = t
      const W = box.clientWidth, H = box.clientHeight
      const floor = H - 24
      Object.entries(els.current).forEach(([id, el], i) => {
        if (!el) return
        const w = el.offsetWidth, h = el.offsetHeight
        let b = bodies.current[id]
        if (!b) {
          const x = 20 + Math.random() * Math.max(10, W - w - 40)
          const vx = (Math.random() < 0.5 ? -1 : 1) * (25 + Math.random() * 35)
          const onLoad = t - mountedAt.current < 1500
          b = bodies.current[id] = onLoad
            ? { x, y: -h - Math.random() * 200, vx, vy: 0, r: 0 } // при завантаженні — падає згори
            : { x, y: floor - h, vx, vy: -(320 + Math.random() * 140), r: 0 } // доданий пізніше — одразу підстрибує з підлоги
        }
        if (!reduce && hovered.current !== id) {
          b.vy += 520 * dt
          b.x += b.vx * dt
          b.y += b.vy * dt
          if (b.y + h > floor) {
            b.y = floor - h
            b.vy = -Math.abs(b.vy) * 0.72
            if (Math.abs(b.vy) < 160) b.vy = -(270 + Math.random() * 190)
          }
          if (b.x < 8) { b.x = 8; b.vx = Math.abs(b.vx) }
          if (b.x + w > W - 8) { b.x = W - 8 - w; b.vx = -Math.abs(b.vx) }
          b.r = Math.max(-12, Math.min(12, b.vx * 0.1 + b.vy * 0.01))
        } else if (reduce && b.y < 0) {
          b.y = floor - h - (i % 3) * 80
        }
        el.style.transform = `translate3d(${b.x}px,${b.y}px,0) rotate(${hovered.current === id ? 0 : b.r}deg)`
      })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  const show = (p, el) => {
    hovered.current = p.id
    const r = el.getBoundingClientRect(), pr = layer.current.getBoundingClientRect()
    setTip({ p, x: Math.min(pr.width - 310, Math.max(10, r.left - pr.left + r.width / 2 - 150)), y: r.top - pr.top })
  }
  const hide = () => { hovered.current = null; setTip(null) }

  return (
    <div className="jb-layer" ref={layer} aria-label="Партнери Yantarne.FM">
      {items.map(p => (
        <button
          key={p.id}
          type="button"
          ref={el => { els.current[p.id] = el; if (!el) { delete els.current[p.id]; delete bodies.current[p.id] } }}
          className={'jb-bubble' + (p.id === focusId ? ' fresh' : '')}
          onMouseEnter={e => show(p, e.currentTarget)}
          onMouseLeave={hide}
          onFocus={e => show(p, e.currentTarget)}
          onBlur={hide}
          onClick={() => setOpen(true)}
          aria-label={`Партнер ${p.name}, логотип на сайті ще ${fmtLeft(p.until - now)}`}
        >
          <PartnerLogo p={p} />
          <PartnerTag left={fmtLeft(p.until - now, true)} frac={left01(p, now)} />
        </button>
      ))}
      {tip && (
        <div className="jb-tip" style={{ left: tip.x, top: Math.max(8, tip.y - 196) }} role="tooltip">
          <small>ПАРТНЕР YANTARNE.FM</small>
          <b>{tip.p.name}</b>
          {tip.p.note && <span>«{tip.p.note}»</span>}
          <div className="jb-tip-meta">
            <div><i>На сайті ще</i><strong>{fmtLeft(tip.p.until - Date.now())}</strong></div>
            <div><i>Розміщення</i><strong>{daysWord(tip.p.days)}</strong></div>
          </div>
          <em>Хочете тут свій логотип? Від {MIN_PRICE} ₴ на день: натисніть на логотип</em>
        </div>
      )}
    </div>
  )
}

// Логотип у власних пропорціях (прямокутний лишається прямокутним)
export function PartnerLogo({ p }) {
  return (
    <span className="jb-logo">
      {p.logo ? <img src={p.logo} alt="" draggable="false" /> : <i>{initials(p.name || 'Лого')}</i>}
    </span>
  )
}

// Мітка «Партнер» + скільки лишилося, зі смужкою залишку терміну
export function PartnerTag({ left, frac }) {
  return (
    <span className="jb-tag">
      ПАРТНЕР · {left}
      <i aria-hidden="true"><b style={{ width: frac * 100 + '%' }} /></i>
    </span>
  )
}
