import { TextPage } from '@/components/site-layout'
import { MediaWarmup } from '@/components/media-warmup'
import { judgeImages } from '@/lib/media'
import { displayImageUrl, imageDetails, judgeImageSizes } from '@/lib/image-source'

const warmImages = judgeImages.map((src) => ({
  src: displayImageUrl(src, 320),
  srcSet: imageDetails(src)!.variants.map((item) => `${new URL(item.path, src).href} ${item.width}w`).join(', '),
  sizes: judgeImageSizes,
}))

const supporters = [
  ['David Zwirner', 'https://www.davidzwirner.com/'],
  ['Gallerie Derouillon', 'https://derouillon.com'],
  ['Hauser & Wirth', 'https://www.hauserwirth.com'],
  ['Lafayette Anticipations - Fonds de Dotation Famille Moulin', 'https://www.lafayetteanticipations.com/fr'],
  ['Sadie Coles HQ', 'https://www.sadiecoles.com'],
  ['Thaddaeus Ropac', 'https://ropac.net'],
] as const

export default function Page() {
  return <TextPage active="Apply"><MediaWarmup images={warmImages} /><p><strong>Thank you to all those that applied to Artist Grant 2026. 1635 applications have now been received so the grant will now close. All applications submitted before closure will be eligible for review. We plan to notify successful applicants within 12 weeks but this is subject to change.</strong><br /><br /><br />Artist Grant (<a href="https://www.instagram.com/drabl/" rel="noreferrer">formerly DRABL Artist Grant</a>) is a yearly programme providing unrestricted financial support to artists worldwide.<br /><br />For 2026, £12,000 will be distributed. Six £2000 grants will be awarded to six individuals, providing a financial boost to further their artistic practice. A panel of eleven judges will decide the successful applicants by popular vote. Applications for the Artist Grant 2026 will be open for two weeks from June 18th to July 2nd (at 23:59 BST) or until 1500 applications are received.<br /><br />In its fifth iteration, Artist Grant is designed to have as few barriers to entry as possible: open to anyone who considers themselves as having a fine art practice. This includes but is not limited to: painters, sculptors, video artists, performance artists, installation artists, sound artists and photographers. Applicants need no formal training or education to apply. Factors of age, locality, gender and ethnicity will be considered to ensure equal opportunities.</p><p className="supporters"><br />Artist Grant 2026 has been made possible with kind support from:<br />{supporters.map(([name, href]) => <span className="supporter" key={name}><a href={href} rel="noreferrer">{name}</a><br /></span>)}</p><p className="home-spacer" aria-hidden="true"><br /></p></TextPage>
}

