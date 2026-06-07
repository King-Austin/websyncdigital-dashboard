# DESIGN.md — Recivo Editorial Design System

> **Concept**: Editorial precision meets informal-sector urgency. A magazine designed by an engineer.
> Think: *Monocle* × *Linear* × *Lagos street print shop*. Every decision reinforces that exact tension.

---

## 1. Design Philosophy

This system is built on one principle: **intentional contrast**.

- Serif warmth **vs** monospace precision
- Cream softness **vs** near-black weight
- Large expressive headlines **vs** tight technical metadata
- Organic editorial layout **vs** structured data components

Nothing is "default". Every font, color, and spacing choice is a deliberate argument. When in doubt, ask: *does this feel like it was made by someone who cares, or someone who shipped fast?*

### What this system is NOT
- No purple gradients
- No Inter/Roboto/system-ui body copy
- No rounded pill buttons on everything
- No card-soup layouts with equal-weight shadows everywhere
- No dark-mode-as-an-afterthought (both modes are first-class)

---

## 2. Color System

### Base Palette

| Token | Light Value | Dark Value | Usage |
|---|---|---|---|
| `--bg-primary` | `#ECEAE4` | `#0E0E0C` | Page background |
| `--bg-surface` | `#F5F3ED` | `#1A1A17` | Cards, panels, inset areas |
| `--bg-raised` | `#FFFFFF` | `#242420` | Elevated cards, modals |
| `--bg-sunken` | `#E4E2DC` | `#090907` | Code blocks, input backgrounds |
| `--text-primary` | `#1C1C1A` | `#ECEAE4` | Body text, headings |
| `--text-secondary` | `#4A4A42` | `#9A9A8E` | Supporting body copy |
| `--text-muted` | `#7A7A70` | `#5A5A52` | Labels, captions, metadata |
| `--text-ghost` | `#9A9A90` | `#3A3A34` | Placeholder, disabled |
| `--border-default` | `rgba(0,0,0,0.10)` | `rgba(255,255,255,0.08)` | Default borders |
| `--border-strong` | `rgba(0,0,0,0.20)` | `rgba(255,255,255,0.15)` | Hover, emphasis borders |

### Brand Accents

| Token | Value | Usage |
|---|---|---|
| `--accent-green` | `#1F4A35` | Primary CTAs, progress bars, logo, key highlights |
| `--accent-green-light` | `#2A6347` | Hover state for green elements |
| `--accent-green-tint` | `rgba(31,74,53,0.08)` | Tinted backgrounds (scorer notes, badges) |
| `--accent-green-border` | `rgba(31,74,53,0.35)` | Green-tinted borders |
| `--accent-amber` | `#D4A853` | Italic highlights in dark sections ONLY |
| `--accent-amber-dark` | `#B8902F` | Amber hover in dark sections |
| `--accent-red` | `#C0392B` | Recording indicator dot, destructive actions |

### Color Usage Rules

1. **Green is the primary brand color** — use it for the one most important element per section. Don't spray it everywhere.
2. **Amber appears only on dark backgrounds** — it's the candlelight in the dark room. On light backgrounds it looks muddy and cheap.
3. **The two backgrounds alternate** — a light section (`#ECEAE4`) is always followed by a dark section (`#0E0E0C`) or vice versa. Never two consecutive same-tone sections.
4. **No pure black, no pure white** — `#1C1C1A` and `#ECEAE4` are the warm extremes. The warmth is load-bearing.
5. **Tints over opacities in production** — prefer `rgba(31,74,53,0.08)` for tinted surfaces over mixing HSL variants.

---

## 3. Typography

### Font Stack

```css
/* Display & Body — Primary serif */
font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;

/* Labels, metadata, UI chrome, navigation, code */
font-family: 'DM Mono', 'JetBrains Mono', 'Courier New', monospace;
```

**Google Fonts import:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Hero Display | Cormorant Garamond | clamp(52px, 7vw, 88px) | 600 | 0.95 | -0.02em |
| Section Heading | Cormorant Garamond | clamp(36px, 5vw, 64px) | 600 | 0.96 | -0.02em |
| Sub-heading | Cormorant Garamond | clamp(24px, 3vw, 40px) | 500 | 1.1 | -0.015em |
| Body Large | Cormorant Garamond | 18px | 400 | 1.7 | 0 |
| Body Default | Cormorant Garamond | 16px | 400 | 1.65 | 0 |
| UI Label | DM Mono | 13px | 500 | 1.5 | 0.02em |
| Eyebrow / Section Tag | DM Mono | 10px | 400 | 1 | 0.15em |
| Metadata / Caption | DM Mono | 11px | 400 | 1.6 | 0.04em |
| Small UI Text | DM Mono | 10px | 400 | 1.6 | 0.03em |
| Nav Links | DM Mono | 11px | 400 | 1 | 0.08em |

### Typography Rules

**Italics are semantic, not decorative.**
Italic Cormorant Garamond in headings signals the *emotional core* of the sentence — the word that carries the most weight. Usually one word, occasionally a short phrase. Green on light backgrounds, amber on dark.

```html
<!-- Correct -->
<h2>Not a skill exam. <em>A diagnostic interview.</em></h2>
<h2>Forty-one million <em>invisibles.</em></h2>

<!-- Wrong — too many italicized words, loses impact -->
<h2><em>Forty-one million invisibles</em> across Nigeria.</h2>
```

**Eyebrows are section anchors, not decoration.**
The `01 — SECTION NAME` pattern is structural. Every major section gets one. Format: `{number} — {NAME IN CAPS}`.

```css
.eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}
```

**Max line length: 36ch for body copy.** Wider than this and the reader loses their place. On large screens, the body copy column stays narrow while the heading bleeds wide. This asymmetry is intentional.

**Never mix fonts in body paragraphs.** Cormorant Garamond for prose. DM Mono for any number, statistic, code, label, or UI string inside prose. Mixed inline:

```html
<p>Workers complete the assessment in under <span class="mono">T-00:24</span> on average.</p>
```

---

## 4. Spacing & Layout

### Spacing Scale

```css
--space-1:  0.25rem;  /* 4px  — icon gaps, tight inline */
--space-2:  0.5rem;   /* 8px  — component-internal gaps */
--space-3:  0.75rem;  /* 12px — tight stack */
--space-4:  1rem;     /* 16px — standard stack */
--space-5:  1.25rem;  /* 20px — card padding */
--space-6:  1.5rem;   /* 24px — section sub-items */
--space-8:  2rem;     /* 32px — between components */
--space-10: 2.5rem;   /* 40px — section horizontal padding */
--space-16: 4rem;     /* 64px — between grid columns */
--space-20: 5rem;     /* 80px — section vertical padding */
```

### Section Padding

```css
.section {
  padding: var(--space-20) var(--space-10);
}

/* Mobile */
@media (max-width: 768px) {
  .section {
    padding: 3rem 1.25rem;
  }
}
```

### Grid System

This system uses **three primary layouts**, not a generic 12-column grid:

**1. Two-column editorial (60/40 or 50/50)**
```css
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-16);
  align-items: start;
}

/* Asymmetric variant */
.two-col-wide {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: var(--space-16);
}
```

**2. Demo + Rubric side-by-side (equal)**
```css
.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: start;
}
```

**3. Full-bleed text block (centered, constrained)**
```css
.text-block {
  max-width: 680px;
  margin: 0 auto;
}
```

### Border Radius

```css
--radius-sm:  4px;   /* Tags, small badges */
--radius-md:  8px;   /* Buttons, inputs */
--radius-lg:  12px;  /* Cards, panels */
--radius-pill: 50px; /* CTA buttons with icon arrow */
```

**Cards use `border-radius: 12px`.** CTAs with arrow icons use `border-radius: 50px`. Everything else uses 4px or 8px. No radius on single-sided borders.

---

## 5. Component Library

### Navigation

```html
<nav class="nav">
  <!-- Logo -->
  <div class="logo">
    <div class="logo-mark"><!-- SVG icon --></div>
    <span>Brand Name</span>
  </div>

  <!-- Links: DM Mono, 11px, 0.08em tracked, uppercase -->
  <div class="nav-links">
    <a href="#">Problem</a>
    <a href="#">How it works</a>
  </div>

  <!-- Actions -->
  <div class="nav-actions">
    <button class="btn-ghost">Sign in</button>
    <button class="btn-ghost">Create account</button>
    <button class="btn-solid">Open App ↗</button>
  </div>
</nav>
```

```css
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2.5rem;
  border-bottom: 0.5px solid var(--border-default);
  background: var(--bg-primary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.nav-links {
  display: flex;
  gap: 2rem;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

---

### Buttons

**Three button variants only. No gradients. No shadows.**

```css
/* Ghost — secondary actions */
.btn-ghost {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 0.45rem 1rem;
  border: 0.5px solid var(--border-strong);
  background: transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-primary);
  letter-spacing: 0.02em;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.btn-ghost:hover {
  background: var(--bg-surface);
  border-color: var(--border-strong);
}

/* Solid — nav-level actions */
.btn-solid {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  padding: 0.45rem 1rem;
  background: var(--text-primary);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* CTA — primary call-to-action, pill shape with arrow */
.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-green);
  color: #ECEAE4;
  border: none;
  border-radius: var(--radius-pill);
  padding: 0.9rem 2rem;
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: background 0.15s ease;
}
.btn-cta:hover {
  background: var(--accent-green-light);
}
```

---

### Cards

**Three card variants:**

```css
/* Surface card — sunken, for demo areas */
.card-surface {
  background: var(--bg-surface);
  border-radius: var(--radius-lg);
  border: 0.5px solid var(--border-default);
  overflow: hidden;
}

/* Raised card — elevated, for rubrics, feature panels */
.card-raised {
  background: var(--bg-raised);
  border-radius: var(--radius-lg);
  border: 0.5px solid var(--border-default);
  padding: 1.75rem;
}

/* Tinted card — brand-tinted, for highlights, callouts */
.card-tinted {
  background: var(--accent-green-tint);
  border-left: 2px solid var(--accent-green);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  padding: 0.6rem 1rem;
}
```

---

### Chat / Conversation UI

Used for the diagnostic interview demo component.

```css
/* AI message */
.msg-ai {
  background: var(--bg-raised);
  border-radius: 10px 10px 10px 3px;
  padding: 0.8rem 1rem;
  font-size: 14px;
  line-height: 1.55;
  max-width: 82%;
  border: 0.5px solid var(--border-default);
  color: var(--text-primary);
}

/* User message */
.msg-user {
  background: var(--text-primary);
  color: var(--bg-primary);
  border-radius: 10px 10px 3px 10px;
  padding: 0.8rem 1rem;
  font-size: 14px;
  line-height: 1.55;
  max-width: 82%;
  align-self: flex-end;
}

/* Scorer annotation */
.scorer-note {
  background: var(--accent-green-tint);
  border-left: 2px solid var(--accent-green);
  padding: 0.6rem 1rem;
  border-radius: 0 6px 6px 0;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: var(--accent-green);
}
```

---

### Progress / Rubric Bars

Slim 3px bars. No rounded caps on track — only on fill.

```css
.bar-track {
  height: 3px;
  background: var(--border-default);
  border-radius: 2px;
}

.bar-fill {
  height: 3px;
  background: var(--accent-green);
  border-radius: 2px;
  transition: width 0.4s ease;
}
```

```html
<div class="rubric-item">
  <div class="rubric-header">
    <span class="rubric-name">Diagnostic reasoning</span>
    <span class="rubric-pct">30%</span>
  </div>
  <p class="rubric-sub">Isolate causes systematically</p>
  <div class="bar-track">
    <div class="bar-fill" style="width: 88%"></div>
  </div>
</div>
```

```css
.rubric-name {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 500;
  font-size: 15px;
}

.rubric-pct {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: var(--text-muted);
}

.rubric-sub {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: var(--text-ghost);
  letter-spacing: 0.03em;
  margin-bottom: 0.5rem;
}
```

---

### Comparison Table

Used in the "What's Been Tried" dark section.

```css
.compare-table {
  width: 100%;
  border-collapse: collapse;
}

.compare-table td {
  padding: 1rem 0;
  border-bottom: 0.5px solid rgba(255,255,255,0.08);
  font-size: 14px;
  vertical-align: top;
}

/* Column 1: Competitor name */
.compare-table td:nth-child(1) {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 500;
  font-size: 16px;
  color: #ECEAE4;
  width: 22%;
}

/* Column 2: What they do */
.compare-table td:nth-child(2) {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: var(--text-muted);
  width: 38%;
}

/* Column 3: Why it fails — prefixed with → */
.compare-table td:nth-child(3) {
  font-size: 13px;
  color: var(--text-muted);
}

.compare-table td:nth-child(3)::before {
  content: '→ ';
  color: #5A5A52;
}
```

---

### Recording Header (Demo Card)

```html
<div class="demo-header">
  <span>
    <span class="rec-dot"></span>
    Recording · language: <strong>Pidgin</strong>
  </span>
  <span class="timer">T-00:24</span>
</div>
```

```css
.demo-header {
  padding: 0.6rem 1.2rem;
  border-bottom: 0.5px solid var(--border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: var(--text-muted);
}

.rec-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-red);
  margin-right: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.timer {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}
```

---

## 6. Section Templates

### Hero Section (Light)

```html
<section class="section">
  <p class="eyebrow">01 — Section Name</p>
  <div class="two-col">
    <div>
      <h1 class="hero-heading">
        Main claim.<br>
        <em>Italic payoff.</em>
      </h1>
      <p class="body-text">Supporting copy, max 36ch wide. Never wider.
        Explains the claim without repeating it.</p>
      <button class="btn-cta">Primary action ↗</button>
    </div>
    <div>
      <!-- Demo component, rubric card, or visual -->
    </div>
  </div>
</section>
```

### Problem Section (Dark)

```html
<section class="section-dark">
  <p class="eyebrow-dark">01 — The Problem</p>
  <div class="two-col-wide">
    <div>
      <h2 class="big-heading">
        Stark number<br>
        <em class="amber-em">impactful noun.</em>
      </h2>
      <p class="body-dark">
        One sentence stating who is affected.<br>
        One sentence stating why. No more.
      </p>
    </div>
    <div>
      <p class="eyebrow-dark">02 — What's Been Tried</p>
      <h3 class="sub-heading-dark">
        Why nothing else verifies the <em class="amber-em">work itself.</em>
      </h3>
      <table class="compare-table">
        <!-- competitor rows -->
      </table>
    </div>
  </div>
</section>
```

### Feature / How It Works (Light, Numbered)

```html
<section class="section">
  <p class="eyebrow">03 — How It Works</p>
  <div class="feature-steps">
    <!-- Each step has: number label, serif heading, mono sub, body copy -->
    <div class="step">
      <span class="step-num">01</span>
      <h3 class="step-heading">Worker completes a diagnostic interview.</h3>
      <p class="step-body">AI conducts a voice-first conversation in the worker's language.</p>
    </div>
    <!-- repeat -->
  </div>
</section>
```

---

## 7. Motion & Animation

**Principle: one well-orchestrated entrance per section. No continuous animations except the recording dot pulse.**

### Page / Section Entrance

```css
.fade-up {
  opacity: 0;
  transform: translateY(18px);
  animation: fadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger children */
.fade-up:nth-child(1) { animation-delay: 0s; }
.fade-up:nth-child(2) { animation-delay: 0.08s; }
.fade-up:nth-child(3) { animation-delay: 0.16s; }
.fade-up:nth-child(4) { animation-delay: 0.24s; }
```

### Progress Bar Fill (on scroll into view)

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.bar-fill').forEach(bar => {
        bar.style.transition = 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        bar.style.width = bar.dataset.value + '%';
      });
    }
  });
}, { threshold: 0.3 });
```

### Hover States

```css
/* Nav links */
.nav-links a {
  transition: color 0.12s ease;
}
.nav-links a:hover {
  color: var(--text-primary);
}

/* Table rows */
.compare-table tr {
  transition: background 0.1s ease;
}
.compare-table tr:hover td {
  color: #ECEAE4;
}

/* Cards */
.card-raised {
  transition: border-color 0.15s ease;
}
.card-raised:hover {
  border-color: var(--border-strong);
}
```

---

## 8. Dark Mode

Dark mode is not just color inversion. The dark sections have their own identity:

| Element | Light Section | Dark Section |
|---|---|---|
| Background | `#ECEAE4` | `#0E0E0C` |
| Heading italic | `#1F4A35` (green) | `#D4A853` (amber) |
| Body text | `#4A4A42` | `#9A9A8E` |
| Border | `rgba(0,0,0,0.10)` | `rgba(255,255,255,0.08)` |
| Eyebrow | `#7A7A70` | `#7A7A68` |
| Compare table border | — | `rgba(255,255,255,0.08)` |

**System dark mode (prefers-color-scheme):**

```css
:root {
  --bg-primary: #ECEAE4;
  --bg-surface: #F5F3ED;
  --bg-raised: #FFFFFF;
  --text-primary: #1C1C1A;
  --text-secondary: #4A4A42;
  --text-muted: #7A7A70;
  --text-ghost: #9A9A90;
  --border-default: rgba(0,0,0,0.10);
  --border-strong: rgba(0,0,0,0.20);
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0E0E0C;
    --bg-surface: #1A1A17;
    --bg-raised: #242420;
    --text-primary: #ECEAE4;
    --text-secondary: #9A9A8E;
    --text-muted: #5A5A52;
    --text-ghost: #3A3A34;
    --border-default: rgba(255,255,255,0.08);
    --border-strong: rgba(255,255,255,0.15);
  }
}
```

---

## 9. Responsive Breakpoints

```css
/* Desktop first */

/* Large screens — 1280px+ */
@media (min-width: 1280px) {
  .hero-heading { font-size: 96px; }
  .section { padding: 6rem 3rem; }
}

/* Tablet — max 1024px */
@media (max-width: 1024px) {
  .two-col { grid-template-columns: 1fr; gap: 2.5rem; }
  .two-col-wide { grid-template-columns: 1fr; gap: 2.5rem; }
  .demo-grid { grid-template-columns: 1fr; }
}

/* Mobile — max 768px */
@media (max-width: 768px) {
  .section { padding: 3rem 1.25rem; }
  .nav-links { display: none; }
  .nav-actions .btn-ghost:first-child { display: none; }
  .hero-heading { font-size: 44px; }
  .big-heading { font-size: 38px; }
}

/* Small mobile — max 480px */
@media (max-width: 480px) {
  .nav-actions .btn-ghost { display: none; }
  .hero-heading { font-size: 36px; }
}
```

---

## 10. CSS Custom Properties — Full Reference

```css
:root {
  /* Colors */
  --bg-primary:          #ECEAE4;
  --bg-surface:          #F5F3ED;
  --bg-raised:           #FFFFFF;
  --bg-sunken:           #E4E2DC;
  --text-primary:        #1C1C1A;
  --text-secondary:      #4A4A42;
  --text-muted:          #7A7A70;
  --text-ghost:          #9A9A90;
  --border-default:      rgba(0,0,0,0.10);
  --border-strong:       rgba(0,0,0,0.20);

  --accent-green:        #1F4A35;
  --accent-green-light:  #2A6347;
  --accent-green-tint:   rgba(31,74,53,0.08);
  --accent-green-border: rgba(31,74,53,0.35);
  --accent-amber:        #D4A853;
  --accent-amber-dark:   #B8902F;
  --accent-red:          #C0392B;

  /* Typography */
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-mono:  'DM Mono', 'JetBrains Mono', monospace;

  /* Spacing */
  --space-1:  0.25rem;
  --space-2:  0.5rem;
  --space-3:  0.75rem;
  --space-4:  1rem;
  --space-5:  1.25rem;
  --space-6:  1.5rem;
  --space-8:  2rem;
  --space-10: 2.5rem;
  --space-16: 4rem;
  --space-20: 5rem;

  /* Border Radius */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-pill: 50px;
}
```

---

## 11. Dos and Don'ts

### Do
- ✅ Use one italic word/phrase per headline as the emotional anchor
- ✅ Alternate light and dark sections
- ✅ Keep body copy under 36ch wide
- ✅ Use DM Mono for all numbers, stats, labels, and timestamps
- ✅ Keep amber accent strictly for dark backgrounds
- ✅ Use section eyebrows (`01 — NAME`) consistently
- ✅ Keep the CTA count per section to exactly one
- ✅ Use `border: 0.5px` — not `1px` — for card and component borders
- ✅ Use the warm `#ECEAE4` cream, never pure `#FFFFFF` as the page background

### Don't
- ❌ No purple. Not even as an accent. Especially not gradients.
- ❌ No Inter, Roboto, or system-ui for display or body copy
- ❌ No equal-weight shadows on cards (use border instead)
- ❌ No more than 2 CTAs in the viewport at any time
- ❌ No full-width body text on desktop
- ❌ No amber on light backgrounds
- ❌ No green on dark backgrounds (use amber instead for emphasis)
- ❌ No more than 3 different font sizes per section
- ❌ No decorative borders with border-radius (use full borders or none)
- ❌ Never use `font-weight: 700` — max is `600` for display, `500` for UI

---

## 12. Naming Conventions (for Claude Code)

When building with this design system in Claude Code, use these class name patterns:

```
rp-*          Root prefix (rp = Recivo Pattern)
rp-section    Light section wrapper
rp-section-dark  Dark section wrapper
rp-eyebrow    Section label (01 — NAME)
rp-hero-heading  Hero display text
rp-big-heading   Dark section display text
rp-two-col    Equal two-column grid
rp-two-col-wide  Asymmetric 1:2 grid
rp-body       Light background body copy
rp-body-dark  Dark background body copy
rp-btn-ghost  Secondary button
rp-btn-solid  Nav-level dark button
rp-btn-cta    Primary pill CTA
rp-card-surface  Demo / inset card
rp-card-raised   Rubric / feature card
rp-card-tinted   Green-tinted callout
rp-msg-ai     AI chat bubble (left)
rp-msg-user   User chat bubble (right)
rp-scorer     Scorer annotation note
rp-bar-track  Progress bar background
rp-bar-fill   Progress bar fill
rp-compare-table  Competitor comparison table
rp-rec-dot    Red recording indicator dot
rp-eyebrow-dark  Dark section eyebrow variant
```

---

*End of DESIGN.md — Recivo Editorial Design System*
*Reverse-engineered and documented by Claude, May 2025*
