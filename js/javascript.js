document.addEventListener('DOMContentLoaded', function () {

    // ── Referencias ──────────────────────────────
    const scene      = document.getElementById('scene');
    const enterBtn   = document.getElementById('enterBtn');
    const closeBtn   = document.getElementById('closeBtn');
    const music      = document.getElementById('bgMusic');
    const musicBtn   = document.getElementById('musicToggle');
    const musicOn    = document.getElementById('musicIconOn');
    const musicOff   = document.getElementById('musicIconOff');

    // ── URL Params ───────────────────────────────
    const params  = new URLSearchParams(window.location.search);
    const nombre  = params.get('n');
    const pases   = params.get('p');
    const elNombre = document.getElementById('invitadoNombre');
    const elPases  = document.getElementById('numPases');

    if (nombre && elNombre) elNombre.innerText = nombre.replace(/_/g, ' ').toUpperCase();
    if (elPases) elPases.innerText = pases || '1';

    // ── Abrir invitación ─────────────────────────
    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            // Confeti temático
            confetti({ particleCount: 120, spread: 65, origin: { y: 0.65 },
                colors: ['#a8d8f0', '#d6eefa', '#eef7fd', '#ffffff', '#5b9fc4', '#7aafd4'] });

            setTimeout(() => {
                scene.classList.add('is-open');
                document.body.style.overflowY = 'auto';

                // Intentar música
                if (music && music.paused) {
                    music.volume = 0.4;
                    music.play().catch(() => {});
                    musicBtn.classList.add('visible');
                }
            }, 250);
        });
    }

    // ── Cerrar ───────────────────────────────────
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            scene.classList.remove('is-open');
            document.body.style.overflowY = 'hidden';
            if (music) music.pause();
            setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 800);
        });
    }

    // ── Control de música ────────────────────────
    let playing = false;
    if (musicBtn && music) {
        musicBtn.addEventListener('click', () => {
            if (music.paused) {
                music.play();
                playing = true;
            } else {
                music.pause();
                playing = false;
            }
            musicOn.style.display  = music.paused ? 'none' : 'block';
            musicOff.style.display = music.paused ? 'block' : 'none';
        });
    }

    // ── Visibilidad de página ────────────────────
    document.addEventListener('visibilitychange', () => {
        if (!music) return;
        if (document.hidden) { music.pause(); }
        else if (scene.classList.contains('is-open') && playing) { music.play().catch(() => {}); }
    });

    // ── Acordeón ─────────────────────────────────
    document.querySelectorAll('.acc-header').forEach(header => {
        header.addEventListener('click', () => {
            const isOpen = header.getAttribute('aria-expanded') === 'true';
            // Cerrar todos
            document.querySelectorAll('.acc-header').forEach(h => {
                h.setAttribute('aria-expanded', 'false');
                h.nextElementSibling.classList.remove('is-open');
            });
            // Abrir el tocado (o dejar cerrado si ya estaba abierto)
            if (!isOpen) {
                header.setAttribute('aria-expanded', 'true');
                header.nextElementSibling.classList.add('is-open');
            }
        });
    });

    // ── Reloj ─────────────────────────────────────
    iniciarReloj();

    // ── Partículas ───────────────────────────────
    initParticles();
});


/* ══════════════════════════════
   CUENTA REGRESIVA
══════════════════════════════ */
function iniciarReloj() {
    const target  = new Date('2026-12-19T12:00:00').getTime();
    const display = document.getElementById('mainCountdown');
    const daysBox = document.getElementById('daysBox');
    if (!display) return;

    function render() {
        const diff = target - Date.now();
        if (diff <= 0) {
            display.innerHTML = "<div class='finish-msg'>¡Es hoy el gran día!</div>";
            if (daysBox) daysBox.innerText = '0 DÍAS';
            return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        if (daysBox) daysBox.innerText = `${d} DÍAS`;

        display.innerHTML = `
            ${unit(d,'Días')}${unit(h,'Hrs')}${unit(m,'Min')}${unit(s,'Seg')}`;
    }
    function unit(n, l) {
        return `<div class="c-unit"><span class="c-num">${n}</span><span class="c-lbl">${l}</span></div>`;
    }
    render();
    setInterval(render, 1000);
}


/* ══════════════════════════════
   PARTÍCULAS (CANVAS)
══════════════════════════════ */
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = canvas.width  = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    });

    const GOLD = ['#a8d8f0', '#d6eefa', '#eef7fd', '#5b9fc4', '#ffffff', '#7aafd4'];
    const count = Math.min(80, Math.floor(W * H / 18000));

    const particles = Array.from({ length: count }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.2 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(Math.random() * 0.3 + 0.05),
        color: GOLD[Math.floor(Math.random() * GOLD.length)],
        alpha: Math.random() * 0.6 + 0.1,
        blink: Math.random() * Math.PI * 2,
        blinkSpeed: Math.random() * 0.02 + 0.005,
    }));

    function draw() {
        ctx.clearRect(0, 0, W, H);
        particles.forEach(p => {
            p.blink += p.blinkSpeed;
            const a = p.alpha * (0.5 + 0.5 * Math.sin(p.blink));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = a;
            ctx.fill();

            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
            if (p.x < -5) p.x = W + 5;
            if (p.x > W + 5) p.x = -5;
        });
        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }
    draw();
}
