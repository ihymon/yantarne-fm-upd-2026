import { SUPPORT_COVER } from '../data/content'
import { STATION } from '../data/station'
import { useReveal } from '../hooks/useReveal'
import coffee from '../assets/icons/coffee.webp'

// Блок «Підтримати»: фото студії + банка Monobank.
// id="news" лишається як невидимий якір, щоб старі посилання на #news вели сюди.
export default function Support() {
  const r1 = useReveal(), r2 = useReveal()

  return (
    <section id="support" className="news-sec">
      <span id="news" className="anchor-alias" aria-hidden="true" />
      <div className="wrap news">
        <div className="video reveal" ref={r1}>
          <figure className="video-frame photo-frame">
            <img src={SUPPORT_COVER} alt="Студія Yantarne.FM" loading="lazy" />
            <figcaption className="video-cap">
              <small>СТУДІЯ YANTARNE.FM</small>
              <b>Радіо Новояворівська та Івано-Франкового — щодня в ефірі для вас</b>
            </figcaption>
          </figure>
        </div>
        <div className="support reveal" ref={r2}>
          <div className="cup"><img src={coffee} alt="" width="36" height="36" /></div>
          <h2>Будемо вдячні<br />за <span className="accent">підтримку</span></h2>
          <p>Незалежне місцеве радіо двох громад, Новояворівська та Івано-Франкового, тримається на слухачах. Кожен донат — це ще одна година ефіру.</p>
          <div className="support-actions">
            <a className="btn btn-red magnet" href={STATION.monoJarUrl} target="_blank" rel="noopener noreferrer">Поповнити банку Mono</a>
          </div>
        </div>
      </div>
    </section>
  )
}
