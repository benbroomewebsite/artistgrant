# Turning on the editor for Ben

The editor at `/keystatic` lets Ben change the Previous Winners pages for each
grant year. It saves by committing to the GitHub repository
`benbroomewebsite/artistgrant`. Ben signs in with his own GitHub account. He never
needs access to Vercel or to the R2 media bucket: Vercel redeploys on every commit,
and existing images stay where they are.

The editor stays off, and `/keystatic` returns a 404, until these steps are done.

## One-time setup (Daniel)

1. **Give Ben write access to the repository.** GitHub → the repository → Settings →
   Collaborators → Add people → Ben's GitHub username, unless the account he signs
   in with already has it.
2. **Create the GitHub sign-in app.** In `.env.local` add
   `NEXT_PUBLIC_KEYSTATIC_STORAGE=github`, run `pnpm dev`, and open
   http://127.0.0.1:3000/keystatic. Follow the prompt to create a GitHub App; when
   asked for the deployed URL, enter `https://www.artistgrant.co.uk`. It writes four
   values into `.env`: `KEYSTATIC_GITHUB_CLIENT_ID`,
   `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` and
   `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`. `.env` is ignored by Git. Never commit it.
3. **Install the app on the repository** when GitHub offers to, choosing only
   `artistgrant`.
4. **Copy the settings to Vercel.** Project → Settings → Environment Variables: add
   those four values plus `NEXT_PUBLIC_KEYSTATIC_STORAGE=github`, then redeploy.

Sign-in only works from the addresses listed in the GitHub App. To sign in from a
preview deployment, add its address to the app's callback URLs first.

## Check before relying on it

Vercel's free Hobby plan does not deploy commits to a **private** repository when
the commit author is not the Vercel account owner. The repository is public, so
Ben's saves deploy. If it is ever made private, check this first.

## What Ben does

Open `https://www.artistgrant.co.uk/keystatic`, sign in with GitHub, choose **Grant
years** and then a year. Each block on the list is one thing on the page, in page
order.

- **Change the order:** drag a block by its handle, or use its arrows.
- **Move a whole artist:** use **Move artist** beside the artist's name.
- **Change something:** press **Edit** on a block. Text can be bold, italic or a link.
- **Add something:** use the **Add** buttons in an artist's section, or **+ New artist**
  at the bottom.
- **Add a new year:** on **Grant years** press **Add**, and enter the year.

Press **Save** at the top. The site updates a minute or two later. Nothing changes
on the site until Save is pressed, and every save can be undone from the
repository's history.

If the editor offers a branch menu, choose **main** for direct publication. Saves on
`editor/…` branches are merged automatically when their changes are limited to
content and uploads. If both branches edited the same content, publication stops
for conflict resolution and the saved work remains on its branch.

## Images and videos

Images uploaded in the editor are stored in the repository under `public/uploads/`.
The build makes their WebP sizes and blurred placeholder, as the media bucket's
images already have. Keep uploaded videos short, under 25 MB, because they are
stored in the repository too. Use a **YouTube or Vimeo** block for longer films.
