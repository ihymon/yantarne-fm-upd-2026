import { PARTNERS } from '../data/content'
import { useReveal } from '../hooks/useReveal'

export default function Partners() {
  const reveal = useReveal()
  // логотипи повторюються, щоб стрічка-маркіза йшла без розривів
  const row = [0, 1, 2].flatMap(() => PARTNERS)
  const all = [...row, ...row]
  return (
    <section className="partners-sec" aria-label="Наші партнери">
      <div className="wrap"><div className="kicker reveal" ref={reveal} style={{ textAlign: 'center' }}>НАШІ ПАРТНЕРИ</div></div>
      <div className="partners">
        <div className="plogos">
          {all.map((p, i) => {
            const hidden = i >= PARTNERS.length // дублікати ховаємо від екранних читачів
            const img = <img src={p.logo} alt={hidden ? '' : p.name} loading="lazy" />
            return (
              <div className="plogo" key={i} aria-hidden={hidden || undefined}>
                {p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" tabIndex={hidden ? -1 : undefined}>{img}</a> : img}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
