# VCB Color Contrast Audit & Rules

## Last Audit: December 1, 2025

## Issue Fixed
- "Gogga · Coming Soon" button had black text on dark background in light theme
- Light theme CSS was overriding ALL `.text-white` elements, including buttons

## Root Cause
Overly broad CSS selectors like:
```css
body.light-theme section.bg-vcb-900 .text-white { color: #0a0a0a; }
```
This affected buttons inside sections, breaking their contrast.

## Solution Applied
More specific CSS selectors that:
1. Target section headings/descriptions specifically (not buttons)
2. Use `!important` on button text colors to preserve contrast
3. Keep dark button backgrounds (vcb-700, vcb-800) dark even in light theme
4. Explicitly style button SVG icons to match text color

## Button Contrast Matrix

| Button Type | Background | Text | Light Theme BG | Light Theme Text |
|-------------|------------|------|----------------|------------------|
| Primary CTA | bg-white | text-vcb-900 | white | #0a0a0a |
| Secondary CTA | bg-vcb-100 | text-vcb-900 | #f5f5f5 | #0a0a0a |
| Dark Button | bg-vcb-700 | text-white | #2a2a2a | #ffffff |
| Outline Dark | bg-vcb-800 | text-white | #2a2a2a | #ffffff |

## CSS Selectors to AVOID
```css
/* TOO BROAD - affects buttons! */
section.bg-vcb-XXX .text-white { color: black; }
```

## CSS Selectors to USE
```css
/* SPECIFIC - targets content only */
section.bg-vcb-XXX > div > div > h2.text-white { color: black; }

/* EXPLICIT button overrides */
body.light-theme button.bg-vcb-700 { color: #ffffff !important; }
body.light-theme button.bg-vcb-700 svg { color: #ffffff !important; }
```

## Files Affected
- `src/pages/Home/Home.css` - Light theme overrides section
- `tailwind.config.js` - Color palette definition

## Testing Checklist
- [ ] Hero buttons visible in dark theme
- [ ] Hero buttons visible in light theme  
- [ ] Feature card icons visible on dark backgrounds
- [ ] Track card icons visible
- [ ] Footer newsletter button visible
- [ ] CTA section buttons visible
