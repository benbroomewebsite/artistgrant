import type { Metadata } from 'next'
import { SiteImage as Image } from '@/components/site-image'
import { notFound } from 'next/navigation'
import { TextPage } from '@/components/site-layout'
import { winnerYears } from '@/lib/media'
import { mediaUrl } from '@/lib/media-url'
import { imageDetails } from '@/lib/image-source'
import Link from 'next/link'
import { SiteVideo } from '@/components/site-video'
import winnerContent from '@/content/winner-pages.json'

export function generateStaticParams() {
  return winnerYears.map(({ year }) => ({ year }))
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
  const page = winnerContent.pages.find((item) => item.year === year)
  if (!page) notFound()
  const years: string[] = winnerYears.map((item) => item.year)
  const position = years.indexOf(year)
  const newer = years[position - 1]
  const older = years[position + 1]

  return (
    <TextPage active="Previous Winners" className="winner-detail-page">
      <div className="winner-hero"><Image src={mediaUrl(year === '2024' ? '/media/hero/2024' : page.blocks[0].src ?? '')} alt="" fill sizes="100vw" preload /><h1>{year} Grant</h1></div>
      <div className="winner-story">
        {page.blocks.slice(2).map((block, index) => {
          if (block.type === 'html') return <div className={index === 0 ? 'winner-copy winner-intro' : 'winner-copy'} dangerouslySetInnerHTML={{ __html: block.html ?? '' }} key={index} />
          if (block.type === 'image') return <figure className="winner-media" key={index}><Image src={mediaUrl(block.src ?? '')} alt={block.alt ?? ''} width={imageDetails(mediaUrl(block.src ?? ''))?.width ?? 1800} height={imageDetails(mediaUrl(block.src ?? ''))?.height ?? 1350} loading={index === 0 ? 'eager' : 'lazy'} sizes="(max-width: 769px) 88vw, 70vw" /></figure>
          if (block.type === 'video') return <figure className="winner-media winner-video" key={index}><SiteVideo src={mediaUrl(block.src ?? '')} title={`${year} Grant artist film`} /></figure>
          if (block.type === 'embed') return <figure className="winner-media winner-embed" key={index}><iframe src={block.src} title={'title' in block ? block.title : `${year} Grant video`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></figure>
          return <hr key={index} />
        })}
      </div>
      <nav className="year-navigation" aria-label="Other grant years"><span>{newer && <Link href={`/previouswinners/${newer}`}>← {newer} Grant</Link>}</span><span>{older && <Link href={`/previouswinners/${older}`}>{older} Grant →</Link>}</span></nav>
    </TextPage>
  )
}
