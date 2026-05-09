"use strict";

const SPOTIFY_EMBED_HTML = '<iframe data-testid="embed-iframe" style="border-radius:12px" src="https://open.spotify.com/embed/playlist/0Ebty6V4jEvF4kxcMlLcAW?utm_source=generator&theme=0" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';
// Example:
// const SPOTIFY_EMBED_HTML = '<iframe src="https://open.spotify.com/embed/playlist/YOUR_PLAYLIST_ID?utm_source=generator" width="100%" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>';

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hint = document.getElementById("hint");
const dialogue = document.getElementById("dialogue");
const musicPanel = document.getElementById("musicPanel");
const tvPanel = document.getElementById("tvPanel");
const cardPanel = document.getElementById("cardPanel");
const consolePanel = document.getElementById("consolePanel");
const spotifySlot = document.getElementById("spotifySlot");
const cardMessage = document.getElementById("cardMessage");
const tvCarousel = document.getElementById("tvCarousel");
const miniGrid = document.getElementById("miniGrid");
const miniScore = document.getElementById("miniScore");
const miniTime = document.getElementById("miniTime");
const startMiniGameButton = document.getElementById("startMiniGame");

ctx.imageSmoothingEnabled = false;

const TILE = 16;
const W = canvas.width;
const H = canvas.height;
const GREETING_CARD_MESSAGE = "Dear Muthu, wishing you a birthday filled with warmth, laughter, music, cake, and all the tiny moments that make the day feel special.";
const TRAKT_LIST_URL = "https://app.trakt.tv/users/abithav/lists/hbd";
const TV_RECOMMENDATIONS = [
  {
    title: "The Bear",
    kind: "Show",
    rating: "83%",
    year: "2022",
    meta: "Drama, 38 eps.",
    note: "Fast, warm, intense kitchen chaos with a lot of heart.",
    poster: "poster-kitchen",
  },
  {
    title: "Eternal Sunshine of the Spotless Mind",
    kind: "Movie",
    rating: "82%",
    year: "2004",
    meta: "Drama, 1h 48m",
    note: "Dreamy, bittersweet, and perfect for someone who likes stories that linger.",
    poster: "poster-dream",
  },
  {
    title: "The Truman Show",
    kind: "Movie",
    rating: "82%",
    year: "1998",
    meta: "Comedy, 1h 43m",
    note: "A clever classic about reality, freedom, and choosing your own sky.",
    poster: "poster-truman",
  },
  {
    title: "Blue Eye Samurai",
    kind: "Show",
    rating: "86%",
    year: "2023",
    meta: "Action, 8 eps.",
    note: "Stylish, sharp, and full of cinematic revenge energy.",
    poster: "poster-samurai",
  },
  {
    title: "Laapataa Ladies",
    kind: "Movie",
    rating: "81%",
    year: "2024",
    meta: "Comedy, 2h 3m",
    note: "Gentle, funny, and quietly moving.",
    poster: "poster-lost",
  },
  {
    title: "Like Stars on Earth",
    kind: "Movie",
    rating: "82%",
    year: "2007",
    meta: "Drama, 2h 42m",
    note: "Tender, emotional, and full of empathy.",
    poster: "poster-stars",
  },
  {
    title: "The Railway Men",
    kind: "Show",
    rating: "78%",
    year: "2023",
    meta: "Drama, 4 eps.",
    note: "A tense, grounded tribute to courage during disaster.",
    poster: "poster-railway",
  },
  {
    title: "Lemony Snicket's A Series of Unfortunate Events",
    kind: "Movie",
    rating: "70%",
    year: "2004",
    meta: "Adventure, 1h 48m",
    note: "Darkly whimsical, strange, and storybook-fun.",
    poster: "poster-lemony",
  },
  {
    title: "Inkheart",
    kind: "Movie",
    rating: "65%",
    year: "2008",
    meta: "Adventure, 1h 46m",
    note: "A fantasy pick for book magic and old-school adventure.",
    poster: "poster-inkheart",
  },
  {
    title: "Arcane",
    kind: "Show",
    rating: "90%",
    year: "2021",
    meta: "Adventure, 18 eps.",
    note: "Gorgeous animation, big emotions, and excellent character drama.",
    poster: "poster-arcane",
  },
  {
    title: "8 Vasantalu",
    kind: "Movie",
    rating: "63%",
    year: "2025",
    meta: "Drama, 2h 18m",
    note: "A recent drama pick from the birthday watchlist.",
    poster: "poster-vasantalu",
  },
];

const keys = new Set();
const heldTouchKeys = new Set();
const player = {
  x: 112,
  y: 226,
  w: 12,
  h: 15,
  dir: "down",
  step: 0,
  speed: 1.45,
};
let moveTarget = null;
let pendingInteractId = null;

const objects = [
  {
    id: "abitha",
    name: "Abitha",
    x: 151,
    y: 137,
    w: 15,
    h: 21,
    solid: true,
    radius: 24,
    message: '<strong>Abitha</strong><br>"Happy Birthday Muthu"',
  },
  {
    id: "music",
    name: "Music Player",
    x: 179,
    y: 74,
    w: 26,
    h: 18,
    solid: true,
    radius: 24,
    message: '<strong>Music Player</strong><br>The little speaker hums awake.',
    action: openMusicPanel,
  },
  {
    id: "cake",
    name: "Chocolate Cake",
    x: 94,
    y: 138,
    w: 48,
    h: 42,
    solid: true,
    radius: 26,
    message: "<strong>Chocolate Cake</strong><br>A rich birthday cake waits at the center of the room.",
    action: playBirthdayCakeSong,
  },
  {
    id: "tv",
    name: "TV",
    x: 75,
    y: 56,
    w: 88,
    h: 41,
    solid: true,
    radius: 28,
    message: "<strong>TV</strong><br>Movie night is queued up.",
    action: openTvPanel,
  },
  {
    id: "console",
    name: "Mini Console",
    x: 36,
    y: 229,
    w: 35,
    h: 20,
    solid: true,
    radius: 24,
    message: "<strong>Mini Console</strong><br>A tiny arcade challenge blinks on.",
    action: openConsolePanel,
  },
  {
    id: "gift",
    name: "Gift Box",
    x: 171,
    y: 227,
    w: 26,
    h: 24,
    solid: true,
    radius: 24,
    message: "<strong>Gift Box</strong><br>There is a card tucked under the ribbon.",
    action: openCardPanel,
  },
];

const walls = [
  { x: 0, y: 0, w: W, h: 42 },
  { x: 0, y: 0, w: 22, h: H },
  { x: W - 22, y: 0, w: 22, h: H },
  { x: 0, y: H - 24, w: W, h: 24 },
];

const AMBIENT_SONG = {
  chords: [
    [196, 247, 294],
    [220, 262, 330],
    [175, 220, 262],
    [196, 247, 311],
  ],
  bass: [98, 110, 87, 98],
  beat: 0.48,
};

let nearby = null;
let lastInteract = 0;
let audioContext = null;
let noteIndex = 0;
let currentRecommendation = 0;
let ambientTimer = null;
let ambientPlaying = false;
let ambientEnabled = false;
let birthdaySongTimers = [];
let nextStepSoundAt = 0;
let miniActive = false;
let miniSparkle = 0;
let miniGameTimer = null;
let miniTickTimer = null;
let miniScoreValue = 0;
let miniSecondsLeft = 15;

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function playerRect(x = player.x, y = player.y) {
  return { x: x + 2, y: y + 7, w: player.w - 4, h: player.h - 7 };
}

function collides(nextRect) {
  return walls.some((wall) => rectsOverlap(nextRect, wall)) ||
    objects.some((object) => object.solid && rectsOverlap(nextRect, object));
}

function center(entity) {
  return { x: entity.x + entity.w / 2, y: entity.y + entity.h / 2 };
}

function nearestInteractive() {
  const pc = center(player);
  let best = null;
  for (const object of objects) {
    const oc = center(object);
    const distance = Math.hypot(pc.x - oc.x, pc.y - oc.y);
    if (distance <= object.radius && (!best || distance < best.distance)) {
      best = { object, distance };
    }
  }
  return best?.object || null;
}

function objectAtPoint(point) {
  return objects.find((object) =>
    point.x >= object.x - 10 &&
    point.x <= object.x + object.w + 10 &&
    point.y >= object.y - 10 &&
    point.y <= object.y + object.h + 10
  );
}

function clampTarget(point) {
  return {
    x: Math.max(28, Math.min(W - 28, point.x)),
    y: Math.max(48, Math.min(H - 32, point.y)),
  };
}

function setMoveTarget(point, interactId = null) {
  moveTarget = clampTarget(point);
  pendingInteractId = interactId;
  dialogue.hidden = true;
}

function setObjectMoveTarget(object) {
  const objectCenter = center(object);
  const playerCenter = center(player);
  const angle = Math.atan2(playerCenter.y - objectCenter.y, playerCenter.x - objectCenter.x);
  setMoveTarget({
    x: objectCenter.x + Math.cos(angle) * (object.radius - 6),
    y: objectCenter.y + Math.sin(angle) * (object.radius - 6),
  }, object.id);
}

function setDialogue(html) {
  dialogue.innerHTML = html;
  dialogue.hidden = false;
  window.clearTimeout(lastInteract);
  lastInteract = window.setTimeout(() => {
    dialogue.hidden = true;
  }, 3200);
}

function playTone(freq, duration, type = "square", volume = 0.06) {
  ensureAudio();
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(volume, audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + duration + 0.02);
}

function playLofiChord(notes, duration) {
  notes.forEach((freq, index) => {
    window.setTimeout(() => playTone(freq, duration, "sine", 0.028), index * 18);
  });
}

function playLofiHat() {
  ensureAudio();
  const bufferSize = Math.max(1, Math.floor(audioContext.sampleRate * 0.028));
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = audioContext.createBufferSource();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  filter.type = "highpass";
  filter.frequency.value = 1800;
  gain.gain.value = 0.02;
  noise.buffer = buffer;
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(audioContext.destination);
  noise.start();
}

function scheduleAmbientSong() {
  window.clearTimeout(ambientTimer);
  if (!ambientEnabled || !ambientPlaying) return;
  const step = noteIndex % 8;
  const chordIndex = Math.floor(step / 2) % AMBIENT_SONG.chords.length;
  if (step % 2 === 0) {
    playLofiChord(AMBIENT_SONG.chords[chordIndex], AMBIENT_SONG.beat * 1.55);
    playTone(AMBIENT_SONG.bass[chordIndex], AMBIENT_SONG.beat * 0.9, "triangle", 0.026);
  }
  if (step % 2 === 1) {
    playLofiHat();
  }
  noteIndex += 1;
  ambientTimer = window.setTimeout(scheduleAmbientSong, AMBIENT_SONG.beat * 1000);
}

function startAmbientSong() {
  if (!ambientEnabled) {
    ambientEnabled = true;
  }
  if (!musicPanel.hidden) return;
  if (ambientPlaying) return;
  ambientPlaying = true;
  scheduleAmbientSong();
}

function pauseAmbientSong() {
  ambientPlaying = false;
  window.clearTimeout(ambientTimer);
}

function playStepSound() {
  startAmbientSong();
  const now = performance.now();
  if (now < nextStepSoundAt) return;
  nextStepSoundAt = now + 300;
  playTone(95 + Math.random() * 18, 0.045, "triangle", 0.038);
  window.setTimeout(() => playTone(360 + Math.random() * 55, 0.014, "square", 0.026), 18);
}

function playInteractSound() {
  startAmbientSong();
  playTone(660, 0.07, "triangle", 0.045);
  window.setTimeout(() => playTone(880, 0.08, "triangle", 0.045), 55);
}

function closePanels() {
  musicPanel.hidden = true;
  tvPanel.hidden = true;
  cardPanel.hidden = true;
  consolePanel.hidden = true;
}

function interact() {
  const target = nearby || nearestInteractive();
  if (!target) return;
  playInteractSound();
  setDialogue(target.message);
  if (target.action) target.action();
}

function gamePointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * W,
    y: ((event.clientY - rect.top) / rect.height) * H,
  };
}

function openMusicPanel() {
  closePanels();
  pauseAmbientSong();
  musicPanel.hidden = false;
}

function closeMusicPanel() {
  musicPanel.hidden = true;
  startAmbientSong();
}

function openTvPanel() {
  closePanels();
  tvPanel.hidden = false;
}

function openCardPanel() {
  closePanels();
  cardMessage.textContent = GREETING_CARD_MESSAGE;
  cardPanel.hidden = false;
}

function openConsolePanel() {
  closePanels();
  consolePanel.hidden = false;
}

function closeConsolePanel() {
  consolePanel.hidden = true;
  stopMiniGame();
}

function setupSpotifySlot() {
  if (SPOTIFY_EMBED_HTML.trim()) {
    spotifySlot.innerHTML = SPOTIFY_EMBED_HTML;
  }
}

function renderTvRecommendations() {
  const item = TV_RECOMMENDATIONS[currentRecommendation];
  tvCarousel.innerHTML = `
    <article class="recommendation-card">
      <div class="poster ${item.poster}" aria-hidden="true"></div>
      <div class="poster-details">
        <strong class="poster-title">${item.title}</strong>
        <div class="poster-meta">
          <span>${item.kind}</span>
          <span>${item.year}</span>
          <span class="poster-rating">Rating ${item.rating}</span>
        </div>
        <div class="poster-note">${item.meta}. ${item.note}</div>
        <span class="poster-count">${currentRecommendation + 1} / ${TV_RECOMMENDATIONS.length}</span>
      </div>
    </article>
  `;
}

function changeRecommendation(delta) {
  currentRecommendation = (currentRecommendation + delta + TV_RECOMMENDATIONS.length) % TV_RECOMMENDATIONS.length;
  renderTvRecommendations();
}

function ensureAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playBirthdayCakeSong() {
  birthdaySongTimers.forEach((timer) => window.clearTimeout(timer));
  birthdaySongTimers = [];
  const melody = [
    [262, 0.22], [262, 0.18], [294, 0.34], [262, 0.34], [349, 0.34], [330, 0.62],
    [262, 0.22], [262, 0.18], [294, 0.34], [262, 0.34], [392, 0.34], [349, 0.62],
    [262, 0.22], [262, 0.18], [523, 0.34], [440, 0.34], [349, 0.34], [330, 0.34], [294, 0.68],
    [466, 0.22], [466, 0.18], [440, 0.34], [349, 0.34], [392, 0.34], [349, 0.74],
  ];
  let delay = 0;
  for (const [freq, duration] of melody) {
    const timer = window.setTimeout(() => {
      playTone(freq, duration * 0.9, "square", 0.028);
      playTone(freq * 2, duration * 0.7, "triangle", 0.008);
    }, delay * 1000);
    birthdaySongTimers.push(timer);
    delay += duration;
  }
}

function renderMiniGrid() {
  miniGrid.innerHTML = "";
  for (let i = 0; i < 9; i += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mini-cell";
    button.dataset.cell = String(i);
    button.textContent = miniActive && i === miniSparkle ? "*" : "";
    if (miniActive && i === miniSparkle) {
      button.classList.add("is-sparkle");
      button.setAttribute("aria-label", "Catch sparkle");
    } else {
      button.setAttribute("aria-label", "Empty cell");
    }
    miniGrid.appendChild(button);
  }
}

function moveSparkle() {
  miniSparkle = Math.floor(Math.random() * 9);
  renderMiniGrid();
}

function stopMiniGame() {
  miniActive = false;
  window.clearInterval(miniGameTimer);
  window.clearInterval(miniTickTimer);
  startMiniGameButton.textContent = "Start";
  renderMiniGrid();
}

function startMiniGame() {
  miniActive = true;
  miniScoreValue = 0;
  miniSecondsLeft = 15;
  miniScore.textContent = String(miniScoreValue);
  miniTime.textContent = String(miniSecondsLeft);
  startMiniGameButton.textContent = "Restart";
  window.clearInterval(miniGameTimer);
  window.clearInterval(miniTickTimer);
  moveSparkle();
  miniGameTimer = window.setInterval(moveSparkle, 820);
  miniTickTimer = window.setInterval(() => {
    miniSecondsLeft -= 1;
    miniTime.textContent = String(miniSecondsLeft);
    if (miniSecondsLeft <= 0) {
      stopMiniGame();
      setDialogue(`<strong>Mini Console</strong><br>Final score: ${miniScoreValue}.`);
    }
  }, 1000);
}

function update() {
  let dx = 0;
  let dy = 0;
  const hasManualInput =
    keys.has("arrowleft") ||
    keys.has("a") ||
    keys.has("arrowright") ||
    keys.has("d") ||
    keys.has("arrowup") ||
    keys.has("w") ||
    keys.has("arrowdown") ||
    keys.has("s") ||
    heldTouchKeys.size > 0;

  if (keys.has("arrowleft") || keys.has("a") || heldTouchKeys.has("arrowleft")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d") || heldTouchKeys.has("arrowright")) dx += 1;
  if (keys.has("arrowup") || keys.has("w") || heldTouchKeys.has("arrowup")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s") || heldTouchKeys.has("arrowdown")) dy += 1;

  if (hasManualInput) {
    moveTarget = null;
    pendingInteractId = null;
  } else if (moveTarget) {
    const pc = center(player);
    const distance = Math.hypot(moveTarget.x - pc.x, moveTarget.y - pc.y);
    if (distance < 2.5) {
      moveTarget = null;
      if (pendingInteractId && nearby?.id === pendingInteractId) {
        interact();
      }
      pendingInteractId = null;
    } else {
      dx = (moveTarget.x - pc.x) / distance;
      dy = (moveTarget.y - pc.y) / distance;
    }
  }

  if (dx || dy) {
    const len = Math.hypot(dx, dy);
    dx = (dx / len) * player.speed;
    dy = (dy / len) * player.speed;
    const beforeX = player.x;
    const beforeY = player.y;
    if (Math.abs(dx) > Math.abs(dy)) player.dir = dx > 0 ? "right" : "left";
    else player.dir = dy > 0 ? "down" : "up";

    if (!collides(playerRect(player.x + dx, player.y))) player.x += dx;
    if (!collides(playerRect(player.x, player.y + dy))) player.y += dy;
    const movedDistance = Math.hypot(player.x - beforeX, player.y - beforeY);
    player.step += 0.18;
    if (movedDistance > 0.1) {
      playStepSound();
    }
    if (moveTarget && movedDistance < 0.1) {
      moveTarget = null;
      pendingInteractId = null;
    }
  } else {
    player.step = 0;
  }

  nearby = nearestInteractive();
  hint.textContent = nearby ? `${nearby.name}` : moveTarget ? "Moving" : "...";
}

function drawPixelRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawRoom() {
  ctx.fillStyle = "#241b2f";
  ctx.fillRect(0, 0, W, H);
  drawPixelRect(0, 0, W, 42, "#1f1829");
  drawPixelRect(22, 42, W - 44, H - 66, "#6b5366");

  for (let y = 46; y < H - 26; y += TILE) {
    for (let x = 24; x < W - 24; x += TILE) {
      const alt = (x / TILE + y / TILE) % 2;
      ctx.fillStyle = alt ? "#735a6c" : "#7b6072";
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = alt ? "#604b5c" : "#665061";
      ctx.fillRect(x, y + TILE - 1, TILE, 1);
      ctx.fillRect(x + TILE - 1, y, 1, TILE);
      if ((x + y) % 64 === 0) {
        ctx.fillStyle = "rgba(255, 246, 215, 0.12)";
        ctx.fillRect(x + 3, y + 3, 3, 3);
      }
    }
  }

  drawPixelRect(0, 34, W, 8, "#3a2b44");
  drawPixelRect(0, 40, W, 3, "#ffd166");
  drawPixelRect(0, 43, W, 2, "#8bd8bd");
  drawPixelRect(22, H - 24, W - 44, 6, "#2b2133");

  drawPixelRect(78, 128, 84, 66, "#2a2032");
  drawPixelRect(82, 132, 76, 58, "#8b3f59");
  drawPixelRect(88, 138, 64, 46, "#4f3656");
}

function drawBed(object) {
  drawPixelRect(object.x, object.y, object.w, object.h, "#5d3b6f");
  drawPixelRect(object.x + 4, object.y + 4, object.w - 8, 13, "#f2d9a6");
  drawPixelRect(object.x + 5, object.y + 21, object.w - 10, 12, "#7fb7ff");
  drawPixelRect(object.x + 12, object.y + 25, 5, 5, "#fff6d7");
  drawPixelRect(object.x + 31, object.y + 25, 5, 5, "#fff6d7");
}

function drawDesk(object) {
  drawPixelRect(object.x, object.y, object.w, object.h, "#73523d");
  drawPixelRect(object.x + 3, object.y + 4, object.w - 6, 5, "#9b724e");
  drawPixelRect(object.x + 20, object.y - 7, 13, 10, "#ef7895");
  drawPixelRect(object.x + 25, object.y - 9, 3, 12, "#ffd166");
}

function drawCake(object) {
  const x = object.x;
  const y = object.y;

  // Brown table (at the cake position)
  drawPixelRect(x + 6, y + 32, 36, 10, "#7a5649");
  drawPixelRect(x + 10, y + 35, 28, 6, "#46312b");

  // Small cake sitting on the table (no candles/sticks)
  drawPixelRect(x + 10, y + 21, 28, 10, "#6b3f2f");   // base shadow
  drawPixelRect(x + 8, y + 17, 32, 10, "#f8d6a5");    // cake body
  drawPixelRect(x + 11, y + 20, 6, 7, "#fff1ce");     // frosting drips
  drawPixelRect(x + 22, y + 20, 6, 8, "#fff1ce");
  drawPixelRect(x + 28, y + 22, 3, 5, "#fff1ce");

  // Decorative top blocks
  drawPixelRect(x + 13, y + 13, 4, 4, "#ef334d");
  drawPixelRect(x + 20, y + 12, 6, 5, "#ef334d");
  drawPixelRect(x + 28, y + 14, 4, 4, "#d8173a");
  drawPixelRect(x + 16, y + 16, 4, 3, "#fff6d7");

  // Tiny chocolate side details
  drawPixelRect(x + 12, y + 27, 4, 3, "#3a221c");
  drawPixelRect(x + 26, y + 27, 4, 3, "#3a221c");
}

function drawMusic(object) {
  // Bigger + clearer speaker with knobs
  drawPixelRect(object.x, object.y + 2, object.w, object.h - 2, "#242231");
  drawPixelRect(object.x + 2, object.y + 3, object.w - 4, object.h - 6, "#121118");

  // Speaker grills
  drawPixelRect(object.x + 4, object.y + 6, 10, 8, "#7fb7ff");
  drawPixelRect(object.x + 14, object.y + 6, 8, 8, "#8bd8bd");

  // Knob ring
  drawPixelRect(object.x + 4, object.y + 14, 5, 3, "#ffd166");
  drawPixelRect(object.x + 11, object.y + 14, 5, 3, "#ffd166");
  drawPixelRect(object.x + 18, object.y + 14, 3, 3, "#ef7895");

  // Top bar
  drawPixelRect(object.x + 6, object.y, object.w - 12, 2, "#ffd166");
}

function drawPlant(object) {
  drawPixelRect(object.x + 5, object.y + 12, 9, 10, "#b66b5f");
  drawPixelRect(object.x + 2, object.y + 7, 8, 8, "#63bf84");
  drawPixelRect(object.x + 9, object.y + 3, 8, 10, "#8bd8bd");
  drawPixelRect(object.x + 8, object.y + 10, 6, 7, "#4fa46b");
}

function drawAbitha(object) {
  // NPC: taller with hat + clearer face
  drawPixelRect(object.x + 5, object.y - 1, 5, 4, "#ffd166"); // hat brim
  drawPixelRect(object.x + 4, object.y - 4, 7, 4, "#ef7895"); // hat top

  // Head
  drawPixelRect(object.x + 4, object.y + 1, 7, 6, "#8b5a44");
  // Face highlights
  drawPixelRect(object.x + 5, object.y + 3, 1, 1, "#fff6d7");
  drawPixelRect(object.x + 9, object.y + 3, 1, 1, "#fff6d7");

  // Eyes
  drawPixelRect(object.x + 5, object.y + 4, 2, 2, "#171217");
  drawPixelRect(object.x + 9, object.y + 4, 2, 2, "#171217");

  // Body
  drawPixelRect(object.x + 3, object.y + 7, 9, 8, "#ef7895");
  // Arms
  drawPixelRect(object.x + 1, object.y + 9, 3, 6, "#8b5a44");
  drawPixelRect(object.x + 12, object.y + 9, 3, 6, "#8b5a44");
  // Legs
  drawPixelRect(object.x + 4, object.y + 15, 3, 4, "#2d2638");
  drawPixelRect(object.x + 10, object.y + 15, 3, 4, "#2d2638");
}

function drawTv(object) {
  drawPixelRect(object.x, object.y, object.w, object.h - 7, "#171217");
  drawPixelRect(object.x + 4, object.y + 4, object.w - 8, object.h - 15, "#7fb7ff");
  drawPixelRect(object.x + 11, object.y + 10, 20, 6, "#8bd8bd");
  drawPixelRect(object.x + 39, object.y + 8, 25, 8, "#ffd166");
  drawPixelRect(object.x + 66, object.y + 12, 12, 10, "#ef7895");
  drawPixelRect(object.x + 35, object.y + object.h - 7, 18, 5, "#33243b");
  drawPixelRect(object.x + 27, object.y + object.h - 2, 34, 4, "#5b5260");
}

function drawConsole(object) {
  // Handheld console / mini arcade
  drawPixelRect(object.x, object.y + 2, object.w, object.h - 2, "#242231");
  drawPixelRect(object.x + 2, object.y + 4, object.w - 4, object.h - 7, "#121118");

  // Screen
  drawPixelRect(object.x + 7, object.y + 6, object.w - 14, 10, "#7fb7ff");
  drawPixelRect(object.x + 9, object.y + 8, object.w - 18, 6, "#8bd8bd");

  // Buttons row
  drawPixelRect(object.x + 6, object.y + 14, 7, 3, "#ffd166");
  drawPixelRect(object.x + 15, object.y + 14, 7, 3, "#ef7895");

  // Tiny indicator
  drawPixelRect(object.x + 24, object.y + 9, 3, 3, "#ef7895");
  drawPixelRect(object.x + 22, object.y + 6, 2, 2, "#ffd166");
}

function drawGift(object) {
  // More readable wrapped gift with ribbon
  drawPixelRect(object.x + 3, object.y + 9, object.w - 6, object.h - 10, "#ef7895"); // wrap
  drawPixelRect(object.x + 5, object.y + 6, object.w - 10, 6, "#ff9ab0"); // top fold

  // Ribbon vertical
  drawPixelRect(object.x + 11, object.y + 4, 4, object.h - 7, "#ffd166");
  drawPixelRect(object.x + 10, object.y + 6, 6, 2, "#fff6d7");

  // Ribbon horizontal
  drawPixelRect(object.x + 5, object.y + 15, 16, 3, "#ffd166");
  drawPixelRect(object.x + 6, object.y + 15, 14, 2, "#fff6d7");

  // Bow corners
  drawPixelRect(object.x + 4, object.y + 8, 6, 5, "#ffd166");
  drawPixelRect(object.x + object.w - 10, object.y + 8, 6, 5, "#ffd166");
}

function drawObject(object) {
  if (object.id === "tv") drawTv(object);
  if (object.id === "console") drawConsole(object);
  if (object.id === "gift") drawGift(object);
  if (object.id === "cake") drawCake(object);
  if (object.id === "music") drawMusic(object);
  if (object.id === "abitha") drawAbitha(object);

  if (nearby?.id === object.id) {
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 1;
    ctx.strokeRect(object.x - 3, object.y - 3, object.w + 6, object.h + 6);
  }
}

function drawMoveTarget() {
  if (!moveTarget) return;
  const pulse = Math.sin(performance.now() / 120) > 0 ? 1 : 0;
  drawPixelRect(moveTarget.x - 5, moveTarget.y - 1, 10, 2, "#ffd166");
  drawPixelRect(moveTarget.x - 1, moveTarget.y - 5, 2, 10, "#ffd166");
  if (pulse) {
    drawPixelRect(moveTarget.x - 2, moveTarget.y - 2, 4, 4, "#fff6d7");
  }
}

function drawPlayer() {
  const bob = Math.sin(player.step) > 0 ? 1 : 0;
  const x = Math.round(player.x);
  const y = Math.round(player.y + bob);

  // Hat / hair
  drawPixelRect(x + 2, y, 8, 3, "#ffd166");
  drawPixelRect(x + 3, y + 1, 6, 2, "#3b2620");

  // Head + face
  drawPixelRect(x + 2, y + 3, 8, 6, "#a7654a");
  drawPixelRect(x + 4, y + 6, 1, 1, "#171217");
  drawPixelRect(x + 8, y + 6, 1, 1, "#171217");

  // Torso (mint jacket)
  drawPixelRect(x + 2, y + 8, 8, 7, "#8bd8bd");
  // Collar
  drawPixelRect(x + 3, y + 8, 2, 2, "#ffd166");
  drawPixelRect(x + 7, y + 8, 2, 2, "#ffd166");

  // Arms
  drawPixelRect(x, y + 10, 3, 6, "#a7654a");
  drawPixelRect(x + 9, y + 10, 3, 6, "#a7654a");

  // Legs
  drawPixelRect(x + 2, y + 15, 3, 4, "#22242f");
  drawPixelRect(x + 7, y + 15, 3, 4, "#22242f");

  // Direction marker (front)
  if (player.dir !== "up") {
    drawPixelRect(x + 4, y + 12, 1, 1, "#171217");
    drawPixelRect(x + 7, y + 12, 1, 1, "#171217");
  }
}

function render() {
  ctx.clearRect(0, 0, W, H);
  drawRoom();
  drawMoveTarget();

  const drawables = [...objects, { id: "player", y: player.y + player.h }];
  drawables.sort((a, b) => (a.y + (a.h || 0)) - (b.y + (b.h || 0)));
  for (const drawable of drawables) {
    if (drawable.id === "player") drawPlayer();
    else drawObject(drawable);
  }
}

function loop() {
  update();
  render();
  window.requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "w", "a", "s", "d", "e"].includes(key)) {
    event.preventDefault();
  }
  keys.add(key);
  if (key === "e" || key === " ") interact();
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.key.toLowerCase());
});

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  startAmbientSong();
  const point = gamePointFromEvent(event);
  const object = objectAtPoint(point);
  if (object) {
    if (nearby?.id === object.id) {
      interact();
    } else {
      setObjectMoveTarget(object);
    }
    return;
  }
  setMoveTarget(point);
});

function releaseTouchKey(button) {
  const key = button.dataset.holdKey;
  if (!key) return;
  heldTouchKeys.delete(key);
  button.classList.remove("is-held");
}

document.querySelectorAll("[data-hold-key]").forEach((button) => {
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    heldTouchKeys.add(button.dataset.holdKey);
    button.classList.add("is-held");
  });

  button.addEventListener("pointerup", () => releaseTouchKey(button));
  button.addEventListener("pointercancel", () => releaseTouchKey(button));
  button.addEventListener("lostpointercapture", () => releaseTouchKey(button));
});

document.querySelector("[data-action='interact']").addEventListener("pointerdown", (event) => {
  event.preventDefault();
  startAmbientSong();
  interact();
});

document.getElementById("closeMusic").addEventListener("click", closeMusicPanel);
document.getElementById("closeTv").addEventListener("click", () => {
  tvPanel.hidden = true;
});
document.getElementById("closeCard").addEventListener("click", () => {
  cardPanel.hidden = true;
});
document.getElementById("closeConsole").addEventListener("click", closeConsolePanel);
document.getElementById("openTraktList").href = TRAKT_LIST_URL;
document.getElementById("prevRecommendation").addEventListener("click", () => changeRecommendation(-1));
document.getElementById("nextRecommendation").addEventListener("click", () => changeRecommendation(1));
startMiniGameButton.addEventListener("click", startMiniGame);
miniGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cell]");
  if (!button || !miniActive) return;
  if (Number(button.dataset.cell) === miniSparkle) {
    miniScoreValue += 1;
    miniScore.textContent = String(miniScoreValue);
    moveSparkle();
  }
});

setupSpotifySlot();
cardMessage.textContent = GREETING_CARD_MESSAGE;
renderTvRecommendations();
renderMiniGrid();
loop();
