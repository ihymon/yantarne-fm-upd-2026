import { useEffect, useState } from 'react'
import { ClockProvider } from './context/ClockContext'
import { PlayerProvider } from './context/PlayerContext'
import { ScrollProgress, DesktopFx } from './components/Effects'
import Header from './components/Header'
import Hero from './components/Hero'
import Ticker from './components/Ticker'
import Timetable from './components/Timetable'
import LikeDraw from './components/LikeDraw'
import Jukebox from './components/Jukebox'
import { JukeboxProvider, JUKEBOX } from './context/JukeboxContext'
import TopSongs from './components/TopSongs'
import About from './components/About'
import Team from './components/Team'
import Support from './components/Support'
import Ads from './components/Ads'
import Partners from './components/Partners'
import Contacts from './components/Contacts'
import Footer from './components/Footer'
import MiniPlayer from './components/MiniPlayer'

function initialView() {
  if (location.hash === '#photo') return 'photo'
  try { return localStorage.getItem('yfm-view') || 'graphic' } catch { return 'graphic' }
}

export default function App() {
  const [view, setView] = useState(initialView)

  // режим головної: «Графіка» або «Фото» (клас body.photo у CSS)
  useEffect(() => { document.body.classList.toggle('photo', view === 'photo') }, [view])
  const changeView = v => {
    setView(v)
    try { localStorage.setItem('yfm-view', v) } catch { /* ignore */ }
  }

  return (
    <ClockProvider>
      <PlayerProvider>
      <JukeboxProvider>
        <ScrollProgress />
        <DesktopFx />
        <Header view={view} onView={changeView} />
        <main>
          <Hero view={view} />
          <Ticker />
          <Timetable />
          <TopSongs />
          <About />
          <Team />
          <Support />
          <Ads />
          <Partners />
          <Contacts />
        </main>
        <Footer />
        <MiniPlayer />
        <LikeDraw />
        {JUKEBOX.enabled && <Jukebox />}
      </JukeboxProvider>
      </PlayerProvider>
    </ClockProvider>
  )
}
