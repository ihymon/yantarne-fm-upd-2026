import { useEffect, useState } from 'react'
import { STATION, FORM_ENDPOINT } from '../data/station'
import { ADS, BRIEF_START, BRIEF_BUDGET, BRIEF_CONTACT } from '../data/content'
import { useReveal } from '../hooks/useReveal'
import { SOCIAL_ICONS } from './Icons'

const EMPTY = { name: '', company: '', phone: '', email: '', contactVia: BRIEF_CONTACT[0], start: BRIEF_START[0], budget: BRIEF_BUDGET[0], about: '' }
const typeTitle = id => ADS.find(a => a.id === id)?.title || id

// Текст заявки для листа (коли форма працює без сервісу прийому заявок)
function briefText(types, f) {
  return [
    'ЗАЯВКА НА РЕКЛАМУ — Yantarne.FM',
    '',
    'Тип реклами: ' + types.map(typeTitle).join(', '),
    'Ім’я: ' + f.name,
    f.company ? 'Компанія / бренд: ' + f.company : null,
    'Телефон: ' + f.phone,
    f.email ? 'Email: ' + f.email : null,
    'Зручний спосіб зв’язку: ' + f.contactVia,
    'Старт кампанії: ' + f.start,
    'Бюджет: ' + f.budget,
    '',
    'Що рекламуємо:',
    f.about || '—'
  ].filter(x => typeof x === 'string').join('\n')
}

export default function Contacts() {
  const r1 = useReveal(), r2 = useReveal()
  const [types, setTypes] = useState([])
  const [f, setF] = useState(EMPTY)
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [typeError, setTypeError] = useState(false)
  const set = k => e => setF(v => ({ ...v, [k]: e.target.value }))

  // кнопка «Замовити» в розділі «Реклама» передає тип реклами
  useEffect(() => {
    const on = e => {
      const id = e.detail?.type
      if (!id) return
      setTypes(t => (t.includes(id) ? t : [...t, id]))
      setTypeError(false)
      setState(s => (s === 'done' ? 'idle' : s))
    }
    window.addEventListener('yfm:brief', on)
    return () => window.removeEventListener('yfm:brief', on)
  }, [])

  const toggleType = id => {
    setTypes(t => (t.includes(id) ? t.filter(x => x !== id) : [...t, id]))
    setTypeError(false)
  }

  const submit = async e => {
    e.preventDefault()
    if (!types.length) { setTypeError(true); document.getElementById('brief-types')?.focus(); return }
    const text = briefText(types, f)

    if (!FORM_ENDPOINT) {
      // без сервісу прийому заявок — відкриваємо поштовий клієнт із готовим листом
      const subject = encodeURIComponent('Заявка на рекламу — ' + (f.company || f.name))
      window.location.href = `mailto:${STATION.email}?subject=${subject}&body=${encodeURIComponent(text)}`
      setState('done')
      return
    }
    setState('sending')
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: 'Yantarne.FM — заявка на рекламу',
          types: types.map(typeTitle).join(', '),
          ...f,
          message: text
        })
      })
      if (!res.ok) throw new Error(res.status)
      setState('done')
    } catch {
      setState('error')
    }
  }

  // після відправки показуємо підтвердження по центру екрана
  useEffect(() => {
    if (state === 'done') document.getElementById('brief')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [state])

  const reset = () => { setF(EMPTY); setTypes([]); setState('idle') }
  const adsPhone = STATION.phones.find(p => p.label === 'Реклама') || STATION.phones[0]

  return (
    <section id="contacts">
      <div className="wrap contacts">
        <div className="reveal" ref={r1}>
          <h2 className="sec-title"><span className="accent">К</span>онтакти</h2>
          <ul className="clist">
            <li><small>Емейл</small><a href={'mailto:' + STATION.email}>{STATION.email}</a></li>
            {STATION.phones.map(p => <li key={p.tel}><small>{p.label}</small><a href={'tel:' + p.tel}>{p.display}</a></li>)}
          </ul>
          <div className="socials">
            {STATION.socials.map(s => {
              const Icon = SOCIAL_ICONS[s.id]
              return <a key={s.id} className="magnet" href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}><Icon /></a>
            })}
          </div>
        </div>

        <form id="brief" className={'form brief reveal' + (state === 'done' ? ' done' : '')} ref={r2} onSubmit={submit} noValidate={false}>
          <div className="brief-head">
            <h3>Замовити <span className="accent">рекламу</span></h3>
            <p className="hint">Заповніть короткий бриф, і менеджер з реклами зв’яжеться з вами, щоб узгодити деталі та вартість.</p>
          </div>

          <fieldset className="brief-types">
            <legend>Тип реклами <i aria-hidden="true">*</i> <span>можна вибрати кілька</span></legend>
            <div className="pick" id="brief-types" tabIndex={-1} role="group" aria-invalid={typeError}>
              {ADS.map(a => {
                const on = types.includes(a.id)
                return (
                  <button key={a.id} type="button" className={'pick-btn' + (on ? ' on' : '')} aria-pressed={on} onClick={() => toggleType(a.id)}>
                    <span className="tick" aria-hidden="true" />{a.short}
                  </button>
                )
              })}
            </div>
            {typeError && <p className="err" role="alert">Оберіть хоча б один тип реклами.</p>}
          </fieldset>

          <div className="brief-grid">
            <label><span>Ім’я <i aria-hidden="true">*</i></span><input name="name" required autoComplete="name" placeholder="Як до вас звертатися" value={f.name} onChange={set('name')} /></label>
            <label>Компанія / бренд<input name="company" autoComplete="organization" placeholder="Назва бізнесу" value={f.company} onChange={set('company')} /></label>
            <label><span>Телефон <i aria-hidden="true">*</i></span><input name="phone" type="tel" required autoComplete="tel" inputMode="tel" pattern="[\d\s()+\-]{9,}" placeholder="+380 __ ___ __ __" value={f.phone} onChange={set('phone')} /></label>
            <label>Email<input name="email" type="email" autoComplete="email" placeholder="name@company.com" value={f.email} onChange={set('email')} /></label>
            <label>Як зручніше зв’язатися
              <select name="contactVia" value={f.contactVia} onChange={set('contactVia')}>{BRIEF_CONTACT.map(o => <option key={o}>{o}</option>)}</select>
            </label>
            <label>Старт кампанії
              <select name="start" value={f.start} onChange={set('start')}>{BRIEF_START.map(o => <option key={o}>{o}</option>)}</select>
            </label>
            <label className="wide">Орієнтовний бюджет
              <select name="budget" value={f.budget} onChange={set('budget')}>{BRIEF_BUDGET.map(o => <option key={o}>{o}</option>)}</select>
            </label>
            <label className="wide">Що рекламуємо
              <textarea name="about" rows="4" placeholder="Коротко про товар, послугу чи подію, акцію, цільову аудиторію, побажання щодо формату" value={f.about} onChange={set('about')} />
            </label>
          </div>

          {state === 'error' && <p className="err" role="alert">Не вдалося надіслати заявку. Спробуйте ще раз або зателефонуйте: {adsPhone.display}.</p>}
          <div className="brief-foot">
            <button className="btn btn-red" type="submit" disabled={state === 'sending'} onClick={() => { if (!types.length) setTypeError(true) }}>{state === 'sending' ? 'Надсилаємо…' : 'Надіслати заявку'}</button>
            <p className="hint">Надсилаючи заявку, ви погоджуєтесь на обробку контактних даних для зв’язку з вами.</p>
          </div>

          <div className="sent" role="status">
            {state === 'done' && (
              <div>
                <b>Заявку прийнято ✓</b>
                <p>{FORM_ENDPOINT
                  ? 'Менеджер з реклами розгляне її та зв’яжеться з вами.'
                  : 'Відкрився лист із вашою заявкою. Залишилося натиснути «Надіслати» в поштовій програмі.'}</p>
                <p>Терміново? Телефонуйте: <a href={'tel:' + adsPhone.tel}>{adsPhone.display}</a></p>
                <button type="button" className="btn" onClick={reset}>Нова заявка</button>
              </div>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
