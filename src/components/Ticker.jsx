import { TICKER } from '../data/station'

export default function Ticker() {
  const items = [...TICKER, ...TICKER]
  return (
    <div className="ticker" aria-label="Новини">
      <div className="tag">НОВИНИ</div>
      <div className="track">
        {items.map((x, i) => [<span key={'t' + i}>{x}</span>, <span key={'d' + i} aria-hidden="true">●</span>])}
      </div>
    </div>
  )
}
