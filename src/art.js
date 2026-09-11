/** Original garden drawings. Not emoji and not PopCap/EA art. */

export function paintLawn(g, { cols, rows, tile, reduced }) {
  const w = cols * tile, h = rows * tile;
  g.fillStyle(0x8ec86a, 1);
  g.fillRect(0, 0, w, h);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const x = col * tile, y = row * tile;
      g.fillStyle((row + col) % 2 === 0 ? 0xb6e08a : 0xa6d47c, 1);
      g.fillRoundedRect(x + 3, y + 3, tile - 6, tile - 6, 14);
      if (!reduced && (col * 5 + row * 3) % 7 === 0) {
        g.fillStyle(0xffc0d4, 0.85);
        g.fillCircle(x + tile * 0.78, y + tile * 0.22, 4);
        g.fillStyle(0xfff6fb, 1);
        g.fillCircle(x + tile * 0.78, y + tile * 0.22, 1.6);
      }
    }
  }
  g.fillStyle(0x5a7a38, 1);
  g.fillRect(0, 0, 14, h);
  for (let i = 0; i < rows; i += 1) {
    g.fillStyle(0xe8f4b8, 1);
    g.fillRoundedRect(2, i * tile + 12, 10, tile - 24, 4);
    g.fillStyle(0x8aaa4a, 1);
    g.fillCircle(7, i * tile + tile / 2, 3);
  }
}

export function drawPlant(g, plant, time, reduced) {
  const x = plant.col * plant.tile + plant.tile / 2;
  const y = plant.row * plant.tile + plant.tile / 2 + 8;
  const bounce = reduced ? 1 : 1 + Math.sin(time / 220 + plant.col) * 0.04;
  g.fillStyle(0x2f4a24, 0.18);
  g.fillEllipse(x, y + 20, 22, 8);
  stem(g, x, y);
  const kind = plant.kind;
  if (kind === "sunbloom") {
    g.fillStyle(0xffb020, 1);
    for (let i = 0; i < 10; i += 1) {
      const a = (Math.PI / 5) * i + 0.2;
      g.fillEllipse(x + Math.cos(a) * 13 * bounce, y - 18 + Math.sin(a) * 13 * bounce, 9, 6);
    }
    g.fillStyle(0xff8a14, 1);
    g.fillCircle(x, y - 18, 10 * bounce);
    g.fillStyle(0xfff1a0, 1);
    g.fillCircle(x - 2, y - 20, 3.5);
    face(g, x, y - 17, 0.8);
  } else if (kind === "podling") {
    g.fillStyle(0x3f9a32, 1);
    g.fillEllipse(x - 1, y - 10 * bounce, 20, 18);
    g.fillStyle(0x6dcc4c, 1);
    g.fillEllipse(x + 6, y - 13 * bounce, 18, 14);
    g.fillStyle(0x2f7a28, 1);
    g.fillRoundedRect(x + 12, y - 16, 16, 9, 5);
    g.fillStyle(0xc8f08a, 1);
    g.fillCircle(x + 24, y - 12, 3);
    face(g, x + 2, y - 13, 0.95);
  } else if (kind === "twinpod") {
    g.fillStyle(0x3f9a32, 1);
    g.fillEllipse(x - 10, y - 8 * bounce, 16, 15);
    g.fillEllipse(x + 10, y - 14 * bounce, 16, 15);
    g.fillStyle(0x2f7a28, 1);
    g.fillRoundedRect(x + 16, y - 16, 12, 7, 4);
    face(g, x - 10, y - 9, 0.75);
    face(g, x + 8, y - 15, 0.75);
  } else if (kind === "frostpod") {
    g.fillStyle(0xd8f3ff, 1);
    for (let i = 0; i < 7; i += 1) {
      const a = (Math.PI / 3.5) * i;
      g.fillEllipse(x + Math.cos(a) * 12, y - 16 + Math.sin(a) * 12, 8, 5);
    }
    g.fillStyle(0x7ed0ff, 1);
    g.fillCircle(x, y - 16, 9 * bounce);
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(x - 2, y - 18, 3);
    face(g, x, y - 15, 0.8);
  } else if (kind === "gourd") {
    g.fillStyle(0xf4b03a, 1);
    g.fillEllipse(x, y - 2 * bounce, 30, 26);
    g.fillStyle(0xe08a16, 1);
    g.fillEllipse(x - 7, y - 6, 8, 16);
    g.fillStyle(0x5a8f32, 1);
    g.fillRoundedRect(x - 3, y - 22, 6, 10, 3);
    g.fillStyle(0xffe08a, 1);
    g.fillEllipse(x + 6, y - 8, 8, 6);
    face(g, x + 2, y - 4, 0.9);
  } else if (kind === "snapleaf") {
    g.fillStyle(0x58b844, 1);
    g.fillEllipse(x - 2, y - 8 * bounce, 26, 20);
    g.fillStyle(0x2a5a22, 1);
    g.fillEllipse(x + 6, y - 8, 15, 8);
    g.fillStyle(0xff7a88, 1);
    g.fillEllipse(x + 6, y - 7, 10, 4);
    g.fillStyle(0xfff1a0, 1);
    g.fillRect(x + 2, y - 9, 3, 4);
    g.fillRect(x + 8, y - 9, 3, 4);
    face(g, x - 8, y - 14, 0.7);
  } else if (kind === "trilane") {
    g.fillStyle(0x4f9e3a, 1);
    g.fillRoundedRect(x - 16, y - 16 * bounce, 7, 20, 3);
    g.fillRoundedRect(x - 3, y - 22 * bounce, 7, 26, 3);
    g.fillRoundedRect(x + 10, y - 16 * bounce, 7, 20, 3);
    g.fillStyle(0x8ad45a, 1);
    g.fillCircle(x - 12, y - 20, 7);
    g.fillCircle(x, y - 26, 7);
    g.fillCircle(x + 13, y - 20, 7);
    face(g, x, y - 26, 0.55);
  } else if (kind === "emberpod") {
    g.fillStyle(0xff7a28, 0.28);
    g.fillCircle(x + 4, y - 12, 20);
    g.fillStyle(0xff6a2a, 1);
    g.fillEllipse(x + 2, y - 11 * bounce, 22, 17);
    g.fillStyle(0xffd24a, 1);
    g.fillCircle(x + 16, y - 14, 6);
    g.fillStyle(0xfff6c8, 1);
    g.fillCircle(x + 16, y - 15, 2.4);
    face(g, x, y - 12, 0.9);
  } else {
    g.fillStyle(0x3d8f4a, 1);
    g.fillRoundedRect(x - 9, y - 22 * bounce, 18, 30, 8);
    g.fillStyle(0x2f6a38, 1);
    g.fillRoundedRect(x - 5, y - 8, 10, 12, 4);
    g.fillStyle(0xd4f06a, 1);
    g.fillTriangle(x + 8, y - 8, x + 22, y - 14, x + 8, y - 20);
    face(g, x, y - 16, 0.75);
  }
  const ratio = Math.max(0, plant.health / plant.maxHealth);
  g.fillStyle(0x2a2a2a, 0.35);
  g.fillRoundedRect(x - 16, y + 20, 32, 5, 2);
  g.fillStyle(ratio > 0.35 ? 0x5ad46a : 0xe35d5d, 1);
  g.fillRoundedRect(x - 16, y + 20, 32 * ratio, 5, 2);
}

export function drawWalker(g, walker, time, reduced) {
  const flash = walker.flashUntil && time < walker.flashUntil;
  const kick = flash && !reduced ? 4 : 0;
  const bob = reduced ? 0 : Math.sin(time / 140 + walker.x * 0.04) * 2;
  const x = walker.x + kick, y = walker.row * walker.tile + walker.tile / 2 + bob;
  g.fillStyle(0x2f4a24, 0.2);
  g.fillEllipse(x, y + 18, 20, 7);
  if (walker.kind === "slug") {
    g.fillStyle(0x6a3d8f, 1);
    g.fillRoundedRect(x - 16, y + 4, 8, 6, 2);
    g.fillRoundedRect(x + 8, y + 4, 8, 6, 2);
    g.fillStyle(0xc48ae8, 1);
    g.fillEllipse(x, y + 2, 30, 16);
    g.fillStyle(0x9b5fd0, 1);
    g.fillCircle(x - 11, y - 2, 9);
    g.fillStyle(0xe8c8ff, 0.8);
    g.fillEllipse(x + 4, y - 2, 8, 5);
    antenna(g, x - 16, y - 8, -0.7);
    antenna(g, x - 10, y - 10, -0.3);
    face(g, x - 12, y - 2, 0.85);
  } else if (walker.kind === "snail") {
    g.fillStyle(0xe0b46a, 1);
    g.fillCircle(x + 4, y - 2, 15);
    g.fillStyle(0xc47a32, 1);
    g.lineStyle(2.4, 0xc47a32, 1);
    g.strokeCircle(x + 4, y - 2, 9);
    g.strokeCircle(x + 4, y - 2, 5);
    g.lineStyle(0);
    g.fillStyle(0x9ad86a, 1);
    g.fillEllipse(x - 10, y + 6, 18, 11);
    antenna(g, x - 16, y - 2, -0.8);
    antenna(g, x - 12, y - 4, -0.4);
    face(g, x - 12, y + 4, 0.7);
  } else if (walker.kind === "beetle") {
    g.fillStyle(0x3a2418, 1);
    g.fillRoundedRect(x - 14, y + 6, 6, 8, 2);
    g.fillRoundedRect(x + 8, y + 6, 6, 8, 2);
    g.fillStyle(0x6a4228, 1);
    g.fillEllipse(x, y + 1, 28, 18);
    g.fillStyle(0x2a1c14, 1);
    g.fillEllipse(x + 3, y - 3, 14, 11);
    g.fillStyle(0xd4a06a, 0.35);
    g.fillEllipse(x - 4, y - 4, 8, 5);
    face(g, x - 6, y - 2, 0.8);
  } else if (walker.kind === "mite") {
    g.fillStyle(0x3d6a28, 1);
    g.fillCircle(x - 8, y + 6, 2);
    g.fillCircle(x + 8, y + 6, 2);
    g.fillStyle(0x8ee05a, 1);
    g.fillCircle(x, y, 12);
    g.fillStyle(0xd8ff9a, 0.7);
    g.fillCircle(x - 2, y - 3, 4);
    face(g, x, y - 1, 0.7);
  } else {
    g.fillStyle(0xb85a22, 1);
    g.fillRoundedRect(x - 16, y + 6, 8, 8, 3);
    g.fillRoundedRect(x + 8, y + 6, 8, 8, 3);
    g.fillStyle(0xf08a3a, 1);
    g.fillEllipse(x, y + 2, 32, 18);
    g.fillStyle(0xffd24a, 1);
    g.fillCircle(x - 10, y - 4, 8);
    g.fillStyle(0xfff1a0, 0.8);
    g.fillCircle(x - 12, y - 6, 3);
    face(g, x - 10, y - 3, 0.85);
  }
  if (walker.slowed) {
    g.fillStyle(0x8fd3ff, 0.35);
    g.fillCircle(x, y, 20);
  }
  if (flash) {
    g.fillStyle(0xffffff, 0.45);
    g.fillEllipse(x, y, 34, 22);
  }
  const ratio = Math.max(0, walker.health / walker.maxHealth);
  g.fillStyle(0x2a2a2a, 0.35);
  g.fillRoundedRect(x - 16, y + 20, 32, 5, 2);
  g.fillStyle(0xe35d5d, 1);
  g.fillRoundedRect(x - 16, y + 20, 32 * ratio, 5, 2);
}

export function drawShot(g, shot) {
  if (shot.fire) {
    g.fillStyle(0xff6a2a, 1);
    g.fillCircle(shot.x, shot.y, 7);
    g.fillStyle(0xffe08a, 1);
    g.fillCircle(shot.x + 1, shot.y - 1, 3);
    return;
  }
  if (shot.slow) {
    g.fillStyle(0xb9e7ff, 1);
    g.fillCircle(shot.x, shot.y, 7);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(shot.x - 1, shot.y - 1, 2);
    return;
  }
  if (shot.pierce) {
    g.fillStyle(0xc8e86a, 1);
    g.fillTriangle(shot.x + 8, shot.y, shot.x - 6, shot.y - 5, shot.x - 6, shot.y + 5);
    return;
  }
  g.fillStyle(0x6ad45a, 1);
  g.fillCircle(shot.x, shot.y, 6);
  g.fillStyle(0xe8ffc8, 1);
  g.fillCircle(shot.x - 1, shot.y - 1, 2);
}

export function drawEffects(g, effects, time) {
  for (const burst of effects) {
    const life = Math.max(0, (burst.until - time) / burst.span);
    if (life <= 0) continue;
    if (burst.kind === "spark") {
      g.fillStyle(burst.color, 0.25 + 0.7 * life);
      g.fillCircle(burst.x + burst.vx * (1 - life), burst.y + burst.vy * (1 - life), 3 * life + 1);
    } else {
      g.fillStyle(0xfff6d8, 0.55 * life);
      g.fillCircle(burst.x, burst.y, 16 * (1.2 - life));
    }
  }
}

export function drawSun(g, sun, time, reduced) {
  const pulse = reduced ? 1 : 1 + Math.sin(time / 160 + sun.x) * 0.08;
  g.fillStyle(0xffc53a, 0.22);
  g.fillCircle(sun.x, sun.y, 22 * pulse);
  g.fillStyle(0xffb020, 1);
  for (let i = 0; i < 8; i += 1) {
    const a = (Math.PI / 4) * i + time / 700;
    g.fillTriangle(
      sun.x + Math.cos(a) * 16 * pulse, sun.y + Math.sin(a) * 16 * pulse,
      sun.x + Math.cos(a + 0.18) * 10, sun.y + Math.sin(a + 0.18) * 10,
      sun.x + Math.cos(a - 0.18) * 10, sun.y + Math.sin(a - 0.18) * 10,
    );
  }
  g.fillStyle(0xffd24a, 1);
  g.fillCircle(sun.x, sun.y, 12 * pulse);
  g.fillStyle(0xfff6c8, 1);
  g.fillCircle(sun.x - 3, sun.y - 3, 4);
}

function stem(g, x, y) {
  g.fillStyle(0x4f8a3a, 1);
  g.fillRoundedRect(x - 3, y - 2, 6, 20, 3);
  g.fillStyle(0x7ec85a, 1);
  g.fillEllipse(x - 10, y + 6, 10, 5);
  g.fillEllipse(x + 10, y + 8, 10, 5);
}

function antenna(g, x, y, tilt) {
  g.lineStyle(2, 0x4a2a6a, 1);
  g.beginPath();
  g.moveTo(x, y + 8);
  g.lineTo(x + tilt * 8, y);
  g.strokePath();
  g.lineStyle(0);
  g.fillStyle(0xff8ad0, 1);
  g.fillCircle(x + tilt * 8, y, 2.4);
}

function face(g, x, y, scale = 1) {
  g.fillStyle(0xffffff, 1);
  g.fillCircle(x - 3.2 * scale, y - 0.5 * scale, 3.1 * scale);
  g.fillCircle(x + 3.4 * scale, y - 0.5 * scale, 3.1 * scale);
  g.fillStyle(0x1f2a1c, 1);
  g.fillCircle(x - 2.4 * scale, y - 0.2 * scale, 1.5 * scale);
  g.fillCircle(x + 4.2 * scale, y - 0.2 * scale, 1.5 * scale);
  g.fillStyle(0xff8aa8, 0.7);
  g.fillCircle(x, y + 3.4 * scale, 1.6 * scale);
}
