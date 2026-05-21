// ============================================================
// CUSTOM CURSOR
// Dot snaps to exact mouse position. Ring lerps toward dot
// each frame — the lag (factor 0.1) gives a weighted,
// physical feel. Lower = more lag, higher = snappier.
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

// Expand ring on interactive elements
document.querySelectorAll(".slice, a, .logo").forEach((el) => {
  el.addEventListener("mouseenter", () => ring.classList.add("expanded"));
  el.addEventListener("mouseleave", () => ring.classList.remove("expanded"));
});

// ============================================================
// TICK BAR GENERATION
// 42 ticks at varying heights evoke a waveform/film strip.
// Generated in JS so count is easy to adjust.
// ============================================================
const tickBar = document.getElementById("tickBar");
for (let i = 0; i < 42; i++) {
  const t = document.createElement("div");
  t.className = "tick";
  tickBar.appendChild(t);
}

// ============================================================
// EDGE-DRAG PAN
// When mouse is in the outer 15% of the viewport width, the
// strip slowly translates so slices beyond the visible area
// can be reached. Lerp keeps the motion smooth and inertial.
// Constraint: strip can't slide so far that it exposes void.
// ============================================================
const slices = document.getElementById("slices");
let stripX = 0;
let targetX = 0;

document.addEventListener("mousemove", (e) => {
  const vw = window.innerWidth;
  const ratio = e.clientX / vw;
  const zone = 0.15;
  const maxPan = 160;

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

// ============================================================
// IMAGE PRELOAD
// Pulls each slice's background-image URL and preloads it
// before first hover, preventing a flash-of-no-image during
// the expand transition.
// ============================================================
document.querySelectorAll(".slice").forEach((slice) => {
  const bg = slice.style.backgroundImage;
  const match = bg.match(/url\(['"]?([^'")\s]+)['"]?\)/);
  if (match) {
    const img = new Image();
    img.src = match[1];
  }
});
