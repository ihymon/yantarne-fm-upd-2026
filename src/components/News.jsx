import { useState } from 'react'
import { NEWS_COVER } from '../data/content'
import { STATION, YOUTUBE_VIDEO_ID } from '../data/station'
import { usePlayer } from '../context/PlayerContext'
import { useReveal } from '../hooks/useReveal'
import coffee from '../assets/icons/coffee.webp'

export default function News() {
  const r1 = useReveal(), r2 = useReveal()
  const [playing, setPlaying] = useState(false)
  const { stop } = usePlayer()

  const onPlay = () => {
    if (!YOUTUBE_VIDEO_ID) { window.open(STATION.youtubeChannel, '_blank', 'noopener'); return }
    stop() // зупиняємо радіо, щоб звук не накладався
    setPlaying(true)
  }

  return (
    <section id="news" className="news-sec">
      <div className="wrap news">
        <div className="video reveal" ref={r1}>
          <div className="video-frame">
            {playing ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&rel=0`}
                title="Відео Yantarne.FM"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <div className="video-bg" style={{ backgroundImage: `url(${NEWS_COVER})` }} />
                <button type="button" className="vplay magnet" aria-label={YOUTUBE_VIDEO_ID ? 'Відтворити відео' : 'Відкрити YouTube-канал'} onClick={onPlay}>
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" /></svg>
                </button>
                <div className="video-cap">
                  <small>НОВИНИ · ВІДЕО</small>
                  <b>{YOUTUBE_VIDEO_ID ? 'Останнє відео Yantarne.FM' : 'Новини та ефіри на YouTube-каналі Yantarne.FM'}</b>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="support reveal" ref={r2}>
          <div className="cup"><img src={coffee} alt="" width="36" height="36" /></div>
          <h2>Будемо вдячні<br />за <span className="accent">підтримку</span></h2>
          <p>Незалежне місцеве радіо тримається на слухачах. Кожна кава — це ще одна година ефіру.</p>
          <a className="btn btn-red magnet" href={STATION.donateUrl} target="_blank" rel="noopener noreferrer">Підтримати</a>
        </div>
      </div>
    </section>
  )
}
