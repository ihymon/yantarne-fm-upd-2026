import { useCallback } from 'react'

// Спільний IntersectionObserver для анімації появи блоків (.reveal → .reveal[data-in]).
// Атрибут, а не клас: React перезаписує className під час рендеру і «прибирав» би стан появи.
let io = null
function getObserver() {
  if (io || typeof IntersectionObserver === 'undefined') return io
  io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return
      const el = e.target
      const idx = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0
      el.style.transitionDelay = Math.min(idx, 5) * 0.08 + 's'
      el.setAttribute('data-in', '')
      setTimeout(() => { el.style.transitionDelay = '' }, 1400)
      el.dispatchEvent(new CustomEvent('revealed'))
      io.unobserve(el)
    })
  }, { threshold: 0.15 })
  return io
}

// Повертає ref-callback: <div className="reveal" ref={useReveal()} />
export function useReveal() {
  return useCallback(el => {
    if (!el) return
    const obs = getObserver()
    if (obs) obs.observe(el)
    else el.setAttribute('data-in', '')
  }, [])
}
