import { useEffect, useRef, useState } from 'react'
import { useClock } from '../context/ClockContext'
import { useLikeDraw, usePromoConfig, LIKE_CONFIG } from '../hooks/useLikeDraw'
import { HeartIcon } from './Icons'

const pad = n => String(n).padStart(2, '0')
const hms = ms => { const s = Math.ceil(ms / 1000); return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60) }
const ms = ms => { const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ':' + pad(s % 60) }
const fmtNum = n => n.toLocaleString('uk-UA')
const plural = (n, one, few, many) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many }

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M12 8v13M12 8S10.5 3 8 3.5 6.5 8 12 8zM12 8s1.5-5 4-4.5S17.5 8 12 8z" /></svg>
  )
}

// Модальне вікно розіграшу: «барабан» з іменами, потім переможець
function DrawModal({ winner, onClose, prize = LIKE_CONFIG.prize, sponsor = LIKE_CONFIG.sponsor }) {
  const [shown, setShown] = useState(winner.names[0])
  const [done, setDone] = useState(false)
  useEffect(() => {
    let i = 0, delay = 50, t
    const spin = () => {
      i++
      setShown(winner.names[i % winner.names.length])
      delay *= 1.09
      if (delay < 420) t = setTimeout(spin, delay)
      else { setShown(winner.name); setDone(true) }
    }
    t = setTimeout(spin, delay)
    return () => clearTimeout(t)
  }, [winner])
  useEffect(() => {
    const k = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  return (
    <div className="ld-modal" role="dialog" aria-modal="true" aria-label="Розіграш дня" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={'ld-modal-card' + (done ? ' done' : '')}>
        <small className="ld-kicker">РОЗІГРАШ ДНЯ · {prize.title.toUpperCase()}</small>
        <div className="ld-drum" aria-live="polite"><span key={shown + done}>{shown}</span></div>
        {done && (
          <>
            <p className="ld-win">{winner.me ? 'Вітаємо! Ви виграли 🎉 Ми зв’яжемося з вами за вказаними контактами.' : `Переможець дня: ${winner.name} (${winner.tickets} ${plural(winner.tickets, 'лайк', 'лайки', 'лайків')} за день). Вітаємо!`}</p>
            <div className="ld-confetti" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ '--x': (i * 37) % 100 + '%', '--d': (i % 7) * 0.12 + 's', '--r': (i * 53) % 360 + 'deg' }} />)}</div>
          </>
        )}
        {sponsor && <div className="ld-modal-sponsor">{sponsor.logo && <img src={sponsor.logo} alt="" width="32" height="32" />}<span>Приз дарує <b>{sponsor.name}</b></span></div>}
        <button type="button" className="btn" onClick={onClose}>{done ? 'Закрити' : 'Пропустити'}</button>
      </div>
    </div>
  )
}

const HASH = '#rozygrash'
const SEEN_KEY = 'yfm-promo-seen'
const OPEN_EVENT = 'yfm:draw'

// Відкрити вікно розіграшу з будь-якого місця сайту (напр. «Подивитися, як це виглядає» в розділі «Реклама»).
// Якщо акція вимкнена, вікно відкривається як приклад для рекламодавців.
export function openDrawPreview() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT))
}

// Кнопка-подарунок на головному екрані (плаває в кутку) + вікно акції
export default function LikeDraw() {
  const cfg = usePromoConfig()
  const [preview, setPreview] = useState(false)

  // акція вимкнена: вікно монтується лише на вимогу, тож не працюють таймери й автоматичний розіграш
  useEffect(() => {
    if (cfg.enabled) return
    const on = () => setPreview(true)
    const onHash = () => { if (location.hash === HASH) setPreview(true) }
    onHash()
    window.addEventListener(OPEN_EVENT, on)
    window.addEventListener('hashchange', onHash)
    return () => { window.removeEventListener(OPEN_EVENT, on); window.removeEventListener('hashchange', onHash) }
  }, [cfg.enabled])

  if (cfg.enabled) return <LikeDrawInner cfg={cfg} />
  if (!preview) return null
  return <LikeDrawInner cfg={cfg} preview onExit={() => setPreview(false)} />
}

function LikeDrawInner({ cfg, preview = false, onExit }) {
  const { current } = useClock()
  const d = useLikeDraw(current.t)
  const [open, setOpen] = useState(() => preview || (typeof location !== 'undefined' && location.hash === HASH))
  const [hint, setHint] = useState(false)
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [agree, setAgree] = useState(false)
  const [hearts, setHearts] = useState([])
  const [bump, setBump] = useState(0)
  const heartId = useRef(0)
  const dialog = useRef(null)
  const launcher = useRef(null)
  const returnFocus = useRef(null)
  const demoMode = typeof location !== 'undefined' && new URLSearchParams(location.search).has('demo')

  // підказка біля подарунка при першому візиті
  useEffect(() => {
    if (preview) return
    let seen = false
    try { seen = !!localStorage.getItem(SEEN_KEY) } catch { /* ignore */ }
    if (seen) return
    const t1 = setTimeout(() => setHint(true), 2500)
    const t2 = setTimeout(() => setHint(false), 12000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const openIt = () => {
    setOpen(true); setHint(false)
    try { localStorage.setItem(SEEN_KEY, '1') } catch { /* ignore */ }
  }
  const close = () => { setOpen(false); if (preview) onExit?.() }

  // відкрите вікно: блокуємо прокрутку сторінки, фокус у вікно, Esc закриває, адреса #rozygrash
  useEffect(() => {
    if (!open) return
    returnFocus.current = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (location.hash !== HASH) history.replaceState(null, '', HASH)
    dialog.current?.focus()
    const k = e => { if (e.key === 'Escape' && !d.winner) close() }
    window.addEventListener('keydown', k)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', k)
      if (location.hash === HASH) history.replaceState(null, '', location.pathname + location.search)
      ;(launcher.current || returnFocus.current)?.focus?.()
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // посилання на #rozygrash або openDrawPreview() з будь-якого місця сайту відкриває вікно
  useEffect(() => {
    if (preview) return
    const onHash = () => { if (location.hash === HASH) openIt() }
    window.addEventListener('hashchange', onHash)
    window.addEventListener(OPEN_EVENT, openIt)
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener(OPEN_EVENT, openIt) }
  }, [preview])

  const onLike = () => {
    if (!d.like()) return
    setBump(b => b + 1)
    const batch = Array.from({ length: 7 }, (_, i) => ({ id: ++heartId.current, x: (i - 3) * 22 + (Math.random() * 16 - 8), s: 0.6 + Math.random() * 0.7, d: i * 0.05 }))
    setHearts(h => [...h, ...batch])
    setTimeout(() => setHearts(h => h.filter(x => !batch.includes(x))), 1600)
  }

  const submit = e => {
    e.preventDefault()
    if (name.trim().length < 2 || contact.trim().length < 3 || !agree) return
    d.join(name, contact)
  }

  const cooling = d.waitMs > 0
  const cooldownProgress = cooling ? 1 - d.waitMs / (cfg.cooldownMin * 60000) : 1
  const canLike = d.me && !cooling && !d.limitReached

  return (
    <>
      {!preview && <button
        ref={launcher}
        type="button"
        className={'ld-fab' + (canLike ? ' ready' : '') + (open ? ' hidden' : '')}
        onClick={openIt}
        aria-haspopup="dialog"
        aria-label={cfg.occasion + ': лайкай ефір і вигравай ' + cfg.prize.title}
      >
        <span className="ld-fab-ic"><GiftIcon /></span>
        <span className="ld-fab-txt"><b>{cfg.occasion}</b><small>{d.me ? (canLike ? 'Можна лайкнути!' : 'Квитків: ' + d.tickets) : 'Лайкай і вигравай'}</small></span>
        {d.me && canLike && <i className="ld-fab-dot" aria-hidden="true" />}
      </button>}
      {hint && !open && !preview && (
        <div className="ld-hint" role="status">
          <b>🎁 {cfg.occasion}!</b> Лайкайте ефір і вигравайте {cfg.prize.title.toLowerCase()}{cfg.sponsor ? ' від ' + cfg.sponsor.name : ''}
          <button type="button" aria-label="Закрити підказку" onClick={() => setHint(false)}>×</button>
        </div>
      )}

      {open && (
        <div className="ld-overlay" onClick={e => { if (e.target === e.currentTarget) close() }}>
          <div className="ld-dialog" role="dialog" aria-modal="true" aria-labelledby="ld-title" tabIndex={-1} ref={dialog}>
            <button type="button" className="ld-close" aria-label="Закрити" onClick={close}>×</button>
            {preview && (
              <p className="ld-preview-note">
                <b>Приклад для партнерів.</b> Так акція виглядає для слухачів. Зараз розіграш не проводиться, цифри та учасники змодельовані.
              </p>
            )}
            <div className="likes">
              <div className="ld-main">
                <div className="ld-head">
                  <small className="ld-kicker">{cfg.demoData && <span className="ld-demo">ДЕМО</span>} {cfg.occasion.toUpperCase()}</small>
                  <h2 className="sec-title" id="ld-title">Лайкай <span className="accent">ефір</span> — вигравай</h2>
                  <p>Слухайте Yantarne.FM і ставте лайк ефіру раз на {cfg.cooldownMin} хвилин. Кожен лайк — це квиток у розіграш, який проводимо о {cfg.drawHour}:00 у прямому ефірі.</p>
                </div>

                {!d.me ? (
                  <form className="ld-join" onSubmit={submit}>
                    <label><span>Ваше ім’я</span><input required minLength={2} autoComplete="name" placeholder="Напр., Оксана Петрук" value={name} onChange={e => setName(e.target.value)} /></label>
                    <label><span>Телефон або Instagram</span><input required minLength={3} placeholder="Щоб зв’язатися з переможцем" value={contact} onChange={e => setContact(e.target.value)} /></label>
                    <label className="ld-agree"><input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} required /><span>Погоджуюсь з <a href={HASH} onClick={e => e.preventDefault()}>правилами розіграшу</a> та обробкою даних</span></label>
                    <button className="btn btn-red" type="submit">Взяти участь</button>
                    <p className="hint">Одна людина бере участь з одного пристрою. На сайті показуємо лише ім’я та першу літеру прізвища.</p>
                  </form>
                ) : (
                  <div className="ld-play">
                    <div className="ld-heart-wrap">
                      <svg className="ld-ring" viewBox="0 0 120 120" aria-hidden="true">
                        <circle cx="60" cy="60" r="56" />
                        <circle cx="60" cy="60" r="56" className="p" style={{ strokeDashoffset: 352 * (1 - cooldownProgress) }} />
                      </svg>
                      <button
                        type="button"
                        className={'ld-heart' + (cooling || d.limitReached ? ' wait' : '')}
                        onClick={onLike}
                        disabled={cooling || d.limitReached}
                        aria-label={cooling ? 'Наступний лайк через ' + ms(d.waitMs) : 'Лайкнути ефір «' + current.t + '»'}
                      >
                        <span key={bump} className={bump ? 'beat' : ''}><HeartIcon /></span>
                      </button>
                      {hearts.map(h => <i key={h.id} className="ld-fly" style={{ '--x': h.x + 'px', '--s': h.s, animationDelay: h.d + 's' }}><HeartIcon /></i>)}
                    </div>
                    <div className="ld-status">
                      <small>ЗАРАЗ В ЕФІРІ</small>
                      <b>{current.t}</b>
                      <p aria-live="polite">
                        {d.limitReached ? 'На сьогодні все: ви зібрали максимум квитків. До завтра!'
                          : cooling ? <>Дякуємо! Наступний лайк через <strong>{ms(d.waitMs)}</strong></>
                            : 'Натисніть на серце, щоб лайкнути ефір'}
                      </p>
                      <div className="ld-tickets" aria-label={'Ваші квитки сьогодні: ' + d.tickets}>
                        {Array.from({ length: Math.max(8, Math.min(cfg.maxTicketsPerDay, d.tickets + 1)) }, (_, i) => <i key={i} className={i < d.tickets ? 'on' : ''} />)}
                      </div>
                      <small className="ld-me">Ви — <b>{d.me.name}</b> · квитків сьогодні: <b>{d.tickets}</b> · <button type="button" onClick={d.leave}>змінити</button></small>
                    </div>
                  </div>
                )}
              </div>

              <aside className="ld-side">
                <div className="ld-prize">
                  <div className="ld-gift"><GiftIcon /></div>
                  <div>
                    <small className="ld-kicker">ПРИЗ</small>
                    <b>{cfg.prize.title}</b>
                    <span>{cfg.prize.from}</span>
                  </div>
                </div>
                {cfg.sponsor && (
                  <div className="ld-sponsor">
                    {cfg.sponsor.logo && <img src={cfg.sponsor.logo} alt={cfg.sponsor.name} width="64" height="64" loading="lazy" />}
                    <div>
                      <small className="ld-kicker">ПАРТНЕР РОЗІГРАШУ</small>
                      <b>{cfg.sponsor.name}</b>
                      <span className="ld-sp-tag">{cfg.sponsor.tagline}</span>
                      <p>{cfg.sponsor.pitch}</p>
                      {cfg.sponsor.url && <a href={cfg.sponsor.url} target="_blank" rel="noopener noreferrer">Дізнатися більше →</a>}
                    </div>
                  </div>
                )}
                <div className="ld-count">
                  <small>Розіграш о {cfg.drawHour}:00 через</small>
                  <b>{hms(d.drawInMs)}</b>
                </div>
                <div className="ld-stats">
                  <div><b>{fmtNum(d.total)}</b><span>лайків сьогодні</span></div>
                  <div><b>{fmtNum(d.participants)}</b><span>учасників</span></div>
                </div>
                <ul className="ld-feed" aria-label="Останні лайки">
                  {d.feed.slice(0, 4).map(f => (
                    <li key={f.id} className={f.me ? 'me' : ''}><i><HeartIcon /></i><span><b>{f.me ? 'Ви' : f.name}</b><small>«{f.show}»</small></span><em>{f.ago ? f.ago + ' хв' : 'щойно'}</em></li>
                  ))}
                </ul>
                <small className="ld-prev">Минулого разу виграла: <b>{cfg.yesterdayWinner}</b> · {cfg.prize.note}</small>
              </aside>

              {demoMode && (
                <div className="ld-demobar">
                  <span>Панель для показу (відкривається з ?demo в адресі):</span>
                  <button type="button" onClick={d.demo.skipCooldown}>⏩ Пропустити паузу</button>
                  <button type="button" onClick={d.runDraw}>🎲 Провести розіграш зараз</button>
                  <button type="button" onClick={d.demo.reset}>↺ Почати спочатку</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {d.winner && <DrawModal winner={d.winner} onClose={d.closeWinner} prize={cfg.prize} sponsor={cfg.sponsor} />}
    </>
  )
}
