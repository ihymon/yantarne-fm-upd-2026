import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { STREAM_URL, STREAM_FALLBACK_URL, STATION } from '../data/station'
import { useNowPlaying } from '../hooks/useNowPlaying'
import { useClock } from './ClockContext'

const PlayerContext = createContext(null)

// Один <audio> на весь сайт: головна кнопка і міні-плеєр керують ним спільно
export function PlayerProvider({ children }) {
  const audioRef = useRef(null)
  const [status, setStatus] = useState('paused') // paused | loading | playing | error
  const { track, listeners } = useNowPlaying()
  const { current } = useClock()

  if (!audioRef.current && typeof Audio !== 'undefined') {
    const a = new Audio()
    a.preload = 'none'
    audioRef.current = a
  }

  const start = useCallback(async (url, isFallback = false) => {
    const a = audioRef.current
    if (!a) return
    setStatus('loading')
    // для прямого ефіру щоразу підключаємось заново, щоб не грати «старий» буфер
    a.src = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now()
    try {
      await a.play()
    } catch (err) {
      if (err?.name === 'NotAllowedError') { setStatus('paused'); return }
      if (!isFallback && STREAM_FALLBACK_URL && STREAM_FALLBACK_URL !== url) return start(STREAM_FALLBACK_URL, true)
      setStatus('error')
    }
  }, [])

  const stop = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    a.pause()
    a.removeAttribute('src')
    a.load()
    setStatus('paused')
  }, [])

  const toggle = useCallback(() => {
    if (status === 'playing' || status === 'loading') stop()
    else start(STREAM_URL)
  }, [status, start, stop])

  // події аудіо
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    const onPlaying = () => setStatus('playing')
    const onWaiting = () => setStatus(s => (s === 'paused' ? s : 'loading'))
    const onPause = () => setStatus(s => (s === 'error' ? s : 'paused'))
    a.addEventListener('playing', onPlaying)
    a.addEventListener('waiting', onWaiting)
    const onError = () => { if (a.getAttribute('src')) setStatus('error') }
    a.addEventListener('pause', onPause)
    a.addEventListener('error', onError)
    return () => {
      a.removeEventListener('error', onError)
      a.removeEventListener('playing', onPlaying)
      a.removeEventListener('waiting', onWaiting)
      a.removeEventListener('pause', onPause)
    }
  }, [])

  // клас body.paused керує анімаціями (еквалайзер, кільця) у CSS
  useEffect(() => {
    document.body.classList.toggle('paused', status !== 'playing')
    document.body.classList.toggle('loading', status === 'loading')
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
    navigator.mediaSession.setActionHandler('play', () => start(STREAM_URL))
    navigator.mediaSession.setActionHandler('pause', stop)
    navigator.mediaSession.setActionHandler('stop', stop)
  }, [nowTitle, start, stop])

  const value = useMemo(() => ({ status, toggle, stop, track, listeners, show: current }), [status, toggle, stop, track, listeners, current])
  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export const usePlayer = () => useContext(PlayerContext)
