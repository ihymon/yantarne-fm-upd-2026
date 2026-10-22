import { useState } from 'react'
import { ADS } from '../data/content'
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
              {a.text.map(p => <p key={p}>{p}</p>)}
              <button type="button" className="btn btn-red acc-order" tabIndex={open ? 0 : -1} onClick={() => orderAd(a.id)}>Замовити →</button>
            </div>
            <div className="chips">{a.chips.map(c => <span key={c}>{c}</span>)}</div>
          </div>
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
        <div className="acc">
          {ADS.map((a, i) => <Item key={a.id} a={a} i={i} open={open === i} onToggle={() => setOpen(o => (o === i ? -1 : i))} />)}
        </div>
      </div>
    </section>
  )
}
