import { useState } from 'react'
import { TOP_SONGS } from '../data/content'
import { useReveal } from '../hooks/useReveal'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { HeartIcon } from './Icons'

const LABELS = ['var(--red)', 'var(--text)', 'var(--red-dark)', 'var(--muted)', 'var(--red)']
const moveColor = m => (m.startsWith('▲') ? '#5CC98A' : m.startsWith('▼') ? 'var(--red)' : m === 'NEW' ? 'var(--text)' : 'var(--dim)')

function Song({ s, i, liked, onLike }) {
  const reveal = useReveal()
  const [pop, setPop] = useState(false)
  return (
    <div className="song reveal" ref={reveal}>
      <div className="n">{String(i + 1).padStart(2, '0')}</div>
      <div className="vinyl"><i style={{ '--c': LABELS[i % LABELS.length] }} /></div>
      <div className="meta"><b>{s.title}</b><span>{s.artist}</span></div>
      <div className="move" style={{ color: moveColor(s.move) }}>{s.move}</div>
      <button
        type="button"
        className={'like' + (liked ? ' on' : '') + (pop ? ' pop' : '')}
        aria-label={'Подобається: ' + s.title}
        aria-pressed={liked}
        onClick={() => { onLike(); setPop(true) }}
        onAnimationEnd={() => setPop(false)}
      ><HeartIcon /></button>
    </div>
  )
}

export default function TopSongs() {
  const reveal = useReveal()
  const [likes, setLikes] = useLocalStorage('yfm-likes', {})
  return (
    <section id="top-songs">
      <div className="wrap top">
        <div className="reveal" ref={reveal}>
          <h2 className="sec-title"><span className="accent">ТОП</span><br />пісень</h2>
          <p>Наведіть на трек — платівка закрутиться. Ставте серце улюбленим пісням, і вони піднімуться в рейтингу.</p>
        </div>
        <div className="songs">
          {TOP_SONGS.map((s, i) => {
            const key = s.artist + '—' + s.title
            return <Song key={key + i} s={s} i={i} liked={!!likes[key]} onLike={() => setLikes(l => ({ ...l, [key]: !l[key] }))} />
          })}
        </div>
      </div>
    </section>
  )
}
