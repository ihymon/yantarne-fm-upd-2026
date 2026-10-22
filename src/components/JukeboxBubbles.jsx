import { useEffect, useRef, useState } from 'react'
import { useJukebox } from '../context/JukeboxContext'

const hhmm = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') }
export const initials = name => name.split(/\s+/).filter(w => /^[\p{L}]/u.test(w)).slice(0, 2).map(w => w[0]).join('').toUpperCase()

// Логотипи компаній і імена слухачів, які замовили пісню, «підстрибують» на головному екрані.
// Фізика проста: гравітація + відскок від «підлоги» і стін; коли м'ячик затихає — новий поштовх угору.
export default function JukeboxBubbles() {
  const { queue, setOpen, focusId } = useJukebox()
  const layer = useRef(null)
  const els = useRef({})
  const bodies = useRef({})
  const hovered = useRef(null)
  const [tip, setTip] = useState(null)
  const now = Date.now()
  const currentId = [...queue].filter(o => o.time <= now).pop()?.id
  const items = queue.slice(0, 9)

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
          // нове замовлення «падає» згори в випадковому місці
          b = bodies.current[id] = { x: 20 + Math.random() * Math.max(10, W - w - 40), y: -h - Math.random() * 200, vx: (Math.random() < 0.5 ? -1 : 1) * (25 + Math.random() * 35), vy: 0, r: 0 }
        }
        if (!reduce && hovered.current !== id) {
          b.vy += 520 * dt
          b.x += b.vx * dt
          b.y += b.vy * dt
          if (b.y + h > floor) {
            b.y = floor - h
            b.vy = -Math.abs(b.vy) * 0.72
            // затухло — підстрибуємо знову (поточна пісня стрибає вище)
            if (Math.abs(b.vy) < 160) b.vy = -(270 + Math.random() * 190) * (id === currentId ? 1.2 : 1)
          }
          if (b.x < 8) { b.x = 8; b.vx = Math.abs(b.vx) }
          if (b.x + w > W - 8) { b.x = W - 8 - w; b.vx = -Math.abs(b.vx) }
          b.r = Math.max(-14, Math.min(14, b.vx * 0.12 + b.vy * 0.01))
        } else if (reduce && b.y < 0) {
          b.y = floor - h - (i % 3) * 70
        }
        el.style.transform = `translate3d(${b.x}px,${b.y}px,0) rotate(${hovered.current === id ? 0 : b.r}deg)`
      })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [currentId])

  const show = (o, el) => {
    hovered.current = o.id
    const r = el.getBoundingClientRect(), pr = layer.current.getBoundingClientRect()
    setTip({ o, x: Math.min(pr.width - 290, Math.max(10, r.left - pr.left + r.width / 2 - 140)), y: r.top - pr.top })
  }
  const hide = () => { hovered.current = null; setTip(null) }

  return (
    <div className="jb-layer" ref={layer} aria-label="Замовлені пісні">
      {items.map(o => (
        <button
          key={o.id}
          type="button"
          ref={el => { els.current[o.id] = el; if (!el) delete bodies.current[o.id] }}
          className={'jb-bubble ' + o.kind + (o.id === currentId ? ' now' : '') + (o.id === focusId ? ' fresh' : '')}
          onMouseEnter={e => show(o, e.currentTarget)}
          onMouseLeave={hide}
          onFocus={e => show(o, e.currentTarget)}
          onBlur={hide}
          onClick={() => setOpen(true)}
          aria-label={`${o.name}: «${o.song.title}» о ${hhmm(o.time)}`}
        >
          {o.kind === 'company' && o.logo
            ? <img src={o.logo} alt="" draggable="false" />
            : <><i>{initials(o.name)}</i><span>{o.name}</span></>}
          {o.id === currentId && <em aria-hidden="true">♪</em>}
        </button>
      ))}
      {tip && (
        <div className="jb-tip" style={{ left: tip.x, top: Math.max(8, tip.y - 118) }} role="tooltip">
          <small>{tip.o.id === currentId ? '● ЗАРАЗ ГРАЄ' : 'О ' + hhmm(tip.o.time)}</small>
          <b>{tip.o.song.artist} — {tip.o.song.title}</b>
          <span>Замовлення від <strong>{tip.o.name}</strong>{tip.o.note ? ` · «${tip.o.note}»` : ''}</span>
        </div>
      )}
    </div>
  )
}
