/* =====================================================
   BootScene.js
   Generates all procedural Warli-art assets via canvas
   ===================================================== */

class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    // We generate everything procedurally — no external image files needed
  }

  create() {
    this._generateTextures();
    this.scene.start('MenuScene');
  }

  /* ── helper: draw a filled circle ── */
  _circle(ctx, x, y, r, fill) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    else ctx.stroke();
  }

  /* ── Warli chalk style ── */
  _chalk(ctx, alpha = 1) {
    ctx.strokeStyle = `rgba(245,237,214,${alpha})`;
    ctx.fillStyle   = `rgba(245,237,214,${alpha})`;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }

  /* ══════════════════════════════════════════════════
     MAIN TEXTURE GENERATOR
  ══════════════════════════════════════════════════ */
  _generateTextures() {
    /* 1 ── MUD BACKGROUND TILE (seamless 800×400) ── */
    this._makeMudBg();

    /* 2 ── PARALLAX LAYERS ── */
    this._makeFarLayer();
    this._makeMidLayer();

    /* 3 ── GROUND ── */
    this._makeGround();

    /* 4 ── PLAYER SPRITE SHEET (8 frames × 48×64) ── */
    this._makePlayerSheet();

    /* 5 ── OBSTACLES ── */
    this._makeStone();
    this._makeSpiritObstacle();
    this._makeTree();

    /* 6 ── COLLECTIBLES ── */
    this._makeSunSymbol();
    this._makeGrainSymbol();
    this._makeSpiritOrb();

    /* 7 ── UI ── */
    this._makeHeartTexture();
    this._makeParticle();

    /* 8 ── MENU BG ── */
    this._makeMenuBg();

    /* 9 ── BORDER PATTERN ── */
    this._makeBorderPattern();
  }

  /* ──────────────────────────────────────────────── */
  _makeMudBg() {
    const W = 800, H = 400;
    const tex = this.textures.createCanvas('mud_bg', W, H);
    const ctx = tex.getContext();

    // Base clay gradient
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0,   '#4A2E10');
    g.addColorStop(0.5, '#5C3A1E');
    g.addColorStop(1,   '#3E2209');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Grain / mud texture noise
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const a = Math.random() * 0.06;
      const r = Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,220,150,${a})`;
      ctx.fill();
    }

    // Subtle cracks
    ctx.strokeStyle = 'rgba(30,10,0,0.3)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 18; i++) {
      ctx.beginPath();
      let cx = Math.random() * W;
      let cy = Math.random() * H;
      ctx.moveTo(cx, cy);
      for (let j = 0; j < 6; j++) {
        cx += (Math.random() - 0.5) * 40;
        cy += (Math.random() - 0.5) * 20;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    tex.refresh();
  }

  _makeMenuBg() {
    const W = 800, H = 400;
    const tex = this.textures.createCanvas('menu_bg', W, H);
    const ctx = tex.getContext();

    // Rich background
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0,   '#2A1506');
    g.addColorStop(0.4, '#3E2209');
    g.addColorStop(1,   '#1A0A02');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Noise
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      ctx.fillStyle = `rgba(200,140,60,${Math.random()*0.05})`;
      ctx.fillRect(x, y, 1, 1);
    }

    // Draw decorative Warli village scene
    this._chalk(ctx, 0.85);
    ctx.lineWidth = 1.5;

    // Moon
    this._drawMoon(ctx, 680, 70, 28);

    // Stars
    for (let i = 0; i < 30; i++) {
      const sx = 30 + Math.random() * 740;
      const sy = 10 + Math.random() * 140;
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(245,237,214,0.6)';
      ctx.fill();
    }

    // Mountains / hills silhouette
    ctx.fillStyle = 'rgba(245,237,214,0.12)';
    ctx.beginPath();
    ctx.moveTo(0, 320);
    ctx.lineTo(100, 200); ctx.lineTo(200, 260);
    ctx.lineTo(300, 170); ctx.lineTo(420, 280);
    ctx.lineTo(530, 160); ctx.lineTo(650, 240);
    ctx.lineTo(760, 180); ctx.lineTo(800, 220);
    ctx.lineTo(800, 400); ctx.lineTo(0, 400);
    ctx.closePath();
    ctx.fill();

    // Trees row
    for (let tx = 60; tx < 750; tx += 90) {
      this._drawTree(ctx, tx, 280, 0.7);
    }

    // Huts
    this._drawHut(ctx, 140, 290, 1);
    this._drawHut(ctx, 380, 285, 1.2);
    this._drawHut(ctx, 610, 288, 0.9);

    // Dancing figures
    const positions = [200, 300, 400, 490, 560];
    positions.forEach((px, i) => {
      this._drawDancingFigure(ctx, px, 320, i % 2 === 0);
    });

    // Decorative border patterns
    this._drawBorderPatterns(ctx, W, H);

    tex.refresh();
  }

  _makeFarLayer() {
    const W = 1600, H = 400;
    const tex = this.textures.createCanvas('far_layer', W, H);
    const ctx = tex.getContext();

    ctx.clearRect(0, 0, W, H);
    this._chalk(ctx, 0.18);
    ctx.lineWidth = 1.5;

    // Distant hills
    ctx.fillStyle = 'rgba(245,237,214,0.08)';
    ctx.beginPath();
    ctx.moveTo(0, 260);
    for (let x = 0; x <= W; x += 80) {
      const y = 180 + Math.sin(x * 0.008) * 60 + Math.cos(x * 0.015) * 40;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, 400); ctx.lineTo(0, 400);
    ctx.closePath();
    ctx.fill();

    // Distant trees
    for (let tx = 40; tx < W; tx += 120 + Math.random() * 60) {
      this._drawTree(ctx, tx, 200 + Math.random() * 40, 0.5);
    }

    // Birds
    for (let i = 0; i < 12; i++) {
      const bx = Math.random() * W;
      const by = 60 + Math.random() * 100;
      this._drawBird(ctx, bx, by, 0.6);
    }

    tex.refresh();
  }

  _makeMidLayer() {
    const W = 1600, H = 400;
    const tex = this.textures.createCanvas('mid_layer', W, H);
    const ctx = tex.getContext();

    ctx.clearRect(0, 0, W, H);
    this._chalk(ctx, 0.55);
    ctx.lineWidth = 2;

    // Trees row
    for (let tx = 30; tx < W; tx += 100 + Math.random() * 50) {
      this._drawTree(ctx, tx, 270 + Math.random() * 30, 0.8 + Math.random() * 0.4);
    }

    // Some huts
    [200, 600, 1000, 1400].forEach(hx => {
      this._drawHut(ctx, hx, 280, 1);
    });

    tex.refresh();
  }

  _makeGround() {
    const W = 800, H = 40;
    const tex = this.textures.createCanvas('ground', W, H);
    const ctx = tex.getContext();

    // Base
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#7A4E2D');
    g.addColorStop(1, '#3E2209');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Top chalk line
    ctx.strokeStyle = 'rgba(245,237,214,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 3);
    for (let x = 0; x <= W; x += 20) {
      ctx.lineTo(x, 3 + (Math.random() - 0.5) * 2);
    }
    ctx.stroke();

    // Decorative dots along top
    for (let x = 10; x < W; x += 16) {
      ctx.beginPath();
      ctx.arc(x, 3, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245,237,214,0.5)';
      ctx.fill();
    }

    // Texture
    for (let i = 0; i < 400; i++) {
      ctx.fillStyle = `rgba(255,200,100,${Math.random() * 0.08})`;
      ctx.fillRect(Math.random() * W, Math.random() * H, 2, 1);
    }

    tex.refresh();
  }

  /* ──────────────────────────────────────────────── */
  _makePlayerSheet() {
    // 8 frames: 0-3 run, 4-5 jump, 6 hurt, 7 idle
    const FW = 48, FH = 64, FRAMES = 8;
    const tex = this.textures.createCanvas('player', FW * FRAMES, FH);
    const ctx = tex.getContext();

    for (let f = 0; f < FRAMES; f++) {
      const ox = f * FW;
      ctx.clearRect(ox, 0, FW, FH);
      this._drawWarliHero(ctx, ox + FW/2, FH/2, f);
    }

    this.textures.get('player').add('__BASE', 0, 0, 0, FW * FRAMES, FH);

    // Define animation frames
    for (let f = 0; f < FRAMES; f++) {
      this.textures.get('player').add(
        f, 0, f * FW, 0, FW, FH
      );
    }

    tex.refresh();
  }

  _drawWarliHero(ctx, cx, cy, frame) {
    const W  = 'rgba(245,237,214,1)';
    const WD = 'rgba(245,237,214,0.85)';

    ctx.strokeStyle = W;
    ctx.fillStyle = W;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Animation offsets
    const runFrameData = [
      // [leftLegAngle, rightLegAngle, leftArmAngle, rightArmAngle, bodyBob]
      [-25, 25, 30, -30, 0],
      [-10, 15, 15, -15, -2],
      [15, -20, -20, 20, -3],
      [25, -30, -30, 30, -1],
    ];

    const jumpFrameData = [
      [30, 30, -60, -60, -6],
      [20, 20, -45, -45, -10],
    ];

    let legL, legR, armL, armR, bob;

    if (frame <= 3) { // run
      [legL, legR, armL, armR, bob] = runFrameData[frame];
    } else if (frame <= 5) { // jump
      [legL, legR, armL, armR, bob] = jumpFrameData[frame - 4];
    } else if (frame === 6) { // hurt
      [legL, legR, armL, armR, bob] = [40, 40, -70, -70, 0];
      ctx.strokeStyle = 'rgba(255,120,80,0.9)';
      ctx.fillStyle = 'rgba(255,120,80,0.9)';
    } else { // idle
      [legL, legR, armL, armR, bob] = [0, 5, 15, -10, 0];
    }

    const headR = 8;
    const bodyH = 16;
    const headY = cy - bodyH/2 - headR + bob;
    const bodyTopY = headY + headR;
    const bodyBotY = bodyTopY + bodyH;
    const hipX = cx;
    const hipY = bodyBotY;

    // Head (circle)
    ctx.beginPath();
    ctx.arc(cx, headY, headR, 0, Math.PI * 2);
    ctx.stroke();

    // Headdress / feather
    ctx.beginPath();
    ctx.moveTo(cx, headY - headR);
    ctx.lineTo(cx - 4, headY - headR - 8);
    ctx.moveTo(cx, headY - headR);
    ctx.lineTo(cx + 3, headY - headR - 9);
    ctx.stroke();

    // Body (inverted triangle - classic Warli)
    ctx.beginPath();
    ctx.moveTo(cx, bodyTopY + 2);     // shoulder mid
    ctx.lineTo(cx - 10, bodyTopY);    // left shoulder
    ctx.lineTo(hipX, bodyBotY);       // hip
    ctx.lineTo(cx + 10, bodyTopY);    // right shoulder
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'rgba(245,237,214,0.15)';
    ctx.fill();
    ctx.fillStyle = W;

    // Arms
    const toRad = d => d * Math.PI / 180;
    const armLen = 14;
    const shoulderLX = cx - 10, shoulderRX = cx + 10;
    const shoulderY = bodyTopY + 2;

    // Left arm
    ctx.beginPath();
    ctx.moveTo(shoulderLX, shoulderY);
    ctx.lineTo(
      shoulderLX + Math.sin(toRad(armL)) * armLen,
      shoulderY + Math.cos(toRad(armL)) * armLen
    );
    ctx.stroke();

    // Right arm
    ctx.beginPath();
    ctx.moveTo(shoulderRX, shoulderY);
    ctx.lineTo(
      shoulderRX + Math.sin(toRad(armR)) * armLen,
      shoulderY + Math.cos(toRad(armR)) * armLen
    );
    ctx.stroke();

    // Legs
    const legLen = 18;
    // Left leg
    ctx.beginPath();
    ctx.moveTo(hipX - 2, hipY);
    ctx.lineTo(
      hipX - 2 + Math.sin(toRad(legL)) * legLen,
      hipY + Math.cos(toRad(legL)) * legLen
    );
    ctx.stroke();

    // Right leg
    ctx.beginPath();
    ctx.moveTo(hipX + 2, hipY);
    ctx.lineTo(
      hipX + 2 + Math.sin(toRad(legR)) * legLen,
      hipY + Math.cos(toRad(legR)) * legLen
    );
    ctx.stroke();

    // Restore color
    ctx.strokeStyle = W;
    ctx.fillStyle = W;
  }

  /* ──────────────────────────────────────────────── */
  _makeStone() {
    const tex = this.textures.createCanvas('stone', 44, 36);
    const ctx = tex.getContext();
    this._chalk(ctx, 0.9);
    ctx.lineWidth = 2;

    // Stone shape (irregular polygon)
    ctx.beginPath();
    ctx.moveTo(8, 28);
    ctx.lineTo(4, 18);
    ctx.lineTo(10, 8);
    ctx.lineTo(22, 4);
    ctx.lineTo(36, 6);
    ctx.lineTo(42, 16);
    ctx.lineTo(38, 28);
    ctx.lineTo(22, 32);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'rgba(245,237,214,0.08)';
    ctx.fill();

    // Details
    ctx.beginPath();
    ctx.moveTo(14, 14); ctx.lineTo(22, 10); ctx.lineTo(30, 14);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(20, 20, 2, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(245,237,214,0.4)';
    ctx.fill();

    tex.refresh();
  }

  _makeSpiritObstacle() {
    const tex = this.textures.createCanvas('spirit_obs', 40, 60);
    const ctx = tex.getContext();
    this._chalk(ctx, 0.9);
    ctx.lineWidth = 2;

    // Ghost/spirit figure — inverted Warli shape, menacing
    // Floating wisps
    ctx.strokeStyle = 'rgba(180,220,255,0.7)';
    ctx.fillStyle   = 'rgba(180,220,255,0.7)';

    // Head
    ctx.beginPath();
    ctx.arc(20, 14, 9, 0, Math.PI*2);
    ctx.stroke();

    // Spiral eyes
    ctx.lineWidth = 1.5;
    [[15,13],[25,13]].forEach(([ex,ey]) => {
      ctx.beginPath();
      ctx.arc(ex, ey, 2.5, 0, Math.PI*1.5);
      ctx.stroke();
    });

    // Body — wavy ghost bottom
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(11, 22);
    ctx.lineTo(8, 46);
    ctx.bezierCurveTo(8, 52, 14, 56, 20, 52);
    ctx.bezierCurveTo(26, 56, 32, 52, 32, 46);
    ctx.lineTo(29, 22);
    ctx.closePath();
    ctx.fillStyle = 'rgba(180,220,255,0.12)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,220,255,0.7)';
    ctx.stroke();

    // Claws / hands
    ctx.lineWidth = 1.5;
    [[8,34],[32,34]].forEach(([ax,ay]) => {
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 6, ay - 4);
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax - 4, ay + 4);
      ctx.stroke();
    });

    tex.refresh();
  }

  _makeTree() {
    const tex = this.textures.createCanvas('tree', 48, 80);
    const ctx = tex.getContext();
    this._chalk(ctx, 0.9);
    ctx.lineWidth = 2.5;

    // Trunk
    ctx.beginPath();
    ctx.moveTo(24, 78); ctx.lineTo(24, 42);
    ctx.stroke();

    // Branches
    [[24,42,10,26],[24,50,36,30],[24,56,8,38],[24,56,40,36]].forEach(([fx,fy,tx2,ty2]) => {
      ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(tx2,ty2); ctx.stroke();
    });

    // Leaves (triangles — very Warli)
    const leaves = [[12,28,24,12],[20,22,32,6],[28,26,40,12],[6,38,20,22],[30,36,44,22]];
    ctx.lineWidth = 1.5;
    leaves.forEach(([lx,ly,rx,ry]) => {
      const mx = (lx+rx)/2, topY = ry - 6;
      ctx.beginPath();
      ctx.moveTo(mx, topY);
      ctx.lineTo(lx, ly + 6);
      ctx.lineTo(rx, ry + 6);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(245,237,214,0.06)';
      ctx.fill();
    });

    tex.refresh();
  }

  /* ──────────────────────────────────────────────── */
  _makeSunSymbol() {
    const tex = this.textures.createCanvas('sun', 36, 36);
    const ctx = tex.getContext();
    ctx.strokeStyle = 'rgba(232,200,74,0.95)';
    ctx.fillStyle   = 'rgba(232,200,74,0.95)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    // Sun circle
    ctx.beginPath();
    ctx.arc(18, 18, 8, 0, Math.PI*2);
    ctx.stroke();

    // Rays
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(18 + Math.cos(a)*11, 18 + Math.sin(a)*11);
      ctx.lineTo(18 + Math.cos(a)*16, 18 + Math.sin(a)*16);
      ctx.stroke();
    }

    // Inner dot
    ctx.beginPath();
    ctx.arc(18, 18, 3, 0, Math.PI*2);
    ctx.fill();

    tex.refresh();
  }

  _makeGrainSymbol() {
    const tex = this.textures.createCanvas('grain', 28, 34);
    const ctx = tex.getContext();
    ctx.strokeStyle = 'rgba(245,200,120,0.95)';
    ctx.fillStyle   = 'rgba(245,200,120,0.95)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    // Grain stalk
    ctx.beginPath();
    ctx.moveTo(14, 32); ctx.lineTo(14, 8);
    ctx.stroke();

    // Grain ears
    for (let i = 0; i < 5; i++) {
      const y = 10 + i * 4;
      ctx.beginPath();
      ctx.ellipse(10, y, 4, 2.5, -0.4, 0, Math.PI*2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(18, y+1, 4, 2.5, 0.4, 0, Math.PI*2);
      ctx.stroke();
    }

    // Top diamond
    ctx.beginPath();
    ctx.moveTo(14, 2); ctx.lineTo(18, 6); ctx.lineTo(14, 10);
    ctx.lineTo(10, 6); ctx.closePath();
    ctx.stroke();

    tex.refresh();
  }

  _makeSpiritOrb() {
    const tex = this.textures.createCanvas('orb', 32, 32);
    const ctx = tex.getContext();

    // Glowing orb
    const g = ctx.createRadialGradient(16,16,2,16,16,14);
    g.addColorStop(0,   'rgba(200,240,255,0.95)');
    g.addColorStop(0.5, 'rgba(160,210,255,0.6)');
    g.addColorStop(1,   'rgba(100,180,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI*2);
    ctx.fill();

    // Inner Warli dot pattern
    ctx.strokeStyle = 'rgba(200,240,255,0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(16, 16, 6, 0, Math.PI*2);
    ctx.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i/6)*Math.PI*2;
      ctx.beginPath();
      ctx.arc(16+Math.cos(a)*9, 16+Math.sin(a)*9, 1.5, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(200,240,255,0.8)';
      ctx.fill();
    }

    tex.refresh();
  }

  _makeHeartTexture() {
    const tex = this.textures.createCanvas('heart', 24, 22);
    const ctx = tex.getContext();
    ctx.strokeStyle = 'rgba(245,237,214,0.95)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(12, 18);
    ctx.bezierCurveTo(4, 12, 2, 6, 6, 4);
    ctx.bezierCurveTo(9, 2, 12, 6, 12, 6);
    ctx.bezierCurveTo(12, 6, 15, 2, 18, 4);
    ctx.bezierCurveTo(22, 6, 20, 12, 12, 18);
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'rgba(232,80,60,0.7)';
    ctx.fill();

    tex.refresh();
  }

  _makeParticle() {
    const tex = this.textures.createCanvas('particle', 8, 8);
    const ctx = tex.getContext();
    const g = ctx.createRadialGradient(4,4,0,4,4,4);
    g.addColorStop(0, 'rgba(232,200,74,1)');
    g.addColorStop(1, 'rgba(232,200,74,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(4, 4, 4, 0, Math.PI*2);
    ctx.fill();
    tex.refresh();
  }

  _makeBorderPattern() {
    const tex = this.textures.createCanvas('border', 800, 400);
    const ctx = tex.getContext();
    ctx.clearRect(0, 0, 800, 400);
    this._drawBorderPatterns(ctx, 800, 400);
    tex.refresh();
  }

  /* ──────────────────────────────────────────────── */
  /* Reusable drawing helpers (used above + in other scenes) */

  _drawTree(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(0, -36);
    ctx.stroke();

    [[-12,-30,0,-18],[-14,-22,0,-14],[12,-28,0,-16],[14,-20,0,-12]].forEach(([fx,fy,tx2,ty2]) => {
      ctx.beginPath(); ctx.moveTo(fx,fy); ctx.lineTo(tx2,ty2); ctx.stroke();
    });

    // Leaf triangles
    [[-16,-36,16,-36,0,-52],[-20,-26,10,-26,-5,-42],[8,-32,28,-32,18,-48]].forEach(([lx,ly,rx,ry,mx,my]) => {
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(lx, ly);
      ctx.lineTo(rx, ry);
      ctx.closePath();
      ctx.stroke();
    });

    ctx.restore();
  }

  _drawHut(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.lineWidth = 2;

    // Walls
    ctx.beginPath();
    ctx.rect(-20, -24, 40, 24);
    ctx.stroke();

    // Roof (triangle)
    ctx.beginPath();
    ctx.moveTo(-24, -24); ctx.lineTo(0, -50); ctx.lineTo(24, -24);
    ctx.closePath();
    ctx.stroke();

    // Door
    ctx.beginPath();
    ctx.rect(-6, -14, 12, 14);
    ctx.stroke();

    // Window
    ctx.beginPath();
    ctx.rect(-16, -20, 8, 7);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-16,-16); ctx.lineTo(-8,-16);
    ctx.moveTo(-12,-20); ctx.lineTo(-12,-13);
    ctx.stroke();

    ctx.restore();
  }

  _drawMoon(ctx, x, y, r) {
    ctx.save();
    ctx.strokeStyle = 'rgba(245,237,214,0.9)';
    ctx.fillStyle   = 'rgba(245,237,214,0.9)';
    ctx.lineWidth = 1.5;

    // Crescent
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(245,237,214,0.15)';
    ctx.fill();

    // Inner circle (crescent effect)
    ctx.beginPath();
    ctx.arc(x + r*0.35, y - r*0.15, r*0.75, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(62,34,9,0.85)';
    ctx.fill();

    ctx.restore();
  }

  _drawBird(ctx, x, y, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.strokeStyle = 'rgba(245,237,214,0.7)';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.quadraticCurveTo(-4, -5, 0, 0);
    ctx.quadraticCurveTo(4, -5, 8, 0);
    ctx.stroke();

    ctx.restore();
  }

  _drawDancingFigure(ctx, x, y, raised = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.lineWidth = 1.5;

    const armDir = raised ? -1 : 1;

    // Head
    ctx.beginPath();
    ctx.arc(0, -30, 5, 0, Math.PI*2);
    ctx.stroke();

    // Body triangle
    ctx.beginPath();
    ctx.moveTo(-7, -24); ctx.lineTo(0, -24);
    ctx.lineTo(7, -24); ctx.lineTo(0, -8);
    ctx.lineTo(-7, -24); ctx.moveTo(7, -24);
    ctx.lineTo(0, -8);
    ctx.stroke();

    // Arms raised
    ctx.beginPath();
    ctx.moveTo(-7, -22); ctx.lineTo(-14, -22 + armDir*8);
    ctx.moveTo(7, -22); ctx.lineTo(14, -22 + armDir*8);
    ctx.stroke();

    // Legs
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-6, 0); ctx.lineTo(-4, 10);
    ctx.moveTo(0, -8);
    ctx.lineTo(6, 0); ctx.lineTo(4, 10);
    ctx.stroke();

    ctx.restore();
  }

  _drawBorderPatterns(ctx, W, H) {
    ctx.strokeStyle = 'rgba(245,237,214,0.3)';
    ctx.fillStyle   = 'rgba(245,237,214,0.3)';
    ctx.lineWidth = 1;

    const patH = 12; // band height

    // Top band
    ctx.strokeRect(2, 2, W-4, patH);
    for (let x = 12; x < W-12; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 3); ctx.lineTo(x+8, patH/2+2); ctx.lineTo(x+16, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x+8, patH/2+2, 2, 0, Math.PI*2);
      ctx.fill();
    }

    // Bottom band
    ctx.strokeRect(2, H-patH-2, W-4, patH);
    for (let x = 12; x < W-12; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, H-3); ctx.lineTo(x+8, H-patH/2-2); ctx.lineTo(x+16, H-3);
      ctx.stroke();
    }

    // Side dots
    for (let y = patH+14; y < H-patH-14; y += 14) {
      [6, W-6].forEach(dx => {
        ctx.beginPath();
        ctx.arc(dx, y, 2.5, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(dx, y, 5, 0, Math.PI*2);
        ctx.stroke();
      });
    }

    // Corner diamonds
    [[14,14],[W-14,14],[14,H-14],[W-14,H-14]].forEach(([cx,cy]) => {
      ctx.beginPath();
      ctx.moveTo(cx, cy-8); ctx.lineTo(cx+8,cy);
      ctx.lineTo(cx, cy+8); ctx.lineTo(cx-8,cy);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI*2);
      ctx.fill();
    });
  }
}