import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { STREAM_URL, STREAM_FALLBACK_URL, STATION } from '../data/station'
import { useNowPlaying } from '../hooks/useNowPlaying'
import { useClock } from './ClockContext'

const PlayerContext = createContext(null)

// Скільки чекати, перш ніж вважати, що потік «завис» (буферизація без звуку)
const STALL_MS = 12000
// Паузи між спробами перепідключення: 1 с, 2 с, 4 с … але не довше 15 с
const backoff = n => Math.min(15000, 1000 * 2 ** Math.min(n, 4))

// Один <audio> на весь сайт: головна кнопка і міні-плеєр керують ним спільно.
// status: paused | loading | playing | reconnecting | error
//   reconnecting — зв'язок пропав, плеєр сам відновить ефір (у т. ч. коли повернеться інтернет)
//   error — не вдалося підключитися з першої спроби (напр., потік недоступний)
export function PlayerProvider({ children }) {
  const audioRef = useRef(null)
  const [status, setStatus] = useState('paused')
  const { track, listeners } = useNowPlaying()
  const { current } = useClock()

  const want = useRef(false) // користувач хоче слухати
  const everPlayed = useRef(false) // у цьому сеансі звук уже йшов
  const attempt = useRef(0)
  const retryTimer = useRef(null)
  const stallTimer = useRef(null)

  if (!audioRef.current && typeof Audio !== 'undefined') {
    const a = new Audio()
    a.preload = 'none'
    audioRef.current = a
  }

  const clearTimers = () => {
    clearTimeout(retryTimer.current)
    clearTimeout(stallTimer.current)
    retryTimer.current = stallTimer.current = null
  }

  // сторож: якщо за STALL_MS звук не просунувся хоча б на секунду — перепідключаємось
  const armWatchdog = () => {
    const a = audioRef.current
    if (!a) return
    clearTimeout(stallTimer.current)
    const t0 = a.currentTime
    stallTimer.current = setTimeout(() => {
      if (want.current && (a.paused || a.currentTime - t0 < 1)) reconnectRef.current?.()
    }, STALL_MS)
  }

  const detach = () => {
    const a = audioRef.current
    if (!a) return
    a.pause()
    a.removeAttribute('src')
    a.load()
  }

  // для прямого ефіру щоразу підключаємось заново, щоб не грати «старий» буфер
  const connect = useCallback(async url => {
    const a = audioRef.current
    if (!a || !want.current) return
    a.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now()
    armWatchdog()
    try {
      await a.play()
    } catch (err) {
      if (err?.name === 'NotAllowedError') { want.current = false; clearTimers(); setStatus('paused'); return }
      if (err?.name === 'AbortError') return // перервано новим підключенням або паузою
      reconnectRef.current?.()
    }
  }, [])

  // запланувати наступну спробу; основна й резервна адреси чергуються
  const reconnectRef = useRef(null)
  reconnectRef.current = () => {
    if (!want.current) return
    clearTimers()
    const n = attempt.current++
    // перша ж спроба не вдалася і звук ще не йшов: пробуємо резервну адресу, далі показуємо помилку
    if (!everPlayed.current && n >= 1) {
      want.current = false
      detach()
      setStatus('error')
      return
    }
    setStatus(everPlayed.current ? 'reconnecting' : 'loading')
    const urls = [STREAM_URL, STREAM_FALLBACK_URL].filter(Boolean)
    const url = everPlayed.current ? urls[n % urls.length] : urls[1 % urls.length]
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return // чекаємо на подію online
    retryTimer.current = setTimeout(() => connect(url), everPlayed.current ? backoff(n) : 0)
  }

  const start = useCallback(() => {
    want.current = true
    everPlayed.current = false
    attempt.current = 0
    clearTimers()
    setStatus('loading')
    connect(STREAM_URL)
  }, [connect])

  const stop = useCallback(() => {
    want.current = false
    clearTimers()
    detach()
    setStatus('paused')
  }, [])

  const toggle = useCallback(() => {
    if (want.current) stop()
    else start()
  }, [start, stop])

  // події аудіо
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onPlaying = () => {
      clearTimers()
      attempt.current = 0
      everPlayed.current = true
      setStatus('playing')
    }
    // waiting — відтворення зупинилось через буферизацію; stalled — дані тимчасово не надходять (звук ще може грати)
    const onWaiting = () => {
      if (!want.current) return
      setStatus(s => (s === 'playing' ? 'loading' : s))
      armWatchdog()
    }
    const onStalled = () => { if (want.current) armWatchdog() }
    const onBroken = () => { if (want.current && a.getAttribute('src')) reconnectRef.current?.() }
    // потік не має кінця: якщо браузер вважає, що він закінчився, — це обрив
    const onPause = () => { if (!want.current) setStatus(s => (s === 'error' ? s : 'paused')) }
    a.addEventListener('playing', onPlaying)
    a.addEventListener('waiting', onWaiting)
    a.addEventListener('stalled', onStalled)
    a.addEventListener('error', onBroken)
    a.addEventListener('ended', onBroken)
    a.addEventListener('pause', onPause)

    const onOffline = () => { if (want.current) { clearTimers(); setStatus(everPlayed.current ? 'reconnecting' : 'loading') } }
    const onOnline = () => {
      if (!want.current) return
      clearTimers()
      attempt.current = 0
      connect(STREAM_URL)
    }
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      a.removeEventListener('playing', onPlaying)
      a.removeEventListener('waiting', onWaiting)
      a.removeEventListener('stalled', onStalled)
      a.removeEventListener('error', onBroken)
      a.removeEventListener('ended', onBroken)
      a.removeEventListener('pause', onPause)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
      clearTimers()
    }
  }, [connect])

  // класи body: paused — вимикає анімації, busy — плеєр підключається (показуємо «пауза», щоб можна було зупинити)
  useEffect(() => {
    const busy = status === 'loading' || status === 'reconnecting'
    document.body.classList.toggle('paused', status !== 'playing')
    document.body.classList.toggle('loading', busy)
    document.body.classList.toggle('busy', busy)
  }, [status])

  // Media Session: назва на екрані блокування та кнопки керування
  const nowTitle = track || current.t
  useEffect(() => {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: nowTitle,
      artist: STATION.name + ' · 97.6 / 92.8 FM',
      artwork: [{ src: new URL('icon-512.png', document.baseURI).href, sizes: '512x512', type: 'image/png' }]
    })
    navigator.mediaSession.setActionHandler('play', start)
    navigator.mediaSession.setActionHandler('pause', stop)
    navigator.mediaSession.setActionHandler('stop', stop)
  }, [nowTitle, start, stop])

  const value = useMemo(() => ({ status, toggle, stop, track, listeners, show: current }), [status, toggle, stop, track, listeners, current])
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export const usePlayer = () => useContext(PlayerContext)
