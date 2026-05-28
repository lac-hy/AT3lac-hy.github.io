// ============================================================
// CUSTOM CURSOR
// Dot snaps to exact mouse position every frame.
// Ring lerps toward dot at factor 0.1 — creates a weighted
// lag that feels physical and intentional.
// ============================================================
const dot = document.getElementById("cursor-dot");
const ring = document.getElementById("cursor-ring");

let mouse = { x: -100, y: -100 };
let ringPos = { x: -100, y: -100 };

document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  dot.style.left = mouse.x + "px";
  dot.style.top = mouse.y + "px";
});

function lerp(a, b, t) {
  return a + (b - a) * t;
}

(function animateRing() {
  ringPos.x = lerp(ringPos.x, mouse.x, 0.1);
  ringPos.y = lerp(ringPos.y, mouse.y, 0.1);
  ring.style.left = ringPos.x + "px";
  ring.style.top = ringPos.y + "px";
  requestAnimationFrame(animateRing);
})();

function addHoverExpand(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("expanded"));
    el.addEventListener("mouseleave", () => ring.classList.remove("expanded"));
  });
}
addHoverExpand(".slice, a, .logo, .lightbox-close");

// ============================================================
// ABOUT LIGHTBOX
// Toggles .open class to animate opacity + translateY.
// Backdrop blur keeps carousel visible behind panel.
// Closes via button, backdrop click, or Escape key.
// ============================================================
const lightbox = document.getElementById("lightbox");
const lightboxBackdrop = document.getElementById("lightboxBackdrop");
const lightboxClose = document.getElementById("lightboxClose");
const aboutBtn = document.getElementById("aboutBtn");

function openLightbox() {
  lightbox.classList.add("open");
}
function closeLightbox() {
  lightbox.classList.remove("open");
}

aboutBtn.addEventListener("click", (e) => {
  e.preventDefault();
  openLightbox();
});
lightboxClose.addEventListener("click", closeLightbox);
lightboxBackdrop.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeLightbox();
});

// ============================================================
// EDGE-PAN
// When the mouse enters the outer 15% of the viewport on
// either side, the strip slowly translates to reveal slices
// beyond the visible edge. The strip starts at translateX(0)
// which — combined with justify-content:center in CSS — means
// it is already perfectly centred on load with no JS needed.
// Edge-pan offsets from 0 in either direction.
//
// Design choice: using CSS centering (not JS) for the initial
// position means it's correct even before any script runs,
// avoiding a flash-of-misaligned-strip on slow connections.
// ============================================================
const slices = document.getElementById("slices");
let stripX = 0;
let targetX = 0;

document.addEventListener("mousemove", (e) => {
  if (lightbox.classList.contains("open")) return;

  const vw = window.innerWidth;
  const ratio = e.clientX / vw;
  const zone = 0.15;
  const maxPan = 120;

  if (ratio < zone) {
    targetX = ((zone - ratio) / zone) * maxPan;
  } else if (ratio > 1 - zone) {
    targetX = -((ratio - (1 - zone)) / zone) * maxPan;
  } else {
    targetX = 0;
  }
});

(function animateStrip() {
  stripX = lerp(stripX, targetX, 0.06);
  slices.style.transform = `translateX(${stripX}px)`;
  requestAnimationFrame(animateStrip);
})();

window.addEventListener("resize", () => {
  targetX = 0;
});

// Apply custom label colours from data-label-color attribute.
// Uses a CSS custom property on each slice element so the
// ::after pseudo-element can inherit it without JS touching
// the pseudo-element directly (which isn't possible).
document.querySelectorAll(".slice[data-label-color]").forEach((slice) => {
  slice.style.setProperty("--label-color", slice.dataset.labelColor);
});

// ============================================================
// IMAGE PRELOAD
// Preloads background images before first hover to prevent
// a flash-of-no-image during the expand transition.
// ============================================================
document.querySelectorAll(".slice").forEach((slice) => {
  const bg = slice.style.backgroundImage;
  const match = bg.match(/url\(['"]?([^'")\s]+)['"]?\)/);
  if (match) {
    const img = new Image();
    img.src = match[1];
  }
});
