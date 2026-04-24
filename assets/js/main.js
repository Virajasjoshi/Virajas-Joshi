/* ═══════════════════════════════════════════════════════
   main.js — Virajas Joshi Portfolio
═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────
   LAYER 1: PCB CIRCUIT TRACES BACKGROUND
───────────────────────────────────────────────────── */
(function () {
  const cv  = document.getElementById('bg-pcb');
  const ctx = cv.getContext('2d');
  let W, H;
  let vias = [], traces = [], components = [];

  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    init();
  }

  function init() {
    vias = []; traces = []; components = [];

    const gx = Math.ceil(W / 80);
    const gy = Math.ceil(H / 80);

    for (let i = 0; i <= gx; i++) {
      for (let j = 0; j <= gy; j++) {
        if (Math.random() < 0.35) {
          vias.push({
            x: i * 80 + Math.random() * 20 - 10,
            y: j * 80 + Math.random() * 20 - 10,
          });
        }
      }
    }

    for (let i = 0; i < vias.length; i++) {
      for (let j = i + 1; j < vias.length; j++) {
        const dx   = vias[j].x - vias[i].x;
        const dy   = vias[j].y - vias[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120 && Math.random() < 0.4) {
          traces.push({
            ax: vias[i].x, ay: vias[i].y,
            bx: vias[j].x, by: vias[j].y,
            t: 0,
            speed:     0.0015 + Math.random() * 0.003,
            alpha:     0.12   + Math.random() * 0.18,
            color:     Math.random() < 0.7 ? '#00d4ff' : '#a678d9',
            manhattan: Math.random() < 0.7,
          });
        }
      }
    }

    for (let i = 0; i < 18; i++) {
      components.push({
        x:    Math.random() * W,
        y:    Math.random() * H,
        w:    30 + Math.random() * 40,
        h:    20 + Math.random() * 25,
        alpha: 0.06 + Math.random() * 0.09,
        pins: Math.floor(3 + Math.random() * 5),
      });
    }
  }

  function drawGrid() {
    ctx.strokeStyle = 'rgba(0,212,255,0.025)';
    ctx.lineWidth   = 0.5;
    for (let x = 0; x < W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += 80) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function drawComponents() {
    components.forEach(c => {
      ctx.strokeStyle = `rgba(0,212,255,${c.alpha})`;
      ctx.lineWidth   = 0.7;
      ctx.strokeRect(c.x - c.w / 2, c.y - c.h / 2, c.w, c.h);

      for (let i = 0; i < c.pins; i++) {
        const py = c.y - c.h / 2 + ((i + 1) / (c.pins + 1)) * c.h;
        ctx.beginPath(); ctx.moveTo(c.x - c.w / 2, py); ctx.lineTo(c.x - c.w / 2 - 8, py); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(c.x + c.w / 2, py); ctx.lineTo(c.x + c.w / 2 + 8, py); ctx.stroke();
      }
    });
  }

  function drawVias() {
    vias.forEach(v => {
      ctx.beginPath(); ctx.arc(v.x, v.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,212,255,0.25)'; ctx.fill();

      ctx.beginPath(); ctx.arc(v.x, v.y, 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,212,255,0.08)'; ctx.lineWidth = 0.7; ctx.stroke();
    });
  }

  function drawTraces() {
    traces.forEach(t => {
      const ex = t.ax + (t.bx - t.ax) * t.t;
      const ey = t.ay + (t.by - t.ay) * t.t;

      ctx.beginPath();
      if (t.manhattan) {
        ctx.moveTo(t.ax, t.ay); ctx.lineTo(t.ax, ey); ctx.lineTo(ex, ey);
      } else {
        ctx.moveTo(t.ax, t.ay); ctx.lineTo(ex, t.ay); ctx.lineTo(ex, ey);
      }

      ctx.strokeStyle = t.color === '#00d4ff'
        ? `rgba(0,212,255,${t.alpha * t.t})`
        : `rgba(166,120,217,${t.alpha * t.t})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      if (t.t > 0 && t.t < 1) {
        ctx.beginPath(); ctx.arc(ex, ey, 2, 0, Math.PI * 2);
        ctx.fillStyle = t.color === '#00d4ff' ? 'rgba(0,212,255,0.7)' : 'rgba(166,120,217,0.7)';
        ctx.fill();
      }

      t.t += t.speed;
      if (t.t > 1.2) t.t = 0;
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawComponents();
    drawVias();
    drawTraces();
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}());

/* ─────────────────────────────────────────────────────
   LAYER 2: CODE RAIN (Matrix-style)
───────────────────────────────────────────────────── */
(function () {
  const cv  = document.getElementById('bg-code');
  const ctx = cv.getContext('2d');
  let W, H, streams = [];

  const FS = 14;
  const CW = 16;

  const POOL = [
    '0','1','0','1','0','1',
    'A','B','C','D','E','F',
    '{','}','(',')',';','[',']',
    '*','&','<','>','=','!','|','^',
    '#','_','+','-','/','~','?',
    'i','n','t','v','o','d','r','e',
    'u','l','p','m','x','s','f','c',
    '0','x','F','f','0','0',
  ];

  const TOKENS = [
    'void','int','u8','u16','u32','rx','tx','if','fn',
    'SPI','I2C','CAN','BLE','HAL','DMA','ISR','ADC',
    'MCU','PWM','IRQ','RTO','BMS','OTA','NUL','EOF',
    '0xFF','0x00','0xAB','0x1A','NULL','true','HIGH',
  ];

  function rc() { return POOL[Math.floor(Math.random() * POOL.length)]; }

  function Stream(initial) {
    this.reset = function () {
      this.x    = Math.floor(Math.random() * (W / CW)) * CW;
      this.y    = initial ? Math.random() * H : -FS * 2;
      this.len  = 12 + Math.floor(Math.random() * 22);
      this.spd  = 0.6 + Math.random() * 1.6;
      this.chars = Array.from({ length: this.len }, rc);
      this.head  = Math.random() < 0.2 ? TOKENS[Math.floor(Math.random() * TOKENS.length)] : null;
      this.cyan  = Math.random() < 0.78;
      this.tick  = 0;
      this.mut   = 4 + Math.floor(Math.random() * 10);
    };

    this.reset();

    this.update = function () {
      this.y += this.spd;
      if (++this.tick >= this.mut) {
        this.tick = 0;
        this.chars[Math.floor(Math.random() * this.len)] = rc();
      }
    };

    this.draw = function () {
      ctx.textBaseline = 'top';
      for (let i = 0; i < this.len; i++) {
        const cy   = this.y - i * FS;
        if (cy < -FS || cy > H) continue;
        const fade = 1 - i / this.len;
        let col, alpha;

        if (i === 0) {
          col   = this.cyan ? '200,245,255' : '235,210,255';
          alpha = 0.92;
          ctx.font = `bold ${FS}px "Share Tech Mono"`;
        } else if (i < 3) {
          col   = this.cyan ? '0,212,255' : '166,120,217';
          alpha = fade * 0.85;
          ctx.font = `${FS}px "Share Tech Mono"`;
        } else if (i < 8) {
          col   = this.cyan ? '0,180,220' : '130,90,200';
          alpha = fade * 0.55;
          ctx.font = `${FS}px "Share Tech Mono"`;
        } else {
          col   = this.cyan ? '0,140,180' : '100,65,170';
          alpha = fade * 0.28;
          ctx.font = `${FS}px "Share Tech Mono"`;
        }

        ctx.fillStyle = `rgba(${col},${alpha})`;
        const ch = (i === 0 && this.head) ? this.head[0] : this.chars[i];
        ctx.fillText(ch, this.x, cy);
      }
    };

    this.done = function () { return this.y - this.len * FS > H; };
  }

  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    const n = Math.floor(W / CW * 0.42);
    streams = Array.from({ length: n }, () => new Stream(true));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    streams.forEach(s => {
      s.update(); s.draw();
      if (s.done()) s.reset();
    });
    if (Math.random() < 0.04 && streams.length < Math.floor(W / CW * 0.6)) {
      streams.push(new Stream(false));
    }
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);
  draw();
}());

/* ─────────────────────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.07 });

document.querySelectorAll(
  '.reveal,.card,.ach-card,.act-card,.int-card,.svc-card,.proj-card,.exp-card,.t-card,.cert-card'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

/* ─────────────────────────────────────────────────────
   SKILL BARS
───────────────────────────────────────────────────── */
const barObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.sbar-fill').forEach(b => {
        b.style.width = b.dataset.width + '%';
      });
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('#skill-bars-section').forEach(s => barObserver.observe(s));

/* ─────────────────────────────────────────────────────
   ACTIVE NAV HIGHLIGHT
───────────────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  let current = '';
  document.querySelectorAll('section[id], div[id]').forEach(s => {
    if (window.scrollY >= s.offsetTop - 130) current = s.id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
});

/* ─────────────────────────────────────────────────────
   MOBILE MENU
───────────────────────────────────────────────────── */
function toggleMenu() { document.getElementById('mobileMenu').classList.toggle('open'); }
function closeMenu()  { document.getElementById('mobileMenu').classList.remove('open'); }

/* ─────────────────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────────────────── */
function handleFormSubmit(e) {
  e.preventDefault();
  const f         = e.target;
  const firstName = f.firstName.value.trim();
  const lastName  = f.lastName.value.trim();
  const email     = f.email.value.trim();
  const subject   = f.subject.value.trim() || 'Portfolio Contact';
  const message   = f.message.value.trim();
  const body      = `Name: ${firstName} ${lastName}%0AEmail: ${email}%0A%0A${encodeURIComponent(message)}`;

  window.location.href = `mailto:joshivirajas@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

  const status = document.getElementById('formStatus');
  status.textContent  = '// Opening your email client...';
  status.style.display = 'block';
  setTimeout(() => { status.style.display = 'none'; }, 4000);
}

/* ─────────────────────────────────────────────────────
   STAGGER ANIMATION DELAYS
───────────────────────────────────────────────────── */
document.querySelectorAll('.grid-3 .proj-card, .grid-3 .svc-card, .grid-2 .int-card').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.07) + 's';
});
