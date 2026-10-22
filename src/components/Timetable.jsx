import { useEffect, useMemo, useRef, useState } from 'react'
import { TYPES, PROGRAMS, DAY_SHORT, DAY_FULL, fmt, dur, itemsForDay, itemKey } from '../data/schedule'
import { useClock } from '../context/ClockContext'
import { useReveal } from '../hooks/useReveal'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { ArrowLeft, ArrowRight } from './Icons'

const HW = 110 // px на годину
const HOURS = Array.from({ length: 24 }, (_, x) => fmt(x))
const hostText = p => (p.h ? '🎙 ' + p.h : TYPES[p.k].n)

function NowNext({ today, hours, current }) {
  const reveal = useReveal()
  const list = itemsForDay(today).filter(p => !p.ins && p.a >= current.b - 1e-6).sort((a, b) => a.a - b.a)
  const next = list[0] || itemsForDay((today + 1) % 7).filter(p => !p.ins).sort((a, b) => a.a - b.a)[0]
  const progress = ((hours - current.a) / (current.b - current.a)) * 100
  return (
    <div className="nownext reveal" ref={reveal}>
      <div className="nn-card nn-now">
        <div className="nn-top"><span className="live"><i></i>ЗАРАЗ</span><span className="nn-time">{fmt(current.a)} – {fmt(current.b)}</span></div>
        <b>{current.t}</b>
        <span className="nn-host">{hostText(current)}</span>
        <div className="nn-bar"><i style={{ width: progress + '%' }} /></div>
        <small>До кінця: {dur((current.b - hours) * 60)}</small>
      </div>
      <div className="nn-card">
        <div className="nn-top"><span className="tag-next">ДАЛІ</span><span className="nn-time">{fmt(next.a)} – {fmt(next.b)}</span></div>
        <b>{next.t}</b>
        <span className="nn-host">{hostText(next)}</span>
        <small>{list[0] ? 'Почнеться через ' + dur((next.a - hours) * 60) : 'Завтра'}</small>
      </div>
      <div className="nn-card nn-legend">
        <small className="nn-lab">ЛЕГЕНДА</small>
        <div className="legend">
          {Object.entries(TYPES).map(([k, T]) => <span key={k}><i style={{ background: T.bg }} />{T.n}</span>)}
        </div>
      </div>
    </div>
  )
}

function Detail({ item, day, today, hours, reminders, onRemind, flashKey }) {
  const reveal = useReveal()
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash')
  }, [flashKey])
  if (!item) return null
  const T = TYPES[item.k]
  const isToday = day === today
  const st = isToday && hours >= item.a && hours < item.b ? '● Зараз в ефірі' : isToday && hours >= item.b ? 'Вже завершилось' : DAY_FULL[day]
  const key = itemKey(day, item)
  const on = !!reminders[key]
  const canRemind = item.k !== 'music' && item.k !== 'ads'
  return (
    <div className="detail reveal" ref={el => { ref.current = el; reveal(el) }} aria-live="polite">
      <div className="dicon" style={{ background: T.bg, color: T.fg }}>{fmt(item.a).slice(0, 2)}</div>
      <div>
        <div className="dtype">{T.n.toUpperCase()}</div>
        <h3>{item.t}</h3>
        <p>{item.x}</p>
        <div className="dmeta">
          <span>🕒 {fmt(item.a)} – {fmt(item.b)} · {dur((item.b - item.a) * 60)}</span>
          {item.h && <span>🎙 {item.h}</span>}
          <span>{st}</span>
        </div>
      </div>
      {canRemind
        ? <button type="button" className={'remind' + (on ? ' on' : '')} aria-pressed={on} onClick={() => onRemind(key)}>{on ? '✓ Нагадаю' : '🔔 Нагадати'}</button>
        : <span />}
    </div>
  )
}

export default function Timetable() {
  const { today, hours, current, tick } = useClock()
  const [day, setDay] = useState(today)
  const [selected, setSelected] = useState(null)
  const [phase, setPhase] = useState(0) // 0 — приховано, 1 — з'являються, 2 — показано
  const [reminders, setReminders] = useLocalStorage('yfm-reminders', {})
  const notified = useRef({})
  const scroller = useRef(null)
  const drag = useRef({ down: false, moved: false, sx: 0, sl: 0 })
  const r1 = useReveal(), r2 = useReveal(), r3 = useReveal()

  const items = useMemo(() => itemsForDay(day), [day])
  const isToday = day === today

  const scrollToHour = (h, smooth) => scroller.current?.scrollTo({ left: Math.max(0, h * HW), behavior: smooth ? 'smooth' : 'auto' })

  // при зміні дня — анімація слотів, вибір програми, прокрутка до потрібної години
  useEffect(() => {
    setPhase(0)
    const id = setTimeout(() => setPhase(1), 40)
    const id2 = setTimeout(() => setPhase(2), 1400)
    const n = hours
    const cur = day === today ? PROGRAMS.find(p => p.d.includes(day) && n >= p.a && n < p.b) : null
    const first = cur || items.find(p => !p.ins && p.k !== 'music') || items[0]
    setSelected(first)
    scrollToHour(day === today ? n - 1.5 : first.a - 1, false)
    return () => { clearTimeout(id); clearTimeout(id2) }
  }, [day]) // eslint-disable-line react-hooks/exhaustive-deps

  // нагадування: браузерне сповіщення, коли програма починається (поки сайт відкритий)
  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
    PROGRAMS.forEach(p => {
      const key = itemKey(today, p)
      if (reminders[key] && p.d.includes(today) && hours >= p.a && hours < p.a + 1 / 60 * 2 && !notified.current[key]) {
        notified.current[key] = true
        try { new Notification('Yantarne.FM — починається «' + p.t + '»', { body: fmt(p.a) + ' – ' + fmt(p.b) + (p.h ? ' · ' + p.h : ''), icon: 'icon-192.png' }) } catch { /* ignore */ }
      }
    })
  }, [tick]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleReminder = key => {
    const on = !reminders[key]
    setReminders(r => ({ ...r, [key]: on }))
    if (on && typeof Notification !== 'undefined' && Notification.permission === 'default') Notification.requestPermission().catch(() => {})
  }

  // перетягування стрічки мишею
  useEffect(() => {
    const move = e => {
      const d = drag.current
      if (!d.down) return
      const dx = e.clientX - d.sx
      if (Math.abs(dx) > 4) { d.moved = true; scroller.current.classList.add('drag') }
      scroller.current.scrollLeft = d.sl - dx
    }
    const up = () => {
      drag.current.down = false
      scroller.current?.classList.remove('drag')
      setTimeout(() => { drag.current.moved = false }, 0)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
  }, [])
  const onPointerDown = e => {
    if (e.pointerType !== 'mouse') return
    Object.assign(drag.current, { down: true, moved: false, sx: e.clientX, sl: scroller.current.scrollLeft })
  }

  const goNow = () => {
    if (day !== today) setDay(today)
    else scrollToHour(hours - 1.5, true)
  }

  return (
    <section id="timetable">
      <div className="wrap">
        <div className="tt-head reveal" ref={r1}>
          <div><h2 className="sec-title"><span className="accent">Р</span>озклад</h2></div>
          <div className="days" role="tablist" aria-label="День тижня">
            {DAY_SHORT.map((nm, i) => (
              <button key={nm} type="button" role="tab" aria-selected={i === day} aria-label={DAY_FULL[i]} className={i === day ? 'on' : ''} onClick={() => setDay(i)}>{nm}</button>
            ))}
          </div>
        </div>

        <NowNext today={today} hours={hours} current={current} />

        <div className="tt-bar reveal" ref={r2}>
          <span className="tt-hint">← Гортайте або тягніть стрічку · натисніть на програму або вставку →</span>
          <div className="tt-nav">
            <button type="button" className="tt-arrow" aria-label="Раніше" onClick={() => scroller.current.scrollBy({ left: -HW * 4, behavior: 'smooth' })}><ArrowLeft /></button>
            <button type="button" className="tt-now-btn" onClick={goNow}>До «зараз»</button>
            <button type="button" className="tt-arrow" aria-label="Пізніше" onClick={() => scroller.current.scrollBy({ left: HW * 4, behavior: 'smooth' })}><ArrowRight /></button>
          </div>
        </div>

        <div className="tt-scroll reveal" ref={el => { scroller.current = el; r3(el) }} onPointerDown={onPointerDown}>
          <div className="tt">
            <div className="hours">{HOURS.map(h => <div key={h}>{h}</div>)}</div>
            <div className="lane-lab" style={{ top: 58 }}>ПРОГРАМИ</div>
            <div className="lane-lab" style={{ top: 170 }}>ВСТАВКИ</div>
            {isToday && (
              <div className="nowline" style={{ left: hours * HW }}><em>{fmt(Math.floor(hours * 60) / 60)}</em></div>
            )}
            {items.map((p, i) => {
              const T = TYPES[p.k]
              const w = (p.b - p.a) * HW - (p.ins ? 0 : 4)
              const past = isToday && hours >= p.b
              const cur = isToday && !p.ins && hours >= p.a && hours < p.b
              const cls = ['slot', p.ins ? 'ins' : 'main', phase > 0 && 'show', past && 'past', cur && 'cur', selected === p && 'sel'].filter(Boolean).join(' ')
              return (
                <button
                  key={day + '-' + i}
                  type="button"
                  className={cls}
                  title={p.t + ' · ' + fmt(p.a) + '–' + fmt(p.b)}
                  style={{
                    left: p.a * HW + (p.ins ? 0 : 2),
                    width: p.ins ? 26 : Math.max(w, 40),
                    background: T.bg,
                    color: T.fg,
                    border: p.k === 'music' ? '1px solid #363636' : undefined,
                    transitionDelay: phase === 1 ? Math.min(i, 20) * 30 + 'ms' : undefined
                  }}
                  onClick={() => { if (!drag.current.moved) setSelected(p) }}
                >
                  {p.ins
                    ? <b>{p.k === 'news' ? 'Н' : p.k === 'weather' ? '☀' : '₴'}</b>
                    : <><b>{p.t}</b><small>{fmt(p.a)} – {fmt(p.b)}{p.h ? ' · ' + p.h : ''}</small></>}
                  {cur && <span className="onair" />}
                </button>
              )
            })}
          </div>
        </div>

        <Detail item={selected} day={day} today={today} hours={hours} reminders={reminders} onRemind={toggleReminder} flashKey={selected ? itemKey(day, selected) : ''} />
      </div>
    </section>
  )
}
