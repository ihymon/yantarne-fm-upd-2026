import { useRef } from 'react'
import { STATION } from '../data/station'
import { fmt } from '../data/schedule'
import { usePlayer } from '../context/PlayerContext'
import PlayButton from './PlayButton'
import HeroSlider from './HeroSlider'
import { HeroEq } from './Equalizer'
import JukeboxBubbles from './JukeboxBubbles'
import { JukeboxLauncher } from './Jukebox'

const TITLE = 'Yantarne.fm'

export default function Hero({ view }) {
  const heroRef = useRef(null)
  const { status, track, listeners, show } = usePlayer()

  const onMove = e => {
    const el = heroRef.current
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', e.clientX - r.left + 'px')
    el.style.setProperty('--my', e.clientY - r.top + 'px')
  }

  let hint = fmt(show.a) + ' – ' + fmt(show.b) + ' · натисніть, щоб слухати'
  if (status === 'loading') hint = 'Підключаємось до ефіру…'
  if (status === 'playing') hint = track ? '♪ ' + track : fmt(show.a) + ' – ' + fmt(show.b)

  return (
    <div className="hero" id="top" ref={heroRef} onMouseMove={onMove}>
      <HeroSlider active={view === 'photo'} heroRef={heroRef} />
      <div className="blob a"></div><div className="blob b"></div><div className="spot"></div>
      <HeroEq />
      <JukeboxBubbles />
      <div className="kicker">{STATION.city.toUpperCase()} · З {STATION.since} РОКУ</div>
      <h1 className="title" lang="en" aria-label={TITLE}>
        {TITLE.split('').map((c, i) => <span key={i} className="ch" aria-hidden="true" style={{ animationDelay: i * 0.07 + 's' }}>{c}</span>)}
      </h1>
      <div className="freqs">
        {STATION.frequencies.map(f => (
          <div className="fq" key={f.mhz}><b>{f.mhz}</b><span>FM</span><small>{f.city}</small></div>
        ))}
      </div>
      <div className="player">
        <div className="play-wrap">
          <span className="ring"></span><span className="ring"></span>
          <PlayButton className="magnet" />
        </div>
        <div className="now">
          <small>ЗАРАЗ В ЕФІРІ</small>
          <strong>{show.t}</strong>
          {status === 'error'
            ? <span className="err">Не вдалося підключитися до ефіру. Спробуйте ще раз.</span>
            : <span>{hint}{listeners != null && status === 'playing' && <span className="listeners">· {listeners} слухачів</span>}</span>}
        </div>
      </div>
      <JukeboxLauncher />
    </div>
  )
}
