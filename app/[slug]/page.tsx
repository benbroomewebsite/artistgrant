import { judges, terms, TextPage } from '@/components/site-layout'

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (slug === 'judges') return <JudgesPage />
  if (slug === 'shortlisting') return <ShortlistingPage />
  if (slug === 'previouswinners') return <PreviousWinnersPage />
  return <TermsPage />
}

function JudgesPage() {
  return <TextPage active="Judges"><div className="judge-grid">{judges.map((name, index) => <div className="judge-card" key={name}><div className={`image-space judge-image judge-image-${index + 1}`} aria-hidden="true" /><p>{name}</p></div>)}</div></TextPage>
}

function ShortlistingPage() {
  return <TextPage active="Shortlisting" className="shortlisting-page"><p>Shortlisting of Artist Grant 2026 will implemented by the 2026 New Curators Fellows (from left to right): <a href="#juan-felipe-paredes">Juan Felipe Paredes</a>, <a href="#mark-cho">Mark Cho</a>, <a href="#dulce-ariadna-ardila">Dulce Ariadna Ardila</a>, <a href="#vy-tsan">Vy Tsan</a>, <a href="#seth-kriger">Seth Kriger</a>, <a href="#nana-ampofo">Nana Ampofo</a>, <a href="#runnie-exuma">Runnie Exuma</a>, <a href="#bijal-daialal">Bijal Daialal</a>, <a href="#sadie-barnett">Sadie Barnett</a>, <a href="#ruchika-dhillon">Ruchika Dhillon</a> and <a href="#chris-d-reeder">chris d. reeder</a></p><div className="image-space shortlist-image" aria-label="Shortlisting group photograph space" /></TextPage>
}

function PreviousWinnersPage() {
  return <TextPage active="Previous Winners" className="winners-page"><h1>Previous Winners</h1><div className="winner-grid">{[['2024 Grant', 'winner-2024'], ['2023 Grant', 'winner-2023'], ['2022 Grant', 'winner-2022'], ['2021 Grant', 'winner-2021']].map(([label, className]) => <figure key={label}><div className={`image-space ${className}`} aria-hidden="true" /><figcaption>{label}</figcaption></figure>)}</div></TextPage>
}

function TermsPage() {
  return <TextPage active="T&Cs" className="terms-page"><h1>Terms and Conditions of the Artist Grant</h1><div className="terms-copy">{terms.split('\n').map((line, index) => line === '' ? <br key={index} /> : /^(Eligibility Criteria|Assessment Criteria|Application Process|Judging Process)$/.test(line) ? <h2 key={index}>{line}</h2> : <p key={index}>{line}</p>)}</div></TextPage>
}
