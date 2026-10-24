import { NEWS_COVER } from '../data/content'
import { STATION } from '../data/station'
import { useReveal } from '../hooks/useReveal'
import coffee from '../assets/icons/coffee.webp'

// Блок «Будемо вдячні за підтримку»: фото студії + банка Monobank
export default function News() {
  const r1 = useReveal(), r2 = useReveal()

  return (
    <section id="news" className="news-sec">
      <div className="wrap news">
        <div className="video reveal" ref={r1}>
          <figure className="video-frame photo-frame">
            <img src={NEWS_COVER} alt="Студія Yantarne.FM" loading="lazy" />
            <figcaption className="video-cap">
              <small>СТУДІЯ YANTARNE.FM</small>
              <b>Радіо рідного міста — щодня в ефірі для вас</b>
            </figcaption>
          </figure>
        </div>
        <div className="support reveal" ref={r2}>
          <div className="cup"><img src={coffee} alt="" width="36" height="36" /></div>
          <h2>Будемо вдячні<br />за <span className="accent">підтримку</span></h2>
          <p>Незалежне місцеве радіо тримається на слухачах. Кожен донат — це ще одна година ефіру.</p>
          <div className="support-actions">
            <a className="btn btn-red magnet" href={STATION.monoJarUrl} target="_blank" rel="noopener noreferrer">Поповнити банку Mono</a>
          </div>
        </div>
      </div>
    </section>
  )
}
