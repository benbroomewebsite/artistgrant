'use client'

import { useEffect } from 'react'

type WarmImage = { src: string; srcSet: string; sizes: string }

export function MediaWarmup({ images }: { images: WarmImage[] }) {
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection
    if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType ?? '')) return
    let cancelled = false
    let idle: number | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    const queue = [...images]

    // Two low-priority downloads at a time, after the visible page has loaded.
    const warm = async () => {
      while (!cancelled && queue.length && document.visibilityState === 'visible') {
        const item = queue.shift()!
        const image = new window.Image()
        image.fetchPriority = 'low'
        image.sizes = item.sizes
        image.srcset = item.srcSet
        image.src = item.src
        await image.decode().catch(() => {})
      }
    }
    const start = () => {
      timer = setTimeout(() => {
        const run = () => { void warm(); void warm() }
        if ('requestIdleCallback' in window) idle = window.requestIdleCallback(run, { timeout: 3000 })
        else run()
      }, 1200)
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => {
      cancelled = true
      window.removeEventListener('load', start)
      if (timer) clearTimeout(timer)
      if (idle !== undefined) window.cancelIdleCallback(idle)
    }
  }, [images])
  return null
}
