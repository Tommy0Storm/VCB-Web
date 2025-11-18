// Emergency mobile fix script - run this if mobile is still broken
(function() {
  'use strict';
  
  console.log('🔧 VCB Mobile Emergency Fix Script');
  
  // Force mobile viewport
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no');
  }
  
  // Force body styles
  document.body.style.overflowX = 'hidden';
  document.body.style.width = '100%';
  document.body.style.maxWidth = '100vw';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  
  // Fix common layout issues
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    console.log('📱 Applying mobile fixes...');
    
    // Fix wrap containers
    const wraps = document.querySelectorAll('.wrap');
    wraps.forEach(wrap => {
      wrap.style.padding = '0 16px';
      wrap.style.maxWidth = '100%';
      wrap.style.overflow = 'hidden';
    });
    
    // Fix navigation
    const nav = document.querySelector('.nav');
    if (nav) {
      nav.style.flexDirection = 'column';
      nav.style.alignItems = 'center';
      nav.style.padding = '12px 0';
    }
    
    const navLinks = document.querySelectorAll('.nav nav');
    navLinks.forEach(navLink => {
      navLink.style.width = '100%';
      navLink.style.justifyContent = 'center';
      navLink.style.flexWrap = 'wrap';
      navLink.style.gap = '8px';
    });
    
    // Fix grids
    const grids = document.querySelectorAll('.grid-2, .grid-3, .grid-4');
    grids.forEach(grid => {
      grid.style.gridTemplateColumns = '1fr';
      grid.style.gap = '16px';
    });
    
    // Fix cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.style.padding = '20px';
      card.style.margin = '0 0 16px 0';
    });
    
    // Fix stats
    const stats = document.querySelector('.stats');
    if (stats) {
      stats.style.gridTemplateColumns = window.innerWidth <= 480 ? '1fr' : '1fr 1fr';
      stats.style.gap = '12px';
    }
    
    // Fix hero
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.style.padding = '60px 0 40px';
      hero.style.textAlign = 'center';
    }
    
    // Fix brand logo
    const brandImg = document.querySelector('.brand img');
    if (brandImg) {
      brandImg.style.height = window.innerWidth <= 480 ? '80px' : '100px';
      brandImg.style.width = 'auto';
    }
    
    console.log('✅ Mobile fixes applied');
  }
  
  // Add resize handler
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
      // Re-apply mobile fixes on resize
      setTimeout(() => {
        const event = new Event('mobileFixResize');
        document.dispatchEvent(event);
      }, 100);
    }
  });
  
})();

// Auto-run on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Mobile fix script loaded');
  });
} else {
  console.log('🚀 Mobile fix script loaded');
}