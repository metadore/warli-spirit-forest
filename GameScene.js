/* =====================================================
   GameScene.js
   Main side-scrolling runner gameplay
   ===================================================== */

class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  init(data) {
    this.level       = data.level  || 1;
    this.score       = data.score  || 0;
    this.health      = data.health || 3;
    this.levelConfig = this._getLevelConfig(this.level);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this._gameOver = false;
    this._paused   = false;

    // ── BACKGROUND ──────────────────────────────────
    this.add.image(W/2, H/2, 'mud_bg').setDisplaySize(W, H);

    // Parallax layers (tiling sprites)
    this._farBg  = this.add.tileSprite(0, 0, W, H, 'far_layer').setOrigin(0,0);
    this._midBg  = this.add.tileSprite(0, 0, W, H, 'mid_layer').setOrigin(0,0);

    // Border overlay
    this.add.image(W/2, H/2, 'border').setDisplaySize(W, H).setDepth(10);

    // Level name
    this._levelLabel = this.add.text(W/2, 20,
      `LEVEL ${this.level} · ${this.levelConfig.name.toUpperCase()}`,
      { fontFamily: 'Cinzel, Georgia, serif', fontSize: '10px', color: '#E8C84A', letterSpacing: 3 }
    ).setOrigin(0.5).setDepth(11).setAlpha(0.8);

    // ── GROUND ──────────────────────────────────────
    const GROUND_Y = H - 40;
    this._groundTile = this.add.tileSprite(0, GROUND_Y, W, 40, 'ground').setOrigin(0,0);

    // Physics static group for ground
    this._ground = this.physics.add.staticGroup();
    const groundBody = this._ground.create(W/2, GROUND_Y + 20, null);
    groundBody.setVisible(false).setSize(W, 40);

    // ── PLAYER ──────────────────────────────────────
    this._createPlayer(GROUND_Y);

    // ── GROUPS ──────────────────────────────────────
    this._obstacles   = this.physics.add.group();
    this._collectibles = this.physics.add.group();
    this._decorations = this.add.group();

    // ── COLLISIONS ──────────────────────────────────
    this.physics.add.collider(this._player, this._ground);
    this.physics.add.collider(this._obstacles, this._ground);
    this.physics.add.overlap(this._player, this._obstacles,   this._hitObstacle, null, this);
    this.physics.add.overlap(this._player, this._collectibles, this._collectSymbol, null, this);

    // ── PARTICLE EMITTER ────────────────────────────
    this._particles = this.add.particles(0, 0, 'particle', {
      speed: { min: 40, max: 120 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 600,
      quantity: 8,
      emitting: false
    });

    // ── UI ──────────────────────────────────────────
    this._createUI(W, H);

    // ── SPAWN TIMERS ────────────────────────────────
    this._spawnTimer       = 0;
    this._collectibleTimer = 0;
    this._decorTimer       = 0;
    this._diffTimer        = 0;
    this._speed            = this.levelConfig.speed;
    this._spawnInterval    = this.levelConfig.spawnInterval;

    // ── CONTROLS ────────────────────────────────────
    this._cursors = this.input.keyboard.createCursorKeys();
    this._spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.input.on('pointerdown', () => this._jump());

    // ── ANIMATION VARS ──────────────────────────────
    this._animFrame  = 0;
    this._animTimer  = 0;
    this._isJumping  = false;
    this._isHurt     = false;
    this._hurtTimer  = 0;
    this._runCycle   = 0;

    // ── INVINCIBILITY FRAMES ────────────────────────
    this._invincible = false;

    // ── SCORE TWEEN ─────────────────────────────────
    this._displayScore = this.score;

    // Fade in
    this.cameras.main.fadeIn(400, 62, 34, 9);

    // Spawn initial decoration
    this._spawnDecoration();
  }

  /* ──────────────────────────────────────────────── */
  _getLevelConfig(level) {
    const configs = {
      1: { name: 'Village Outskirts', speed: 180,  spawnInterval: 2200, obstacleTypes: ['stone','tree'],              collectibles: ['sun','grain'], bgSpeed: [0.08, 0.2] },
      2: { name: 'Sacred Forest',     speed: 230,  spawnInterval: 1800, obstacleTypes: ['stone','spirit','tree'],      collectibles: ['sun','grain','orb'], bgSpeed: [0.12, 0.3] },
      3: { name: 'Spirit Mountain',   speed: 290,  spawnInterval: 1400, obstacleTypes: ['stone','spirit','double'],   collectibles: ['sun','orb'],   bgSpeed: [0.18, 0.45] },
    };
    return configs[level] || configs[1];
  }

  /* ──────────────────────────────────────────────── */
  _createPlayer(groundY) {
    this._player = this.physics.add.sprite(120, groundY - 28, 'player', 0);
    this._player.setDisplaySize(44, 58);
    this._player.setDepth(5);
    this._player.body.setSize(24, 52);
    this._player.body.setOffset(12, 6);
    this._player.setGravityY(200);
  }

  _jump() {
    if (this._gameOver || this._paused) return;
    if (this._player.body.blocked.down) {
      this._player.setVelocityY(-560);
      this._isJumping = true;
      // Jump SFX placeholder (no audio assets — visual feedback)
    }
  }

  /* ──────────────────────────────────────────────── */
  _createUI(W, H) {
    // Score
    this._scoreLabel = this.add.text(16, 14, 'SYMBOLS', {
      fontFamily: 'Cinzel, Georgia, serif', fontSize: '9px', color: '#7A4E2D'
    }).setDepth(11);
    this._scoreText = this.add.text(16, 24, `${this.score}`, {
      fontFamily: 'Cinzel, Georgia, serif', fontSize: '20px', color: '#E8C84A'
    }).setDepth(11);

    // Health hearts
    this._hearts = [];
    for (let i = 0; i < 3; i++) {
      const h = this.add.image(W - 26 - i * 30, 22, 'heart').setDepth(11);
      this._hearts.unshift(h);
    }

    // Progress bar
    this._progressBg = this.add.graphics().setDepth(11);
    this._progressBg.lineStyle(1, 0x7A4E2D, 0.6);
    this._progressBg.strokeRect(W/2 - 100, 10, 200, 6);
    this._progressFill = this.add.graphics().setDepth(11);
    this._progressPct  = 0;

    // Collect flash
    this._flashText = this.add.text(W/2, H/2 - 40, '', {
      fontFamily: 'Cinzel, Georgia, serif', fontSize: '18px', color: '#E8C84A'
    }).setOrigin(0.5).setDepth(12).setAlpha(0);
  }

  _updateUI() {
    const W = this.scale.width;
    this._scoreText.setText(`${this.score}`);

    // Hearts
    this._hearts.forEach((h, i) => {
      h.setAlpha(i < this.health ? 1 : 0.2);
    });

    // Progress (time-based, 60 seconds per level)
    this._progressFill.clear();
    const pct = Math.min(this._diffTimer / 60000, 1);
    if (pct > 0) {
      this._progressFill.fillStyle(0xE8C84A, 0.7);
      this._progressFill.fillRect(W/2 - 100, 10, 200 * pct, 6);
    }

    if (pct >= 1 && !this._levelComplete) {
      this._levelComplete = true;
      this._completeLevel();
    }
  }

  /* ──────────────────────────────────────────────── */
  update(time, delta) {
    if (this._gameOver || this._paused) return;

    // ── TIMERS ──
    this._spawnTimer       += delta;
    this._collectibleTimer += delta;
    this._decorTimer       += delta;
    this._diffTimer        += delta;

    // ── PARALLAX SCROLL ──
    const cfg = this.levelConfig;
    this._farBg.tilePositionX  += cfg.bgSpeed[0] * this._speed * delta / 1000 * 60;
    this._midBg.tilePositionX  += cfg.bgSpeed[1] * this._speed * delta / 1000 * 60;
    this._groundTile.tilePositionX += this._speed * delta / 1000;

    // ── PLAYER ANIMATION ──
    this._animTimer += delta;
    if (this._animTimer > 100) {
      this._animTimer = 0;
      this._updatePlayerAnim();
    }

    // ── JUMP INPUT ──
    if (Phaser.Input.Keyboard.JustDown(this._spaceKey) ||
        Phaser.Input.Keyboard.JustDown(this._cursors.up)) {
      this._jump();
    }

    // ── HURT TIMER ──
    if (this._isHurt) {
      this._hurtTimer -= delta;
      if (this._hurtTimer <= 0) {
        this._isHurt = false;
        this._player.clearTint();
      }
    }

    // ── SPAWN OBSTACLES ──
    if (this._spawnTimer >= this._spawnInterval) {
      this._spawnTimer = 0;
      this._spawnObstacle();
    }

    // ── SPAWN COLLECTIBLES ──
    if (this._collectibleTimer >= 1400) {
      this._collectibleTimer = 0;
      if (Math.random() < 0.65) this._spawnCollectible();
    }

    // ── SPAWN DECORATION ──
    if (this._decorTimer >= 3000) {
      this._decorTimer = 0;
      this._spawnDecoration();
    }

    // ── MOVE OBSTACLES & COLLECTIBLES ──
    this._obstacles.getChildren().forEach(obs => {
      obs.x -= this._speed * delta / 1000;
      if (obs.x < -60) obs.destroy();
    });

    this._collectibles.getChildren().forEach(col => {
      col.x -= this._speed * delta / 1000;
      col.y += Math.sin(time * 0.003 + col._phase) * 0.5;
      if (col.x < -40) col.destroy();
    });

    this._decorations.getChildren().forEach(d => {
      d.x -= this._speed * delta / 1000 * 0.6;
      if (d.x < -60) d.destroy();
    });

    // ── DIFFICULTY RAMP ──
    if (this._diffTimer > 8000) {
      this._speed = Math.min(
        this.levelConfig.speed * 2,
        this._speed + 0.3 * delta / 1000 * 20
      );
      this._spawnInterval = Math.max(
        this.levelConfig.spawnInterval * 0.5,
        this._spawnInterval - 0.5 * delta / 1000 * 10
      );
    }

    // ── UI ──
    this._updateUI();
  }

  /* ──────────────────────────────────────────────── */
  _updatePlayerAnim() {
    const onGround = this._player.body.blocked.down;

    if (!onGround) {
      // Jump frame
      this._player.setFrame(4 + (this._runCycle % 2));
    } else if (this._isHurt) {
      this._player.setFrame(6);
    } else {
      // Run cycle: frames 0-3
      this._runCycle = (this._runCycle + 1) % 4;
      this._player.setFrame(this._runCycle);
    }

    if (onGround) this._isJumping = false;
  }

  /* ──────────────────────────────────────────────── */
  _spawnObstacle() {
    const W = this.scale.width;
    const H = this.scale.height;
    const GROUND_Y = H - 40;

    const types = this.levelConfig.obstacleTypes;
    const type  = types[Math.floor(Math.random() * types.length)];

    if (type === 'double') {
      // Two stones close together
      [0, 60].forEach(offset => {
        const obs = this._obstacles.create(W + 40 + offset, GROUND_Y - 18, 'stone');
        obs.setDisplaySize(40, 32).setDepth(4);
        obs.body.setSize(36, 28);
        obs.body.allowGravity = false;
        obs.setImmovable(true);
      });
      return;
    }

    let key, w, h, y;
    switch (type) {
      case 'stone':
        key = 'stone'; w = 40; h = 32; y = GROUND_Y - 16; break;
      case 'spirit':
        key = 'spirit_obs'; w = 36; h = 54; y = GROUND_Y - 28; break;
      case 'tree':
        // Low branch / root — a tree used as obstacle
        key = 'tree'; w = 44; h = 72; y = GROUND_Y - 38;
        // 30% chance of low obstacle (must duck — but we use jump)
        break;
      default:
        key = 'stone'; w = 40; h = 32; y = GROUND_Y - 16;
    }

    const obs = this._obstacles.create(W + 50, y, key);
    obs.setDisplaySize(w, h).setDepth(4);
    obs.body.setSize(w - 10, h - 6);
    obs.body.allowGravity = false;
    obs.setImmovable(true);
  }

  _spawnCollectible() {
    const W = this.scale.width;
    const H = this.scale.height;
    const GROUND_Y = H - 40;

    const types = this.levelConfig.collectibles;
    const type  = types[Math.floor(Math.random() * types.length)];

    let key, w, h, points;
    switch (type) {
      case 'sun':   key = 'sun';   w = 32; h = 32; points = 10; break;
      case 'grain': key = 'grain'; w = 24; h = 30; points = 5;  break;
      case 'orb':   key = 'orb';   w = 28; h = 28; points = 20; break;
      default:      key = 'sun';   w = 32; h = 32; points = 10;
    }

    // Vary height: ground level or floating
    const floating = Math.random() < 0.5;
    const y = floating
      ? GROUND_Y - 90 - Math.random() * 60
      : GROUND_Y - 26;

    const col = this._collectibles.create(W + 40, y, key);
    col.setDisplaySize(w, h).setDepth(4);
    col.body.allowGravity = false;
    col._points = points;
    col._phase  = Math.random() * Math.PI * 2;
  }

  _spawnDecoration() {
    const W = this.scale.width;
    const H = this.scale.height;
    const GROUND_Y = H - 40;

    // Background tree or hut for depth
    const isHut = Math.random() < 0.3;
    const gfx = this.add.graphics().setDepth(2);
    gfx.lineStyle(1.5, 0xF5EDD6, 0.22);

    const x = W + 80;
    const y = GROUND_Y - 5;

    if (isHut) {
      gfx.strokeRect(x - 18, y - 40, 36, 38);
      gfx.strokeTriangle(x - 22, y - 40, x, y - 64, x + 22, y - 40);
      gfx.strokeRect(x - 5, y - 20, 10, 18);
    } else {
      gfx.strokeLineShape(new Phaser.Geom.Line(x, y, x, y - 50));
      gfx.strokeTriangle(x - 16, y - 30, x + 16, y - 30, x, y - 56);
    }

    gfx.x = x;
    this._decorations.add(gfx);
  }

  /* ──────────────────────────────────────────────── */
  _hitObstacle(player, obstacle) {
    if (this._invincible || this._gameOver) return;

    this.health--;
    this._invincible = true;
    this._isHurt = true;
    this._hurtTimer = 400;
    this._player.setTint(0xFF6644);

    // Screen shake
    this.cameras.main.shake(200, 0.012);

    // Invincibility window
    this.time.delayedCall(1200, () => {
      this._invincible = false;
      this._player.clearTint();
    });

    // Flash
    this._showFlash('✦ SPIRIT STRIKES!', 0xFF6644);

    // Blink player
    let blinks = 0;
    const blinkTimer = this.time.addEvent({
      delay: 120,
      callback: () => {
        this._player.setAlpha(this._player.alpha < 1 ? 1 : 0.3);
        blinks++;
        if (blinks >= 10) {
          blinkTimer.destroy();
          this._player.setAlpha(1);
        }
      },
      repeat: 9
    });

    obstacle.destroy();

    if (this.health <= 0) {
      this._triggerGameOver();
    }
  }

  _collectSymbol(player, collectible) {
    const points = collectible._points || 10;
    this.score += points;

    // Particle burst at collection point
    this._particles.setPosition(collectible.x, collectible.y);
    this._particles.explode(10);

    // Flash text
    const msgs = {
      10: ['✦ SUN BLESSED!', '✦ SACRED LIGHT!'],
      5:  ['✦ GRAIN GATHERED!', '✦ FOREST GIFT!'],
      20: ['✦ SPIRIT FREED!', '✦ ANCIENT POWER!']
    };
    const pool = msgs[points] || msgs[10];
    this._showFlash(pool[Math.floor(Math.random() * pool.length)], 0xE8C84A);

    // Score pop animation
    this.tweens.add({
      targets: this._scoreText,
      scaleX: 1.4, scaleY: 1.4,
      duration: 100,
      yoyo: true,
      ease: 'Cubic.easeOut'
    });

    collectible.destroy();
  }

  _showFlash(msg, color) {
    const c = Phaser.Display.Color.IntegerToColor(color);
    this._flashText.setText(msg);
    this._flashText.setColor(Phaser.Display.Color.RGBToString(c.r, c.g, c.b));
    this._flashText.setAlpha(1).setScale(1);
    this.tweens.add({
      targets: this._flashText,
      alpha: 0, y: this._flashText.y - 30, scaleX: 1.2, scaleY: 1.2,
      duration: 900, ease: 'Cubic.easeOut',
      onComplete: () => {
        this._flashText.y = this.scale.height / 2 - 40;
        this._flashText.setScale(1);
      }
    });
  }

  /* ──────────────────────────────────────────────── */
  _triggerGameOver() {
    if (this._gameOver) return;
    this._gameOver = true;

    // Final shake
    this.cameras.main.shake(400, 0.02);

    // Dim
    this.time.delayedCall(600, () => {
      this.cameras.main.fadeOut(700, 62, 34, 9);
      this.time.delayedCall(700, () => {
        this.scene.start('GameOverScene', {
          score: this.score,
          level: this.level,
          win: false
        });
      });
    });
  }

  _completeLevel() {
    this._gameOver = true;

    // Victory flash
    this._showFlash('✦ LEVEL COMPLETE ✦', 0xE8C84A);

    this.cameras.main.flash(400, 245, 237, 214, false);

    this.time.delayedCall(1400, () => {
      this.cameras.main.fadeOut(500, 62, 34, 9);
      this.time.delayedCall(500, () => {
        if (this.level < 3) {
          this.scene.start('StoryScene', {
            level: this.level + 1,
            score: this.score,
            health: Math.min(3, this.health + 1)
          });
        } else {
          // Game complete!
          this.scene.start('GameOverScene', {
            score: this.score,
            level: this.level,
            win: true
          });
        }
      });
    });
  }
}