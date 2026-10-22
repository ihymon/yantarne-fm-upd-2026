import { useEffect, useMemo, useRef, useState } from 'react'
import { useJukebox, JUKEBOX, calcPrice, MIN_PRICE, daysWord, fmtLeft, fmtDate } from '../context/JukeboxContext'
import { initials } from './JukeboxBubbles'

const hhmm = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') }
const STEPS = ['Компанія', 'Термін і час', 'Монетка']

export function CoinIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="6" opacity=".5" /><path d="M10 9.5h3.2a1.6 1.6 0 0 1 0 3.2H10m0-3.2v6m-1-3h5" /></svg>
}

// Кнопка на головному екрані
export function JukeboxLauncher() {
  const { setOpen } = useJukebox()
  return (
    <button type="button" className="jb-launch magnet" onClick={() => setOpen(true)}>
      <span className="jb-coin-ic"><CoinIcon /></span>
      <span><b>Пісня від вашої компанії</b><small>від {MIN_PRICE} ₴ · ваш логотип підстрибне тут</small></span>
    </button>
  )
}

// вільні слоти: кожні 15 хв від найближчого до 23:00
function useSlots(busy) {
  return useMemo(() => {
    const out = []
    const d = new Date(Date.now() + 20 * 60000)
    d.setSeconds(0, 0); d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15)
    const end = new Date(); end.setHours(23, 0, 0, 0)
    while (d <= end && out.length < 24) { out.push({ t: d.getTime(), busy: busy.has(d.getTime()) }); d.setMinutes(d.getMinutes() + 15) }
    return out
  }, [busy])
}

// Прорахунок вартості + як виглядатиме логотип на головній
function Calc({ calc, days, name, logo, compact }) {
  return (
    <div className={'jb-calc' + (compact ? ' compact' : '')} aria-live="polite">
      {!compact && (
        <div className="jb-preview" aria-hidden="true">
          <span className="jb-bubble company static">
            <span className="jb-logo">{logo ? <img src={logo} alt="" /> : <i>{initials(name || 'Лого')}</i>}<svg className="jb-ring" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" /><circle cx="50" cy="50" r="47" className="p" style={{ strokeDashoffset: 0 }} /></svg></span>
            <span className="jb-tag">ПАРТНЕР · {days} дн</span>
          </span>
          <small>Так виглядатиме ваш логотип: кільце показує, скільки часу лишилося</small>
        </div>
      )}
      <ul>
        <li><span>Пісня в ефірі + побажання</span><b>{calc.song} ₴</b></li>
        <li><span>Логотип на головній · {daysWord(days)} × {JUKEBOX.prices.perDay} ₴</span><b>{calc.logoFull} ₴</b></li>
        {calc.discount > 0 && <li className="disc"><span>Знижка за термін −{Math.round(calc.pct * 100)}%</span><b>−{calc.discount} ₴</b></li>}
        {calc.exact > 0 && <li><span>Точний час</span><b>{calc.exact} ₴</b></li>}
        <li className="sum"><span>Разом</span><b>{calc.total} ₴</b></li>
      </ul>
      <small className="jb-until">Логотип стрибатиме з моменту оплати до {fmtDate(Date.now() + days * 864e5)}</small>
    </div>
  )
}

function Queue({ queue, focusId }) {
  const now = Date.now()
  const currentId = [...queue].filter(o => o.time <= now).pop()?.id
  const upcoming = queue.filter(o => o.time > now || o.id === currentId)
  return (
    <aside className="jb-queue">
      <div className="jb-q-head"><small className="ld-kicker">ЧЕРГА В ЕФІРІ</small><span>{upcoming.length} замовлень сьогодні</span></div>
      <ol>
        {upcoming.map((o, i) => (
          <li key={o.id} className={(o.id === currentId ? 'now ' : '') + (o.id === focusId ? 'fresh' : '')}>
            <span className={'jb-av ' + o.kind}>{o.logo ? <img src={o.logo} alt="" /> : initials(o.name)}</span>
            <span className="jb-q-txt"><b>{o.name}</b><small>Лого на сайті ще {fmtLeft(o.until - now, true)}{o.note ? ' · ' + o.note : ''}</small></span>
            <em>{o.id === currentId ? <span className="jb-live">ГРАЄ</span> : i === 1 && currentId ? 'Далі · ' + hhmm(o.time) : hhmm(o.time)}</em>
          </li>
        ))}
      </ol>
    </aside>
  )
}

export default function Jukebox() {
  const { open, setOpen, queue, addOrder, busy, focusId } = useJukebox()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [logo, setLogo] = useState(null)
  const [time, setTime] = useState('asap')
  const [days, setDays] = useState(3)
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(null)
  const dialog = useRef(null)
  const slots = useSlots(busy)

  const calc = calcPrice(days, time !== 'asap')
  const price = calc.total
  const firstFree = slots.find(s => !s.busy)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.focus()
    const k = e => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', k)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', k) }
  }, [open, setOpen])

  const reset = () => { setStep(0); setName(''); setNote(''); setLogo(null); setTime('asap'); setDays(3); setPaying(false); setDone(null) }
  const close = () => { setOpen(false); if (done) reset() }

  const onLogo = e => {
    const f = e.target.files?.[0]
    if (f) setLogo(URL.createObjectURL(f))
  }

  const canNext = [name.trim().length >= 2 && !!logo, true][step] ?? true

  const pay = () => {
    setPaying(true)
    setTimeout(() => {
      const t = time === 'asap' ? (firstFree?.t ?? Date.now() + 3600000) : time
      const until = Date.now() + days * 864e5
      addOrder({ kind: 'company', name: name.trim(), logo, time: t, note: note.trim(), days, until })
      setDone({ t, until })
      setPaying(false)
    }, 1400)
  }

  if (!open) return null
  return (
    <div className="ld-overlay" onClick={e => { if (e.target === e.currentTarget) close() }}>
      <div className="ld-dialog jb-dialog" role="dialog" aria-modal="true" aria-labelledby="jb-title" tabIndex={-1} ref={dialog}>
        <button type="button" className="ld-close" aria-label="Закрити" onClick={close}>×</button>
        <div className="jb-grid">
          <div className="jb-main">
            <div className="ld-head">
              <small className="ld-kicker">{JUKEBOX.demo && <span className="ld-demo">ДЕМО</span>} МУЗИЧНИЙ АВТОМАТ</small>
              <h2 className="sec-title" id="jb-title">Пісня від <span className="accent">вашої компанії</span></h2>
              <p className="jb-lead">Ваш логотип підстрибує на головній сторінці сайту, а в обраний час ведучий ставить пісню від вашої компанії та озвучує побажання слухачам.</p>
            </div>

            {!done && (
              <ol className="jb-steps" aria-label="Кроки">
                {STEPS.map((s, i) => (
                  <li key={s} className={i === step ? 'on' : i < step ? 'ok' : ''}>
                    <button type="button" disabled={i > step} onClick={() => setStep(i)}><i>{i < step ? '✓' : i + 1}</i>{s}</button>
                  </li>
                ))}
              </ol>
            )}

            {done ? (
              <div className="jb-done">
                <div className="jb-done-ic">♪</div>
                <b>Ви в черзі!</b>
                <p>Пісня від <strong>{name}</strong> прозвучить в ефірі о <strong>{hhmm(done.t)}</strong>, а ведучий озвучить ваше побажання. Ваш логотип уже підстрибує на головній сторінці з позначкою «Партнер» і стрибатиме до <strong>{fmtDate(done.until)}</strong>.</p>
                <div className="acc-actions">
                  <button type="button" className="btn btn-red" onClick={close}>Подивитися на головній</button>
                  <button type="button" className="btn" onClick={reset}>Замовити ще одну</button>
                </div>
              </div>
            ) : step === 0 ? (
              <div className="jb-pane">
                <div className="ld-join jb-who">
                  <label><span>Назва компанії</span><input value={name} onChange={e => setName(e.target.value)} placeholder="Напр., Кав’ярня «Зерно»" /></label>
                  {(
                    <label className="jb-upload">
                      <span>Логотип</span>
                      <span className="jb-drop">
                        {logo ? <img src={logo} alt="Ваш логотип" /> : <i>+</i>}
                        <span>{logo ? 'Замінити логотип' : 'Завантажити PNG / JPG / SVG'}</span>
                        <input type="file" accept="image/*" onChange={onLogo} />
                      </span>
                    </label>
                  )}
                  <label className="wide"><span>Побажання в ефірі (необов’язково)</span><input value={note} onChange={e => setNote(e.target.value)} maxLength={80} placeholder="Напр., Знижка 10% усім слухачам до неділі" /></label>
                </div>
              </div>
            ) : step === 1 ? (
              <div className="jb-pane">
                <p className="jb-sub">Скільки логотип стрибатиме на головній</p>
                <div className="jb-plans" role="radiogroup" aria-label="Термін розміщення логотипа">
                  {JUKEBOX.plans.map(p => {
                    const c = calcPrice(p.days, false)
                    return (
                      <button key={p.days} type="button" role="radio" aria-checked={days === p.days} className={days === p.days ? 'on' : ''} onClick={() => setDays(p.days)}>
                        <b>{daysWord(p.days)}</b>
                        <span>{c.logo} ₴</span>
                        {p.discount ? <em>−{Math.round(p.discount * 100)}%</em> : null}
                      </button>
                    )
                  })}
                </div>
                <p className="jb-sub">Коли звучить пісня</p>
                <button type="button" className={'jb-asap' + (time === 'asap' ? ' on' : '')} onClick={() => setTime('asap')}>
                  <b>Найближчий вільний час</b><small>{firstFree ? 'орієнтовно о ' + hhmm(firstFree.t) : 'завтра'} · без доплати</small>
                </button>
                <p className="jb-sub jb-sub2">Або точний час <span>+{JUKEBOX.prices.exactTime} ₴</span></p>
                <div className="jb-slots">
                  {slots.map(s => (
                    <button key={s.t} type="button" disabled={s.busy} className={time === s.t ? 'on' : ''} onClick={() => setTime(s.t)} aria-label={hhmm(s.t) + (s.busy ? ', зайнято' : '')}>{hhmm(s.t)}</button>
                  ))}
                </div>
                <Calc calc={calc} days={days} name={name} logo={logo} />
              </div>
            ) : (
              <div className="jb-pane jb-pay">
                <div className="jb-machine">
                  <div className="jb-slot" aria-hidden="true"><span /></div>
                  <div className={'jb-coin' + (paying ? ' drop' : '')} aria-hidden="true">₴</div>
                </div>
                <ul className="jb-summary">
                  <li><span>Компанія</span><b>{name}</b></li>
                  {note.trim() && <li><span>Побажання</span><b>{note.trim()}</b></li>}
                  <li><span>Пісня в ефірі</span><b>{time === 'asap' ? 'найближчий вільний час' : 'о ' + hhmm(time)}</b></li>
                  <li><span>Логотип на головній</span><b>{daysWord(days)}</b></li>
                </ul>
                <Calc calc={calc} days={days} compact />
                <button type="button" className="btn btn-red jb-paybtn" onClick={pay} disabled={paying}>{paying ? 'Монетка падає…' : `Кинути монетку · ${price} ₴`}</button>
                <p className="hint">У прототипі оплата не списується. У робочій версії тут буде оплата карткою або Apple / Google Pay, а замовлення перед ефіром перевіряє модератор.</p>
              </div>
            )}

            {!done && step < 2 && (
              <div className="jb-nav">
                {step > 0 && <button type="button" className="btn" onClick={() => setStep(s => s - 1)}>← Назад</button>}
                <button type="button" className="btn btn-red" disabled={!canNext} onClick={() => setStep(s => s + 1)}>Далі →</button>
                {step === 0 && !logo && <span className="hint">Додайте логотип, щоб продовжити</span>}
              </div>
            )}
          </div>
          <Queue queue={queue} focusId={focusId} />
        </div>
      </div>
    </div>
  )
}
