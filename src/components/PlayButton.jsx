import { usePlayer } from '../context/PlayerContext'
import { PlayIcon, PauseIcon } from './Icons'

export default function PlayButton({ className = '' }) {
  const { status, toggle } = usePlayer()
  const active = status === 'playing' || status === 'loading'
  return (
    <button type="button" className={'play ' + className} onClick={toggle} aria-label={active ? 'Пауза' : 'Слухати ефір'} aria-pressed={active}>
      <PlayIcon />
      <PauseIcon />
    </button>
  )
}
