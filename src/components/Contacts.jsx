import { useState } from 'react'
import { STATION, FORM_ENDPOINT } from '../data/station'
import { useReveal } from '../hooks/useReveal'
import { SOCIAL_ICONS } from './Icons'

export default function Contacts() {
  const r1 = useReveal(), r2 = useReveal()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState('idle') // idle | sending | done | error

  const submit = async e => {
    e.preventDefault()
    if (!FORM_ENDPOINT) {
      // без бекенду — відкриваємо поштовий клієнт із заповненим листом
      const subject = encodeURIComponent('Повідомлення з сайту від ' + name)
      const body = encodeURIComponent(message + '\n\n— ' + name)
      window.location.href = `mailto:${STATION.email}?subject=${subject}&body=${body}`
      return
    }
    setState('sending')
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name, message, _subject: 'Yantarne.FM — повідомлення з сайту' })
      })
      if (!res.ok) throw new Error(res.status)
      setState('done')
      setName(''); setMessage('')
      setTimeout(() => setState('idle'), 2600)
    } catch {
      setState('error')
    }
  }

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
        <form className={'form reveal' + (state === 'done' ? ' done' : '')} ref={r2} onSubmit={submit}>
          <h3>Надіслати <span className="accent">повідомлення</span></h3>
          <label>Ім’я<input name="name" required autoComplete="name" placeholder="Введіть своє ім’я" value={name} onChange={e => setName(e.target.value)} /></label>
          <label>Повідомлення<textarea name="message" required rows="5" placeholder="Введіть повідомлення..." value={message} onChange={e => setMessage(e.target.value)} /></label>
          <p className="hint">Якщо чекаєте на відповідь — залиште свої контакти в повідомленні.</p>
          {state === 'error' && <p className="err" role="alert">Не вдалося надіслати. Спробуйте ще раз або напишіть на {STATION.email}.</p>}
          <button className="btn btn-red" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Надсилаємо…' : 'Надіслати'}</button>
          <div className="sent" role="status">{state === 'done' ? 'Повідомлення надіслано ✓' : ''}</div>
        </form>
      </div>
    </section>
  )
}
