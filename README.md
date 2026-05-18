# tarekokasha.com

Personal portfolio for Tarek Okasha — independent engineer building AI systems, intelligent automations, and custom internal software for founders and operators.

Live at **[tarekokasha.com](https://tarekokasha.com)**

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Motion | Motion (Framer Motion) + GSAP with ScrollTrigger |
| Fonts | Cormorant Garamond (display) + Space Grotesk (sans) via Google Fonts |
| Contact | Formspree or Resend (configurable via env vars) |
| Hosting | Vercel |

---

## Getting Started

```bash
# Install
npm install

# Development
npm run dev

# Production build
npm run build && npm start

# Type check
npx tsc --noEmit
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Option 1 — Formspree (easiest)
# Sign up at formspree.io, create a form, paste the endpoint URL here
FORMSPREE_ENDPOINT=https://formspree.io/f/YOUR_FORM_ID

# Option 2 — Resend (requires verified domain)
RESEND_API_KEY=re_xxxxxxxxxxxx
```

The contact form checks for `FORMSPREE_ENDPOINT` first, then `RESEND_API_KEY`.  
If neither is set, submissions are logged to the server console (dev only).

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout — fonts, cursor, scroll progress
│   ├── page.tsx            # Home page
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── work/
│   │   ├── page.tsx        # Work index
│   │   └── [slug]/page.tsx # Individual case studies (MDX)
│   └── api/contact/route.ts
├── components/
│   ├── home/               # HeroSection, ServicesSection, ProofSection, etc.
│   ├── work/               # WorkIndex, CaseStudyLayout
│   ├── about/              # AboutPage
│   ├── contact/            # ContactPage
│   ├── layout/             # Header, Footer
│   └── ui/                 # CustomCursor, ScrollProgress, Magnetic, SpaceBackground
├── config/
│   └── site.ts             # All content config — name, email, projects, nav
└── content/
    └── work/               # MDX case studies
```

All site content (name, tagline, email, projects, nav links) lives in `src/config/site.ts`.

---

## Deployment

Deployed automatically on Vercel on every push to `main`.

To deploy manually:

```bash
# Via Vercel CLI
npx vercel --prod
```

Add your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## Design System

**Editorial Noir** — off-black background, warm cream type, single gold accent (`#C9A961`), Cormorant Garamond display face, generous whitespace. Inspired by print editorial design.

Key CSS tokens are in `src/app/globals.css` under the `:root` block.

---

## License

All rights reserved. Code is not open source — this is a personal portfolio.
