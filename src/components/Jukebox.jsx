import { useEffect, useMemo, useRef, useState } from 'react'
import { useJukebox, JUKEBOX } from '../context/JukeboxContext'
import { initials } from './JukeboxBubbles'

const hhmm = t => { const d = new Date(t); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') }
const STEPS = ['Пісня', 'Хто замовляє', 'Час', 'Монетка']

export function CoinIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="6" opacity=".5" /><path d="M10 9.5h3.2a1.6 1.6 0 0 1 0 3.2H10m0-3.2v6m-1-3h5" /></svg>
}

// Кнопка на головному екрані
export function JukeboxLauncher() {
  const { setOpen } = useJukebox()
  return (
    <button type="button" className="jb-launch magnet" onClick={() => setOpen(true)}>
      <span className="jb-coin-ic"><CoinIcon /></span>
      <span><b>Замовити пісню в ефір</b><small>від {JUKEBOX.prices.person} ₴ · ваше ім’я або лого підстрибне тут</small></span>
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
            <span className="jb-q-txt"><b>{o.song.artist} — {o.song.title}</b><small>{o.name}{o.note ? ' · ' + o.note : ''}</small></span>
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
  const [q, setQ] = useState('')
  const [song, setSong] = useState(null)
  const [kind, setKind] = useState('person')
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [logo, setLogo] = useState(null)
  const [time, setTime] = useState('asap')
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(null)
  const dialog = useRef(null)
  const slots = useSlots(busy)

  const price = (kind === 'company' ? JUKEBOX.prices.company : JUKEBOX.prices.person) + (time !== 'asap' ? JUKEBOX.prices.exactTime : 0)
  const songs = JUKEBOX.songs.filter(s => (s.artist + ' ' + s.title).toLowerCase().includes(q.trim().toLowerCase()))
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

  const reset = () => { setStep(0); setQ(''); setSong(null); setKind('person'); setName(''); setNote(''); setLogo(null); setTime('asap'); setPaying(false); setDone(null) }
  const close = () => { setOpen(false); if (done) reset() }

  const onLogo = e => {
    const f = e.target.files?.[0]
    if (f) setLogo(URL.createObjectURL(f))
  }

  const canNext = [!!song, name.trim().length >= 2 && (kind === 'person' || !!logo), true][step] ?? true

  const pay = () => {
    setPaying(true)
    setTimeout(() => {
      const t = time === 'asap' ? (firstFree?.t ?? Date.now() + 3600000) : time
      addOrder({ kind, name: name.trim(), logo: kind === 'company' ? logo : null, song, time: t, note: note.trim() })
      setDone({ t, n: queue.filter(o => o.time > Date.now()).length + 1 })
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
              <h2 className="sec-title" id="jb-title">Замовте <span className="accent">пісню</span> в ефір</h2>
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
                <p>«{song.title}» — {song.artist} прозвучить о <strong>{hhmm(done.t)}</strong>. {kind === 'company' ? 'Ваш логотип' : 'Ваше ім’я'} вже підстрибує на головній сторінці.</p>
                <div className="acc-actions">
                  <button type="button" className="btn btn-red" onClick={close}>Подивитися на головній</button>
                  <button type="button" className="btn" onClick={reset}>Замовити ще одну</button>
                </div>
              </div>
            ) : step === 0 ? (
              <div className="jb-pane">
                <input className="jb-search" type="search" placeholder="Пошук: виконавець або назва" value={q} onChange={e => setQ(e.target.value)} aria-label="Пошук пісні" />
                <div className="jb-songs" role="listbox" aria-label="Пісні">
                  {songs.map(s => {
                    const on = song === s
                    return (
                      <button key={s.title} type="button" role="option" aria-selected={on} className={'jb-song' + (on ? ' on' : '')} onClick={() => setSong(s)}>
                        <span className="jb-disc" aria-hidden="true" /><span><b>{s.title}</b><small>{s.artist}</small></span>
                      </button>
                    )
                  })}
                  {!songs.length && <p className="hint">Не знайшли? Напишіть назву в побажанні на наступному кроці, і ведучі підберуть пісню.</p>}
                </div>
              </div>
            ) : step === 1 ? (
              <div className="jb-pane">
                <div className="jb-kind" role="radiogroup" aria-label="Хто замовляє">
                  <button type="button" role="radio" aria-checked={kind === 'person'} className={kind === 'person' ? 'on' : ''} onClick={() => setKind('person')}><b>Я слухач</b><small>підстрибуватиме ваше ім’я · {JUKEBOX.prices.person} ₴</small></button>
                  <button type="button" role="radio" aria-checked={kind === 'company'} className={kind === 'company' ? 'on' : ''} onClick={() => setKind('company')}><b>Я компанія</b><small>підстрибуватиме ваш логотип · {JUKEBOX.prices.company} ₴</small></button>
                </div>
                <div className="ld-join jb-who">
                  <label><span>{kind === 'company' ? 'Назва компанії' : 'Ваше ім’я'}</span><input value={name} onChange={e => setName(e.target.value)} placeholder={kind === 'company' ? 'Напр., Кав’ярня «Зерно»' : 'Напр., Оксана'} /></label>
                  {kind === 'company' && (
                    <label className="jb-upload">
                      <span>Логотип</span>
                      <span className="jb-drop">
                        {logo ? <img src={logo} alt="Ваш логотип" /> : <i>+</i>}
                        <span>{logo ? 'Замінити логотип' : 'Завантажити PNG / JPG / SVG'}</span>
                        <input type="file" accept="image/*" onChange={onLogo} />
                      </span>
                    </label>
                  )}
                  <label className="wide"><span>Побажання в ефірі (необов’язково)</span><input value={note} onChange={e => setNote(e.target.value)} maxLength={80} placeholder={kind === 'company' ? 'Напр., Знижка 10% усім слухачам до неділі' : 'Напр., Для мами з днем народження'} /></label>
                </div>
              </div>
            ) : step === 2 ? (
              <div className="jb-pane">
                <button type="button" className={'jb-asap' + (time === 'asap' ? ' on' : '')} onClick={() => setTime('asap')}>
                  <b>Найближчий вільний час</b><small>{firstFree ? 'орієнтовно о ' + hhmm(firstFree.t) : 'завтра'} · без доплати</small>
                </button>
                <p className="jb-sub">Або точний час <span>+{JUKEBOX.prices.exactTime} ₴</span></p>
                <div className="jb-slots">
                  {slots.map(s => (
                    <button key={s.t} type="button" disabled={s.busy} className={time === s.t ? 'on' : ''} onClick={() => setTime(s.t)} aria-label={hhmm(s.t) + (s.busy ? ', зайнято' : '')}>{hhmm(s.t)}</button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="jb-pane jb-pay">
                <div className="jb-machine">
                  <div className="jb-slot" aria-hidden="true"><span /></div>
                  <div className={'jb-coin' + (paying ? ' drop' : '')} aria-hidden="true">₴</div>
                </div>
                <ul className="jb-summary">
                  <li><span>Пісня</span><b>{song.artist} — {song.title}</b></li>
                  <li><span>{kind === 'company' ? 'Компанія' : 'Від'}</span><b>{name}</b></li>
                  <li><span>Час</span><b>{time === 'asap' ? 'найближчий вільний' : hhmm(time)}</b></li>
                  <li className="sum"><span>До сплати</span><b>{price} ₴</b></li>
                </ul>
                <button type="button" className="btn btn-red jb-paybtn" onClick={pay} disabled={paying}>{paying ? 'Монетка падає…' : `Кинути монетку · ${price} ₴`}</button>
                <p className="hint">У прототипі оплата не списується. У робочій версії тут буде оплата карткою або Apple / Google Pay, а замовлення перед ефіром перевіряє модератор.</p>
              </div>
            )}

            {!done && step < 3 && (
              <div className="jb-nav">
                {step > 0 && <button type="button" className="btn" onClick={() => setStep(s => s - 1)}>← Назад</button>}
                <button type="button" className="btn btn-red" disabled={!canNext} onClick={() => setStep(s => s + 1)}>Далі →</button>
                {step === 1 && kind === 'company' && !logo && <span className="hint">Додайте логотип, щоб продовжити</span>}
              </div>
            )}
          </div>
          <Queue queue={queue} focusId={focusId} />
        </div>
      </div>
    </div>
  )
}
