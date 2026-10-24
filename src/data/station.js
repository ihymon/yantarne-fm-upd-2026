// Основні дані станції та налаштування. Значення з .env мають пріоритет.
const env = import.meta.env

export const STREAM_URL = env.VITE_STREAM_URL || 'https://complex.in.ua/yantarne'
export const STREAM_FALLBACK_URL = env.VITE_STREAM_FALLBACK_URL || 'http://complex.in.ua/yantarne'
export const STREAM_STATUS_URL = env.VITE_STREAM_STATUS_URL || 'https://complex.in.ua/status-json.xsl?mount=/yantarne'
// API адмінки радіо (той самий бекенд, що й у поточного сайту yantarne.fm)
export const API_URL = (env.VITE_API_URL || 'https://yantarnefm-server-4j82.onrender.com/api').replace(/\/$/, '')
// Заявки «Замовити рекламу» → сервер радіо → Telegram-бот адміністраторам
export const FORM_ENDPOINT = env.VITE_FORM_ENDPOINT || API_URL + '/ad-request'
export const YOUTUBE_VIDEO_ID = env.VITE_YOUTUBE_VIDEO_ID || ''

export const STATION = {
  name: 'Yantarne.FM',
  since: 2021,
  city: 'Новояворівськ',
  frequencies: [
    { mhz: '97.6', city: 'Новояворівськ' },
    { mhz: '92.8', city: 'Івано-Франкове' }
  ],
  email: 'yantarne.fm@gmail.com',
  phones: [
    { label: 'Студія', display: '+380 98 200 86 88', tel: '+380982008688' },
    { label: 'Реклама', display: '+380 68 302 05 55', tel: '+380683020555' }
  ],
  monoJarUrl: 'https://send.monobank.ua/jar/4vWF9VnCbp', // банка Monobank
  donateUrl: 'https://buymeacoffee.com/yantarne.fm',
  youtubeChannel: 'https://www.youtube.com/channel/UCTaO-GLI_0srISh-Ase5NZw',
  socials: [
    { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/yantarne.fm/' },
    { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/yantarne.fm' },
    { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/channel/UCTaO-GLI_0srISh-Ase5NZw' },
    { id: 'soundcloud', label: 'SoundCloud', url: 'https://soundcloud.com/andriy-yantarne' }
  ],
  org: { name: 'Медіа Фронт', edrpou: '44902972', head: 'Андрій Стасишин' }
}

export const NAV = [
  ['timetable', 'Розклад'],
  ['top-songs', 'Топ пісень'],
  ['about', 'Хто ми'],
  ['team', 'Команда'],
  ['news', 'Новини'],
  ['ads', 'Реклама'],
  ['contacts', 'Контакти']
]

export const TICKER = [
  '97.6 FM — Новояворівськ',
  '92.8 FM — Івано-Франкове',
  'Фестивалі',
  'Новини',
  'Музика без перерв',
  'Yantarne.FM — сучасне українське радіо Новояворівська',
  'Ранкове шоу «Не спати» — щобудня з 8:00',
  'Маєте новину? Надсилайте нам!'
]
