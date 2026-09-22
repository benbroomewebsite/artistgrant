import type { ReactNode } from 'react'

const navigation = [
  ['Apply', '/'],
  ['Judges', '/judges'],
  ['Shortlisting', '/shortlisting'],
  ['Previous Winners', '/previouswinners'],
  ['T&Cs', '/tandcs'],
] as const

export function SiteLayout({ children, active }: { children: ReactNode; active?: string }) {
  return (
    <main className="site-shell">
      <a className="skip-link" href="#content">Skip to Content</a>
      <header className="site-header">
        <a className="wordmark" href="/">Artist Grant</a>
        <nav aria-label="Main navigation">
          <ul className="nav-list">
            {navigation.map(([label, href]) => (
              <li key={label}><a className={active === label ? 'is-active' : undefined} href={href}>{label}</a></li>
            ))}
          </ul>
        </nav>
      </header>
      <div id="content">{children}</div>
      <footer className="site-footer"><a href="mailto:ben@drawingablank.co.uk">Contact</a></footer>
    </main>
  )
}

export const judges = [
  'Selvi May Akyildiz', 'Aslı Baykal', 'Caroline Bourgeois', 'Jace Clayton', 'Racheal Crowther', 'Nat Faulkner',
  'David L. Johnson', 'Jessi Reaves', 'P. Staff', 'Christopher Kulendran Thomas', 'Annika Kuhlmann',
  'Olamiju Fajemisin (Artist Grant 2026 organiser)', 'Ben Broome (Artist Grant Founder)',
]

export const terms = `These Terms and Conditions will set out the basis upon which applicants apply and are selected for Artist Grant 2026 provided by DRABL CIC.

Eligibility Criteria

In order to be considered for the Artist Grant 2026 applicants should meet the following criteria:

1. Applicants should consider themselves as having a fine art practice. This includes but is not limited to:

- Painters;
- Sculptors;
- Video artists;
- Performance artists;
- Installation artists
- Sound artists; and
- Photographers

2. The Artist Grant 2026 is open to anyone globally.

3. Applicants do not need to have had any artistic formal training or education to apply.

4. Successful applicants are not required to provide evidence of how funds are spent.

5. Successful applicants will not be considered for future DRABL CIC Artist Grants.

6. Successful applicants must be able to provide the relevant banking details for a wire transfer (in their own name).

7. Successful applicants agree to permit [at least] one piece of work to be shared publicly [for a reasonable period] on DRABL CIC social media and on the artistgrant.co.uk website to announce their win.

8. Factors of age, location, gender and ethnicity will be considered in the application process to ensure equal opportunities for all.

Assessment Criteria

Applications will be reviewed against the following areas:

1. Creative merit including demonstrating a strong idea, aesthetic and/or point of difference within their practice.

2. The quality of the project or proposed project upon which they would spend the funds if successful. Whilst a specific project has to be linked to the application, funds can also be allocated to personal costs (rent payments, living expenses etc.).

3. Quality and completeness of application form.

Application Process

Applicants will be asked to submit the following information with their application:

1. Name;
2. Age;
3. Location;
4. Gender;
5. Ethnicity;
6. Contact email or phone number;

7. A short statement detailing how they would describe their artistic practice (200 words maximum);

8. A short statement detailing how they would spend the £2,000 grant if successful. (200 words maximum);

9. A link to a recent piece of work that best reflects the applicant’s artistic practice; and

10. A link to the website or social media of the applicant (or a website where their work is represented).

6. Applicants who fail to complete the form correctly and fail to supply all requested information will be disqualified.

7. Applications for the Artist Grant 2026 will be open for two weeks from June 18th to July 2nd (at 23:59 BST) or until 1500 applications are received. DRABL CIC reserves the right to close the grant early for the avoidance of doubt any applications received outside the application window will not be considered.

8. If an applicant requires information on this application in a different format such as accessible PDF, large print, easy read or audio recording, please contact: ben@drawingablank.co.uk

Judging Process

1. Applications will be reviewed and 50 individuals will be shortlisted by the 2026 New Curators fellows with guidance from Artist Grant founder, Ben Broome.

2. Shortlisted applicants will then be passed to the Judging Panel.

3. Successful applicants will be determined by majority vote of the Judging Panel.

4. Successful applicants will be notified as soon as possible - likely in September 2026 but this is subject to change.

5. The Judging Panel will be operating in an advisory capacity and in the event the Judging Panel does not reach a majority vote DRABL CIC reserves the right to make the final decision.`

export function TextPage({ children, active, className = '' }: { children: ReactNode; active: string; className?: string }) {
  return <SiteLayout active={active}><article className={`content-column ${className}`}>{children}</article></SiteLayout>
}
