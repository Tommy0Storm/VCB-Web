// Minimal mobile fix - performance optimized
(function() {
  const isMobile = window.innerWidth <= 768;
  if (!isMobile) return;
  
  // Disable heavy animations
  const particle = document.getElementById('particle-bg');
  const mesh = document.getElementById('mesh-canvas');
  if (particle) particle.style.display = 'none';
  if (mesh) mesh.style.display = 'none';
  
  // Basic mobile fixes only
  document.body.style.overflowX = 'hidden';
})();