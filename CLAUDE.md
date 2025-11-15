# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**VCB-Web** is a static website for Viable Core Business (VCB), showcasing three core business tracks: Voice Agents, Hardware & Software supply, and Trusted Advisory services, with a focus on Intelligent Compliance for the South African market.

## Architecture

### Page Structure

- **main.html** — Primary landing page with navigation to all other pages
- **aboutus.html** — Company information and team details
- **Compliance.html** — Intelligent Compliance offering (POPIA-first, SA legal focus)
- **LLM-Ent.html** — PRIME sovereign AI platform details
- **Model-Train.html** — Model training and fine-tuning services
- **SalesAgent.html** — Voice agent and sales automation capabilities
- **Lianela-info.html** — Lianela product/service information

All pages link from main.html as the primary navigation hub.

### Design System

**Color Scheme:**
- Navy Blue shades, Black, Silver, and White (as specified in user instructions)
- CSS variables define the palette: `--black`, `--white`, `--g-900` through `--g-100`

**Typography:**
- Font: Quicksand (Google Fonts)
- Body: weight 300 (thin sans)
- Headers: weight 500

**Visual Features:**
- Animated grid background (subtle, repeating linear gradients)
- Glass-morphic sticky navigation with backdrop blur
- Card-based layouts with hover effects
- Responsive design using CSS Grid and clamp() for fluid typography
- Intersection Observer for scroll-reveal animations
- Premium SVG icon system (inline sprite)

### Key Patterns

1. **Sticky Glass Nav** — All pages use `position: sticky` navigation with blur backdrop filter
2. **Hero Sections** — Animated signal/grid backgrounds with gradient overlays
3. **Card Components** — Consistent border radius (14-16px), shadows, and hover transforms
4. **Reveal Animations** — `.reveal` class with IntersectionObserver for scroll-triggered fade-in
5. **Responsive Grids** — Mobile-first with `@media(min-width:900px)` breakpoints
6. **Icon System** — SVG sprite with `<symbol>` definitions and `<use>` references

### Technical Stack

- Pure HTML/CSS/Vanilla JavaScript (no build tools or frameworks)
- Self-contained pages with inline styles and scripts
- External dependencies: Google Fonts (Quicksand), LinkedIn badge script

## Development Guidelines

### Opening/Viewing the Site
Simply open any `.html` file in a browser. Start with `main.html`.

### Editing Styles
Styles are embedded in `<style>` blocks within each HTML file's `<head>`. The design system is consistent across pages using CSS custom properties.

### Adding New Pages
1. Create new `.html` file following existing structure
2. Copy the navigation and footer from `main.html`
3. Maintain color scheme and typography patterns
4. Add link to new page from `main.html` navigation or hero section

### Color Scheme Compliance
Always use the defined navy blue, black, silver, and white palette. Reference existing CSS variables:
```css
--black:#0B0B0B;
--g-900 through --g-100 (grayscale)
--white:#fff;
```

### Accessibility
- Reduced motion support via `@media (prefers-reduced-motion:reduce)`
- Semantic HTML structure
- ARIA labels on decorative elements (`aria-hidden="true"`)

## File Management

- **Do NOT create** unnecessary documentation files
- **Prefer editing** existing HTML files over creating new ones
- All styles are inline — no separate CSS files needed
- No build process or compilation required

## Deployment

**IMPORTANT:** This repository uses **fully automated deployments**. See `DEPLOYMENT.md` for complete details.

### Quick Deployment Workflow
1. Make changes on `claude/**` branch
2. Commit and push: `git push -u origin claude/your-branch-name`
3. Auto-merge workflow merges to `master` automatically
4. Deploy workflow publishes to GitHub Pages
5. Live in ~2-3 minutes at: https://tommy0storm.github.io/VCB-Web/

### Key Points
- ✅ **Always work on `claude/**` branches** - they auto-deploy
- ❌ **Never push directly to `master` from WSL** - proxy gives 403 errors
- ✅ **No manual merging needed** - GitHub Actions handles everything
- 📊 **Monitor deployments:** https://github.com/Tommy0Storm/VCB-Web/actions

See `DEPLOYMENT.md` for troubleshooting and detailed workflow information.

---

## WSL Development Notes

**Environment:** Windows 11 with WSL

### Local Development Server
- Use `python3 -m http.server 8080` (instead of Windows `start python -m http.server`)
- Access via WSL IP: `http://21.0.0.104:8080/index.html` (from Windows browser)
- Or open file directly: `C:\Users\tommy\OneDrive\Dev-Projects\VCB-Web\index.html`

### File Paths
- Project location in WSL: `/home/user/VCB-Web/`
- Windows path: `C:\Users\tommy\OneDrive\Dev-Projects\VCB-Web\`
- Use forward slashes `/` for all paths in WSL
- Files can be edited from both Windows and WSL

### Common Commands
- `ls` instead of `dir`
- `cp` instead of `copy`
- `rm` instead of `del`
- `explorer.exe .` to open current directory in Windows Explorer
