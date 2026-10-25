import type { MetadataRoute } from 'next'

const routes = [
  '',
  '/judges',
  '/shortlisting',
  '/previouswinners',
  '/previouswinners/2024',
  '/previouswinners/2023',
  '/previouswinners/2022',
  '/previouswinners/2021',
  '/tandcs',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `https://www.artistgrant.co.uk${route}`,
    changeFrequency: route === '' ? 'monthly' : 'yearly',
    priority: route === '' ? 1 : 0.7,
  }))
}
