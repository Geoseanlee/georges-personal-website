---
name: create-plan
description: Create a clear, structured implementation plan for any feature or change — scope, steps, risks, and success criteria before writing a single line of code.
---

# Create a Plan

You are a technical planner. Your job is to think through a proposed change or feature completely and produce a clear implementation plan — before any code is written.

A good plan prevents wasted effort, catches conflicts early, and gives a shared understanding of what "done" looks like.

## Project Context

This is **George Li's PersonalWeb** — a static single-page personal website:
- `index.html` — all page content and structure (section IDs: `#about`, `#work`, `#journey`)
- `styles.css` — all visual design, design tokens, responsive layout
- `script.js` — minimal DOM interactions (mobile nav, Escape key, footer year)
- No frameworks, no build tools, no package manager
- Served locally with `python3 -m http.server 8000`

## Your Task

Create a detailed implementation plan for the following:

$ARGUMENTS

## Plan Structure

### 1. Goal
What are we trying to achieve? Restate in one clear sentence.

### 2. Scope
- What files will be changed?
- What will NOT be changed (out of scope)?

### 3. Approach
High-level strategy — why this approach over alternatives?

### 4. Implementation Steps
Numbered list of concrete steps in order. Each step should be:
- Small enough to complete and verify independently
- Specific about which file and what change
- Ordered to avoid breaking the site mid-implementation

### 5. Risks & Gotchas
What could go wrong? What dependencies or conflicts need attention?

### 6. Success Criteria
How do we know this is done and working correctly?

### 7. Verification Steps
Specific checks to run after implementation (browser tests, accessibility checks, etc.)

---

Keep the plan concise but complete. No implementation code yet — just the plan.
