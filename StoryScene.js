/* =====================================================
   StoryScene.js
   Animated Warli story panels between levels
   ===================================================== */

class StoryScene extends Phaser.Scene {
  constructor() { super('StoryScene'); }

  init(data) {
    this.level  = data.level  || 1;
    this.score  = data.score  || 0;
    this.health = data.health || 3;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.image(W/2, H/2, 'menu_bg').setDisplaySize(W, H);
    this.add.image(W/2, H/2, 'border').setDisplaySize(W, H);

    const stories = {
      1: {
        title: 'THE VILLAGE OUTSKIRTS',
        panels: [
          {
            text: 'Long ago, the sacred forest was alive with ancient spirits...\nTheir forms danced in the paintings on every mud wall.',
            draw: (g, cx, cy) => this._panelForest(g, cx, cy)
          },
          {
            text: 'One sunrise, a shadow crept through the trees.\nThe village elder\'s eyes grew wide with fear.',
            draw: (g, cx, cy) => this._panelShadow(g, cx, cy)
          },
          {
            text: '"Aru," whispered the wind. "You have been chosen.\nFind the sacred symbols. Restore the balance."',
            draw: (g, cx, cy) => this._panelAru(g, cx, cy)
          }
        ]
      },
      2: {
        title: 'THE SACRED FOREST',
        panels: [
          {
            text: 'Aru entered the heart of the forest.\nThe trees here were older than memory.',
            draw: (g, cx, cy) => this._panelDeepForest(g, cx, cy)
          },
          {
            text: 'Three sun symbols collected. Yet the darkness grows.\nThe spirits call out — their voices like rustling leaves.',
            draw: (g, cx, cy) => this._panelSpirits(g, cx, cy)
          }
        ]
      },
      3: {
        title: 'SPIRIT MOUNTAIN',
        panels: [
          {
            text: 'At last — the summit. The source of all darkness.\nHere, Aru must face the final shadow.',
            draw: (g, cx, cy) => this._panelMountain(g, cx, cy)
          },
          {
            text: 'The spirits chant through the paintings.\n"Collect the last symbol. Heal the forest. Become legend."',
            draw: (g, cx, cy) => this._panelFinal(g, cx, cy)
          }
        ]
      }
    };

    this._panels  = stories[this.level]?.panels || stories[1].panels;
    this._title   = stories[this.level]?.title  || 'THE FOREST CALLS';
    this._current = 0;

    // Title
    this._titleText = this.add.text(W/2, 28, this._title, {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '16px',
      color: '#E8C84A',
      letterSpacing: 4,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets: this._titleText, alpha: 1, duration: 700 });

    // Level label
    this.add.text(W/2, 12, `LEVEL  ${this.level}  ·  STORY`, {
      fontFamily: 'Cinzel, Georgia, serif', fontSize: '9px',
      color: '#7A4E2D', letterSpacing: 6
    }).setOrigin(0.5);

    // Panel illustration area
    this._panelGfx = this.add.graphics();

    // Panel text
    this._panelText = this.add.text(W/2, 320, '', {
      fontFamily: '"Crimson Text", Georgia, serif',
      fontSize: '15px',
      fontStyle: 'italic',
      color: '#D4C4A0',
      align: 'center',
      wordWrap: { width: 520 },
      lineSpacing: 6
    }).setOrigin(0.5).setAlpha(0);

    // Continue prompt
    this._continuePrompt = this.add.text(W/2, 374, '— TAP OR PRESS SPACE TO CONTINUE —', {
      fontFamily: 'Cinzel, Georgia, serif',
      fontSize: '9px', color: '#7A4E2D', letterSpacing: 3
    }).setOrigin(0.5).setAlpha(0);

    this._showPanel(0);

    // Input
    this.input.keyboard.on('keydown-SPACE', () => this._advance());
    this.input.on('pointerdown', () => this._advance());
  }

  _showPanel(idx) {
    const W = this.scale.width;
    const H = this.scale.height;

    if (idx >= this._panels.length) {
      this._launchLevel();
      return;
    }

    const panel = this._panels[idx];

    // Fade out previous
    this.tweens.add({
      targets: [this._panelGfx, this._panelText, this._continuePrompt],
      alpha: 0,
      duration: 300,
      onComplete: () => {
        // Draw illustration
        this._panelGfx.clear();
        // Panel bg
        this._panelGfx.lineStyle(1.5, 0xD4C4A0, 0.4);
        this._panelGfx.fillStyle(0x3E2209, 0.6);
        this._panelGfx.fillRoundedRect(W/2 - 220, 52, 440, 220, 6);
        this._panelGfx.strokeRoundedRect(W/2 - 220, 52, 440, 220, 6);

        // Inner border
        this._panelGfx.lineStyle(1, 0xE8C84A, 0.25);
        this._panelGfx.strokeRoundedRect(W/2 - 212, 58, 424, 208, 4);

        // Call panel draw function
        panel.draw(this._panelGfx, W/2, 160);

        // Panel text
        this._panelText.setText(panel.text);

        // Fade in
        this.tweens.add({
          targets: [this._panelGfx, this._panelText],
          alpha: 1, duration: 500, ease: 'Cubic.easeOut'
        });

        // Continue prompt after delay
        this.time.delayedCall(1200, () => {
          this.tweens.add({
            targets: this._continuePrompt,
            alpha: { from: 0, to: 0.8 },
            duration: 400,
            onComplete: () => {
              this.tweens.add({
                targets: this._continuePrompt,
                alpha: { from: 0.3, to: 0.8 },
                duration: 700, yoyo: true, repeat: -1
              });
            }
          });
        });
      }
    });
  }

  _advance() {
    this._current++;
    this._showPanel(this._current);
  }

  _launchLevel() {
    this.cameras.main.fadeOut(500, 62, 34, 9);
    this.time.delayedCall(500, () => {
      this.scene.start('GameScene', {
        level: this.level,
        score: this.score,
        health: this.health
      });
    });
  }

  /* ── Panel illustration renderers ── */

  _panelForest(g, cx, cy) {
    const chalk = 0xF5EDD6;
    // Trees
    [-160,-80,0,80,160].forEach((dx, i) => {
      const h = 60 + (i%2)*20;
      g.lineStyle(2, chalk, 0.7);
      g.strokeLineShape(new Phaser.Geom.Line(cx+dx, cy+80, cx+dx, cy+80-h));
      // Triangle top
      g.fillStyle(chalk, 0.12);
      g.fillTriangle(cx+dx-18, cy+80-h+20, cx+dx+18, cy+80-h+20, cx+dx, cy+80-h-20);
      g.strokeTriangle(cx+dx-18, cy+80-h+20, cx+dx+18, cy+80-h+20, cx+dx, cy+80-h-20);
    });

    // Ground line
    g.lineStyle(2, chalk, 0.5);
    g.strokeLineShape(new Phaser.Geom.Line(cx-200, cy+80, cx+200, cy+80));

    // Moon
    g.lineStyle(2, chalk, 0.8);
    g.strokeCircle(cx + 150, cy - 60, 18);
    g.fillStyle(chalk, 0.1); g.fillCircle(cx+150, cy-60, 18);
    // crescent
    g.fillStyle(0x3E2209, 0.8); g.fillCircle(cx+158, cy-63, 14);
  }

  _panelShadow(g, cx, cy) {
    const chalk = 0xF5EDD6;

    // Village elder — shocked
    g.lineStyle(2, chalk, 0.85);
    g.strokeCircle(cx - 80, cy - 10, 7);
    // body
    g.strokeTriangle(cx-87, cy-2, cx-73, cy-2, cx-80, cy+14);
    // arms raised in shock
    g.strokeLineShape(new Phaser.Geom.Line(cx-87, cy+2, cx-96, cy-8));
    g.strokeLineShape(new Phaser.Geom.Line(cx-73, cy+2, cx-64, cy-8));
    // legs
    g.strokeLineShape(new Phaser.Geom.Line(cx-80, cy+14, cx-85, cy+26));
    g.strokeLineShape(new Phaser.Geom.Line(cx-80, cy+14, cx-75, cy+26));

    // Shadow entity (dark spirit)
    g.lineStyle(2, 0xAABBFF, 0.7);
    g.fillStyle(0xAABBFF, 0.06);
    g.strokeCircle(cx + 50, cy - 20, 26);
    g.fillCircle(cx+50, cy-20, 26);
    // tendrils
    for (let i = 0; i < 6; i++) {
      const a = (i/6)*Math.PI*2;
      const r = 28 + Math.sin(i)*8;
      g.strokeLineShape(new Phaser.Geom.Line(cx+50, cy-20, cx+50+Math.cos(a)*r, cy-20+Math.sin(a)*r));
    }
    // eyes
    g.fillStyle(0xAABBFF, 0.9);
    g.fillCircle(cx+40, cy-22, 4); g.fillCircle(cx+60, cy-22, 4);
    g.fillStyle(0x3E2209, 1);
    g.fillCircle(cx+42, cy-21, 2.5); g.fillCircle(cx+62, cy-21, 2.5);

    // Ground
    g.lineStyle(1.5, chalk, 0.4);
    g.strokeLineShape(new Phaser.Geom.Line(cx-200, cy+28, cx+200, cy+28));
  }

  _panelAru(g, cx, cy) {
    const chalk = 0xF5EDD6;
    g.lineStyle(2, chalk, 0.9);

    // Aru — hero pose
    g.strokeCircle(cx, cy - 28, 8);
    // Headdress
    g.strokeLineShape(new Phaser.Geom.Line(cx, cy-36, cx-5, cy-46));
    g.strokeLineShape(new Phaser.Geom.Line(cx, cy-36, cx+4, cy-47));
    g.strokeLineShape(new Phaser.Geom.Line(cx, cy-36, cx, cy-48));
    // Body
    g.strokeTriangle(cx-10, cy-18, cx+10, cy-18, cx, cy);
    // Arms raised triumphantly
    g.strokeLineShape(new Phaser.Geom.Line(cx-10, cy-14, cx-22, cy-28));
    g.strokeLineShape(new Phaser.Geom.Line(cx+10, cy-14, cx+22, cy-28));
    // Legs
    g.strokeLineShape(new Phaser.Geom.Line(cx, cy, cx-8, cy+16));
    g.strokeLineShape(new Phaser.Geom.Line(cx, cy, cx+8, cy+16));

    // Sacred sun symbol floating above
    g.lineStyle(2, 0xE8C84A, 0.9);
    g.strokeCircle(cx, cy - 70, 12);
    for (let i = 0; i < 8; i++) {
      const a = (i/8)*Math.PI*2;
      g.strokeLineShape(new Phaser.Geom.Line(
        cx+Math.cos(a)*14, cy-70+Math.sin(a)*14,
        cx+Math.cos(a)*20, cy-70+Math.sin(a)*20
      ));
    }
    g.fillStyle(0xE8C84A, 0.4); g.fillCircle(cx, cy-70, 12);

    // Glow rays
    g.fillStyle(0xE8C84A, 0.08);
    g.fillCircle(cx, cy-70, 30);

    // Ground
    g.lineStyle(1.5, chalk, 0.4);
    g.strokeLineShape(new Phaser.Geom.Line(cx-200, cy+18, cx+200, cy+18));

    // Hut in background
    g.lineStyle(1.5, chalk, 0.35);
    g.strokeRect(cx + 110, cy - 20, 50, 30);
    g.strokeTriangle(cx+106, cy-20, cx+135, cy-46, cx+164, cy-20);
  }

  _panelDeepForest(g, cx, cy) {
    const chalk = 0xF5EDD6;
    g.lineStyle(2, chalk, 0.75);

    // Dense trees
    [-150,-90,-30,30,90,150].forEach((dx, i) => {
      const h = 70 + (i%3)*20;
      const w = 20 + (i%2)*6;
      g.strokeLineShape(new Phaser.Geom.Line(cx+dx, cy+80, cx+dx, cy+80-h));
      g.fillStyle(chalk, 0.07);
      g.fillTriangle(cx+dx-w, cy+80-h+30, cx+dx+w, cy+80-h+30, cx+dx, cy+80-h-16);
      g.strokeTriangle(cx+dx-w, cy+80-h+30, cx+dx+w, cy+80-h+30, cx+dx, cy+80-h-16);
    });

    // Aru small in the forest
    g.lineStyle(2, chalk, 0.9);
    const ax = cx, ay = cy + 36;
    g.strokeCircle(ax, ay-22, 6);
    g.strokeTriangle(ax-8, ay-16, ax+8, ay-16, ax, ay-2);
    g.strokeLineShape(new Phaser.Geom.Line(ax-8, ay-12, ax-16, ay-6));
    g.strokeLineShape(new Phaser.Geom.Line(ax+8, ay-12, ax+16, ay-22));
    g.strokeLineShape(new Phaser.Geom.Line(ax, ay-2, ax-6, ay+10));
    g.strokeLineShape(new Phaser.Geom.Line(ax, ay-2, ax+6, ay+10));

    // Spirits floating
    [[-100,-50],[100,-40],[-60,-20],[80,-10]].forEach(([dx,dy]) => {
      g.lineStyle(1.5, 0xAABBFF, 0.5);
      g.strokeCircle(cx+dx, cy+dy, 8);
      g.fillStyle(0xAABBFF, 0.08);
      g.fillCircle(cx+dx, cy+dy, 12);
    });

    g.lineStyle(1.5, chalk, 0.4);
    g.strokeLineShape(new Phaser.Geom.Line(cx-200, cy+80, cx+200, cy+80));
  }

  _panelSpirits(g, cx, cy) {
    const chalk = 0xF5EDD6;

    // Spirit beings in a circle
    const spirits = 5;
    for (let i = 0; i < spirits; i++) {
      const a = (i/spirits)*Math.PI*2 - Math.PI/2;
      const r = 65;
      const sx = cx + Math.cos(a)*r, sy = cy + Math.sin(a)*r - 10;

      g.lineStyle(2, 0xAABBFF, 0.7);
      g.strokeCircle(sx, sy - 12, 7);
      g.fillStyle(0xAABBFF, 0.08); g.fillCircle(sx, sy-12, 7);
      g.strokeTriangle(sx-7, sy-5, sx+7, sy-5, sx, sy+8);
      g.strokeLineShape(new Phaser.Geom.Line(sx-7, sy-2, sx-14, sy+2));
      g.strokeLineShape(new Phaser.Geom.Line(sx+7, sy-2, sx+14, sy+2));
      g.strokeLineShape(new Phaser.Geom.Line(sx, sy+8, sx-4, sy+18));
      g.strokeLineShape(new Phaser.Geom.Line(sx, sy+8, sx+4, sy+18));
    }

    // Connecting circle
    g.lineStyle(1, 0xE8C84A, 0.3);
    g.strokeCircle(cx, cy - 10, 65);

    // Sun symbol center
    g.lineStyle(2, 0xE8C84A, 0.9);
    g.strokeCircle(cx, cy - 10, 14);
    for (let i = 0; i < 8; i++) {
      const a = (i/8)*Math.PI*2;
      g.strokeLineShape(new Phaser.Geom.Line(
        cx+Math.cos(a)*16, cy-10+Math.sin(a)*16,
        cx+Math.cos(a)*24, cy-10+Math.sin(a)*24
      ));
    }
    g.fillStyle(0xE8C84A, 0.2); g.fillCircle(cx, cy-10, 14);
  }

  _panelMountain(g, cx, cy) {
    const chalk = 0xF5EDD6;
    g.lineStyle(2, chalk, 0.75);

    // Mountain
    g.fillStyle(chalk, 0.06);
    g.fillTriangle(cx, cy - 80, cx - 160, cy + 80, cx + 160, cy + 80);
    g.strokeTriangle(cx, cy - 80, cx - 160, cy + 80, cx + 160, cy + 80);

    // Snow cap
    g.fillStyle(chalk, 0.2);
    g.fillTriangle(cx, cy - 80, cx - 30, cy - 46, cx + 30, cy - 46);
    g.strokeTriangle(cx, cy - 80, cx - 30, cy - 46, cx + 30, cy - 46);

    // Aru climbing
    g.lineStyle(2, chalk, 0.9);
    g.strokeCircle(cx + 40, cy + 10, 6);
    g.strokeTriangle(cx+33, cy+17, cx+47, cy+17, cx+40, cy+28);
    g.strokeLineShape(new Phaser.Geom.Line(cx+33, cy+20, cx+26, cy+14));
    g.strokeLineShape(new Phaser.Geom.Line(cx+47, cy+20, cx+52, cy+12));
    g.strokeLineShape(new Phaser.Geom.Line(cx+40, cy+28, cx+35, cy+40));
    g.strokeLineShape(new Phaser.Geom.Line(cx+40, cy+28, cx+45, cy+40));

    // Dark aura at peak
    g.fillStyle(0x0000BB, 0.15);
    g.fillCircle(cx, cy - 60, 25);
    g.lineStyle(1.5, 0xAABBFF, 0.4);
    g.strokeCircle(cx, cy-60, 25);
  }

  _panelFinal(g, cx, cy) {
    const chalk = 0xF5EDD6;

    // Warli painting on a wall (meta!)
    g.lineStyle(2, chalk, 0.8);

    // Framed "painting"
    g.strokeRect(cx - 140, cy - 72, 280, 155);
    g.lineStyle(1, 0xE8C84A, 0.3);
    g.strokeRect(cx - 134, cy - 66, 268, 143);

    // Scene inside: Aru with sun + all spirits dancing
    const spirits = 6;
    for (let i = 0; i < spirits; i++) {
      const a = (i/spirits)*Math.PI*2;
      const sr = 70, sx = cx + Math.cos(a)*sr, sy = cy + Math.sin(a)*sr;
      g.lineStyle(1.5, chalk, 0.6);
      g.strokeCircle(sx, sy, 5);
      g.strokeTriangle(sx-5, sy+5, sx+5, sy+5, sx, sy+14);
    }

    // Central Aru — hero
    g.lineStyle(2.5, chalk, 1);
    g.strokeCircle(cx, cy - 6, 9);
    g.strokeTriangle(cx-10, cy+4, cx+10, cy+4, cx, cy+20);
    g.strokeLineShape(new Phaser.Geom.Line(cx-10, cy+8, cx-20, cy-2));
    g.strokeLineShape(new Phaser.Geom.Line(cx+10, cy+8, cx+20, cy-2));
    g.strokeLineShape(new Phaser.Geom.Line(cx, cy+20, cx-7, cy+34));
    g.strokeLineShape(new Phaser.Geom.Line(cx, cy+20, cx+7, cy+34));

    // Radiant sun above
    g.lineStyle(2, 0xE8C84A, 1);
    g.strokeCircle(cx, cy - 44, 14);
    g.fillStyle(0xE8C84A, 0.3); g.fillCircle(cx, cy-44, 14);
    for (let i = 0; i < 12; i++) {
      const a = (i/12)*Math.PI*2;
      g.strokeLineShape(new Phaser.Geom.Line(
        cx+Math.cos(a)*16, cy-44+Math.sin(a)*16,
        cx+Math.cos(a)*22, cy-44+Math.sin(a)*22
      ));
    }
    g.fillStyle(0xE8C84A, 0.1); g.fillCircle(cx, cy-44, 28);
  }
}