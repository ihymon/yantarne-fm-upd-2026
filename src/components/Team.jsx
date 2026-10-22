import { TEAM } from '../data/content'
import { useReveal } from '../hooks/useReveal'
import { InstagramIcon } from './Icons'

function Member({ p }) {
  const reveal = useReveal()
  return (
    <article className="member reveal" ref={reveal}>
      <img loading="lazy" src={p.photo} alt={p.name} width="420" height="560" />
      <div className="mcap">
        <div><b>{p.name}</b><span>{p.role}</span></div>
        {p.insta && (
          <a className="insta" href={'https://www.instagram.com/' + p.insta} target="_blank" rel="noopener noreferrer" aria-label={'Instagram: ' + p.name}><InstagramIcon /></a>
        )}
      </div>
    </article>
  )
}

export default function Team() {
  const reveal = useReveal()
  return (
    <section id="team">
      <div className="wrap">
        <div className="tt-head reveal" ref={reveal}>
          <h2 className="sec-title"><span className="accent">К</span>оманда</h2>
          <p className="lead">Голоси, які будять Новояворівськ зранку і тримають на хвилі до ночі.</p>
        </div>
        <div className="team">{TEAM.map(p => <Member key={p.name} p={p} />)}</div>
      </div>
    </section>
  )
}
