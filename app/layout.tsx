import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'

const mincho = localFont({ src: '../public/fonts/artist-grant-mincho.woff2', display: 'swap', variable: '--font-mincho' })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.artistgrant.co.uk'),
  title: 'Artist Grant',
  description: 'Artist Grant provides unrestricted financial support to artists worldwide. Learn about the grant, judges, shortlisting process, previous winners, and terms and conditions.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Artist Grant',
    title: 'Artist Grant',
    description: 'A yearly programme providing unrestricted financial support to artists worldwide.',
  },
  twitter: {
    card: 'summary',
    title: 'Artist Grant',
    description: 'A yearly programme providing unrestricted financial support to artists worldwide.',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#dedede',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={mincho.variable}>
      <head><link rel="preconnect" href={process.env.NEXT_PUBLIC_MEDIA_BASE_URL || 'https://pub-8a5603baa7c14b72b81d23aa7715704e.r2.dev'} /></head>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
