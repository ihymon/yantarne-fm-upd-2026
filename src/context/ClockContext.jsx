import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { PROGRAMS, programAt, todayIndex, nowHours } from '../data/schedule'

const ClockContext = createContext(null)

// Годинник, що оновлюється кожні 30 с, і поточна програма за розкладом
export function ClockProvider({ children }) {
  const [tick, setTick] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), 30000)
    return () => clearInterval(id)
  }, [])
  const value = useMemo(() => {
    const today = todayIndex()
    const hours = nowHours()
    const current = programAt(today, hours) || PROGRAMS[0]
    return { tick, today, hours, current }
  }, [tick])
  return <ClockContext.Provider value={value}>{children}</ClockContext.Provider>
}

export const useClock = () => useContext(ClockContext)
