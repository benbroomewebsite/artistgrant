import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { TextPage } from '@/components/site-layout'
import { winnerYears } from '@/lib/media'
import { mediaUrl } from '@/lib/media-url'
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

  return (
    <TextPage active="Previous Winners" className="winner-detail-page">
      <div className="winner-story">
        {page.blocks.map((block, index) => {
          if (block.type === 'html') return <div className="winner-copy" dangerouslySetInnerHTML={{ __html: block.html ?? '' }} key={index} />
          if (block.type === 'image') return <figure className="winner-media" key={index}><Image src={mediaUrl(block.src ?? '')} alt={block.alt ?? ''} width={1800} height={1350} loading={index === 0 ? 'eager' : 'lazy'} sizes="(max-width: 640px) 86vw, 70vw" /></figure>
          if (block.type === 'video') return <figure className="winner-media" key={index}><video autoPlay controls loop muted playsInline preload="metadata" src={mediaUrl(block.src ?? '')} /></figure>
          if (block.type === 'embed') return <figure className="winner-media winner-embed" key={index}><iframe src={block.src} title={'title' in block ? block.title : `${year} Grant video`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></figure>
          return <hr key={index} />
        })}
      </div>
    </TextPage>
  )
}
