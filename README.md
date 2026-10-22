# Yantarne.FM — сайт радіостанції

Односторінковий сайт на **React 19 + Vite 8**. Після збірки це статичні файли, тому сайт можна розмістити на будь-якому хостингу.

## Швидкий старт

Потрібен Node.js 20.19 або новіший.

```bash
npm install
npm run dev       # локальний сервер для розробки: http://localhost:5173
npm run build     # готова збірка в папці dist/
npm run preview   # перегляд готової збірки
```

## Публікація

**Netlify:** підключіть репозиторій, налаштування вже є в `netlify.toml`. Або перетягніть папку `dist/` на app.netlify.com/drop.

**Vercel:** імпортуйте репозиторій. Налаштування в `vercel.json`.

**Звичайний хостинг (cPanel, FTP):** виконайте `npm run build` і завантажте вміст папки `dist/` у кореневу папку сайту (`public_html`).

Сайт має працювати по **HTTPS**. Інакше браузер може блокувати звук і сповіщення.

## Налаштування (`.env`)

| Змінна | Що це |
|---|---|
| `VITE_SITE_URL` | Домен сайту, напр. `https://yantarne.fm`. Потрібен для превʼю в соцмережах |
| `VITE_STREAM_URL` | Адреса аудіопотоку Icecast (HTTPS) |
| `VITE_STREAM_FALLBACK_URL` | Запасна адреса потоку |
| `VITE_STREAM_STATUS_URL` | `status-json.xsl`: звідси беруться назва треку й кількість слухачів |
| `VITE_FORM_ENDPOINT` | Куди надсилати форму «Контакти» (POST JSON, напр. Formspree). Якщо порожньо, відкривається поштовий клієнт |
| `VITE_YOUTUBE_VIDEO_ID` | ID відео для блоку «Новини». Якщо порожньо, кнопка веде на YouTube-канал |

Якщо змінили домен, оновіть його також у `public/robots.txt` і `public/sitemap.xml`.

## Фірмовий стиль

- Основний колір: **#BE0908** (змінна `--red` у `src/styles/global.css`). Жовтих і помаранчевих відтінків немає, палітра складається з червоного, чорного й білого.
- Шрифт заголовків: **Bebas Neue Cyrillic**. Покладіть файл шрифту в `public/fonts/` під назвою `BebasNeueCyrillic.woff2` або `BebasNeueCyrillic.ttf`, і сайт підхопить його автоматично. Поки файлу немає, показується схожий шрифт Oswald з Google Fonts. Основний текст набрано шрифтом Manrope.

## Де змінювати контент

| Що | Файл |
|---|---|
| Контакти, частоти, соцмережі, ГО | `src/data/station.js` |
| Біжучий рядок новин | `src/data/station.js` → `TICKER` |
| Розклад ефіру, новини, погода, реклама | `src/data/schedule.js` |
| ТОП пісень | `src/data/content.js` → `TOP_SONGS` |
| Команда (фото в `src/assets/team/`) | `src/data/content.js` → `TEAM` |
| Партнери (логотипи в `src/assets/partners/`) | `src/data/content.js` → `PARTNERS` |
| Фото для режиму «Фото» | `src/assets/hero/` + `HERO_SLIDES` |
| Пакети реклами | `src/data/content.js` → `ADS` |
| Стилі | `src/styles/global.css` |

## Що вміє сайт

- Справжній аудіоплеєр прямого ефіру з резервною адресою потоку. Показує назву треку та кількість слухачів з Icecast. Підтримує керування з екрана блокування телефона (Media Session).
- «Зараз в ефірі» і «Далі» розраховуються за розкладом і оновлюються кожні 30 секунд.
- Інтерактивний розклад на тиждень. Кнопка «Нагадати» показує браузерне сповіщення на початку програми, поки сайт відкритий.
- Вподобайки пісень, нагадування та вибраний режим головної («Графіка» чи «Фото») зберігаються в браузері.
- SEO: meta- і OG-теги, schema.org `RadioStation`, `robots.txt`, `sitemap.xml`, іконки.
- Анімації вимикаються, якщо в системі ввімкнено «зменшення руху».

## Структура

```
src/
  App.jsx                 збирає сторінку
  context/                PlayerContext (аудіо), ClockContext (час і поточна програма)
  hooks/                  useReveal, useNowPlaying, useLocalStorage
  components/             секції сторінки
  data/                   увесь контент
  assets/                 зображення
  styles/global.css
public/                   favicon, og-image, robots, sitemap
```
