import logo from '../assets/logo.webp'
import { STATION } from '../data/station'

export default function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="big-word" aria-hidden="true">YANTARNE.FM</div>
        <div className="foot">
          <img src={logo} alt="Yantarne FM" className="flogo" width="141" height="56" loading="lazy" />
          <div className="fcol">
            <p>Радіо Новояворівська та Івано-Франкового: <b>97.6 FM</b> і <b>92.8 FM</b>.</p>
            <p><b>Якщо</b> у вас є новина, якою хочете поділитися — надсилайте нам.</p>
            <p>Хочете стати частинкою команди або маєте класні ідеї — пишіть нам.</p>
            <p>Питання щодо реклами та співпраці — телефонуйте!</p>
          </div>
          <div className="fcol">
            <p>Громадська організація «<b>{STATION.org.name}</b>», код ЄДРПОУ: <b>{STATION.org.edrpou}</b></p>
            <p>Голова ГО «{STATION.org.name}» — <span className="accent">{STATION.org.head}</span></p>
            <p className="copy">© {new Date().getFullYear()} Усі права захищені</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
