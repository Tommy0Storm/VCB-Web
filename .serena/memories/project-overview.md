# VCB-Web-clone Project Overview

## Project Description
Viable Core Business (VCB) - AI-powered enterprise solutions website built with React + TypeScript + Vite.

## Tech Stack
- **Framework**: React 19.2.0 + TypeScript
- **Build Tool**: Vite (rolldown-vite 7.2.5)
- **Routing**: react-router-dom 7.9.6
- **Styling**: Tailwind CSS v3 (just installed), vanilla CSS
- **Font**: Quicksand (300-700 weights) via Google Fonts

## Design System - 8-Level Monochrome Palette (LOCKED)
| Level | Hex | Tailwind | Usage | Text Color |
|-------|-----|----------|-------|------------|
| L1 | #0a0a0a | vcb-900 | Header/Hero Background | #ffffff |
| L2 | #1a1a1a | vcb-800 | Card Area/Sections | #ffffff |
| L3 | #f5f5f5 | vcb-100 | Light Cards/Buttons | #0a0a0a |
| L4 | #2a2a2a | vcb-700 | Features Section/Buttons | #ffffff |
| L5 | #3a3a3a | vcb-600 | Feature Card Area | #ffffff |
| L6 | #f0f0f0 | vcb-150 | Feature Card Light | #0a0a0a |
| L7 | #ffffff | white | Pure White Buttons | #0a0a0a |
| L8 | #e0e0e0 | vcb-200 | Light Grey Accent | #0a0a0a |

## Color Contrast Rules (CRITICAL)
1. **Dark backgrounds (vcb-700, vcb-800, vcb-900)** → ALWAYS use `text-white`
2. **Light backgrounds (white, vcb-100, vcb-150, vcb-200)** → ALWAYS use `text-vcb-900`
3. **Buttons with dark bg** → Keep white text in BOTH dark and light themes
4. **Icons inside buttons** → Must inherit or explicitly match button text color
5. **Light theme overrides** → Only change section bg/text, NEVER button text

## Theme Support
- Dark theme: `body.dark-theme` (default)
- Light theme: `body.light-theme`
- Toggle button in header with sun/moon icons

## Key Files
- `src/pages/Home/Home.tsx` - Main homepage with locked level system
- `src/pages/Home/Home.css` - Homepage styles with CSS variables
- `src/index.css` - Global styles, theme support
- `src/App.tsx` - Main app with routing and theme toggle
- `src/components/common/Header/Header.tsx` - Site header

## TEMPLATE Folder
User-provided template they love, uses Tailwind CSS with warm earthy palette.
Components: Navbar, Hero, ProductGrid, About, Features, Footer, Journal

## Current State (Dec 1, 2025)
- ✅ Tailwind CSS v3 installed and configured
- ✅ Homepage rebuilt using TEMPLATE structure
- ✅ BUA-XI content integrated (11 languages, voice/vision AI)
- ✅ Dev server running at http://localhost:5176/

## Homepage Structure (Refined - Dec 1, 2025)
1. **Hero** - Full-screen with animated gradient, trust badges (SOC2, POPIA, E2E), scroll indicator
2. **Features** - 4-card grid: Voice Intelligence, Vision AI, 11 Languages, Call Center Ready
3. **Statistics** - 4 key metrics: 11 Languages, 99.7% Uptime, 50ms Response, 24/7 Support
4. **Tracks** - 3 product cards: Sarah Voice Agent, Agentic AI, LLM Enterprise
5. **About** - Split-screen philosophy blocks (Security First, Platform)
6. **Partners** - Trust logos section (Enterprise, FinTech, LegalTech, TeleCom, Banking)
7. **CallToAction** - "Ready to transform..." with Schedule Demo + Try Free buttons
8. **Footer** - Newsletter, social links, product/company nav, copyright

## Design Refinements Applied
- Animated gradient backgrounds with mesh pattern
- Trust indicators in Hero (SOC2, POPIA, E2E encryption)
- Statistics section with key metrics
- Partners/trust logos section
- Enhanced CTA section before footer
- Social media links in footer
- Smooth hover transitions and lift effects
- Custom scrollbar styling
- Better backdrop blur support

## Sarah AI Chatbot (Dec 1, 2025)
- **Component**: `src/components/SarahChat/SarahChat.tsx`
- **Styles**: `src/components/SarahChat/SarahChat.css`
- **Type**: Floating chatbot widget (bottom-right corner)
- **Features**:
  - Voice input (Web Speech API)
  - Text-to-Speech responses
  - VCB Knowledge Base (company, founder, products, sovereign AI)
  - Email transcript functionality (to user + info@vcb-ai.online)
  - Monochrome styling matching 8-level system
  - Light/dark theme support
- **Knowledge Areas**:
  - About VCB and mission
  - Founder Tommy Storm
  - Products: Sales Agent, Agentic AI, LLM Enterprise
  - Sovereign localized AI for Africa
  - 11 South African languages
  - Security & compliance (SOC2, POPIA)

## Current Task