/* =====================================================
   GameOverScene.js
   Game over / victory screen
   ===================================================== */

class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }

  init(data) {
    this.score  = data.score || 0;
    this.level  = data.level || 1;
    this.win    = data.win   || false;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.image(W/2, H/2, 'menu_bg').setDisplaySize(W, H);
    this.add.image(W/2, H/2, 'border').setDisplaySize(W, H);

    if (this.win) {
      this._createVictoryScreen(W, H);
    } else {
      this._createGameOverScreen(W, H);
    }

    // Floating orbs
    for (let i = 0; i < 4; i++) {
      const orb = this.add.image(
        100 + Math.random() * 600, 280 + Math.random() * 80, 'orb'
      ).setAlpha(0.25).setScale(0.5);

      this.tweens.add({
        targets: orb,
        y: orb.y - 70 - Math.random() * 50,
        alpha: 0, scale: 0.15,
        duration: 3500 + Math.random() * 1500,
        ease: 'Sine.easeIn',
        repeat: -1,
        delay: Math.random() * 2000,
        onRepeat: () => {
          orb.y = 300 + Math.random() * 60;
          orb.setAlpha(0.25);
          orb.setScale(0.5);
        }
      });
    }

    // Input
    this.input.keyboard.on('keydown-SPACE', () => this._restart());
    this.input.on('pointerdown', () => this._restart());
  }

  _createGameOverScreen(W, H) {
    // Dark overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x1A0A02, 0.65);
    overlay.fillRect(0, 0, W, H);

    // Title
    const shadow = this.add.text(W/2 + 2, H/2 - 102,
      'THE FOREST FELL SILENT',
      { fontFamily: 'Cinzel, Georgia, serif', fontSize: '26px', color: '#1A0A02' }
    ).setOrigin(0.5).setAlpha(0);

    const title = this.add.text(W/2, H/2 - 104,
      'THE FOREST FELL SILENT',
      { fontFamily: 'Cinzel, Georgia, serif', fontSize: '26px', color: '#F5EDD6' }
    ).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [shadow, title], alpha: 1, duration: 1000 });

    // Subtitle
    const sub = this.add.text(W/2, H/2 - 68,
      'The spirits retreated into the paintings...',
      { fontFamily: '"Crimson Text", Georgia, serif', fontStyle: 'italic', fontSize: '14px', color: '#A0673A' }
    ).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: sub, alpha: 0.9, duration: 800, delay: 400 });

    // Sad Aru figure
    const gfx = this.add.graphics().setAlpha(0);
    this._drawSadAru(gfx, W/2, H/2 + 10);
    this.tweens.add({ targets: gfx, alpha: 1, duration: 800, delay: 300 });

    // Score
    const scoreLabel = this.add.text(W/2, H/2 + 80,
      'SYMBOLS  GATHERED',
      { fontFamily: 'Cinzel, Georgia, serif', fontSize: '10px', color: '#7A4E2D', letterSpacing: 3 }
    ).setOrigin(0.5).setAlpha(0);

    const scoreText = this.add.text(W/2, H/2 + 100,
      `${this.score}`,
      { fontFamily: 'Cinzel, Georgia, serif', fontSize: '36px', color: '#E8C84A' }
    ).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [scoreLabel, scoreText], alpha: 1, duration: 600, delay: 700 });

    // Restart
    const restart = this.add.text(W/2, H - 42,
      '— PRESS  SPACE  TO  TRY  AGAIN —',
      { fontFamily: 'Cinzel, Georgia, serif', fontSize: '11px', color: '#D4C4A0', letterSpacing: 3 }
    ).setOrigin(0.5).setAlpha(0);

    this.time.delayedCall(1200, () => {
      this.tweens.add({
        targets: restart,
        alpha: { from: 0.3, to: 0.9 },
        duration: 700, yoyo: true, repeat: -1
      });
    });
  }

  _createVictoryScreen(W, H) {
    // Golden glow
    const glow = this.add.graphics();
    glow.fillStyle(0xE8C84A, 0.08);
    glow.fillRect(0, 0, W, H);

    // Victory title
    const shadow = this.add.text(W/2 + 2, H/2 - 128,
      'THE FOREST IS RESTORED',
      { fontFamily: 'Cinzel, Georgia, serif', fontSize: '26px', color: '#3E2209' }
    ).setOrigin(0.5).setAlpha(0);

    const title = this.add.text(W/2, H/2 - 130,
      'THE FOREST IS RESTORED',
      { fontFamily: 'Cinzel, Georgia, serif', fontSize: '26px', color: '#E8C84A' }
    ).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [shadow, title], alpha: 1, duration: 1000 });

    const sub = this.add.text(W/2, H/2 - 92,
      'Aru\'s legend is painted on every wall of the village...',
      { fontFamily: '"Crimson Text", Georgia, serif', fontStyle: 'italic', fontSize: '14px', color: '#D4C4A0' }
    ).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: sub, alpha: 0.9, duration: 800, delay: 400 });

    // Celebration scene
    const gfx = this.add.graphics().setAlpha(0);
    this._drawVictoryScene(gfx, W/2, H/2 + 10);
    this.tweens.add({ targets: gfx, alpha: 1, duration: 900, delay: 300 });

    // Dancing celebration
    this._victGfx = this.add.graphics();
    this._victPhase = 0;
    this.time.addEvent({
      delay: 80, callback: () => {
        this._victGfx.clear();
        this._victPhase += 0.15;
        const positions = [-90, -50, 0, 50, 90];
        positions.forEach((dx, i) => {
          const bob = Math.sin(this._victPhase + i * 0.9) * 4;
          const armUp = Math.sin(this._victPhase + i) > 0;
          this._drawFigure(this._victGfx, W/2 + dx, H/2 + 80 + bob, armUp);
        });
      },
      loop: true
    });

    // Score
    const scoreLabel = this.add.text(W/2, H/2 + 110,
      'TOTAL  SYMBOLS  GATHERED',
      { fontFamily: 'Cinzel, Georgia, serif', fontSize: '9px', color: '#7A4E2D', letterSpacing: 3 }
    ).setOrigin(0.5).setAlpha(0);

    const scoreText = this.add.text(W/2, H/2 + 128,
      `${this.score}`,
      { fontFamily: 'Cinzel, Georgia, serif', fontSize: '40px', color: '#E8C84A' }
    ).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: [scoreLabel, scoreText], alpha: 1, duration: 600, delay: 700 });

    // Restart
    const restart = this.add.text(W/2, H - 38,
      '— PRESS  SPACE  TO  PLAY  AGAIN —',
      { fontFamily: 'Cinzel, Georgia, serif', fontSize: '11px', color: '#E8C84A', letterSpacing: 3 }
    ).setOrigin(0.5).setAlpha(0);

    this.time.delayedCall(1400, () => {
      this.tweens.add({
        targets: restart,
        alpha: { from: 0.3, to: 1 },
        duration: 700, yoyo: true, repeat: -1
      });
    });

    // Particle rain
    const particles = this.add.particles(0, 0, 'particle', {
      x: { min: 0, max: W },
      y: -10,
      speedY: { min: 40, max: 100 },
      speedX: { min: -20, max: 20 },
      scale: { start: 0.6, end: 0.1 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 3000,
      quantity: 2,
      frequency: 60,
      emitting: true
    });
  }

  _drawSadAru(g, cx, cy) {
    g.lineStyle(2, 0xF5EDD6, 0.8);
    // Head, drooping
    g.strokeCircle(cx, cy - 28, 8);
    // Body slumped
    g.strokeTriangle(cx-9, cy-18, cx+9, cy-18, cx, cy-2);
    // Arms down
    g.strokeLineShape(new Phaser.Geom.Line(cx-9, cy-14, cx-18, cy-8));
    g.strokeLineShape(new Phaser.Geom.Line(cx+9, cy-14, cx+18, cy-8));
    // Sitting legs
    g.strokeLineShape(new Phaser.Geom.Line(cx, cy-2, cx-12, cy+12));
    g.strokeLineShape(new Phaser.Geom.Line(cx, cy-2, cx+12, cy+12));
    // Tear
    g.lineStyle(1, 0xAABBFF, 0.7);
    g.strokeLineShape(new Phaser.Geom.Line(cx+4, cy-22, cx+4, cy-14));
    // Dark cloud above
    g.lineStyle(1.5, 0xAABBFF, 0.3);
    g.strokeCircle(cx-10, cy-52, 12);
    g.strokeCircle(cx+2, cy-56, 14);
    g.strokeCircle(cx+14, cy-52, 12);
  }

  _drawVictoryScene(g, cx, cy) {
    // Sun burst
    g.lineStyle(2, 0xE8C84A, 0.9);
    g.strokeCircle(cx, cy - 64, 18);
    g.fillStyle(0xE8C84A, 0.2); g.fillCircle(cx, cy-64, 18);
    for (let i = 0; i < 12; i++) {
      const a = (i/12)*Math.PI*2;
      g.strokeLineShape(new Phaser.Geom.Line(
        cx+Math.cos(a)*20, cy-64+Math.sin(a)*20,
        cx+Math.cos(a)*32, cy-64+Math.sin(a)*32
      ));
    }
    g.fillStyle(0xE8C84A, 0.06); g.fillCircle(cx, cy-64, 45);

    // Trees restored — bright
    [-120, -60, 60, 120].forEach(dx => {
      g.lineStyle(2, 0xF5EDD6, 0.7);
      g.strokeLineShape(new Phaser.Geom.Line(cx+dx, cy+60, cx+dx, cy+10));
      g.fillStyle(0xF5EDD6, 0.1);
      g.fillTriangle(cx+dx-14, cy+16, cx+dx+14, cy+16, cx+dx, cy-8);
      g.strokeTriangle(cx+dx-14, cy+16, cx+dx+14, cy+16, cx+dx, cy-8);
    });
  }

  _drawFigure(g, x, y, armUp) {
    g.lineStyle(2, 0xF5EDD6, 0.8);
    g.strokeCircle(x, y - 20, 5);
    g.strokeTriangle(x-6, y-14, x+6, y-14, x, y-2);
    const armY = armUp ? y - 18 : y - 10;
    g.strokeLineShape(new Phaser.Geom.Line(x-6, y-12, x-14, armY));
    g.strokeLineShape(new Phaser.Geom.Line(x+6, y-12, x+14, armY));
    g.strokeLineShape(new Phaser.Geom.Line(x, y-2, x-6, y+10));
    g.strokeLineShape(new Phaser.Geom.Line(x, y-2, x+6, y+10));
  }

  _restart() {
    this.cameras.main.fadeOut(500, 62, 34, 9);
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}