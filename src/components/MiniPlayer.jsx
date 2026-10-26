import { useEffect, useRef, useState } from 'react'
import { usePlayer } from '../context/PlayerContext'
import PlayButton from './PlayButton'
import { MiniEq } from './Equalizer'

// Плаваючий міні-плеєр: з'являється, коли hero прокручено
export default function MiniPlayer() {
  const { status, track, show } = usePlayer()
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const on = () => {
      const hero = document.getElementById('top')
      setVisible(window.scrollY > (hero ? hero.offsetHeight : 600) * 0.7)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  const text = {
    paused: 'На паузі',
    loading: 'Підключаємось…',
    playing: 'Зараз грає: ' + (track || show.t),
    error: 'Помилка підключення'
  }[status]

  // довгу назву треку не обрізаємо, а плавно прокручуємо рядком
  const box = useRef(null), line = useRef(null)
  const [run, setRun] = useState(0)
  useEffect(() => {
    const measure = () => {
      if (!box.current || !line.current) return
      const extra = line.current.scrollWidth - box.current.clientWidth
      setRun(extra > 4 ? extra : 0)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [text, visible])

  return (
    <div className={'mini' + (visible ? ' show' : '')} aria-hidden={!visible}>
      <PlayButton />
      <div className="info">
        <b>Yantarne.FM<span className="mini-freq"> · 97.6 / 92.8</span></b>
        <span className={'mini-line' + (run ? ' run' : '')} ref={box} title={text}>
          <span ref={line} aria-live="polite" style={run ? { '--run': -run + 'px', '--dur': Math.max(6, run / 30) + 's' } : undefined}>{text}</span>
        </span>
      </div>
      <MiniEq />
    </div>
  )
}
