import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import udoxLogo from '../assets/partners/partner-2.webp'

// ─────────────────────────────────────────────────────────────────────────────
// «Лайкай ефір — вигравай»: ПРОТОТИП.
// Усі дані тут змодельовані в браузері (інші слухачі, лічильники, розіграш).
// У робочій версії ці функції замінюються запитами до бекенду радіо:
//   POST /api/likes/join  { name, contact }        → { participantId }
//   POST /api/likes       { participantId, show }  → { ok } | { error: 'cooldown', retryAt }
//   GET  /api/likes/today                          → { total, participants, feed, myTickets, nextLikeAt, winner }
// Сервер прив'язує учасника до IP + ідентифікатора пристрою, рахує паузу між лайками
// і в кінці дня проводить розіграш (шанс пропорційний кількості лайків-квитків).
// ─────────────────────────────────────────────────────────────────────────────

const env = import.meta.env

// Налаштування акції. Зараз увімкнено за замовчуванням.
// Надалі адмін-панель вмикатиме акцію на свята, вихідні чи під спонсора:
// сайт читає JSON з VITE_PROMO_CONFIG_URL (напр. {API_URL}/promo) і накладає його поверх цих значень,
// наприклад: { "enabled": true, "occasion": "Святковий розіграш", "prize": { "title": "...", "from": "від кав'ярні «Зерно»" },
//             "sponsor": { "name": "Зерно", "logo": "https://…/logo.png", "tagline": "…", "pitch": "…", "url": "https://…" } }
export const LIKE_CONFIG = {
  enabled: env.VITE_PROMO_ENABLED !== 'false', // вимкнути: VITE_PROMO_ENABLED=false
  demoData: true, // поки немає бекенду: лічильники й учасники змодельовані, показується позначка «ДЕМО»
  occasion: 'Розіграш дня', // підпис на кнопці-подарунку й у вікні
  cooldownMin: 15, // один лайк раз на 15 хвилин = один «квиток» у розіграш
  maxTicketsPerDay: 20, // стеля, щоб шанси були чесними
  drawHour: 20, // розіграш о 20:00 в ефірі «Вечірній драйв»
  prize: { title: 'Сертифікат на 500 ₴', from: 'від UDOX', note: 'Переможця оголошуємо в прямому ефірі та в Instagram' },
  // партнер, який дарує приз (з адмінки можна передати іншого: name, logo, tagline, pitch, url)
  sponsor: {
    name: 'UDOX',
    logo: udoxLogo,
    tagline: 'IT-компанія · сайти та цифровізація бізнесу',
    pitch: 'Створюємо сайти, які приводять клієнтів, і автоматизуємо рутину: CRM, Telegram-боти, рішення зі штучним інтелектом.',
    url: '' // посилання на сайт партнера
  },
  yesterdayWinner: 'Марія К.'
}

const DEMO_NAMES = ['Оксана', 'Андрій', 'Ірина', 'Тарас', 'Наталія', 'Богдан', 'Юлія', 'Роман', 'Христина', 'Василь', 'Олена', 'Михайло', 'Софія', 'Дмитро', 'Галина', 'Максим', 'Анна', 'Петро', 'Леся', 'Ігор']
const DEMO_LETTERS = 'АБВГДЄЗІКЛМНОПРСТФХШ'
const KEY = 'yfm-likedraw-demo'
const today = () => new Date().toISOString().slice(0, 10)
const rnd = n => Math.floor(Math.random() * n)
const shortName = (name) => {
  const [first, last] = String(name).trim().split(/\s+/)
  return last ? `${first} ${last[0]}.` : first
}
const demoPerson = () => DEMO_NAMES[rnd(DEMO_NAMES.length)] + ' ' + DEMO_LETTERS[rnd(DEMO_LETTERS.length)] + '.'

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (s && s.day === today()) return s
    if (s?.me) return { day: today(), me: s.me, likes: [] } // новий день — квитки обнуляються, ім'я лишається
  } catch { /* ignore */ }
  return { day: today(), me: null, likes: [] }
}

// базові «чужі» цифри, що ростуть протягом дня
function seedCrowd() {
  const h = new Date().getHours() + new Date().getMinutes() / 60
  const k = Math.max(0.15, Math.min(1, h / 20))
  const participants = Math.round(140 + 260 * k)
  const others = Array.from({ length: 40 }, () => ({ name: demoPerson(), tickets: 1 + rnd(12) }))
  return { total: Math.round(participants * (3.2 + rnd(10) / 10)), participants, others }
}

// Конфіг акції з адмінки (якщо вказано VITE_PROMO_CONFIG_URL). Без адреси — значення за замовчуванням.
export function usePromoConfig() {
  const [cfg, setCfg] = useState(LIKE_CONFIG)
  useEffect(() => {
    const url = env.VITE_PROMO_CONFIG_URL
    if (!url) return
    let alive = true
    fetch(url).then(r => (r.ok ? r.json() : null)).then(remote => {
      if (alive && remote && typeof remote === 'object') {
        setCfg(c => ({ ...c, ...remote, prize: { ...c.prize, ...(remote.prize || {}) }, sponsor: remote.sponsor === null ? null : { ...c.sponsor, ...(remote.sponsor || {}) } }))
      }
    }).catch(() => {})
    return () => { alive = false }
  }, [])
  return cfg
}

export function nextDrawAt(now = new Date()) {
  const d = new Date(now)
  d.setHours(LIKE_CONFIG.drawHour, 0, 0, 0)
  if (d <= now) d.setDate(d.getDate() + 1)
  return d
}

export function useLikeDraw(currentShow) {
  const [store, setStore] = useState(load)
  const [crowd, setCrowd] = useState(seedCrowd)
  const [feed, setFeed] = useState(() => Array.from({ length: 4 }, (_, i) => ({ id: 'seed' + i, name: demoPerson(), show: currentShow, ago: (i + 1) * 2 })))
  const [now, setNow] = useState(Date.now())
  const [winner, setWinner] = useState(null)
  const showRef = useRef(currentShow)
  showRef.current = currentShow

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(store)) } catch { /* ignore */ } }, [store])

  // секундний годинник для таймерів
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // імітація інших слухачів
  useEffect(() => {
    let t
    const tick = () => {
      const name = demoPerson()
      setFeed(f => [{ id: Date.now() + name, name, show: showRef.current, ago: 0 }, ...f].slice(0, 6))
      setCrowd(c => ({ ...c, total: c.total + 1, participants: c.participants + (Math.random() < 0.25 ? 1 : 0) }))
      t = setTimeout(tick, 2500 + rnd(4500))
    }
    t = setTimeout(tick, 2000)
    return () => clearTimeout(t)
  }, [])

  const cooldownMs = LIKE_CONFIG.cooldownMin * 60000
  const lastLike = store.likes[store.likes.length - 1] || 0
  const nextLikeAt = lastLike ? lastLike + cooldownMs : 0
  const waitMs = Math.min(cooldownMs, Math.max(0, nextLikeAt - now))
  const tickets = store.likes.length
  const limitReached = tickets >= LIKE_CONFIG.maxTicketsPerDay

  const join = useCallback((name, contact) => {
    setStore(s => ({ ...s, me: { name: name.trim(), contact: contact.trim() } }))
    setCrowd(c => ({ ...c, participants: c.participants + 1 }))
  }, [])

  const leave = useCallback(() => setStore(s => ({ ...s, me: null })), [])

  const like = useCallback(() => {
    if (!store.me || waitMs > 0 || limitReached) return false
    setStore(s => ({ ...s, likes: [...s.likes, Date.now()] }))
    setCrowd(c => ({ ...c, total: c.total + 1 }))
    setFeed(f => [{ id: 'me' + Date.now(), name: shortName(store.me.name), show: showRef.current, ago: 0, me: true }, ...f].slice(0, 6))
    return true
  }, [store.me, waitMs, limitReached])

  // розіграш: шанс пропорційний кількості квитків
  const runDraw = useCallback(() => {
    const pool = [...crowd.others]
    if (store.me && tickets) pool.push({ name: shortName(store.me.name), tickets, me: true })
    const sum = pool.reduce((a, p) => a + p.tickets, 0)
    let r = Math.random() * sum
    const win = pool.find(p => (r -= p.tickets) < 0) || pool[0]
    setWinner({ ...win, names: pool.map(p => p.name), at: Date.now() })
  }, [crowd.others, store.me, tickets])

  // автоматичний розіграш, якщо сторінка відкрита о 20:00
  const drawAt = useMemo(() => nextDrawAt(new Date(now)).getTime(), [now])
  const prevDraw = useRef(drawAt)
  useEffect(() => {
    if (drawAt !== prevDraw.current) { prevDraw.current = drawAt; runDraw() }
  }, [drawAt, runDraw])

  // демо-кнопки для презентації
  const demo = {
    skipCooldown: () => setStore(s => ({ ...s, likes: s.likes.map(t => t - cooldownMs) })),
    reset: () => { setStore({ day: today(), me: null, likes: [] }); setWinner(null) }
  }

  return {
    me: store.me, tickets, waitMs, limitReached, join, leave, like,
    total: crowd.total, participants: crowd.participants, feed,
    drawInMs: Math.max(0, drawAt - now), winner, closeWinner: () => setWinner(null), runDraw, demo
  }
}
