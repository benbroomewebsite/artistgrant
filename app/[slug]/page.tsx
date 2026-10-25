import type { Metadata } from 'next'
import { SiteImage as Image } from '@/components/site-image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { judges, terms, TextPage } from '@/components/site-layout'
import { judgeImages, shortlistImage, winnerYears } from '@/lib/media'
import { mediaUrl } from '@/lib/media-url'
import { judgeImageSizes } from '@/lib/image-source'

const pageMeta = {
  judges: ['Judges | Artist Grant', 'Meet the Artist Grant 2026 judging panel.'],
  shortlisting: ['Shortlisting | Artist Grant', 'Learn how Artist Grant 2026 applications will be shortlisted.'],
  previouswinners: ['Previous Winners | Artist Grant', 'Explore previous Artist Grant recipients.'],
  tandcs: ['Terms and Conditions | Artist Grant', 'Read the Artist Grant 2026 eligibility, assessment, application, and judging terms.'],
} as const

export function generateStaticParams() {
  return Object.keys(pageMeta).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const meta = pageMeta[slug as keyof typeof pageMeta]
  return meta ? {
    title: meta[0],
    description: meta[1],
    alternates: { canonical: `/${slug}` },
    openGraph: { title: meta[0], description: meta[1], url: `/${slug}` },
  } : {}
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (slug === 'judges') return <JudgesPage />
  if (slug === 'shortlisting') return <ShortlistingPage />
  if (slug === 'previouswinners') return <PreviousWinnersPage />
  if (slug === 'tandcs') return <TermsPage />
  notFound()
}

function JudgesPage() {
  return <TextPage active="Judges" className="judges-page"><div className="judge-grid">{judges.map((name, index) => <div className="judge-card" key={name}><div className="image-space judge-image"><Image src={judgeImages[index]} alt={name} fill sizes={judgeImageSizes} loading={index < 6 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} /></div><p>{name}</p></div>)}</div></TextPage>
}

function ShortlistingPage() {
  return <TextPage active="Shortlisting" className="shortlisting-page"><p>Shortlisting of Artist Grant 2026 will implemented by the <a href="https://www.newcurators.org/" rel="noreferrer">2026 New Curators Fellows</a> (from left to right): <a href="https://www.instagram.com/juanfelipeparedes/" rel="noreferrer">Juan Felipe Paredes</a>, <a href="https://www.instagram.com/markmingucho/" rel="noreferrer">Mark Cho</a>, <a href="https://www.instagram.com/dulceariadnna/" rel="noreferrer">Dulce Ariadna Ardila</a>, <a href="https://www.instagram.com/5tsan/" rel="noreferrer">Vy Tsan</a>, <a href="https://www.instagram.com/seth.kriger/" rel="noreferrer">Seth Kriger</a>, <a href="https://www.instagram.com/alohavip/" rel="noreferrer">Nana Ampofo</a>, <a href="https://www.instagram.com/ladyhaitie/" rel="noreferrer">Runnie Exuma</a>, <a href="https://www.instagram.com/b_daialal/" rel="noreferrer">Bijal Daialal</a>, <a href="https://www.instagram.com/sadiemaybnot/" rel="noreferrer">Sadie Barnett</a>, <a href="https://www.instagram.com/ruchika_blog/" rel="noreferrer">Ruchika Dhillon</a> and <a href="https://www.instagram.com/chrisdreeder/" rel="noreferrer">chris d. reeder</a></p><div className="image-space shortlist-image"><Image src={shortlistImage} alt="The 2026 New Curators Fellows" fill loading="eager" sizes="(max-width: 769px) 88vw, 60vw" /></div></TextPage>
}

function PreviousWinnersPage() {
  return <TextPage active="Previous Winners" className="winners-page"><h1>Previous Winners</h1><div className="winner-grid">{winnerYears.map(({ year, cover }) => <figure key={year}><Link href={`/previouswinners/${year}`}><div className="image-space winner-image"><Image src={mediaUrl(cover)} alt="" fill sizes="(max-width: 769px) 88vw, 40vw" /></div><figcaption>{year} Grant</figcaption></Link></figure>)}</div></TextPage>
}

function TermsPage() {
  return <TextPage active="T&Cs" className="terms-page"><h1>Terms and Conditions of the Artist Grant</h1><div className="terms-copy">{terms.split('\n').map((line, index) => line === '' ? <br key={index} /> : /^(Eligibility Criteria|Assessment Criteria|Application Process|Judging Process)$/.test(line) ? <h2 key={index}>{line}</h2> : <p key={index}>{line}</p>)}</div></TextPage>
}
