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

  // поки на екрані форма заявки або курсор у полі вводу — плеєр і кнопка розіграшу ховаються,
  // щоб не перекривати поля й кнопку «Надіслати заявку»
  const [formZone, setFormZone] = useState(false)
  useEffect(() => {
    let inView = false, typing = false
    const apply = () => {
      const on = inView || typing
      setFormZone(on)
      document.body.classList.toggle('form-zone', on)
    }
    const isField = el => el && el.matches?.('input, textarea, select, [contenteditable="true"]')
    const onFocus = e => { typing = isField(e.target); apply() }
    const onBlur = () => { setTimeout(() => { typing = isField(document.activeElement); apply() }, 0) }
    document.addEventListener('focusin', onFocus)
    document.addEventListener('focusout', onBlur)
    let io
    const form = document.getElementById('brief')
    if (form && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(([en]) => { inView = en.isIntersecting; apply() })
      io.observe(form)
    }
    return () => {
      document.removeEventListener('focusin', onFocus)
      document.removeEventListener('focusout', onBlur)
      io?.disconnect()
      document.body.classList.remove('form-zone')
    }
  }, [])

  const text = {
    paused: 'На паузі',
    loading: 'Підключаємось…',
    reconnecting: 'Зв’язок перервався. Відновлюємо ефір…',
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
    <div className={'mini' + (visible && !formZone ? ' show' : '')} aria-hidden={!visible || formZone} inert={!visible || formZone}>
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
