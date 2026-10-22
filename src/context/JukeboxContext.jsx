import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import sushiLogo from '../assets/demo/logo-sushibox.webp'
import npLogo from '../assets/demo/logo-novaposhta.webp'
import clayLogo from '../assets/demo/logo-clay.webp'
import udoxLogo from '../assets/demo/logo-udox.webp'

// ─────────────────────────────────────────────────────────────────────────────
// «Музичний автомат»: ПРОТОТИП інтерфейсу.
// Замовлення, черга й оплата змодельовані в браузері. Логотипи компаній — приклади.
// Робоча версія: POST /api/orders (компанія, лого, побажання, час) → оплата (Monobank / LiqPay)
// → модерація в адмінці → замовлення стає в чергу, ведучий бачить його в ефірному плані.
// ─────────────────────────────────────────────────────────────────────────────

export const JUKEBOX = {
  enabled: true,
  demo: true,
  // ціни для прикладу
  prices: {
    song: 150, // пісня в ефірі + побажання від ведучого
    perDay: 40, // логотип підстрибує на головній: ціна за добу
    exactTime: 30 // доплата за точний час пісні
  },
  // термін розміщення логотипа; довше — дешевше за добу
  plans: [
    { days: 1 },
    { days: 3 },
    { days: 7, discount: 0.15 },
    { days: 14, discount: 0.25 }
  ]
}

const DAY = 864e5

// Розрахунок вартості: пісня + логотип на N діб (зі знижкою) + точний час
export function calcPrice(days, exact) {
  const plan = JUKEBOX.plans.find(p => p.days === days) || { days, discount: 0 }
  const logoFull = JUKEBOX.prices.perDay * days
  const discount = Math.round(logoFull * (plan.discount || 0))
  const exactFee = exact ? JUKEBOX.prices.exactTime : 0
  return { song: JUKEBOX.prices.song, logoFull, discount, logo: logoFull - discount, exact: exactFee, total: JUKEBOX.prices.song + logoFull - discount + exactFee, pct: plan.discount || 0 }
}
export const MIN_PRICE = JUKEBOX.prices.song + JUKEBOX.prices.perDay

export const plural = (n, one, few, many) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many }
export const daysWord = n => n + ' ' + plural(n, 'день', 'дні', 'днів')

// скільки ще логотип на сайті: «2 дні 5 год», «9 год 20 хв»; коротко: «2 дн», «9 год»
export function fmtLeft(ms, short = false) {
  const m = Math.max(0, Math.floor(ms / 60000)), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60
  if (short) return d ? d + ' дн' : h ? h + ' год' : mm + ' хв'
  return d ? `${daysWord(d)}${h ? ' ' + h + ' год' : ''}` : h ? `${h} год ${mm} хв` : `${mm} хв`
}
export const fmtDate = t => new Date(t).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' }) + ', ' + new Date(t).toTimeString().slice(0, 5)

const at = (h, m) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime() }
const nowSlot = (plusMin) => { const d = new Date(Date.now() + plusMin * 60000); d.setSeconds(0, 0); d.setMinutes(Math.round(d.getMinutes() / 5) * 5); return d.getTime() }

// Пісню в ефір замовляють лише компанії; саму пісню підбирає ведучий
function seed() {
  const now = Date.now()
  return [
    { id: 's1', kind: 'company', name: 'Sushi Box', logo: sushiLogo, time: nowSlot(-2), note: 'Смачного вечора, Новояворівськ!', days: 3, until: now + 2 * DAY + 5 * 36e5 },
    { id: 's2', kind: 'company', name: 'UDOX', logo: udoxLogo, time: nowSlot(15), note: 'Сайти та цифровізація для вашого бізнесу', days: 7, until: now + 6 * DAY + 20 * 36e5 },
    { id: 's3', kind: 'company', name: 'Нова пошта', logo: npLogo, time: nowSlot(30), note: '', days: 1, until: now + 9 * 36e5 + 40 * 6e4 },
    { id: 's4', kind: 'company', name: 'Студія «Глина»', logo: clayLogo, time: nowSlot(45), note: 'Майстер-клас з кераміки в суботу', days: 14, until: now + 11 * DAY + 3 * 36e5 }
  ]
}

const Ctx = createContext(null)

export function JukeboxProvider({ children }) {
  const [queue, setQueue] = useState(seed)
  const [open, setOpen] = useState(false)
  const [focusId, setFocusId] = useState(null) // нове замовлення, яке підсвічуємо

  const addOrder = useCallback(order => {
    const id = 'o' + Date.now()
    setQueue(q => [...q, { ...order, id }].sort((a, b) => a.time - b.time))
    setFocusId(id)
    return id
  }, [])

  // зайняті часові слоти (щоб не продати один час двічі)
  const busy = useMemo(() => new Set(queue.map(o => o.time)), [queue])

  const value = useMemo(() => ({ queue, addOrder, busy, open, setOpen, focusId }), [queue, addOrder, busy, open, focusId])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useJukebox = () => useContext(Ctx)
export { at }
