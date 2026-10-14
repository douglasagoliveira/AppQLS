# Design System: Quantum Lighting Solutions (QLS)
**Project ID:** qls-website

## 1. Visual Theme & Atmosphere
The visual identity of Quantum Lighting Solutions (QLS) is anchored in **"Architectural Noir & Warm Radiance"**. The brand operates under the core philosophy: *"We do not sell LED; we sculpt the experience of a transformed space."*

The atmosphere evokes quiet luxury, architectural precision, and the intimate sensory warmth of high-end residential estates, penthouses, and bespoke galleries in Sydney:
* **Cinematic & Weightless:** Deep obsidian surfaces (`#0e0e0e`) create an infinite architectural background, allowing warm illumination to behave like physical light cutting through darkness.
* **Sculptural Dualism:** A deliberate shift between atmospheric dark canvases (brand storytelling, product showcase, scrollytelling) and tactile warm paper surfaces (`#f6f4f0`) for practical consultation and quotation zones.
* **Whisper-Quiet Restraint:** Glassmorphic overlays, frosted blur barriers, and hairline boundary lines create soft depth without noisy gradients or overt skeuomorphism.

---

## 2. Color Palette & Roles

| Semantic Descriptive Name | Hex / Value | Functional Role |
|---|---|---|
| **Obsidian Architectural Ink** | `#0e0e0e` | Primary global background; infinite dark canvas providing cinematic contrast |
| **Deep Charcoal Surface** | `#181818` | Elevated card backgrounds, sticky media viewports, and drawer panels |
| **Warm Champagne Gold Glow** | `#d9b277` | Brand accent; illuminated eyebrow markers, hover glows, focus indicators, and interactive badges |
| **Deep Antique Amber Gold** | `#8a6a35` | High-contrast accent for daytime warm paper sections, eyebrow indicators, and numerical milestones |
| **Tactile Luminous Paper** | `#f6f4f0` | Inverted background for interactive consultation, quotation sections, and high-contrast buttons |
| **Ghost Chalk Text** | `#f4f2ee` | Primary typography on dark surfaces; crisp readability without harsh pure white glare |
| **Whispering Ambient Mist** | `rgba(244, 242, 238, 0.62)` | Secondary body copy, specification captions, metadata, and subtitle descriptions |
| **Ethereal Glass Line** | `rgba(255, 255, 255, 0.14)` | Structural hair-thin dividers, card frames, and subtle interactive borders |
| **Frosted Obsidian Glass** | `rgba(14, 14, 14, 0.82)` | Fixed header background with `backdrop-filter: blur(14px)` for floating navigation |
| **Shadow Velvet Barrier** | `rgba(0, 0, 0, 0.55)` | Backdrop modal dimming for the interactive quote drawer |

---

## 3. Typography Rules

* **Primary Font Family:** `'Urbanist', system-ui, sans-serif`
  * A geometric sans-serif with subtle humanist proportions, echoing architectural drafting and European luxury editorial design.
* **Typographic Hierarchy & Character:**
  * **Display & Hero Headings (`.display`):** Fluid scale `clamp(2.4rem, 6.2vw, 5.4rem)`, medium weight (`500`), ultra-tight letter spacing (`-0.02em`), compact line-height (`1.02`). Designed to read like an architectural manifesto.
  * **Section Headings (`.h2`):** Fluid scale `clamp(1.9rem, 4vw, 3.4rem)`, weight `500`, tracking `-0.015em`, line-height `1.08`.
  * **Eyebrow Category Markers (`.eyebrow`):** Micro scale `0.78rem`, uppercase, bold weight (`600`), wide letter-spacing (`0.22em`), rendered in Warm Champagne Gold (`#d9b277`) on dark sections and Antique Amber Gold (`#8a6a35`) on paper sections.
  * **Lead Narrative (`.lead`):** Fluid scale `clamp(1.05rem, 1.6vw, 1.3rem)`, color Whispering Ambient Mist (`--muted`), line-height `1.55`, strictly constrained to a maximum line measure of `40ch` to maintain editorial rhythm.
  * **Body & Spec Text:** Base size `1.05rem`, regular weight (`400`), smoothed with `-webkit-font-smoothing: antialiased`.

---

## 4. Component Stylings

* **Buttons (`.btn`):**
  * **Geometry:** Pill-shaped with fully rounded contours (`border-radius: 999px`).
  * **Default State (Dark Canvas):** Transparent background, hairline stroke in Ethereal Glass Line (`1px solid rgba(255,255,255,0.14)`), Ghost Chalk typography (`#f4f2ee`).
  * **Primary Action Variant (`.btn-light`):** Solid Tactile Luminous Paper (`#f6f4f0`) fill with Obsidian text (`#111111`).
  * **Micro-Interactions:** Subtle lift on hover (`transform: translateY(-2px)`), easing curve `cubic-bezier(0.2, 0.7, 0.2, 1)`. Focus state features a crisp 2px Warm Champagne Gold ring with 3px offset.
* **Cards & Product Containers (`.card`):**
  * **Geometry:** Generously rounded corners (`border-radius: 24px`), overflow clipped.
  * **Surface:** Deep Charcoal Surface (`#181818`) with 1px Ethereal Glass Line border.
  * **Elevation & Motion:** On hover, lifts smoothly (`translateY(-5px)`) while border warms to luminous amber-gold (`rgba(217, 178, 119, 0.5)`).
  * **Imagery:** 4:3 aspect ratio thumb container with subtle zoom (`scale(1.06)`) on hover, paired with floating frosted glass category tags (`backdrop-filter: blur(8px)`).
* **Inputs & Form Controls (`input`, `select`, `textarea`):**
  * **Geometry:** Tactile curved corners (`border-radius: 14px`), generous inner padding (`0.85rem 1rem`).
  * **Surface:** Crisp white fill with muted hairline outline (`1px solid rgba(20,20,20,0.2)`) inside daytime paper sections.
  * **Focus State:** Gold halo focus outline (`2px solid #d9b277; outline-offset: 3px`) ensuring unmistakable feedback.
* **Navigation Bar & Header (`.site-header`):**
  * **Layout:** Fixed floating header pinned to the top viewport (`inset: 0 0 auto 0; z-index: 50`).
  * **Scrolled State:** Transitions seamlessly into Frosted Obsidian Glass (`rgba(14,14,14,0.82)`) with a 14px backdrop blur and compressed padding (`0.7rem`).
  * **Brand Identity:** Official QLS horizontal logomark (50px height), with smooth opacity transition on hover.
  * **Navigation Links:** Streamlined 4-item architectural hierarchy:
    * `Collection` (`/produtos`): Direct access to full 12-item catalog.
    * `How it works` (`/#como-funciona`): Smooth-scroll jump to 3-step procurement process.
    * `About` (`/sobre`): Brand manifesto and design philosophy.
    * `Contact` (`/contato`): Dedicated consultation channel.
    *(Note: Former "Projects" anchor removed to eliminate navigational redundancy and focus visitors on bespoke collection sizing).*
  * **Focal Actions:** Right-aligned interactive actions: `My list` trigger with live badge counter and `Request a quote` pill CTA.
* **Metric Chips & Architectural Highlights (`.chip`):**
  * **Geometry:** Softened organic corners (`border-radius: 18px`), padding `1rem 1.25rem`.
  * **Surface:** Translucent charcoal backdrop (`rgba(20,20,20,0.55)`) with 16px backdrop blur, displaying large numbers (`1.5rem`, weight 600) alongside muted labels.

---

## 5. Layout Principles

* **Fluid Spacing System:**
  * Global gutters adapt dynamically using CSS clamp: `--pad: clamp(1.25rem, 4vw, 3.5rem)`.
  * Generous vertical section rhythm: `padding: clamp(4.5rem, 10vw, 9rem) 0`.
* **Content Enclosure & Max Width:**
  * Maximum central wrapper bounded to `1320px` (`--max`), centered horizontally (`margin-inline: auto`).
* **Asymmetrical Grid Compositions:**
  * **Hero Section:** Split 1.3fr to 1fr grid pairing bold typography with floating metrics chips.
  * **Scrollytelling Features:** Sticky two-column grid (1fr : 1fr) with a fixed 100svh media window on the right and flowing narrative steps on the left.
  * **Catalog Showcase:** Responsive 3-column grid (`repeat(3, 1fr)`), automatically folding into 2 columns under `960px` and 1 column under `600px`.
  * **Linear CTA Flow:** Home progression flows organically from Performance Metrics (`.risks`) directly into the Consultation Quote Section (`.final`), maintaining momentum toward user inquiry.
* **Responsive Behavior:**
  * Full desktop navigation collapses cleanly on viewports below `860px`, preserving focal actions (`My List` and `Request a quote`).
  * Motion elements strictly respect user preferences via `@media (prefers-reduced-motion: reduce)`.

---

## 6. Information Architecture & Canonical Sitemap

The QLS digital experience is structured around 4 canonical routes, designed for friction-free consultation and bespoke project quotation:

| Route | Page | Purpose & Components | Priority |
|---|---|---|---|
| `/` | **Home** | Brand Manifesto, Atmospheric Scrollytelling, Catalog Teaser, 3-Step Smartphone Walkthrough, Performance Metrics (`CRI 95+`, `0–100%`, `12 mm`), and Direct Quote Form | `1.0` |
| `/produtos` | **Collection** | Complete 12-Product Interactive Catalog with dual-view ambient + LEDYi studio carousels, category filtering (`Strips`, `Profiles`, `Panels`, `Spotlights`, `Controls`), real-time search, and Quote Drawer integration | `0.9` |
| `/sobre` | **About** | Architectural thesis ("We don’t sell LED light. We sell the experience of a transformed space"), Tri-part Symbolism Breakdown (Quantum, Point of Light, Square), and 8 Guiding Principles | `0.8` |
| `/contato` | **Contact** | Direct Consultation Channel, Sydney HQ details, and Bespoke Inquiry Form | `0.8` |

### Global Overlays & Modals
* **Quote List Drawer (`.drawer`):** Non-blocking slide-out drawer maintaining client-side selection of chosen lighting items with instant deletion and direct quote handoff (`/#orcamento`).

### SEO & Indexing Infrastructure
* **Sitemap (`public/sitemap.xml`):** Fully valid XML sitemap adhering to Sitemaps.org 0.9 standard, listing all 4 active routes above.
* **Robots Configuration (`public/robots.txt`):** Unrestricted indexing for search engines with explicit `Sitemap: https://qls.com.au/sitemap.xml` declaration.
* **Head Integration (`Base.astro`):** `<link rel="sitemap" href="/sitemap.xml" />` declared across all pages.

