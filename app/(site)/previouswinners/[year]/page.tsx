import type { Metadata } from 'next'
import { SiteImage as Image } from '@/components/site-image'
import { notFound } from 'next/navigation'
import { TextPage } from '@/components/site-layout'
import { mediaUrl } from '@/lib/media-url'
import { imageDetails } from '@/lib/image-source'
import Link from 'next/link'
import { SiteVideo } from '@/components/site-video'
import { WinnerText } from '@/components/winner-text'
import { winnerPages } from '@/lib/winners'

// Every year is built in advance; any other year gets the 404 page without running server code.
export const dynamicParams = false

export function generateStaticParams() {
  return winnerPages.map(({ year }) => ({ year }))
}

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }): Promise<Metadata> {
  const { year } = await params
  const title = `${year} Grant | Artist Grant`
  const description = `Artists supported by the ${year} Artist Grant.`
  return {
    title,
    description,
    alternates: { canonical: `/previouswinners/${year}` },
    openGraph: { title, description, url: `/previouswinners/${year}` },
  }
}

export default async function WinnerYearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params
  const page = winnerPages.find((item) => item.year === year)
  if (!page) notFound()
  const years = winnerPages.map((item) => item.year)
  const position = years.indexOf(year)
  const newer = years[position - 1]
  const older = years[position + 1]

  return (
    <TextPage active="Previous Winners" className="winner-detail-page">
      <div className="winner-hero">{page.hero && <Image src={mediaUrl(page.hero)} alt="" fill sizes="100vw" preload />}<h1>{year} Grant</h1></div>
      <div className="winner-story">
        {page.blocks.map((block, index) => {
          if (block.type === 'artist') return <div className="winner-copy" key={index}><h4>{block.link ? <a href={block.link} rel="noreferrer">{block.name}</a> : block.name}</h4></div>
          if (block.type === 'text') return <div className={index === 0 ? 'winner-copy winner-intro' : block.large ? 'winner-copy winner-copy-large' : 'winner-copy'} key={index}><WinnerText source={block.content} /></div>
          if (block.type === 'image') return <figure className="winner-media" key={index}><Image src={mediaUrl(block.src)} alt={block.alt} width={imageDetails(mediaUrl(block.src))?.width ?? 1800} height={imageDetails(mediaUrl(block.src))?.height ?? 1350} loading={index === 0 ? 'eager' : 'lazy'} sizes="(max-width: 769px) 88vw, 70vw" /></figure>
          if (block.type === 'video') return <figure className="winner-media winner-video" key={index}><SiteVideo src={mediaUrl(block.src)} title={block.title} /></figure>
          if (block.type === 'embed') return <figure className="winner-media winner-embed" key={index}><iframe src={block.src} title={block.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></figure>
          return <hr key={index} />
        })}
      </div>
      <nav className="year-navigation" aria-label="Other grant years"><span>{newer && <Link href={`/previouswinners/${newer}`}>← {newer} Grant</Link>}</span><span>{older && <Link href={`/previouswinners/${older}`}>{older} Grant →</Link>}</span></nav>
    </TextPage>
  )
}
