(function(){
  const DEFAULT_OPTIONS = {
    gridSize: 18,
    mobileBreakpoint: 900,
    speed: 0.012
  };

  function initMeshCanvas(canvasId, options = {}){
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const settings = { ...DEFAULT_OPTIONS, ...options };
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const disableOnMobile = window.matchMedia(`(max-width: ${settings.mobileBreakpoint}px)`);

    let cols = 0;
    let rows = 0;
    let time = 0;
    let rafId = null;
    let needsResize = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      cols = Math.ceil(rect.width / settings.gridSize) + 2;
      rows = Math.ceil(rect.height / settings.gridSize) + 2;
      needsResize = false;
    };

    const complexNoise = (x, y, t) => {
      let n = 0;
      n += Math.sin(x * 0.12 + t * 0.35) * Math.cos(y * 0.17 - t * 0.42) * 10;
      n += Math.sin(x * 0.2 + y * 0.15 + t * 0.5) * 6;
      n += Math.cos(x * 0.28 - y * 0.19 + t * 0.85) * 5;
      n += Math.sin((x + y) * 0.07 + t * 1.1) * 8;
      n += Math.sin(x * 0.4 + Math.cos(y * 0.35 + t)) * 3;
      return n;
    };

    const get3DPoint = (col, row, t) => {
      const x = col * settings.gridSize - settings.gridSize;
      const y = row * settings.gridSize - settings.gridSize;

      const displacement = complexNoise(col, row, t);
      const angle = Math.atan2(row - rows / 2, col - cols / 2);
      const radius = Math.hypot(col - cols / 2, row - rows / 2);
      const spiral = Math.sin(angle * 2.6 + radius * 0.18 - t * 1.8) * 4;
      const pulse = Math.sin(t * 2.7 + col * 0.25) * Math.cos(t * 2.1 + row * 0.2) * 6;
      const depth1 = Math.sin(col * 0.18 + t) * Math.cos(row * 0.2 + t * 0.6) * 28;
      const depth2 = Math.sin(radius * 0.09 + t * 1.3) * 12;
      const depth = depth1 + depth2;

      return {
        x: x + displacement + spiral,
        y: y + displacement + pulse,
        z: depth,
        energy: Math.abs(Math.sin(col * 0.25 + row * 0.18 + t * 1.6))
      };
    };

    const shouldAnimate = () => !document.hidden && !prefersReducedMotion.matches && !disableOnMobile.matches;

    const drawFrame = () => {
      if (needsResize) resize();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += settings.speed;

      const points = Array.from({ length: rows }, (_, row) => (
        Array.from({ length: cols }, (_, col) => get3DPoint(col, row, time))
      ));

      for (let row = 0; row < rows; row += 1) {
        ctx.beginPath();
        for (let col = 0; col < cols; col += 1) {
          const p = points[row][col];
          const depthFactor = (p.z + 35) / 70;
          ctx.strokeStyle = `rgba(86, 86, 86, ${0.15 + depthFactor * 0.45})`;
          ctx.lineWidth = 0.25 + depthFactor * 0.35;
          if (col === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      const halfHeight = canvas.height / 2;
      for (let col = 0; col < cols; col += 2) {
        ctx.beginPath();
        for (let row = 0; row < rows; row += 1) {
          const p = points[row][col];
          const depthFactor = (p.z + 35) / 70;
          ctx.strokeStyle = `rgba(86, 86, 86, ${0.12 + depthFactor * 0.35})`;
          ctx.lineWidth = 0.25 + depthFactor * 0.3;
          const yPos = (row === rows - 1) ? halfHeight - 1 : p.y;
          if (row === 0) ctx.moveTo(p.x, yPos);
          else ctx.lineTo(p.x, yPos);
        }
        ctx.stroke();
      }

      ctx.lineWidth = 0.18;
      for (let row = 0; row < rows - 1; row += 2) {
        for (let col = 0; col < cols - 1; col += 2) {
          const p1 = points[row][col];
          const p2 = points[row + 1][col + 1];
          if (Math.abs(p1.z - p2.z) > 12) {
            const avgDepth = (p1.z + p2.z) / 2;
            const depthFactor = (avgDepth + 35) / 70;
            ctx.strokeStyle = `rgba(70, 70, 70, ${0.08 + depthFactor * 0.25})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          if ((row + col) % 2 !== 0) continue;
          const p = points[row][col];
          const depthFactor = (p.z + 35) / 70;
          const energyBoost = p.energy > 0.65 ? p.energy * 0.35 : 0;
          const dotSize = 0.9 + depthFactor * 1.2 + energyBoost;
          const gradient = ctx.createRadialGradient(
            p.x - dotSize * 0.3, p.y - dotSize * 0.3, 0,
            p.x, p.y, dotSize
          );
          gradient.addColorStop(0, `rgba(42, 42, 42, ${0.55 + depthFactor * 0.3})`);
          gradient.addColorStop(0.7, `rgba(66, 66, 66, ${0.45 + depthFactor * 0.25})`);
          gradient.addColorStop(1, `rgba(90, 90, 90, ${0.2 + depthFactor * 0.3})`);
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const stopAnimation = (clear = false) => {
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (clear) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const animate = () => {
      if (!shouldAnimate()) {
        stopAnimation(true);
        return;
      }
      drawFrame();
      rafId = requestAnimationFrame(animate);
    };

    const evaluate = () => {
      if (shouldAnimate()) {
        if (!rafId) animate();
      } else {
        stopAnimation(true);
      }
    };

    resize();
    evaluate();

    window.addEventListener('resize', () => { needsResize = true; evaluate(); });
    document.addEventListener('visibilitychange', evaluate);
    prefersReducedMotion.addEventListener('change', evaluate);
    disableOnMobile.addEventListener('change', evaluate);
  }

  window.initMeshCanvas = initMeshCanvas;
})();
