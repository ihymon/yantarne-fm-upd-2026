import { useEffect, useRef, useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useTopSongs } from '../hooks/useTopSongs'
import { usePlayer } from '../context/PlayerContext'
import { HeartIcon, PlayIcon, PauseIcon } from './Icons'

const fmtTime = s => (Number.isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00')

function Song({ s, i, liked, onLike, active, playing, progress, duration, onToggle, onSeek, broken }) {
  const reveal = useReveal()
  const [pop, setPop] = useState(false)
  const [imgOk, setImgOk] = useState(true)
  const label = s.artist + ' — ' + s.title

  const seek = e => {
    const r = e.currentTarget.getBoundingClientRect()
    onSeek(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)))
  }

  return (
    <div className={'song reveal' + (active ? ' active' : '') + (playing ? ' playing' : '')} ref={reveal}>
      <div className="n">{String(i + 1).padStart(2, '0')}</div>
      <button type="button" className="cover" onClick={onToggle} disabled={!s.audio} aria-label={(playing ? 'Пауза: ' : 'Слухати: ') + label}>
        {s.image && imgOk
          ? <img src={s.image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setImgOk(false)} />
          : <span className="vinyl"><i style={{ '--c': i % 2 ? 'var(--text)' : 'var(--red)' }} /></span>}
        {s.audio && <span className="cover-btn" aria-hidden="true">{playing ? <PauseIcon /> : <PlayIcon />}</span>}
      </button>
      <div className="meta">
        <b>{s.title}</b>
        <span>{s.artist}</span>
        {active && broken && <small className="track-err">Трек тимчасово недоступний</small>}
        {active && !broken && (
          <div className="track-bar">
            <div className="bar" role="slider" tabIndex={0} aria-label="Позиція треку" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}
              onClick={seek}
              onKeyDown={e => { if (e.key === 'ArrowRight') onSeek(Math.min(1, progress + 0.05)); if (e.key === 'ArrowLeft') onSeek(Math.max(0, progress - 0.05)) }}>
              <i style={{ width: progress * 100 + '%' }} />
            </div>
            <small>{fmtTime(progress * duration)} / {fmtTime(duration)}</small>
          </div>
        )}
      </div>
      <button
        type="button"
        className={'like' + (liked ? ' on' : '') + (pop ? ' pop' : '')}
        aria-label={'Подобається: ' + label}
        aria-pressed={liked}
        onClick={() => { onLike(); setPop(true) }}
        onAnimationEnd={() => setPop(false)}
      ><HeartIcon /></button>
    </div>
  )
}

export default function TopSongs() {
  const reveal = useReveal()
  const songs = useTopSongs()
  const [likes, setLikes] = useLocalStorage('yfm-likes', {})
  const { status: liveStatus, stop: stopLive } = usePlayer()
  const audio = useRef(null)
  const [cur, setCur] = useState(-1)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [broken, setBroken] = useState({}) // треки, які не вдалося завантажити

  // один <audio> для прослуховування треків
  useEffect(() => {
    const a = new Audio()
    a.preload = 'none'
    const time = () => setProgress(a.duration ? a.currentTime / a.duration : 0)
    const meta = () => setDuration(a.duration || 0)
    const on = () => setPlaying(true)
    const off = () => setPlaying(false)
    const end = () => { setPlaying(false); setProgress(0) }
    const fail = () => { if (a.getAttribute('src')) { setPlaying(false); setBroken(b => ({ ...b, [a.getAttribute('src')]: true })) } }
    a.addEventListener('error', fail)
    a.addEventListener('timeupdate', time)
    a.addEventListener('loadedmetadata', meta)
    a.addEventListener('playing', on)
    a.addEventListener('pause', off)
    a.addEventListener('ended', end)
    audio.current = a
    return () => { a.pause(); a.src = ''; audio.current = null }
  }, [])

  // увімкнули прямий ефір — ставимо трек на паузу
  useEffect(() => {
    if (liveStatus === 'loading' || liveStatus === 'playing') audio.current?.pause()
  }, [liveStatus])

  // список оновився з API — скидаємо програвання
  useEffect(() => { audio.current?.pause(); setCur(-1); setProgress(0) }, [songs])

  const toggle = i => {
    const a = audio.current
    if (!a || !songs[i]?.audio) return
    if (cur === i) {
      if (a.paused) { stopLive(); a.play().catch(() => {}) } else a.pause()
      return
    }
    stopLive() // щоб звук ефіру не накладався
    a.src = songs[i].audio
    setCur(i); setProgress(0); setDuration(0)
    a.play().catch(err => { setPlaying(false); if (err?.name === 'NotSupportedError') setBroken(b => ({ ...b, [songs[i].audio]: true })) })
  }

  const seek = f => {
    const a = audio.current
    if (a?.duration) a.currentTime = f * a.duration
  }

  return (
    <section id="top-songs">
      <div className="wrap top">
        <div className="reveal" ref={reveal}>
          <h2 className="sec-title"><span className="accent">ТОП</span><br />пісень</h2>
          <p>Пісні, які слухачі Yantarne.FM замовляють найчастіше. Натисніть на обкладинку, щоб послухати, і ставте серце улюбленим.</p>
        </div>
        <div className="songs">
          {songs.map((s, i) => {
            const key = s.artist + '—' + s.title
            return (
              <Song
                key={(s.id || key) + i}
                s={s}
                i={i}
                liked={!!likes[key]}
                onLike={() => setLikes(l => ({ ...l, [key]: !l[key] }))}
                active={cur === i}
                playing={cur === i && playing}
                progress={cur === i ? progress : 0}
                duration={cur === i ? duration : 0}
                onToggle={() => toggle(i)}
                onSeek={seek}
                broken={!!broken[s.audio]}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
