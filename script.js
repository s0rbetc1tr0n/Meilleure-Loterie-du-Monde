'use strict';

const LOTS = [
  {
    emoji: '🎧',
    label: 'Playlist sur mesure',
    color: '#E24B4A',
    text: 'Ressuscitons la playlist "Miel pour les oreilles en l\'honneur de Pascalou" 🎶'
  },
  {
    emoji: '🍿',
    label: 'Film à regarder ensemble',
    color: '#D85A30',
    text: 'Plutôt qu\'une vidéo de Feldup, regardons un film ensemble 🛋️'
  },
  {
    emoji: '🌍',
    label: 'Défi GeoGuessr',
    color: '#1D9E75',
    text: 'Relèveras-tu le défi de la carte spéciale Alsace ? 🗺️'
  },
  {
    emoji: '📦',
    label: 'Colis surprise',
    color: '#7F77DD',
    text: 'Je peux pas en dire plus sinon c\'est plus une surprise... 🤫'
  },
  {
    emoji: '🎨',
    label: 'Défi peinture',
    color: '#D4537E',
    text: 'Le même thème — chacun peint de son côté, et on compare nos versions 🖌️'
  },
  {
    emoji: '🎉',
    label: 'Invitation au Toulouse Game Show',
    color: '#BA7517',
    text: 'Je t\'invite à venir au Toulouse Game Show le 28 & 29 Novembre 2026 🎮'
  }
];

const NB    = LOTS.length;
const SLICE = (2 * Math.PI) / NB;

const wheelCanvas = document.getElementById('wheel-canvas');
const ctx         = wheelCanvas.getContext('2d');
const R           = wheelCanvas.width / 2; // 160

let currentAngle = 0;
let isSpinning   = false;
let hasSpun      = false;

/* ---- Texte multiligne dans un segment ---- */
function getLines(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line    = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/* ---- Dessin de la roue ---- */
function drawWheel(angle) {
  ctx.clearRect(0, 0, wheelCanvas.width, wheelCanvas.height);

  for (let i = 0; i < NB; i++) {
    const start = angle + i * SLICE;
    const end   = start + SLICE;
    const mid   = start + SLICE / 2;

    // Remplissage du segment
    ctx.beginPath();
    ctx.moveTo(R, R);
    ctx.arc(R, R, R, start, end);
    ctx.closePath();
    ctx.fillStyle = LOTS[i].color;
    ctx.fill();

    // Séparateur
    ctx.beginPath();
    ctx.moveTo(R, R);
    ctx.lineTo(R + R * Math.cos(start), R + R * Math.sin(start));
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Texte
    ctx.save();
    ctx.translate(R, R);
    ctx.rotate(mid);

    ctx.font         = 'bold 11px Nunito, sans-serif';
    ctx.fillStyle    = '#ffffff';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur   = 4;

    const maxW  = R * 0.58;
    const lines = getLines(LOTS[i].label, maxW);
    const lineH = 13;
    const startY = -((lines.length - 1) * lineH) / 2;

    lines.forEach((ln, li) => {
      ctx.fillText(ln, R * 0.62, startY + li * lineH);
    });

    ctx.restore();
  }

  // Cercle central blanc
  ctx.beginPath();
  ctx.arc(R, R, 22, 0, 2 * Math.PI);
  ctx.fillStyle   = '#ffffff';
  ctx.shadowBlur  = 0;
  ctx.shadowColor = 'transparent';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(R, R, 22, 0, 2 * Math.PI);
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth   = 2;
  ctx.stroke();
}

document.fonts.ready.then(() => drawWheel(currentAngle));

/* ---- Ouverture des rideaux ---- */
document.getElementById('btn-open').addEventListener('click', () => {
  document.querySelector('.curtain-left').classList.add('open');
  document.querySelector('.curtain-right').classList.add('open');

  setTimeout(() => {
    document.getElementById('curtain-screen').style.display = 'none';
    document.getElementById('wheel-screen').classList.add('visible');
  }, 1300);
});

/* ---- Lancement de la roue ---- */
document.getElementById('btn-spin').addEventListener('click', () => {
  if (isSpinning || hasSpun) return;

  isSpinning = true;
  document.getElementById('btn-spin').disabled = true;

  const extraTurns  = (5 + Math.random() * 5) * 2 * Math.PI;
  const finalExtra  = Math.random() * 2 * Math.PI;
  const totalRot    = extraTurns + finalExtra;
  const duration    = 4000;
  const startAngle  = currentAngle;
  const startTime   = performance.now();

  function ease(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function frame(now) {
    const t = Math.min((now - startTime) / duration, 1);
    currentAngle = startAngle + totalRot * ease(t);
    drawWheel(currentAngle);

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      isSpinning = false;
      hasSpun    = true;
      showResult();
    }
  }

  requestAnimationFrame(frame);
});

/* ---- Calcul du lot gagnant ---- */
function winnerIndex() {
  const pointer    = -Math.PI / 2;
  const normalized = ((pointer - currentAngle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  return Math.floor(normalized / SLICE) % NB;
}

/* ---- Affichage du résultat ---- */
function showResult() {
  const idx  = winnerIndex();
  const lot  = LOTS[idx];
  const card = document.getElementById('result-card');

  card.innerHTML = `
    <span class="result-emoji">${lot.emoji}</span>
    <div class="result-label">${lot.label}</div>
    <div class="result-text">${lot.text}</div>
  `;
  card.style.border    = `2px solid ${lot.color}`;
  card.style.boxShadow = `0 0 32px ${lot.color}55, 0 4px 22px rgba(0,0,0,0.55)`;
  card.classList.remove('hidden');

  launchConfetti(lot.color);
}

/* ---- Confettis ---- */
const cCanvas = document.getElementById('confetti-canvas');
const cCtx    = cCanvas.getContext('2d');

function resizeConfetti() {
  cCanvas.width  = window.innerWidth;
  cCanvas.height = window.innerHeight;
}
resizeConfetti();
window.addEventListener('resize', resizeConfetti);

function launchConfetti(lotColor) {
  const palette = [lotColor, '#FFD700', '#ffffff', '#e74c3c', '#9b59b6', '#2ecc71'];

  const particles = Array.from({ length: 120 }, () => ({
    x:     Math.random() * cCanvas.width,
    y:     -10 - Math.random() * 80,
    vx:    (Math.random() - 0.5) * 4,
    vy:    1.5 + Math.random() * 3,
    w:     6 + Math.random() * 8,
    h:     10 + Math.random() * 6,
    rot:   Math.random() * Math.PI * 2,
    dRot:  (Math.random() - 0.5) * 0.15,
    color: palette[Math.floor(Math.random() * palette.length)]
  }));

  let frame = 0;

  function tick() {
    cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);

    cCtx.globalAlpha = frame < 90 ? 1 : Math.max(0, 1 - (frame - 90) / 60);

    for (const p of particles) {
      p.vy  += 0.06;
      p.x   += p.vx;
      p.y   += p.vy;
      p.rot += p.dRot;

      cCtx.save();
      cCtx.translate(p.x, p.y);
      cCtx.rotate(p.rot);
      cCtx.fillStyle = p.color;
      cCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cCtx.restore();
    }

    frame++;
    if (frame < 150) {
      requestAnimationFrame(tick);
    } else {
      cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
    }
  }

  requestAnimationFrame(tick);
}
