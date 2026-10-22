import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import sushiLogo from '../assets/demo/logo-sushibox.webp'
import npLogo from '../assets/demo/logo-novaposhta.webp'
import clayLogo from '../assets/demo/logo-clay.webp'
import udoxLogo from '../assets/demo/logo-udox.webp'

// ─────────────────────────────────────────────────────────────────────────────
// «Логотип партнера на головній»: ПРОТОТИП інтерфейсу.
// Компанія кидає «монетку» — і її логотип підстрибує на головній сторінці обраний термін.
// Розміщення й оплата змодельовані в браузері. Логотипи компаній — приклади.
// Робоча версія: POST /api/partners (назва, лого, підпис, термін) → оплата (Monobank / LiqPay)
// → модерація логотипа в адмінці → логотип з'являється на сайті до кінця терміну.
// ─────────────────────────────────────────────────────────────────────────────

export const JUKEBOX = {
  // ВИМКНЕНО (збережено на майбутнє). Увімкнути: true тут або VITE_PARTNER_LOGOS=true у .env
  enabled: import.meta.env.VITE_PARTNER_LOGOS === 'true',
  demo: true,
  // ціни для прикладу
  prices: { perDay: 40 }, // логотип на головній: ціна за добу
  // термін розміщення; довше — дешевше за добу
  plans: [
    { days: 1 },
    { days: 3 },
    { days: 7, discount: 0.15 },
    { days: 14, discount: 0.25 },
    { days: 30, discount: 0.35 }
  ]
}

const DAY = 864e5

// Розрахунок вартості: N діб × ціна за добу − знижка за термін
export function calcPrice(days) {
  const plan = JUKEBOX.plans.find(p => p.days === days) || { days, discount: 0 }
  const full = JUKEBOX.prices.perDay * days
  const discount = Math.round(full * (plan.discount || 0))
  return { full, discount, total: full - discount, pct: plan.discount || 0, perDay: Math.round((full - discount) / days) }
}
export const MIN_PRICE = JUKEBOX.prices.perDay

export const plural = (n, one, few, many) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? one : a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many }
export const daysWord = n => n + ' ' + plural(n, 'день', 'дні', 'днів')

// скільки ще логотип на сайті: «2 дні 5 год», «9 год 20 хв»; коротко: «2 дн», «9 год»
export function fmtLeft(ms, short = false) {
  const m = Math.max(0, Math.floor(ms / 60000)), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60), mm = m % 60
  if (short) return d ? d + ' дн' : h ? h + ' год' : mm + ' хв'
  return d ? `${daysWord(d)}${h ? ' ' + h + ' год' : ''}` : h ? `${h} год ${mm} хв` : `${mm} хв`
}
export const fmtDate = t => new Date(t).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' }) + ', ' + new Date(t).toTimeString().slice(0, 5)

function seed() {
  const now = Date.now()
  return [
    { id: 's1', name: 'Sushi Box', logo: sushiLogo, note: 'Смачного вечора, Новояворівськ!', days: 3, until: now + 2 * DAY + 5 * 36e5 },
    { id: 's2', name: 'UDOX', logo: udoxLogo, note: 'Сайти та цифровізація для вашого бізнесу', days: 7, until: now + 6 * DAY + 20 * 36e5 },
    { id: 's3', name: 'Нова пошта', logo: npLogo, note: '', days: 1, until: now + 9 * 36e5 + 40 * 6e4 },
    { id: 's4', name: 'Студія «Глина»', logo: clayLogo, note: 'Майстер-клас з кераміки в суботу', days: 14, until: now + 11 * DAY + 3 * 36e5 }
  ]
}

const Ctx = createContext(null)

export function JukeboxProvider({ children }) {
  const [partners, setPartners] = useState(seed)
  const [open, setOpen] = useState(false)
  const [focusId, setFocusId] = useState(null) // щойно доданий логотип, який підсвічуємо

  const addPartner = useCallback(p => {
    const id = 'p' + Date.now()
    setPartners(list => [...list, { ...p, id }])
    setFocusId(id)
    return id
  }, [])

  const value = useMemo(() => ({ partners, addPartner, open, setOpen, focusId }), [partners, addPartner, open, focusId])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useJukebox = () => useContext(Ctx)
