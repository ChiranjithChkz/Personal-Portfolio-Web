/* ══════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════ */
const cur  = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx=0, my=0, rx=0, ry=0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cur.style.left = mx + 'px';
  cur.style.top  = my + 'px';
});
(function animRing(){
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

function addCursorHover(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('mouseenter', () => {
      ring.style.width  = '56px';
      ring.style.height = '56px';
      ring.style.borderColor = 'var(--accent)';
      cur.style.transform = 'translate(-50%,-50%) scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width  = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'var(--primary)';
      cur.style.transform = 'translate(-50%,-50%) scale(1)';
    });
  });
}
addCursorHover('a,button,.skill-pill,.project-card,.place-card,.interest-card,.extra-card,.see-more-btn,.modal-close');

/* ══════════════════════════════════════
   TYPING EFFECT
══════════════════════════════════════ */
const words = ['Web Developer','Competitive Programmer','Problem Solver','Video Editor','Tutor','CS Student'];
let wi=0, ci=0, del=false;
const typEl = document.getElementById('typingEl');
function type(){
  const w = words[wi];
  typEl.textContent = del ? w.substring(0, ci--) : w.substring(0, ci++);
  if(!del && ci > w.length){ setTimeout(()=>{ del=true; type(); }, 1400); return; }
  if(del && ci < 0){ del=false; wi=(wi+1)%words.length; ci=0; }
  setTimeout(type, del ? 55 : 95);
}
type();

/* ══════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting) setTimeout(() => e.target.classList.add('show'), 80);
  });
}, { threshold: 0.08 });
document.querySelectorAll('section.floating').forEach(s => revealObs.observe(s));

/* ══════════════════════════════════════
   NAV + BACK TO TOP
══════════════════════════════════════ */
const mainNav = document.getElementById('mainNav');
const backTop = document.getElementById('back-top');
window.addEventListener('scroll', () => {
  mainNav.classList.toggle('scrolled', window.scrollY > 50);
  backTop.classList.toggle('show', window.scrollY > 400);
});

/* ══════════════════════════════════════
   THEME TOGGLE
══════════════════════════════════════ */
document.getElementById('themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
});

/* ══════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════ */
function handleForm(e){
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.innerHTML = '✓ Sent!';
  btn.style.background = 'linear-gradient(135deg,#00e5c0,#0fa)';
  setTimeout(() => {
    btn.innerHTML = 'Send Message &nbsp;<i class="fas fa-paper-plane"></i>';
    btn.style.background = '';
    e.target.reset();
  }, 2500);
}

/* ══════════════════════════════════════
   SKILL BARS
══════════════════════════════════════ */
document.querySelectorAll('.skill-bar').forEach(bar => {
  bar.style.width = (parseFloat(bar.dataset.w || 0.8) * 100) + '%';
});

/* ══════════════════════════════════════
   SEE MORE / MODAL SYSTEM
   ─────────────────────────────────────
   Rules:
     Places       → show 4, modal for rest
     Interests    → show 4, modal for rest
     Extracurricular → show 6, modal for rest (currently 4 so btn won't show yet)
     Projects     → show 3, modal for rest
══════════════════════════════════════ */

const LIMITS = {
  places:  { grid: '.places-grid',    card: '.place-card',    limit: 4, label: 'All Visited Places'       },
  interests:{ grid: '.interests-grid', card: '.interest-card', limit: 4, label: 'All Interests'            },
  extra:   { grid: '.extra-grid',     card: '.extra-card',    limit: 6, label: 'All Extracurricular Activities' },
  projects:{ grid: '.projects-grid',  card: '.project-card',  limit: 3, label: 'All Projects'              },
};

/* ── Create the single shared modal ── */
const overlay = document.createElement('div');
overlay.className = 'modal-overlay';
overlay.id = 'sharedModal';
overlay.innerHTML = `
  <div class="modal-box" role="dialog" aria-modal="true">
    <div class="modal-header">
      <div class="modal-title">
        <span class="modal-title-dot"></span>
        <span id="modalTitleText"></span>
      </div>
      <button class="modal-close" id="modalCloseBtn" aria-label="Close">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body" id="modalBody"></div>
  </div>
`;
document.body.appendChild(overlay);

const modalTitleText = document.getElementById('modalTitleText');
const modalBody      = document.getElementById('modalBody');
const modalCloseBtn  = document.getElementById('modalCloseBtn');

function openModal(title, gridClass, clonedCards) {
  modalTitleText.textContent = title;
  modalBody.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = gridClass;
  clonedCards.forEach(c => grid.appendChild(c));
  modalBody.appendChild(grid);
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  /* re-apply cursor hover to newly cloned cards */
  addCursorHover('.modal-body .place-card,.modal-body .interest-card,.modal-body .extra-card,.modal-body .project-card');
}

function closeModal() {
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}

modalCloseBtn.addEventListener('click', closeModal);
overlay.addEventListener('click', e => { if(e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeModal(); });

/* ── For each section, hide extras and add See More button ── */
function setupSeeMore(key) {
  const cfg   = LIMITS[key];
  const grids = document.querySelectorAll(cfg.grid);

  grids.forEach(grid => {
    const cards = Array.from(grid.querySelectorAll(cfg.card));
    if(cards.length <= cfg.limit) return; /* nothing to hide */

    /* hide extra cards */
    cards.slice(cfg.limit).forEach(c => c.style.display = 'none');

    /* build See More button */
    const wrap = document.createElement('div');
    wrap.className = 'see-more-wrap';

    const btn = document.createElement('button');
    btn.className = 'see-more-btn';
    const hiddenCount = cards.length - cfg.limit;
    btn.innerHTML = `<i class="fas fa-plus"></i> See ${hiddenCount} more`;

    btn.addEventListener('click', () => {
      /* clone ALL cards (including already-visible ones) for a full view */
      const allClones = cards.map(c => {
        const clone = c.cloneNode(true);
        clone.style.display = ''; /* make sure all are visible */
        return clone;
      });
      openModal(cfg.label, grid.className, allClones);
    });

    wrap.appendChild(btn);
    grid.parentElement.appendChild(wrap);
  });
}

/* initialise for every section */
Object.keys(LIMITS).forEach(key => setupSeeMore(key));