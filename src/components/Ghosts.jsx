import { useEffect, useState } from 'react'
import { usePlayer } from '../context/PlayerContext'

// ─────────────────────────────────────────────────────────────────────────────
// Хелловін: привиди пропливають головним екраном.
// Коли ефір грає — «танцюють» у такт і світяться; на паузі ледь видні.
// Торкніться привида — він каже «Бу!» і розчиняється, а згодом повертається.
// Вмикається VITE_THEME=halloween або автоматично з 25 жовтня по 1 листопада.
// ─────────────────────────────────────────────────────────────────────────────

const env = import.meta.env
export function isHalloween(d = new Date()) {
  if (env.VITE_THEME === 'halloween') return true
  if (env.VITE_THEME === 'off') return false
  const m = d.getMonth(), day = d.getDate()
  return (m === 9 && day >= 25) || (m === 10 && day <= 1)
}

// траєкторії: висота, розмір, тривалість, затримка, напрямок, аксесуар
const GHOSTS = [
  { top: 14, size: 92, dur: 26, delay: -4, dir: 1, kind: 'phones' },
  { top: 58, size: 64, dur: 34, delay: -18, dir: -1 },
  { top: 30, size: 48, dur: 40, delay: -9, dir: 1, kind: 'small' },
  { top: 70, size: 78, dur: 30, delay: -24, dir: 1, kind: 'note' },
  { top: 8, size: 40, dur: 46, delay: -31, dir: -1, kind: 'small' }
]

function GhostSvg({ kind }) {
  return (
    <svg viewBox="0 0 120 140" aria-hidden="true">
      <defs>
        <radialGradient id="gh-body" cx="40%" cy="30%" r="75%">
          <stop offset="0" stopColor="#fff" />
          <stop offset=".7" stopColor="#F1F1F1" />
          <stop offset="1" stopColor="#D9D9D9" />
        </radialGradient>
      </defs>
      <path className="gh-body" d="M60 6C30 6 12 30 12 60v62c0 6 6 8 10 3l9-10 9 12c3 4 8 4 11 0l9-12 9 12c3 4 8 4 11 0l9-12 9 10c4 5 10 3 10-3V60C108 30 90 6 60 6z" fill="url(#gh-body)" />
      <ellipse className="gh-eye" cx="45" cy="58" rx="7" ry="10" />
      <ellipse className="gh-eye" cx="75" cy="58" rx="7" ry="10" />
      <ellipse cx="60" cy="80" rx="7" ry={kind === 'small' ? 4 : 8} fill="#1a1a1a" />
      <ellipse cx="34" cy="72" rx="6" ry="3.5" fill="#AE080B" opacity=".25" />
      <ellipse cx="86" cy="72" rx="6" ry="3.5" fill="#AE080B" opacity=".25" />
      {kind === 'phones' && (
        <g className="gh-phones">
          <path d="M22 54c0-26 17-40 38-40s38 14 38 40" fill="none" stroke="#AE080B" strokeWidth="6" strokeLinecap="round" />
          <rect x="12" y="46" width="16" height="26" rx="7" fill="#AE080B" />
          <rect x="92" y="46" width="16" height="26" rx="7" fill="#AE080B" />
        </g>
      )}
      {kind === 'note' && (
        <g className="gh-note" fill="#AE080B">
          <path d="M104 20v26a7 7 0 1 1-4-6V14l16-4v8z" />
        </g>
      )}
    </svg>
  )
}

export default function Ghosts() {
  const { status } = usePlayer()
  const [gone, setGone] = useState({})

  const boo = i => {
    if (gone[i]) return
    setGone(g => ({ ...g, [i]: true }))
    setTimeout(() => setGone(g => ({ ...g, [i]: false })), 6000)
  }

  return (
    <div className={'ghosts' + (status === 'playing' ? ' live' : '')} aria-hidden="true">
      {GHOSTS.map((g, i) => (
        <div
          key={i}
          className={'ghost-track' + (g.dir < 0 ? ' rtl' : '')}
          style={{ top: g.top + '%', '--dur': g.dur + 's', '--delay': g.delay + 's' }}
        >
          <button
            type="button"
            tabIndex={-1}
            className={'ghost' + (gone[i] ? ' poof' : '')}
            style={{ '--s': g.size + 'px', '--bob': (2.6 + i * 0.4) + 's' }}
            onClick={() => boo(i)}
          >
            <GhostSvg kind={g.kind} />
            <span className="ghost-boo">Бу!</span>
          </button>
        </div>
      ))}
    </div>
  )
}

// ── Гарбузи-ліхтарі внизу головного екрана ──
const PUMPKINS = [
  { left: 7, size: 86, delay: 0 },
  { left: 19, size: 56, delay: .4, tilt: -8 },
  { left: 80, size: 64, delay: .9, tilt: 6 },
  { left: 91, size: 96, delay: .2 }
]

function PumpkinSvg() {
  return (
    <svg viewBox="0 0 120 110" aria-hidden="true">
      <path d="M60 22c-2-8 0-14 6-18l5 3c-5 3-6 8-5 15z" fill="#4E7A35" />
      <path d="M66 14c8-6 18-6 22 0-8 0-14 2-18 6z" fill="#5E9640" />
      <ellipse cx="34" cy="62" rx="28" ry="38" fill="#D9620F" />
      <ellipse cx="86" cy="62" rx="28" ry="38" fill="#D9620F" />
      <ellipse cx="60" cy="62" rx="30" ry="42" fill="#F07A1A" />
      <ellipse cx="60" cy="62" rx="14" ry="40" fill="#F58A2A" opacity=".55" />
      <g className="pk-face">
        <path d="M36 50l12-10 6 14z" />
        <path d="M84 50l-12-10-6 14z" />
        <path d="M60 58l-5 9h10z" />
        <path d="M30 72c10 14 50 14 60 0-4 1-8 1-10 0l-4 8-6-7-5 8-5-8-5 8-6-8-5 7-4-8c-3 1-6 1-10 0z" />
      </g>
    </svg>
  )
}

export function Pumpkins() {
  const { status } = usePlayer()
  return (
    <div className={'pumpkins' + (status === 'playing' ? ' live' : '')} aria-hidden="true">
      {PUMPKINS.map((p, i) => (
        <span key={i} className="pumpkin" style={{ left: p.left + '%', '--s': p.size + 'px', '--t': (p.tilt || 0) + 'deg', '--pd': p.delay + 's' }}>
          <PumpkinSvg />
        </span>
      ))}
    </div>
  )
}

// гарбуз на вкладці браузера
export function useHalloweenFavicon(on) {
  useEffect(() => {
    if (!on) return
    const href = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🎃</text></svg>')
    const links = [...document.querySelectorAll('link[rel="icon"]')]
    const old = links.map(l => [l, l.href])
    links.forEach(l => { l.href = href; l.type = 'image/svg+xml' })
    return () => old.forEach(([l, h]) => { l.href = h })
  }, [on])
}
