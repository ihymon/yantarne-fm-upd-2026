import { useEffect, useState } from 'react'
import { STREAM_STATUS_URL, STATION } from '../data/station'

// Опитує Icecast status-json: назва поточного треку та кількість слухачів.
// Якщо сервер недоступний або блокує CORS — тихо повертає null.
export function useNowPlaying(intervalMs = 20000) {
  const [data, setData] = useState({ track: null, listeners: null })

  useEffect(() => {
    if (!STREAM_STATUS_URL) return
    let alive = true
    const load = async () => {
      try {
        const res = await fetch(STREAM_STATUS_URL, { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        let src = json?.icestats?.source
        if (Array.isArray(src)) src = src.find(s => String(s.listenurl || '').includes('/yantarne')) || src[0]
        if (!src || !alive) return
        const raw = [src.artist, src.title].filter(Boolean).join(' — ').trim()
        const track = raw && raw.toLowerCase() !== STATION.name.toLowerCase() ? raw : null
        setData({ track, listeners: Number.isFinite(src.listeners) ? src.listeners : null })
      } catch { /* мережа / CORS — ігноруємо */ }
    }
    load()
    const id = setInterval(load, intervalMs)
    return () => { alive = false; clearInterval(id) }
  }, [intervalMs])

  return data
}
