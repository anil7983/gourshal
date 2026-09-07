// ═══════════════════════════════════════════════════
//  GOURSHAL — SHARED EFFECTS (Particles & Cursor)
// ═══════════════════════════════════════════════════

const Effects = {
  // Initialize particle animation
  initParticles(canvas, particleCount = 60) {
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.5 + 0.1,
        gold: Math.random() > 0.45
      });
    }
    
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(201,168,76,${p.opacity})`
          : `rgba(184,184,200,${p.opacity * 0.5})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    
    animate();
    return { canvas, particles };
  },

  // Initialize cursor glow effect
  initCursorGlow(glowElement) {
    if (!glowElement) return;
    
    function onMouseMove(e) {
      glowElement.style.left = e.clientX + 'px';
      glowElement.style.top = e.clientY + 'px';
    }
    
    document.addEventListener('mousemove', onMouseMove);
    return () => document.removeEventListener('mousemove', onMouseMove);
  }
};

window.Effects = Effects;

// Auto-bind Navbar Mobile Menu across all pages
document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks && !hamburger.dataset.bound) {
    hamburger.dataset.bound = "true";
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }
});