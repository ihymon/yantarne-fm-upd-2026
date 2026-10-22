import { useEffect, useRef } from 'react'
import { ABOUT_CARDS } from '../data/content'
import { STATION } from '../data/station'
import { useReveal } from '../hooks/useReveal'

// Лічильник, що «набігає», коли блок статистики з'являється на екрані
function Counter({ to, dec = 0, suffix = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const host = el?.closest('.reveal')
    if (!host) return
    const run = () => {
      let st = null
      const f = ts => {
        if (!st) st = ts
        const p = Math.min((ts - st) / 1600, 1), e = 1 - Math.pow(1 - p, 3)
        el.textContent = (to * e).toFixed(dec) + (p === 1 ? suffix : '')
        if (p < 1) requestAnimationFrame(f)
      }
      requestAnimationFrame(f)
    }
    if (host.hasAttribute('data-in')) { el.textContent = to.toFixed(dec) + suffix; return }
    host.addEventListener('revealed', run, { once: true })
    return () => host.removeEventListener('revealed', run)
  }, [to, dec, suffix])
  return <b ref={ref}>0</b>
}

function Card({ c, i }) {
  const reveal = useReveal()
  return (
    <div className="card tilt reveal" ref={reveal}>
      <div className="crow"><div className="num">{String(i + 1).padStart(2, '0')}</div><img src={c.icon} alt="" width="56" height="56" /></div>
      <h3>{c.title}</h3>
    </div>
  )
}

export default function About() {
  const r1 = useReveal(), r2 = useReveal()
  const [f1, f2] = STATION.frequencies
  return (
    <section id="about">
      <div className="wrap">
        <div className="about-head reveal" ref={r1}>
          <h2 className="sec-title"><span className="accent">Х</span>то ми?</h2>
          <p><strong>Yantarne.FM</strong> — сучасне українське радіо Новояворівська, створене у 2021 році командою ентузіастів. Почали як онлайн-радіо, а з початком повномасштабної війни отримали дозвіл на тимчасове FM-мовлення на частоті <strong>88.9 FM</strong> за підтримки Армії.FM та Національної ради з питань телебачення і радіомовлення. Сьогодні нас чути на <strong>{f1.mhz} FM</strong> у Новояворівську та на <strong>{f2.mhz} FM</strong> в Івано-Франковому.</p>
        </div>
        <div className="cards">
          {ABOUT_CARDS.map((c, i) => <Card key={c.title} c={c} i={i} />)}
        </div>
        <div className="stats reveal" ref={r2}>
          <div><Counter to={STATION.since} /><span>рік заснування</span></div>
          <div><Counter to={parseFloat(f1.mhz)} dec={1} /><span>FM — {f1.city}</span></div>
          <div><Counter to={parseFloat(f2.mhz)} dec={1} /><span>FM — {f2.city}</span></div>
          <div><Counter to={24} suffix="/7" /><span>онлайн-ефір</span></div>
        </div>
      </div>
    </section>
  )
}
