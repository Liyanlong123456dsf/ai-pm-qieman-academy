// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ===== PROGRESS BAR =====
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress = (scrollTop / scrollHeight) * 100;
  progressBar.style.width = progress + '%';
}, { passive: true });

// ===== BACK TO TOP =====
const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 600) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}, { passive: true });
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== TAB SWITCHING =====
document.querySelectorAll('.tab-container').forEach(container => {
  const btns = container.querySelectorAll('.tab-btn');
  const panels = container.querySelectorAll('.tab-panel');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = container.querySelector('#' + btn.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });
});

// ===== PIPELINE NODE HOVER HIGHLIGHT =====
document.querySelectorAll('.pipe-node').forEach(node => {
  node.addEventListener('mouseenter', () => {
    node.style.borderColor = '#0071e3';
  });
  node.addEventListener('mouseleave', () => {
    node.style.borderColor = '';
  });
});

// ===== SCROLL ANIMATIONS =====
const animateEls = document.querySelectorAll(
  '.diff-card, .strat-card, .flow-step, .why-card, .p-step, .scene-card, ' +
  '.pain-card, .mc-card, .ss-card, .train-card, .app-card, .mm-step, .h-step, .explain-block, ' +
  '.tech-detail, .scene-detail, .instruct-card, .tp-card, .app-card-detail, .tldr-box, .cot-s, .five-item, .ts, ' +
  '.analogy-banner, .pipeline-diagram, .collapse-panel, .tab-container'
);
animateEls.forEach(el => el.classList.add('animate-on-scroll'));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

animateEls.forEach(el => observer.observe(el));

// ===== GALLERY =====
const galleryGrid = document.getElementById('galleryGrid');
for (let i = 1; i <= 31; i++) {
  const img = document.createElement('img');
  img.src = `pages/page_${String(i).padStart(2, '0')}.png`;
  img.alt = `第 ${i} 页`;
  img.className = 'gallery-thumb';
  img.loading = 'lazy';
  galleryGrid.appendChild(img);
}

// ===== LIGHTBOX =====
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbClose = document.getElementById('lbClose');

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('page-img') || e.target.classList.contains('gallery-thumb')) {
    lbImg.src = e.target.src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
});

lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

// ===== STAGGER ANIMATION DELAY =====
document.querySelectorAll('.diff-grid, .strat-grid, .strat-grid-2, .pain-grid, .why-grid, .search-strats, .train-grid, .app-grid, .scene-grid, .modal-compare, .process-steps, .instruct-grid, .five-grid, .cot-steps, .tech-path, .expert-grid, .tech-steps, .app-grid-detail').forEach(grid => {
  Array.from(grid.children).forEach((child, i) => {
    child.style.transitionDelay = `${i * 0.08}s`;
  });
});

// ===== ACTIVE NAV HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');
const navLinksArr = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });
  navLinksArr.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === '#' + current) {
      link.style.color = '#2997ff';
    }
  });
}, { passive: true });
