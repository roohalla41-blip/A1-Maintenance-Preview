# A1 Maintenance Preview

This repository is an isolated preview workspace for the maintenance and error pages of Hesab Sarraf.

## Safety boundary
- This repository is not connected to the live A1 application or its Supabase project.
- Never add production credentials, API keys, customer data, transaction data, or database dumps here.
- The preview pages are static demonstrations. They do not activate maintenance mode on the live service.
- A real creator/admin bypass must be implemented and enforced by a trusted server-side backend. Do not put passwords, privileged tokens, or authorization logic in browser JavaScript.

## Preview pages
- `index.html`: preview landing page and navigation.
- `maintenance.html`: full maintenance notice.
- `404.html`: branded not-found page.

## GitHub Pages
The workflow in `.github/workflows/deploy-preview.yml` publishes this repository's static preview from `main`. In repository Settings → Pages, set the build and deployment source to **GitHub Actions** if it is not already selected.

The preview URL, once the workflow succeeds, is:
`https://roohalla41-blip.github.io/A1-Maintenance-Preview/`

## Production integration is intentionally out of scope
No workflow in this repository deploys to the A1 production domain. Any later integration with A1 requires a separate review and explicit approval.
