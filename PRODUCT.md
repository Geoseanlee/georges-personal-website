# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19 + TypeScript + Vite; FastAPI backend; PostgreSQL 16 running locally as a native Homebrew service. Mac mini + Cloudflare Tunnel and Cloudflare Pages are future deployment options, not required for the local MVP.

## Users

Primary: recruiters, potential collaborators, and peers in tech or healthcare who find George via LinkedIn, GitHub, or word-of-mouth. They arrive on a desktop or phone, spend 60–90 seconds, and decide whether to reach out.

## Product Purpose

George Li's personal website. Introduces George as a person who moves between nursing and software with intention — not a career pivot, but a coherent identity. The site earns a "get in touch" from the right person by being polished, human, and not trying to be everything.

## Positioning

The intersection of clinical care and engineering precision, lived rather than claimed. No other portfolio site can truthfully use "nursing student with a CS master's" as its opening line alongside actual production software.

## Operating Context

Viewed on a phone during a commute or on a laptop in a quiet office. Visitors read top-to-bottom without logging in. Contact is email-only; no form, no auth.

## Capabilities and Constraints

- Single-page site, anchor navigation only, no routing.
- Projects section reads from a FastAPI + PostgreSQL backend; degrades gracefully (clear error state, other sections unaffected) when the API is unavailable.
- No admin UI, no contact form, no authentication in v1.
- External links open in a new tab with `rel="noopener noreferrer"`.
- Must pass WCAG 2.1 AA contrast on the chosen dark-purple palette.
- Skip link to `#main`, `aria-expanded` on mobile nav, keyboard-operable.

## Brand Commitments

- Name: George Li
- Wordmark: "GL." (used in nav and footer)
- Chinese name: 子璽 (used as a personal mark, not for navigation)
- Tagline frame: "A life between code & care."
- Email: geoseanlee@gmail.com
- Socials: LinkedIn, Instagram, GitHub (all external links)
- Identity: Wenzhounese roots, Taiwan → Australia journey, Gold Coast home base
- Visual direction (user-pinned): deep purple and white, Apple-register precision

## Evidence on Hand

- Four portfolio projects with GitHub links (Blotz Task App, RenoPilot, Global Youth SDGs Summit, AI Health Management)
- Education: MCS University of Sydney (Distinction), MNursing SCU (in progress), BA Economics Soochow
- Work: Mable support worker, Touch of Pawfection dog groomer
- Languages: Mandarin (native), English (fluent), Japanese (learning), German (learning)
- Contact: geoseanlee@gmail.com

## Product Principles

1. **Human before credentials.** Lead with who George is, not a list of skills.
2. **Precision as personality.** The care taken in the design reflects the care taken in the work.
3. **Graceful under failure.** The page works even when the API is down; the visitor never sees a broken experience.
4. **One page, one story.** No routing. No noise. A clear arc from introduction to action.
5. **Quiet confidence.** No hype, no superlatives. Let the work speak.

## Accessibility & Inclusion

WCAG 2.1 AA minimum. Skip link, visible keyboard focus, `aria-expanded` on mobile nav, `prefers-reduced-motion` respected. All text on dark purple backgrounds must meet ≥4.5:1 contrast ratio.
