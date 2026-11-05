// Scroll reveal + gallery lightbox. No dependencies.
// The `js` class is set inline in <head> so hidden-until-revealed styles apply before first paint.

// --- Reveal on scroll ---
const revealables = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  revealables.forEach((el) => io.observe(el));
} else {
  revealables.forEach((el) => el.classList.add('is-visible'));
}

// --- Project index: image preview follows the cursor (mouse only; hidden on touch via CSS) ---
const preview = document.querySelector('.preview');
if (preview && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let raf = 0;
  let px = 0;
  let py = 0;
  const place = () => {
    preview.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%) scale(1)`;
    raf = 0;
  };
  document.querySelectorAll('.index__row').forEach((row) => {
    row.addEventListener('mouseenter', () => {
      preview.src = row.dataset.preview;
      preview.classList.add('is-on');
    });
    row.addEventListener('mouseleave', () => preview.classList.remove('is-on'));
    row.addEventListener('mousemove', (e) => {
      px = e.clientX + 170;
      py = e.clientY;
      if (!raf) raf = requestAnimationFrame(place);
    });
  });
}

// --- Lightbox: each case is its own group, arrows cycle inside the group ---
const dialog = document.querySelector('.lightbox');
const bigImg = dialog.querySelector('.lightbox__img');
const counter = dialog.querySelector('.lightbox__counter');
let group = [];
let index = 0;
let opener = null;

function show(i) {
  index = (i + group.length) % group.length;
  const img = group[index].querySelector('img');
  bigImg.src = img.currentSrc || img.src;
  bigImg.alt = img.alt;
  counter.textContent = `${index + 1} / ${group.length}`;
}

document.querySelectorAll('.tile').forEach((tile) => {
  tile.addEventListener('click', () => {
    group = [...document.querySelectorAll(`.tile[data-group="${tile.dataset.group}"]`)];
    opener = tile;
    show(group.indexOf(tile));
    dialog.showModal();
  });
});

dialog.querySelector('.lightbox__close').addEventListener('click', () => dialog.close());
dialog.querySelector('.lightbox__prev').addEventListener('click', () => show(index - 1));
dialog.querySelector('.lightbox__next').addEventListener('click', () => show(index + 1));

// Click on the dark backdrop (not on the image or buttons) closes.
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

dialog.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') show(index - 1);
  if (e.key === 'ArrowRight') show(index + 1);
});

// Swipe on touch screens.
let touchX = null;
dialog.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
dialog.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  touchX = null;
});

// Return focus to the tile that opened the lightbox.
dialog.addEventListener('close', () => { if (opener) opener.focus({ preventScroll: true }); });
