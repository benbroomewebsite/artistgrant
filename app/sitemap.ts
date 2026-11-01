import type { MetadataRoute } from 'next'
import { winnerPages } from '@/lib/winners'

const routes = [
  '',
  '/judges',
  '/shortlisting',
  '/previouswinners',
  ...winnerPages.map(({ year }) => `/previouswinners/${year}`),
  '/tandcs',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://www.artistgrant.co.uk${route}`,
    changeFrequency: route === '' ? 'monthly' : 'yearly',
    priority: route === '' ? 1 : 0.7,
  }))
}
