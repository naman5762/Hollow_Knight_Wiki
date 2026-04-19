function showPage(id) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (id === "page-teamcherry") {
      animateCards();
    }
  }
}

function animateCards() {
  const cards = document.querySelectorAll(".story-card");
  cards.forEach((card) => card.classList.remove("visible"));

  cards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.add("visible");
    }, i * 150);
  });
}

(function () {
  const canvas = document.getElementById("hk-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const CONFIG = {
    count: 80,
    bgDraw: false,
    types: [
      {
        color: [180, 210, 255],
        glow: [120, 160, 255],
        sizeRange: [2, 5],
        speedRange: [0.3, 0.9],
        wobble: 0.6,
      },
      {
        color: [140, 160, 220],
        glow: [80, 110, 200],
        sizeRange: [1, 2.5],
        speedRange: [0.1, 0.4],
        wobble: 0.3,
      },
      {
        color: [200, 180, 255],
        glow: [160, 130, 255],
        sizeRange: [1.5, 3],
        speedRange: [0.2, 0.6],
        wobble: 1.0,
      },
      {
        color: [100, 200, 200],
        glow: [60, 180, 180],
        sizeRange: [2, 4],
        speedRange: [0.15, 0.5],
        wobble: 1.5,
      },
    ],
  };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  class Particle {
    constructor() {
      this.reset(true);
    }
    reset(init = false) {
      const t = CONFIG.types[Math.floor(Math.random() * CONFIG.types.length)];
      this.t = t;
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height : canvas.height + 10;
      this.size =
        t.sizeRange[0] + Math.random() * (t.sizeRange[1] - t.sizeRange[0]);
      this.speed =
        t.speedRange[0] + Math.random() * (t.speedRange[1] - t.speedRange[0]);
      this.wobbleAmp = (Math.random() - 0.5) * t.wobble;
      this.wobbleFreq = 0.005 + Math.random() * 0.015;
      this.wobblePhase = Math.random() * Math.PI * 2;
      this.drift = (Math.random() - 0.5) * 0.3;
      this.alpha = 0;
      this.targetAlpha = 0.3 + Math.random() * 0.55;
      this.life = 0;
      this.maxLife = 200 + Math.random() * 300;
      this.pulse = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.04;
      this.fadeIn = true;
      this.fadeOut = false;
    }
    update(frame) {
      this.y -= this.speed;
      this.x +=
        this.wobbleAmp * Math.sin(frame * this.wobbleFreq + this.wobblePhase) +
        this.drift;
      this.pulse += this.pulseSpeed;
      this.life++;
      if (this.fadeIn) {
        this.alpha = Math.min(this.targetAlpha, this.alpha + 0.012);
        if (this.alpha >= this.targetAlpha) this.fadeIn = false;
      }
      if (this.life > this.maxLife * 0.75) this.fadeOut = true;
      if (this.fadeOut) this.alpha -= 0.008;
      if (
        this.alpha <= 0 ||
        this.y < -20 ||
        this.x < -40 ||
        this.x > canvas.width + 40
      )
        this.reset();
    }
    draw() {
      const r = this.size * (1 + 0.12 * Math.sin(this.pulse));
      const [cr, cg, cb] = this.t.color;
      const [gr, gg, gb] = this.t.glow;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      const g = ctx.createRadialGradient(
        this.x,
        this.y,
        0,
        this.x,
        this.y,
        r * 3.5,
      );
      g.addColorStop(0, `rgba(${cr},${cg},${cb},1)`);
      g.addColorStop(0.35, `rgba(${cr},${cg},${cb},0.6)`);
      g.addColorStop(0.7, `rgba(${gr},${gg},${gb},0.2)`);
      g.addColorStop(1, `rgba(${gr},${gg},${gb},0)`);
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(this.x, this.y, r * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(240,245,255,0.85)`;
      ctx.fill();
      ctx.restore();
    }
  }

  const particles = Array.from({ length: CONFIG.count }, () => new Particle());
  let frame = 0;
  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    for (const p of particles) {
      p.update(frame);
      p.draw();
    }
    requestAnimationFrame(loop);
  })();
})();

(function setupMapZoom() {
  document.addEventListener("DOMContentLoaded", function () {
    const wrapper = document.querySelector(".map-wrapper");
    const img = document.querySelector(".map-img");
    if (!wrapper || !img) return;

    let zoomed = false;

    wrapper.addEventListener("click", () => {
      zoomed = !zoomed;
      if (zoomed) {
        img.style.transform = "scale(1.7)";
        img.style.cursor = "zoom-out";
        wrapper.style.cursor = "zoom-out";
      } else {
        img.style.transform = "scale(1)";
        img.style.cursor = "zoom-in";
        wrapper.style.cursor = "zoom-in";
      }
    });
  });
})();

const mapWrapper = document.querySelector(".map-wrapper");
const mapImg = document.querySelector(".map-img");
let isZoomed = false;

mapWrapper.addEventListener("click", (e) => {
  if (!isZoomed) {
    const rect = mapWrapper.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    mapImg.style.transformOrigin = `${x}% ${y}%`;
    mapImg.style.transform = "scale(2)";
    mapWrapper.style.cursor = "grab";
    isZoomed = true;
  } else {
    mapImg.style.transform = "scale(1)";
    mapImg.style.transformOrigin = "center center";
    mapWrapper.style.cursor = "zoom-in";
    isZoomed = false;
  }
});

mapWrapper.addEventListener("mousemove", (e) => {
  if (!isZoomed) return;

  const rect = mapWrapper.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  mapImg.style.transformOrigin = `${x}% ${y}%`;
});

(function setActiveNav() {
  const navItems = document.querySelectorAll(".navbar");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((n) => (n.style.color = ""));
      item.style.color = "#c8d8ff";
    });
  });
})();
