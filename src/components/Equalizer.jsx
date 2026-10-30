import { useMemo } from 'react'

// Великий еквалайзер у hero
export function HeroEq() {
  const bars = useMemo(() => {
    const n = typeof window !== 'undefined' && window.innerWidth < 640 ? 36 : 64
    return Array.from({ length: n }, (_, i) => {
      const mid = Math.abs(i - n / 2) / (n / 2)
      // один фірмовий червоний; до країв смужки тьмяніють через прозорість
      return {
        height: 60 + ((i * 29) % 7) * 17 + 'px',
        background: 'var(--red)',
        opacity: mid < 0.35 ? 1 : mid < 0.7 ? 0.75 : 0.55,
        '--d': (0.5 + ((i * 37) % 11) / 10).toFixed(2) + 's',
        '--delay': '-' + (((i * 53) % 17) / 10).toFixed(2) + 's'
      }
    })
  }, [])
  return <div className="eq" aria-hidden="true">{bars.map((st, i) => <span key={i} style={st} />)}</div>
}

// Малий еквалайзер у міні-плеєрі
export function MiniEq() {
  const bars = Array.from({ length: 12 }, (_, j) => ({ '--d': (0.4 + (j % 5) / 8).toFixed(2) + 's', '--delay': '-' + ((j * 7) % 10) / 10 + 's' }))
  return <div className="mini-eq" aria-hidden="true">{bars.map((st, i) => <span key={i} style={st} />)}</div>
}
