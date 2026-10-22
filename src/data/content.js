import team1 from '../assets/team/team-1.webp'
import team2 from '../assets/team/team-2.webp'
import team3 from '../assets/team/team-3.webp'
import team4 from '../assets/team/team-4.webp'
import team5 from '../assets/team/team-5.webp'
import team6 from '../assets/team/team-6.webp'
import p1 from '../assets/partners/partner-1.webp'
import p2 from '../assets/partners/partner-2.webp'
import p3 from '../assets/partners/partner-3.webp'
import p4 from '../assets/partners/partner-4.webp'
import talents from '../assets/icons/talents.webp'
import studio from '../assets/icons/studio.webp'
import music from '../assets/icons/music.webp'
import hero1 from '../assets/hero/hero-1.webp'
import hero2 from '../assets/hero/hero-2.webp'
import hero3 from '../assets/hero/hero-3.webp'
import hero4 from '../assets/hero/hero-4.webp'
import hero5 from '../assets/hero/hero-5.webp'

export const HERO_SLIDES = [
  { src: hero1, alt: 'Крони осінніх дерев знизу' },
  { src: hero2, alt: 'Кленове листя проти сонця' },
  { src: hero3, alt: 'Модриновий ліс у золотому світлі' },
  { src: hero4, alt: 'Осінній парк у тумані' },
  { src: hero5, alt: 'Гори й золоті модрини' }
]

export const TEAM = [
  { name: 'Андрій Стасишин', role: 'Музичний редактор та директор радіостанції', insta: 'djstason', photo: team1 },
  { name: 'Софія Труш', role: 'Ведуча ранкового шоу «Не спати» та програмна директорка', insta: '_trush_sofia_', photo: team2 },
  { name: 'Марія Канцелярист', role: 'Ведуча новин', insta: 'kantseliarist', photo: team3 },
  { name: 'Тарас Федунь', role: 'Ведучий ранкового шоу «Не спати»', insta: 'tarasfedun', photo: team4 },
  { name: 'Вікторія Дребот', role: 'Ведуча суботнього шоу', insta: 'vika_drebot', photo: team5 },
  { name: 'Андрій Бакалов', role: 'Ведучий суботнього шоу', insta: 'andrew.bakalov', photo: team6 }
]

// Фон блоку «Новини · відео»
export const NEWS_COVER = team1

// Партнери: додайте url, щоб логотип став посиланням
export const PARTNERS = [
  { logo: p1, name: 'Комплекс медіа', url: '' },
  { logo: p2, name: 'UDOX — IT company', url: '' },
  { logo: p3, name: 'Creator IT Academy', url: 'https://creator-it-academy.com' },
  { logo: p4, name: 'Рятувальники Яворівщини', url: '' }
]

export const ABOUT_CARDS = [
  { icon: talents, title: 'Підтримка молодих талантів' },
  { icon: studio, title: 'Професійна студія' },
  { icon: music, title: 'Якісна українська музика' }
]

// ТОП пісень. move: '▲ 2', '▼ 1', 'NEW' або '—'.
// TODO: замініть заглушки на реальний хіт-парад тижня.
export const TOP_SONGS = [
  { title: '[Назва треку 1]', artist: '[Виконавець]', move: '▲ 2' },
  { title: '[Назва треку 2]', artist: '[Виконавець]', move: '▼ 1' },
  { title: '[Назва треку 3]', artist: '[Виконавець]', move: 'NEW' },
  { title: '[Назва треку 4]', artist: '[Виконавець]', move: '▲ 3' },
  { title: '[Назва треку 5]', artist: '[Виконавець]', move: '—' }
]

export const ADS = [
  { id: 'social', short: 'Соцмережі', title: 'Реклама в соціальних мережах', text: ['Просуваємо ваш бізнес там, де нас читають і дивляться щодня.', 'Підходить для акцій, подій, новинок, відкриттів та спецпропозицій.'], chips: ['Пост у Telegram', 'Пост у Facebook', 'Instagram Stories'] },
  { id: 'block', short: 'Ролик в ефірі', title: 'Блокова реклама в ефірі', text: ['Класичні рекламні ролики в ефірі радіо Yantarne.FM.', 'Ваша реклама звучить у визначені години й регулярно та чітко доносить інформацію до слухачів нашої громади.'], chips: ['Ролик в ефірі', 'Фіксовані години'] },
  { id: 'host', short: 'Від ведучих', title: 'Інформаційна реклама від ведучих', text: ['Реклама у форматі живої рекомендації від ведучих в ефірі — звучить природно й довірливо.', 'Особливо ефективно в ранковому шоу: як особиста порада, а не стандартний ролик.'], chips: ['Жива рекомендація', 'Ранкове шоу'] },
  { id: 'partner', short: 'Партнерство', title: 'Партнерство з радіо', text: ['Станьте офіційним партнером наших програм і проєктів.', 'Це довготривала присутність вашого бренду в ефірі та асоціація з контентом, який люблять слухачі.'], chips: ['Партнер погоди', 'Партнер точної години', 'Партнер рубрик і проєктів'] },
  { id: 'custom', short: 'Індивідуальний проєкт', title: 'Індивідуальна співпраця', text: ['Маєте ідею — ми допоможемо її реалізувати.', 'Відкриті до нестандартних форматів, спецпроєктів, інтеграцій і рішень під конкретні цілі вашого бізнесу.'], chips: ['Спецпроєкти', 'Інтеграції', 'Ваша ідея'] }
]

// Бриф на рекламу (блок «Контакти»): варіанти для випадних списків
export const BRIEF_START = ['Якомога швидше', 'Протягом місяця', 'Пізніше', 'Ще не визначились']
export const BRIEF_BUDGET = ['Порадьте оптимальний варіант', 'До 3 000 ₴', '3 000 – 10 000 ₴', '10 000 – 25 000 ₴', 'Понад 25 000 ₴']
export const BRIEF_CONTACT = ['Телефон', 'Telegram', 'Viber', 'Email']
