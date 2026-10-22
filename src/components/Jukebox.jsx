import { useEffect, useRef, useState } from 'react'
import { useJukebox, JUKEBOX, calcPrice, MIN_PRICE, daysWord, fmtLeft, fmtDate } from '../context/JukeboxContext'
import { PartnerLogo, PartnerTag } from './JukeboxBubbles'

const STEPS = ['Компанія', 'Термін', 'Монетка']

export function CoinIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="6" opacity=".5" /><path d="M10 9.5h3.2a1.6 1.6 0 0 1 0 3.2H10m0-3.2v6m-1-3h5" /></svg>
}

// Кнопка на головному екрані
export function JukeboxLauncher() {
  const { setOpen } = useJukebox()
  return (
    <button type="button" className="jb-launch magnet" onClick={() => setOpen(true)}>
      <span className="jb-coin-ic"><CoinIcon /></span>
      <span><b>Ваш логотип на головній</b><small>від {MIN_PRICE} ₴ на день · стрибатиме тут з позначкою «Партнер»</small></span>
    </button>
  )
}

// Партнери, чиї логотипи зараз на сайті
function Partners({ partners, focusId }) {
  const now = Date.now()
  const active = partners.filter(p => p.until > now).sort((a, b) => a.until - b.until)
  return (
    <aside className="jb-queue">
      <div className="jb-q-head"><small className="ld-kicker">ЗАРАЗ НА ГОЛОВНІЙ</small><span>{active.length} партнерів</span></div>
      <ol>
        {active.map(p => (
          <li key={p.id} className={p.id === focusId ? 'fresh' : ''}>
            <span className="jb-q-logo"><PartnerLogo p={p} /></span>
            <span className="jb-q-txt"><b>{p.name}</b><small>{p.note || 'Партнер Yantarne.FM'}</small></span>
            <em>ще {fmtLeft(p.until - now, true)}</em>
          </li>
        ))}
      </ol>
    </aside>
  )
}

// Прорахунок вартості + як виглядатиме логотип на головній
function Calc({ days, name, logo, compact }) {
  const c = calcPrice(days)
  return (
    <div className={'jb-calc' + (compact ? ' compact' : '')} aria-live="polite">
      {!compact && (
        <div className="jb-preview" aria-hidden="true">
          <span className="jb-bubble static">
            <PartnerLogo p={{ name, logo }} />
            <PartnerTag left={days + ' дн'} frac={1} />
          </span>
          <small>Так виглядатиме ваш логотип. Смужка показує, скільки терміну лишилося</small>
        </div>
      )}
      <ul>
        <li><span>Логотип на головній · {daysWord(days)} × {JUKEBOX.prices.perDay} ₴</span><b>{c.full} ₴</b></li>
        {c.discount > 0 && <li className="disc"><span>Знижка за термін −{Math.round(c.pct * 100)}%</span><b>−{c.discount} ₴</b></li>}
        {c.discount > 0 && <li><span>Виходить за добу</span><b>{c.perDay} ₴</b></li>}
        <li className="sum"><span>Разом</span><b>{c.total} ₴</b></li>
      </ul>
      <small className="jb-until">Логотип стрибатиме з моменту оплати до {fmtDate(Date.now() + days * 864e5)}</small>
    </div>
  )
}

export default function Jukebox() {
  const { open, setOpen, partners, addPartner, focusId } = useJukebox()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [logo, setLogo] = useState(null)
  const [days, setDays] = useState(7)
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(null)
  const dialog = useRef(null)
  const price = calcPrice(days).total

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.focus()
    const k = e => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', k)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', k) }
  }, [open, setOpen])

  const reset = () => { setStep(0); setName(''); setNote(''); setLogo(null); setDays(7); setPaying(false); setDone(null) }
  const close = () => { setOpen(false); if (done) reset() }

  const onLogo = e => {
    const f = e.target.files?.[0]
    if (f) setLogo(URL.createObjectURL(f))
  }

  const canNext = [name.trim().length >= 2 && !!logo, true][step] ?? true

  const pay = () => {
    setPaying(true)
    setTimeout(() => {
      const until = Date.now() + days * 864e5
      addPartner({ name: name.trim(), logo, note: note.trim(), days, until })
      setDone({ until })
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
              <small className="ld-kicker">{JUKEBOX.demo && <span className="ld-demo">ДЕМО</span>} ПАРТНЕРИ ЕФІРУ</small>
              <h2 className="sec-title" id="jb-title">Ваш логотип <span className="accent">на головній</span></h2>
              <p className="jb-lead">Логотип вашої компанії підстрибує на головній сторінці Yantarne.FM з позначкою «Партнер». Оберіть термін, киньте монетку, і він з’явиться на сайті.</p>
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
                <div className="jb-done-ic">✓</div>
                <b>Ви партнер!</b>
                <p>Логотип <strong>{name}</strong> уже підстрибує на головній сторінці з позначкою «Партнер» і стрибатиме до <strong>{fmtDate(done.until)}</strong>.</p>
                <div className="acc-actions">
                  <button type="button" className="btn btn-red" onClick={close}>Подивитися на головній</button>
                  <button type="button" className="btn" onClick={reset}>Додати ще один логотип</button>
                </div>
              </div>
            ) : step === 0 ? (
              <div className="jb-pane">
                <div className="ld-join jb-who">
                  <label><span>Назва компанії</span><input value={name} onChange={e => setName(e.target.value)} placeholder="Напр., Кав’ярня «Зерно»" /></label>
                  <label className="jb-upload">
                    <span>Логотип</span>
                    <span className="jb-drop">
                      {logo ? <img src={logo} alt="Ваш логотип" /> : <i>+</i>}
                      <span>{logo ? 'Замінити логотип' : 'Завантажити PNG / JPG / SVG'}</span>
                      <input type="file" accept="image/*" onChange={onLogo} />
                    </span>
                  </label>
                  <label className="wide"><span>Підпис при наведенні (необов’язково)</span><input value={note} onChange={e => setNote(e.target.value)} maxLength={80} placeholder="Напр., Знижка 10% усім слухачам до неділі" /></label>
                  <p className="hint wide">Логотип показуємо у ваших пропорціях: прямокутний лишається прямокутним. Краще з прозорим або однотонним фоном.</p>
                </div>
              </div>
            ) : step === 1 ? (
              <div className="jb-pane">
                <p className="jb-sub">Скільки логотип стрибатиме на головній</p>
                <div className="jb-plans" role="radiogroup" aria-label="Термін розміщення логотипа">
                  {JUKEBOX.plans.map(p => (
                    <button key={p.days} type="button" role="radio" aria-checked={days === p.days} className={days === p.days ? 'on' : ''} onClick={() => setDays(p.days)}>
                      <b>{daysWord(p.days)}</b>
                      <span>{calcPrice(p.days).total} ₴</span>
                      {p.discount ? <em>−{Math.round(p.discount * 100)}%</em> : null}
                    </button>
                  ))}
                </div>
                <Calc days={days} name={name} logo={logo} />
              </div>
            ) : (
              <div className="jb-pane jb-pay">
                <div className="jb-machine">
                  <div className="jb-slot" aria-hidden="true"><span /></div>
                  <div className={'jb-coin' + (paying ? ' drop' : '')} aria-hidden="true">₴</div>
                </div>
                <ul className="jb-summary">
                  <li><span>Компанія</span><b>{name}</b></li>
                  {note.trim() && <li><span>Підпис</span><b>{note.trim()}</b></li>}
                  <li><span>Термін</span><b>{daysWord(days)}</b></li>
                </ul>
                <Calc days={days} compact />
                <button type="button" className="btn btn-red jb-paybtn" onClick={pay} disabled={paying}>{paying ? 'Монетка падає…' : `Кинути монетку · ${price} ₴`}</button>
                <p className="hint">У прототипі оплата не списується. У робочій версії тут буде оплата карткою або Apple / Google Pay, а логотип перед публікацією перевіряє модератор.</p>
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
          <Partners partners={partners} focusId={focusId} />
        </div>
      </div>
    </div>
  )
}
