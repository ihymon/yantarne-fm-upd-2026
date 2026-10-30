import { useState } from 'react'
import { ADS, AD_REACH } from '../data/content'
import { openDrawPreview } from './LikeDraw'
import { useReveal } from '../hooks/useReveal'

// Відкрити бриф у розділі «Контакти» з уже вибраним типом реклами
export function orderAd(id) {
  window.dispatchEvent(new CustomEvent('yfm:brief', { detail: { type: id } }))
  document.getElementById('brief')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Item({ a, i, open, onToggle }) {
  const reveal = useReveal()
  const id = 'ad-' + i
  return (
    <div className={'acc-item reveal' + (open ? ' open' : '')} ref={reveal}>
      <button type="button" className="acc-btn" aria-expanded={open} aria-controls={id} onClick={onToggle}>
        <span className="an">{String(i + 1).padStart(2, '0')}</span>
        <span className="at">{a.title}</span>
        <span className="ax" aria-hidden="true" />
      </button>
      <div className="acc-body" id={id} role="region">
        <div>
          <div className="acc-in">
            <div>
              {a.lead && <p className="acc-lead">{a.lead}</p>}
              {a.steps && (
                <ol className="acc-steps">
                  {a.steps.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}
                </ol>
              )}
              {a.text.map(p => <p key={p}>{p}</p>)}
              <div className="acc-actions">
                <button type="button" className="btn btn-red acc-order" tabIndex={open ? 0 : -1} onClick={() => orderAd(a.id)}>{a.id === 'gift' ? 'Стати партнером →' : 'Замовити →'}</button>
                {a.demo && <a className="btn acc-demo" href="#rozygrash" tabIndex={open ? 0 : -1} onClick={e => { e.preventDefault(); openDrawPreview() }}>Подивитися, як це виглядає</a>}
              </div>
            </div>
            <div className="chips">{a.chips.map(c => <span key={c}>{c}</span>)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Коротко для рекламодавця: де нас чути, хто слухає і чим це вигідно
function Reach() {
  const reveal = useReveal()
  const R = AD_REACH
  return (
    <div className="reach reveal" ref={reveal}>
      <p className="reach-lead">{R.lead}</p>
      <div className="reach-grid">
        <div className="reach-cell reach-fm">
          <h3>Де нас чути</h3>
          <ul className="reach-freqs">
            {R.coverage.map(c => (
              <li key={c.mhz}><b>{c.mhz}<span> FM</span></b><span><strong>{c.city}</strong>{c.note}</span></li>
            ))}
          </ul>
          <p className="reach-note">{R.online}</p>
        </div>
        <div className="reach-cell">
          <h3>Хто слухає</h3>
          <p>{R.audience}</p>
        </div>
        <div className="reach-cell">
          <h3>Що отримує рекламодавець</h3>
          <ul className="reach-perks">{R.perks.map(x => <li key={x}>{x}</li>)}</ul>
        </div>
      </div>
    </div>
  )
}

export default function Ads() {
  const reveal = useReveal()
  const [open, setOpen] = useState(0)
  return (
    <section id="ads">
      <div className="wrap">
        <div className="tt-head reveal" ref={reveal}>
          <h2 className="sec-title"><span className="accent">Р</span>еклама на Yantarne.<span className="accent">FM</span></h2>
          <div className="live"><i></i>РЕКЛАМА В ПРЯМОМУ ЕФІРІ</div>
        </div>
        <Reach />
        <h3 className="acc-title">Формати реклами</h3>
        <div className="acc">
          {ADS.map((a, i) => <Item key={a.id} a={a} i={i} open={open === i} onToggle={() => setOpen(o => (o === i ? -1 : i))} />)}
        </div>
      </div>
    </section>
  )
}
