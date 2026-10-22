import { useEffect, useState } from 'react'
import { API_URL } from '../data/station'
import { TOP_SONGS } from '../data/content'

// ТОП пісень з адмінки радіо: GET {API_URL}/top-songs → { songs: [{ title, artist, image, audio, index }] }.
// Одразу показуємо запасний список, а коли API відповість — підміняємо актуальним.
export function useTopSongs() {
  const [songs, setSongs] = useState(TOP_SONGS)
  useEffect(() => {
    if (!API_URL) return
    let alive = true
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 60000) // безкоштовний сервер може «прокидатися» до хвилини
    fetch(API_URL + '/top-songs', { signal: ctrl.signal })
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .then(json => {
        const list = (json?.songs || [])
          .filter(s => s && (s.title || s.artist))
          .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
          .map(s => ({
            id: s._id,
            title: String(s.title || '').trim(),
            artist: String(s.artist || '').trim(),
            image: s.image || '',
            audio: s.audio || ''
          }))
        if (alive && list.length) setSongs(list)
      })
      .catch(() => { /* лишаємо запасний список */ })
      .finally(() => clearTimeout(timer))
    return () => { alive = false; ctrl.abort(); clearTimeout(timer) }
  }, [])
  return songs
}
