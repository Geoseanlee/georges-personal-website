# Copilot instructions for PersonalWeb

## Project overview

This repository is a lightweight personal website for George Li, built as a static single-page site rather than a framework-based app. The project is intentionally simple: HTML defines the content, CSS controls the visual design, and a small script handles mobile navigation and small UI behaviors.

The site is meant to feel personal and polished, not generic. Keep changes aligned with the project’s tone: warm editorial branding, calm green/neutral palette, responsive one-page layout, and a founder-style “code & care” identity.

## Build, test, and lint commands

There is no package.json, build pipeline, test runner, or lint configuration in this repository.

Recommended local preview:

```bash
cd /Users/geoseanlee/Documents/Code/PersonalWeb
python3 -m http.server 8000
```

Then open: http://localhost:8000

Manual validation for changes:

- Check the page in a browser for layout and interaction issues.
- Confirm navigation links and section anchors still work.
- If editing JavaScript, validate syntax with the browser console or a quick Node check:

```bash
node --check script.js
```

There are no automated unit tests or lint commands to run in this repo.

## High-level architecture

The repo is intentionally small and follows a straightforward static-site structure:

- `index.html`: the full page content, sections, metadata, and all anchor links. This file includes the site structure and content blocks for hero, about, selected work, journey, and contact sections.
- `styles.css`: all styling, design tokens, responsive layout rules, hover/focus states, and page-specific visual treatments. This is the main place for visual changes.
- `script.js`: small DOM behavior for the mobile navigation menu, Escape-key handling, and the footer year.

Important project-specific context from the repo:

- The site is a single-page personal website, not an app with routing or a client-side framework.
- The HTML/CSS/JS are all at the root of the project and are served directly.
- Links to social profiles and GitHub repositories should remain as external links opening in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.
- The project is intentionally static and dependency-free; avoid introducing a framework or bundler unless the task explicitly requires it.

## Key conventions and patterns

- Preserve the existing document structure and section IDs. Navigation links such as `#about`, `#work`, and `#journey` depend on matching IDs in `index.html`.
- Keep the visual language consistent with the warm paper-inspired palette and serif/sans typography already defined in `styles.css`.
- Prefer semantic HTML and accessible interactions. The site already includes skip-link, focus-visible styling, and `aria-expanded` handling for the mobile menu.
- Treat the project as a personal brand page, not an enterprise app. Copy should stay polished and conversational, with a biography and portfolio emphasis rather than technical boilerplate.
- Avoid unnecessary dependencies or build tooling. If a change can be implemented with plain HTML/CSS/JS, that is the preferred path.
- When editing the menu or other JS-driven UI, keep behavior simple and accessible: close the menu when links are clicked, support Escape to dismiss, and maintain keyboard focus behavior.

## Working rules for future edits

- Keep content updates in `index.html` when changing text, section order, or links.
- Keep styling changes in `styles.css` for colors, spacing, typography, and responsive layout.
- Keep behavior changes in `script.js` for interactions only; avoid scattering event logic across HTML.
- Use relative file paths as they currently exist. The app is served from the project root, so `styles.css` and `script.js` are referenced directly from `index.html`.
- Do not add framework scaffolding, package managers, or build steps unless a task specifically requires them for a feature.

## Repository context

This project lives in a small static directory and is expected to be hand-served locally. The project history notes that it was originally created as a personal website in a separate folder and later moved into this repository directory; the current structure should remain stable and self-contained.
