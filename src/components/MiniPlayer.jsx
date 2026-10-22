import { useEffect, useState } from 'react'
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

  return (
    <div className={'mini' + (visible ? ' show' : '')} aria-hidden={!visible}>
      <PlayButton />
      <div className="info"><b>Yantarne.FM · 97.6 / 92.8</b><span aria-live="polite">{text}</span></div>
      <MiniEq />
    </div>
  )
}
