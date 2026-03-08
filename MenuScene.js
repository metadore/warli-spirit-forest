/* =====================================================
   MenuScene.js
   Animated Warli village start screen
   ===================================================== */

class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background
    this.add.image(W/2, H/2, 'menu_bg').setDisplaySize(W, H);

    // Parallax hills already drawn in menu_bg texture
    // Add animated moon glow
    this._moonGlow = this.add.graphics();
    this._drawMoonGlow();

    // Flickering stars
    this._stars = [];
    for (let i = 0; i < 25; i++) {
      const s = this.add.graphics();
      s.fillStyle(0xF5EDD6, Math.random() * 0.5 + 0.2);
      s.fillCircle(0, 0, 1.2);
      s.setPosition(30 + Math.random() * 740, 14 + Math.random() * 130);
      this._stars.push({ gfx: s, baseAlpha: Math.random()*0.4+0.2, phase: Math.random()*Math.PI*2 });
    }

    // Border overlay
    this.add.image(W/2, H/2, 'border').setDisplaySize(W, H);

    // Title text - drawn on canvas for Warli feel
    this._drawTitle();

    // Subtitle
    const sub = this.add.text(W/2, 210,
      'A JOURNEY THROUGH THE SACRED FOREST',
      {
        fontFamily: 'Cinzel, Georgia, serif',
        fontSize: '11px',
        color: '#D4C4A0',
        letterSpacing: 4,
      }
    ).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: sub, alpha: 0.85, duration: 1200, delay: 800, ease: 'Sine.easeInOut' });

    // Animated dancing figures below title
    this._figureTime = 0;
    this._drawDancers();

    // Start prompt — pulse
    this._prompt = this.add.text(W/2, 352,
      '— PRESS  SPACE  OR  TAP  TO  BEGIN —',
      {
        fontFamily: 'Cinzel, Georgia, serif',
        fontSize: '12px',
        color: '#E8C84A',
        letterSpacing: 3,
      }
    ).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: this._prompt,
      alpha: { from: 0, to: 1 },
      duration: 600, delay: 1600, ease: 'Cubic.easeIn',
      onComplete: () => {
        this.tweens.add({
          targets: this._prompt,
          alpha: { from: 0.3, to: 1 },
          duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
      }
    });

    // Version
    this.add.text(W - 10, H - 10, 'v1.0', {
      fontFamily: 'Crimson Text, Georgia, serif',
      fontSize: '10px', color: '#7A4E2D'
    }).setOrigin(1, 1);

    // Input
    this.input.keyboard.on('keydown-SPACE', () => this._startGame());
    this.input.on('pointerdown', () => this._startGame());

    // Floating spirit orbs
    this._spawnMenuOrbs();

    this._time = 0;
  }

  update(time, delta) {
    this._time += delta;

    // Twinkle stars
    this._stars.forEach(s => {
      s.gfx.alpha = s.baseAlpha + Math.sin(this._time * 0.002 + s.phase) * 0.25;
    });

    // Sway moon glow
    const mg = this._moonGlow;
    mg.alpha = 0.5 + Math.sin(this._time * 0.001) * 0.15;
  }

  _drawMoonGlow() {
    const gfx = this._moonGlow;
    gfx.clear();
    gfx.fillStyle(0xF5EDD6, 0.08);
    gfx.fillCircle(680, 70, 55);
    gfx.fillStyle(0xF5EDD6, 0.05);
    gfx.fillCircle(680, 70, 75);
  }

  _drawTitle() {
    const W = this.scale.width;
    // Main title using text with outline effect
    const shadow = this.add.text(W/2 + 2, 136,
      'WARLI', { fontFamily: 'Cinzel, Georgia, serif', fontSize: '64px', color: '#3E2209' }
    ).setOrigin(0.5).setAlpha(0);

    const title = this.add.text(W/2, 134,
      'WARLI', { fontFamily: 'Cinzel, Georgia, serif', fontSize: '64px', color: '#F5EDD6' }
    ).setOrigin(0.5).setAlpha(0);

    const subtitle = this.add.text(W/2, 185,
      'Spirit of the Forest',
      {
        fontFamily: '"Crimson Text", Georgia, serif',
        fontSize: '22px',
        fontStyle: 'italic',
        color: '#E8C84A',
      }
    ).setOrigin(0.5).setAlpha(0);

    // Animate in
    this.tweens.add({ targets: [shadow, title], alpha: 1, duration: 1000, ease: 'Cubic.easeOut' });
    this.tweens.add({ targets: subtitle, alpha: 0.9, duration: 1000, delay: 300, ease: 'Cubic.easeOut' });

    // Gentle float
    this.tweens.add({
      targets: [title, shadow, subtitle],
      y: '-=4',
      duration: 2200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
    });

    // Decorative lines around title
    const deco = this.add.graphics().setAlpha(0);
    deco.lineStyle(1, 0xD4C4A0, 0.6);
    deco.strokeRect(W/2 - 160, 116, 320, 78);
    deco.lineStyle(1, 0xE8C84A, 0.4);
    deco.strokeRect(W/2 - 164, 112, 328, 86);

    // Small diamond ornaments
    deco.fillStyle(0xE8C84A, 0.7);
    [[-164,154],[164,154],[-164,155],[164,155]].forEach(([dx, dy]) => {
      deco.fillTriangle(W/2+dx, dy-6, W/2+dx-5, dy, W/2+dx, dy+6);
    });
    deco.fillTriangle(W/2-164, 155-6, W/2-164-5, 155, W/2-164, 155+6);
    deco.fillTriangle(W/2+164, 155-6, W/2+164+5, 155, W/2+164, 155+6);

    this.tweens.add({ targets: deco, alpha: 1, duration: 800, delay: 400 });
  }

  _drawDancers() {
    // We draw animated Warli dancers using graphics
    this._dancerGfx = this.add.graphics();
    this._dancerPhase = 0;
    this.time.addEvent({
      delay: 80,
      callback: this._animateDancers,
      callbackScope: this,
      loop: true
    });
  }

  _animateDancers() {
    const g = this._dancerGfx;
    g.clear();
    this._dancerPhase += 0.15;

    const positions = [
      { x: 260, mirror: false },
      { x: 310, mirror: true },
      { x: 360, mirror: false },
      { x: 410, mirror: true },
      { x: 460, mirror: false },
      { x: 510, mirror: true },
    ];

    positions.forEach((p, i) => {
      const phase = this._dancerPhase + i * 0.8;
      const bob   = Math.sin(phase) * 3;
      const armUp = Math.sin(phase) > 0;
      this._drawDancerGfx(g, p.x, 300 + bob, armUp, p.mirror);
    });
  }

  _drawDancerGfx(g, x, y, armUp, mirror) {
    const sc = mirror ? -1 : 1;
    g.lineStyle(2, 0xF5EDD6, 0.75);
    g.fillStyle(0xF5EDD6, 0.75);

    // Head
    g.strokeCircle(x, y - 24, 5);

    // Body (triangle)
    const bx = x;
    g.strokeTriangle(bx - 7*sc, y-18, bx + 7*sc, y-18, bx, y-4);

    // Arms
    const ay = y - 16;
    const armY = armUp ? ay - 8 : ay + 4;
    g.strokeLineShape(new Phaser.Geom.Line(bx - 7*sc, ay, bx - 14*sc, armY));
    g.strokeLineShape(new Phaser.Geom.Line(bx + 7*sc, ay, bx + 14*sc, armY));

    // Legs
    g.strokeLineShape(new Phaser.Geom.Line(bx, y-4, bx - 6, y+8));
    g.strokeLineShape(new Phaser.Geom.Line(bx, y-4, bx + 6, y+8));
  }

  _spawnMenuOrbs() {
    for (let i = 0; i < 5; i++) {
      const orb = this.add.image(
        100 + Math.random() * 600,
        220 + Math.random() * 100,
        'orb'
      ).setAlpha(0.3 + Math.random() * 0.3).setScale(0.6);

      this.tweens.add({
        targets: orb,
        x: orb.x + (Math.random() - 0.5) * 200,
        y: orb.y - 60 - Math.random() * 80,
        alpha: 0,
        scale: 0.2,
        duration: 3000 + Math.random() * 2000,
        delay: Math.random() * 2000,
        ease: 'Sine.easeIn',
        onComplete: () => {
          orb.setPosition(100 + Math.random() * 600, 250 + Math.random() * 60);
          orb.setAlpha(0.3 + Math.random() * 0.3).setScale(0.6);
          this.tweens.add({
            targets: orb,
            x: orb.x + (Math.random() - 0.5) * 200,
            y: orb.y - 80,
            alpha: 0, scale: 0.2,
            duration: 3000 + Math.random() * 2000,
            ease: 'Sine.easeIn',
            repeat: -1,
          });
        }
      });
    }
  }

  _startGame() {
    // Transition
    this.cameras.main.fadeOut(600, 62, 34, 9);
    this.time.delayedCall(600, () => {
      this.scene.start('StoryScene', { level: 1, score: 0, health: 3 });
    });
  }
}