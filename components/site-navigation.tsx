'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const navigation = [
  ['Apply', '/'], ['Judges', '/judges'], ['Shortlisting', '/shortlisting'],
  ['Previous Winners', '/previouswinners'], ['T&Cs', '/tandcs'],
] as const

export function SiteNavigation({ active }: { active?: string }) {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    if (!open) return
    const previous = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    const escape = (event: KeyboardEvent) => {
      const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle')
      if (event.key === 'Escape') { setOpen(false); toggle?.focus() }
      if (event.key === 'Tab') {
        const items = Array.from(document.querySelectorAll<HTMLElement>('.site-header a, .site-header button'))
        const first = items[0]
        const last = items.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }
    }
    const desktop = window.matchMedia('(min-width: 770px)')
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false) }
    desktop.addEventListener('change', closeOnDesktop)
    window.addEventListener('keydown', escape)
    return () => {
      document.documentElement.style.overflow = previous
      window.removeEventListener('keydown', escape)
      desktop.removeEventListener('change', closeOnDesktop)
    }
  }, [open])

  return <>
    <button className={`menu-toggle${open ? ' is-open' : ''}`} type="button" aria-expanded={open} aria-controls="site-navigation" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}><span /><span /></button>
    <nav id="site-navigation" className={open ? 'navigation is-open' : 'navigation'} aria-label="Main navigation">
      <ul className="nav-list">{navigation.map(([label, href]) => <li key={label}><Link href={href} className={active === label ? 'is-active' : undefined} aria-current={active === label ? 'page' : undefined} onClick={() => setOpen(false)}>{label}</Link></li>)}</ul>
    </nav>
  </>
}
