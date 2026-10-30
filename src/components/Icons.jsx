// Набір SVG-іконок з прототипу
export const PlayIcon = () => (
  <svg className="i-play" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" /></svg>
)
export const PauseIcon = () => (
  <svg className="i-pause" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
)
export const ArrowLeft = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
export const ArrowRight = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
export const HeartIcon = () => (
  <svg viewBox="0 0 24 24" strokeLinejoin="round" aria-hidden="true"><path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" /></svg>
)
export const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg>
)
export const SOCIAL_ICONS = {
  telegram: () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4.5 2.8 11.4c-.9.4-.9 1.4 0 1.7l4.6 1.5 1.7 5.3c.2.7 1 .9 1.5.4l2.6-2.4 4.7 3.5c.6.4 1.4.1 1.6-.6L22.3 5.8c.2-.9-.6-1.6-1.3-1.3z" /><path d="m7.4 14.6 10-6.6-7.3 7.6" /></svg>,
  instagram: InstagramIcon,
  facebook: () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H7v3.5h2V21h3.5v-8.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" /></svg>,
  youtube: () => <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="4" /><path d="M10 9l5 3-5 3z" fill="currentColor" /></svg>,
  soundcloud: () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 14v3M6 11v6M9 9v8M12 7v10M12 7a5 5 0 0 1 5 4h1a3 3 0 0 1 0 6h-6" /></svg>
}
