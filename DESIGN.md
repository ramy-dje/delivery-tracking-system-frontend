# DESIGN.md — WaselGo Design System

## Theme

Dark-first, glass-morphism aesthetic. Deep navy/slate backgrounds with amber as the primary brand accent and cyan used sparingly for secondary highlights.

---

## Colors

### Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#fbbf24` | Buttons, highlights, active states, brand text |
| `primary-dark` | `#f59e0b` | Gradient second stop, hover |
| `primary-darker` | `#d97706` | Pressed states |
| `primary-glow` | `rgba(251,191,36, 0.4)` | Box shadows on hover |
| `primary-soft` | `rgba(251,191,36, 0.1)` | Tinted glass backgrounds |
| `primary-border` | `rgba(251,191,36, 0.25)` | Amber-tinted borders |
| `secondary` | `#22d3ee` | Cyan accents, gradient text pairs |
| `secondary-dark` | `#06b6d4` | Cyan hover |
| `secondary-soft` | `rgba(34,211,238, 0.08)` | Subtle cyan tints |
| `success` | `#34d399` | Positive states, badges |
| `success-soft` | `rgba(52,211,153, 0.1)` | Success tinted surfaces |

### Backgrounds (dark to light)

| Token | Hex | Usage |
|---|---|---|
| `background-main` | `#030712` | Page background, outermost |
| `background-surface` | `#06090f` | Cards, panels |
| `background-alt` | `#0d1117` | Alternate surface |
| `background-elevated` | `#111827` | Dropdowns, elevated layers |
| Dashboard bg | `#020816` | Dashboard layout wrapper |

### Borders

| Token | Value | Usage |
|---|---|---|
| `border-subtle` | `rgba(255,255,255, 0.05)` | Hairline separators |
| `border-default` | `rgba(255,255,255, 0.1)` | Standard card borders |
| `border-primary` | `rgba(251,191,36, 0.25)` | Highlighted / focused borders |
| Dashboard border | `rgba(255,255,255, 0.1)` | `border-white/10` in Tailwind |

### Text

| Token | Hex | Usage |
|---|---|---|
| `text-primary` | `#ffffff` | Headings, key values |
| `text-secondary` | `#94a3b8` (`slate-400`) | Body, descriptions |
| `text-muted` | `#64748b` (`slate-500`) | Placeholders, labels, stat labels |
| `text-brand` | `#fbbf24` | Brand-colored inline text |
| Body default | `#e2e8f0` | Base body color in `<body>` |

### shadcn/ui Component Tokens (`styles/globals.css`)

The shadcn layer uses OKLCH. The app always renders in dark mode inside the dashboard:

| Variable | Dark value |
|---|---|
| `--background` | `oklch(0.145 0 0)` ≈ `#1a1a1a` |
| `--foreground` | `oklch(0.985 0 0)` ≈ `#fafafa` |
| `--border` | `oklch(0.269 0 0)` |
| `--destructive` | `oklch(0.396 0.141 25.7)` ≈ deep red |
| `--radius` (base) | `0.625rem` |

---

## Typography

### Font Families

| Role | Family | Weights | Used for |
|---|---|---|---|
| `font-display` | **Syne** | 400 500 600 700 800 | All headings (h1–h6), stat values, logo |
| `font-body` | **DM Sans** | 300 400 500 600 (+ italic) | Body text, UI labels, buttons, nav |
| `font-mono` | **JetBrains Mono** | 400 500 | Code, tags, badges, step numbers |

Loaded from Google Fonts in `app/globals.css`.

### Heading Defaults (globals.css)

```css
h1, h2, h3, h4, h5, h6 {
  font-family: "Syne", sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
}
```

### Sizes in Practice

| Element | Classes |
|---|---|
| Hero h1 | `text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05]` |
| Section heading | `text-4xl md:text-5xl lg:text-6xl font-display font-bold` |
| CTA heading | `text-4xl md:text-6xl font-display font-bold leading-[1.05]` |
| Feature card title | `text-lg font-display font-bold text-white/90` |
| Body / descriptions | `text-lg text-slate-400 leading-relaxed` |
| Small body | `text-sm text-slate-500` |
| Nav links | `text-sm` |
| Stat value | `text-2xl font-display font-bold` |
| Badge / tag text | `text-[10px] font-mono tracking-widest uppercase` |
| Stat label | `text-xs text-muted uppercase tracking-wide` |

---

## Gradients

| Name | Value | Usage |
|---|---|---|
| `gradient-primary` | `linear-gradient(135deg, #fbbf24, #f59e0b)` | Primary buttons, fills |
| `gradient-dark` | `linear-gradient(135deg, #0f172a, #020617)` | Dark section backgrounds |
| `gradient-amber` (text) | same as primary, clip to text | Brand-colored display text |
| `gradient-cyan` | `linear-gradient(135deg, #22d3ee, #818cf8)` | Cyan-to-indigo accent text |
| Grid pattern | `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)` repeated at `60px 60px` | Subtle grid overlay on hero |
| Corner glow | `radial-gradient` from amber/cyan at 0% opacity at edge | Atmospheric corner lighting on cards |

---

## Spacing & Layout

### Container

```
max-w-7xl mx-auto px-6
```

### Section Vertical Padding

| Pattern | Value |
|---|---|
| Standard section | `py-28` |
| Large section | `py-32` |
| Compact section | `py-20` or `py-24` |

### Common Gap / Margin Patterns

| Usage | Value |
|---|---|
| Between headline and body | `mb-6` |
| Below body text | `mb-10` |
| Below CTA buttons | `mb-14` |
| Below section badge | `mb-8` |
| Before trust bar / divider | `mt-20 pt-10` |
| Feature grid gap | `gap-5` |
| Button group gap | `gap-4` |
| Stats row gap | `gap-8` |
| Dashboard inner gap | `gap-3` |

### Dashboard Layout

```
h-dvh overflow-hidden p-3 bg-[#020816]
  └── flex flex-col gap-3
        ├── TopNav
        └── flex-1 min-h-0 flex flex-col gap-3 md:flex-row
              ├── Sidebar
              └── main  p-3 border border-white/10 rounded-lg bg-background-surface
```

---

## Border Radius

| Level | Value | Usage |
|---|---|---|
| `rounded-lg` | `0.5rem` | Default cards, buttons, inputs |
| `rounded-xl` | `0.75rem` | Icon boxes, chips |
| `rounded-2xl` | `1rem` | Feature cards, larger cards |
| `rounded-3xl` | `1.5rem` | CTA container, large panels |
| `rounded-full` | `9999px` | Badges, pills, toggle buttons, avatar |
| shadcn `--radius` | `0.625rem` | Base for UI components |

---

## Utility Classes (globals.css)

### Glass Effects

```css
.glass          /* rgba(255,255,255,0.025) + blur(12px) + border-default */
.glass-amber    /* primary-soft bg + blur(12px) + primary-border */
```

### Buttons

```css
.btn-primary    /* gradient-primary bg, dark text, hover: translateY(-2px) + glow shadow */
.btn-outline    /* transparent + primary-border, hover: primary-soft bg */
.btn-secondary  /* rgba(255,255,255,0.05) bg, hover: slightly lighter */
```

### Cards

```css
.card           /* gradient(bg-surface → bg-surface-alt), border-subtle, rounded-2xl */
                /* hover: border-primary, shadow, translateY(-2px) */
```

### Text Gradients

```css
.gradient-amber  /* amber gradient clipped to text */
.gradient-cyan   /* cyan-to-indigo gradient clipped to text */
```

### Divider

```css
.section-divider  /* 1px height, gradient: transparent → primary-border → transparent */
```

### Stats

```css
.stat-value  /* font-display, font-800, text-primary */
.stat-label  /* text-xs, text-muted, uppercase, tracking-widest */
```

---

## Animations

| Name | Definition | Duration | Usage |
|---|---|---|---|
| `ping2` | scale 0.8→2.5, opacity 0.8→0 | 2s ease-out infinite | Pulse rings behind icons |
| `blink` | opacity 1→0→1 (step-end) | 1s infinite | Cursor blink |
| `float` | translateY 0→-10px→0 | 6s ease-in-out infinite | Floating decorative elements |
| `spin-slow` | full rotation | 8s linear infinite | Slow spin accents |

Framer Motion is used for entrance animations on page sections (staggered opacity + translateY).

---

## Component Patterns

### Badge / Pill

```
glass-amber rounded-full px-4 py-1.5
font-mono text-[10px] tracking-widest uppercase text-amber-400
```

### Section Header Block

```
text-center mb-20
  └── pill badge (mb-8)
  └── heading (text-4xl–7xl, font-display)
  └── description (text-lg text-slate-400, max-w-2xl mx-auto)
```

### Feature Card

```
rounded-2xl p-6, card styles
  └── icon box: inline-flex p-2.5 rounded-xl mb-5
  └── tag: font-mono text-[10px] mb-3
  └── title: font-display font-bold text-lg mb-3
  └── description: text-sm text-slate-500
```

### Step / Timeline Card

```
rounded-2xl border p-6 md:p-8
  └── number: h-12 w-12 rounded-full border-2 font-mono text-lg
  └── title: text-2xl font-bold
  └── description: text-[15px] leading-relaxed
  └── detail badge: rounded-full border px-4 py-1.5
```

### Nav Bar

```
max-w-7xl mx-auto px-6 flex items-center justify-between
  ├── logo
  ├── links: gap-8, text-sm text-slate-400 hover:text-amber-400
  └── CTA: text-sm px-5 py-2.5 rounded-lg
```
