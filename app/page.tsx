const navigation = ['Apply', 'Judges', 'Shortlisting', 'Previous Winners', 'T&Cs']

export default function Page() {
  return (
    <main className="site-shell">
      <a className="skip-link" href="#content">Skip to Content</a>
      <header className="site-header">
        <a className="wordmark" href="#content">Artist Grant</a>
        <nav aria-label="Main navigation">
          <ul className="nav-list">
            {navigation.map((label) => (
              <li key={label}><a href={`#${label.toLowerCase().replaceAll(' ', '-')}`}>{label}</a></li>
            ))}
          </ul>
        </nav>
      </header>

      <article id="content" className="content-column">
        <p>
          <strong>Thank you to all those that applied to Artist Grant 2026. 1635 applications have now been received so the grant will now close. All applications submitted before closure will be eligible for review. We plan to notify successful applicants within 12 weeks but this is subject to change.</strong>
          <br /><br />
          Artist Grant (<a href="https://www.instagram.com/drabl/" rel="noreferrer">formerly DRABL Artist Grant</a>) is a yearly programme providing unrestricted financial support to artists worldwide.
          <br /><br />
          For 2026, £12,000 will be distributed. Six £2000 grants will be awarded to six individuals, providing a financial boost to further their artistic practice. A panel of eleven judges will decide the successful applicants by popular vote. Applications for the Artist Grant 2026 will be open for two weeks from June 18th to July 2nd (at 23:59 BST) or until 1500 applications are received.
          <br /><br />
          In its fifth iteration, Artist Grant is designed to have as few barriers to entry as possible: open to anyone who considers themselves as having a fine art practice. This includes but is not limited to: painters, sculptors, video artists, performance artists, installation artists, sound artists and photographers. Applicants need no formal training or education to apply. Factors of age, locality, gender and ethnicity will be considered to ensure equal opportunities.
        </p>
        <p id="apply">
          Artist Grant 2026 has been made possible with kind support from:
          <br />
          {['David Zwirner', 'Gallerie Derouillon', 'Hauser & Wirth', 'Lafayette Anticipations - Fonds de Dotation Famille Moulin', 'Sadie Coles HQ', 'Thaddaeus Ropac'].map((supporter) => <span className="supporter" key={supporter}><a href="#supporters">{supporter}</a><br /></span>)}
        </p>
      </article>

      <footer className="site-footer">
        <a href="mailto:ben@drawingablank.co.uk">Contact</a>
      </footer>
    </main>
  )
}

