import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import sushiLogo from '../assets/demo/logo-sushibox.webp'
import npLogo from '../assets/demo/logo-novaposhta.webp'
import clayLogo from '../assets/demo/logo-clay.webp'

// ─────────────────────────────────────────────────────────────────────────────
// «Музичний автомат»: ПРОТОТИП інтерфейсу.
// Замовлення, черга й оплата змодельовані в браузері. Логотипи компаній — приклади.
// Робоча версія: POST /api/orders (пісня, хто, лого, час) → оплата (Monobank / LiqPay)
// → модерація в адмінці → замовлення стає в чергу, ведучий бачить його в ефірному плані.
// ─────────────────────────────────────────────────────────────────────────────

export const JUKEBOX = {
  enabled: true,
  demo: true,
  // ціни для прикладу
  prices: { person: 50, company: 150, exactTime: 30 },
  songs: [
    { title: 'Фанат', artist: 'Alena Omargalieva' },
    { title: 'Енкарапіста', artist: 'DREVO' },
    { title: 'Сльозка', artist: 'Кажанна' },
    { title: 'З якого ти поверху неба?', artist: 'Jerry Heil & YARMAK' },
    { title: 'Японія', artist: 'DOROFEEVA' },
    { title: 'Стефанія', artist: 'Kalush Orchestra' },
    { title: 'Дикі танці', artist: 'Руслана' },
    { title: 'Обійми', artist: 'Океан Ельзи' },
    { title: 'Плакала', artist: 'KAZKA' },
    { title: 'Шум', artist: 'Go_A' }
  ]
}

const at = (h, m) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.getTime() }
const nowSlot = (plusMin) => { const d = new Date(Date.now() + plusMin * 60000); d.setSeconds(0, 0); d.setMinutes(Math.round(d.getMinutes() / 5) * 5); return d.getTime() }

function seed() {
  return [
    { id: 's1', kind: 'company', name: 'Sushi Box', logo: sushiLogo, song: JUKEBOX.songs[1], time: nowSlot(-2), note: 'Смачного вечора, Новояворівськ!' },
    { id: 's2', kind: 'person', name: 'Оксана', song: JUKEBOX.songs[4], time: nowSlot(12), note: 'Для подруги Ірини з днем народження' },
    { id: 's3', kind: 'company', name: 'Нова пошта', logo: npLogo, song: JUKEBOX.songs[5], time: nowSlot(25), note: '' },
    { id: 's4', kind: 'person', name: 'Тарас і Марта', song: JUKEBOX.songs[7], time: nowSlot(40), note: 'Нашій першій річниці' },
    { id: 's5', kind: 'company', name: 'Студія «Глина»', logo: clayLogo, song: JUKEBOX.songs[3], time: nowSlot(55), note: '' },
    { id: 's6', kind: 'person', name: 'Андрій', song: JUKEBOX.songs[0], time: nowSlot(70), note: 'Для всіх, хто зараз за кермом' }
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
