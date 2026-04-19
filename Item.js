(function () {
  const canvas = document.getElementById("hk-canvas");
  const ctx = canvas.getContext("2d");
  const types = [
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
  ];
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);
  class P {
    constructor() {
      this.reset(true);
    }
    reset(init = false) {
      const t = types[Math.floor(Math.random() * types.length)];
      this.t = t;
      this.x = Math.random() * canvas.width;
      this.y = init ? Math.random() * canvas.height : canvas.height + 10;
      this.size =
        t.sizeRange[0] + Math.random() * (t.sizeRange[1] - t.sizeRange[0]);
      this.speed =
        t.speedRange[0] + Math.random() * (t.speedRange[1] - t.speedRange[0]);
      this.wA = (Math.random() - 0.5) * t.wobble;
      this.wF = 0.005 + Math.random() * 0.015;
      this.wP = Math.random() * Math.PI * 2;
      this.drift = (Math.random() - 0.5) * 0.3;
      this.alpha = 0;
      this.tAlpha = 0.3 + Math.random() * 0.55;
      this.life = 0;
      this.maxLife = 200 + Math.random() * 300;
      this.pulse = Math.random() * Math.PI * 2;
      this.pSpeed = 0.02 + Math.random() * 0.04;
      this.fadeIn = true;
      this.fadeOut = false;
    }
    update(f) {
      this.y -= this.speed;
      this.x += this.wA * Math.sin(f * this.wF + this.wP) + this.drift;
      this.pulse += this.pSpeed;
      this.life++;
      if (this.fadeIn) {
        this.alpha = Math.min(this.tAlpha, this.alpha + 0.012);
        if (this.alpha >= this.tAlpha) this.fadeIn = false;
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
      const [cr, cg, cb] = this.t.color,
        [gr, gg, gb] = this.t.glow;
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
  const ps = Array.from({ length: 80 }, () => new P());
  let frame = 0;
  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    for (const p of ps) {
      p.update(frame);
      p.draw();
    }
    requestAnimationFrame(loop);
  })();
})();

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        const el = e.target;
        const delay = el.dataset.delay || 0;
        setTimeout(() => el.classList.add("visible"), delay);
        observer.unobserve(el);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
);

document.querySelectorAll(".items-grid").forEach((grid) => {
  grid.querySelectorAll(".item-card").forEach((card, i) => {
    card.dataset.delay = i * 100;
  });
});

document
  .querySelectorAll(".item-card, .weapon-card, .section-divider")
  .forEach((el) => {
    observer.observe(el);
  });

const tabs = document.querySelectorAll(".tab-btn");

tabs.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabs.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;

    document
      .querySelectorAll(
        ".item-card, .weapon-card, .section-divider, .lore-callout",
      )
      .forEach((el) => {
        const cat = el.dataset.category || el.dataset.category;
        if (filter === "all" || cat === filter) {
          el.classList.remove("hidden");
        } else {
          el.classList.add("hidden");
        }
      });

    document.querySelectorAll(".items-grid").forEach((grid) => {
      const group = grid.dataset.group;
      if (filter !== "all" && group !== filter) {
        grid.classList.add("hidden");
      } else {
        grid.classList.remove("hidden");
      }
    });
  });
});
