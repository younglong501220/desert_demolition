import { 
  GameMode, 
  GameState, 
  CoyoteEntity, 
  RoadRunnerEntity, 
  Platform, 
  AcmeItem, 
  Obstacle, 
  ActiveTnt, 
  ActiveSpring, 
  Particle, 
  SpeechPop, 
  Tumbleweed, 
  LevelConfig 
} from './types';
import { LEVELS, createProceduralChunk } from './levels';
import { sound } from './sound';

const SIGN_TEXTS = [
  'HELP!',
  'YIKES!',
  'MOTHER?',
  'OH DEAR!',
  'OOPS...',
  'WHY ME?!',
  'ACME WARRANTY?',
  'GOODBYE WORLD!'
];

export class GameEngine {
  public state: GameState = 'MENU';
  public mode: GameMode = 'story';
  public currentLevelIndex: number = 0;
  public score: number = 0;
  public highScore: number = 0;
  public combo: number = 1;
  public comboTimer: number = 0;

  // Camera
  public cameraX: number = 0;
  public screenShake: number = 0;

  // Iris transition ('That's All Folks!' circle wipe)
  public irisRadius: number = 1; // 1 = fully open, 0 = closed
  public irisTarget: number = 1;
  public irisSpeed: number = 0.03;

  // Entities
  public coyote!: CoyoteEntity;
  public roadRunner!: RoadRunnerEntity;
  public platforms: Platform[] = [];
  public items: AcmeItem[] = [];
  public obstacles: Obstacle[] = [];
  public activeTnts: ActiveTnt[] = [];
  public activeSprings: ActiveSpring[] = [];
  public particles: Particle[] = [];
  public speechPops: SpeechPop[] = [];
  public tumbleweeds: Tumbleweed[] = [];

  // Procedural tracking for endless mode
  private endlessMaxX: number = 0;
  private endlessChunkIndex: number = 0;

  // Timing
  private lastTime: number = 0;
  private animId: number | null = null;
  private tickCount: number = 0;

  // Callbacks
  public onStateChange?: (state: GameState) => void;
  public onScoreChange?: (score: number, combo: number) => void;
  public onDistanceChange?: (distance: number, percent: number) => void;
  public onInventoryChange?: (fuel: number, tnt: number, springs: number) => void;

  constructor() {
    try {
      const stored = localStorage.getItem('desert_high_score');
      if (stored) this.highScore = parseInt(stored, 10) || 0;
    } catch {}
    this.resetLevel(0, 'story');
  }

  public getCurrentLevel(): LevelConfig {
    return LEVELS[this.currentLevelIndex % LEVELS.length];
  }

  public getDistanceToRoadRunner(): number {
    return Math.max(0, Math.round(this.roadRunner.x - this.coyote.x));
  }

  public getLevelLength(): number {
    if (this.mode === 'endless') return 10000;
    return this.getCurrentLevel().length;
  }

  public resetLevel(levelIndex: number = 0, mode: GameMode = this.mode): void {
    this.mode = mode;
    this.currentLevelIndex = levelIndex;
    const level = this.getCurrentLevel();

    this.coyote = {
      x: 100,
      y: 280,
      w: 42,
      h: 56,
      vx: 0,
      vy: 0,
      facing: 1,
      grounded: true,
      actionState: 'idle',
      rocketFuel: 100,
      isRocketing: false,
      tntCount: 3,
      springsCount: 3,
      cliffHangTimer: 0,
      cliffSignText: 'HELP!',
      squashTimer: 0,
      burnTimer: 0,
      invulnerableTimer: 0,
      animFrame: 0
    };

    this.roadRunner = {
      x: 650,
      y: 288,
      w: 48,
      h: 52,
      vx: level.roadRunnerBaseSpeed,
      vy: 0,
      facing: 1,
      feetSpin: 0,
      tauntTimer: 0,
      isBeeping: false,
      peckingTimer: 0,
      animFrame: 0
    };

    if (mode === 'endless') {
      this.platforms = [];
      this.items = [];
      this.obstacles = [];
      this.endlessMaxX = 0;
      this.endlessChunkIndex = 0;

      // Seed first 4 chunks
      for (let i = 0; i < 4; i++) {
        const chunk = createProceduralChunk(this.endlessMaxX, this.endlessChunkIndex++);
        this.platforms.push(...chunk.platforms);
        this.items.push(...chunk.items);
        this.obstacles.push(...chunk.obstacles);
        this.endlessMaxX += 800;
      }
    } else {
      // Deep copy level data
      this.platforms = JSON.parse(JSON.stringify(level.platforms));
      this.items = JSON.parse(JSON.stringify(level.items));
      this.obstacles = JSON.parse(JSON.stringify(level.obstacles));
    }

    this.activeTnts = [];
    this.activeSprings = [];
    this.particles = [];
    this.speechPops = [];
    this.tumbleweeds = [
      { x: 300, y: 330, vx: -1.5, vy: 0, size: 24, rot: 0 },
      { x: 900, y: 330, vx: -2.2, vy: 0, size: 28, rot: 0 }
    ];

    this.cameraX = 0;
    this.screenShake = 0;
    this.irisRadius = 1;
    this.irisTarget = 1;

    this.updateCallbacks();
  }

  public startStoryGame(): void {
    this.score = 0;
    this.combo = 1;
    this.resetLevel(0, 'story');
    this.setState('PLAYING');
    sound.enableAudio();
    this.spawnSpeechPop(this.coyote.x, this.coyote.y - 30, 'CHASE IS ON!', '#ffeb3b');
  }

  public startEndlessGame(): void {
    this.score = 0;
    this.combo = 1;
    this.resetLevel(0, 'endless');
    this.setState('PLAYING');
    sound.enableAudio();
    this.spawnSpeechPop(this.coyote.x, this.coyote.y - 30, 'ENDLESS CANYON!', '#ff5722');
  }

  public setState(newState: GameState): void {
    this.state = newState;
    if (this.onStateChange) this.onStateChange(newState);
  }

  public pause(): void {
    if (this.state === 'PLAYING') {
      this.setState('PAUSED');
      sound.stopBgm();
    }
  }

  public resume(): void {
    if (this.state === 'PAUSED') {
      this.setState('PLAYING');
      sound.enableAudio();
    }
  }

  // User Action Triggers
  public moveLeft(active: boolean): void {
    if (this.state !== 'PLAYING' || this.coyote.cliffHangTimer > 0 || this.coyote.squashTimer > 0) return;
    if (active) {
      this.coyote.vx = this.coyote.isRocketing ? -9.5 : -4.5;
      this.coyote.facing = -1;
    } else if (this.coyote.vx < 0) {
      this.coyote.vx = 0;
    }
  }

  public moveRight(active: boolean): void {
    if (this.state !== 'PLAYING' || this.coyote.cliffHangTimer > 0 || this.coyote.squashTimer > 0) return;
    if (active) {
      this.coyote.vx = this.coyote.isRocketing ? 10.5 : 4.8;
      this.coyote.facing = 1;
    } else if (this.coyote.vx > 0) {
      this.coyote.vx = 0;
    }
  }

  public jump(): void {
    if (this.state !== 'PLAYING') return;
    if (this.coyote.grounded && this.coyote.cliffHangTimer === 0 && this.coyote.squashTimer === 0) {
      this.coyote.vy = -13;
      this.coyote.grounded = false;
      this.coyote.actionState = 'jumping';
      sound.playJump();
      this.addPuffCloud(this.coyote.x + this.coyote.w / 2, this.coyote.y + this.coyote.h, 6, '#edd6b8');
    }
  }

  public activateRocket(active: boolean): void {
    if (this.state !== 'PLAYING' || this.coyote.squashTimer > 0) return;
    if (active && this.coyote.rocketFuel > 5) {
      this.coyote.isRocketing = true;
      sound.playRocketBurst();
      this.spawnSpeechPop(this.coyote.x, this.coyote.y - 20, 'BOOST!', '#ff3d00');
    } else {
      this.coyote.isRocketing = false;
    }
  }

  public deploySpring(): void {
    if (this.state !== 'PLAYING' || this.coyote.springsCount <= 0 || this.coyote.squashTimer > 0) return;
    this.coyote.springsCount--;
    this.coyote.vy = -18.5; // Massive comic bounce
    this.coyote.grounded = false;
    this.coyote.actionState = 'spring';
    sound.playSpring();
    this.spawnSpeechPop(this.coyote.x, this.coyote.y - 30, 'BOING!!', '#ffeb3b');
    
    // Add visual spring entity on ground
    this.activeSprings.push({
      id: `spring_${Date.now()}`,
      x: this.coyote.x + 10,
      y: this.coyote.y + this.coyote.h - 10,
      compressed: false,
      timer: 30
    });
    this.addPuffCloud(this.coyote.x + this.coyote.w / 2, this.coyote.y + this.coyote.h, 10, '#ffd54f');
    this.updateCallbacks();
  }

  public tossTnt(): void {
    if (this.state !== 'PLAYING' || this.coyote.tntCount <= 0 || this.coyote.squashTimer > 0) return;
    this.coyote.tntCount--;
    sound.playSignClick();

    // Throw TNT forward
    this.activeTnts.push({
      id: `tnt_${Date.now()}`,
      x: this.coyote.x + (this.coyote.facing === 1 ? this.coyote.w + 10 : -15),
      y: this.coyote.y + 10,
      vx: (this.coyote.facing * 7) + this.coyote.vx * 0.5,
      vy: -5,
      fuseTimer: 65
    });
    this.spawnSpeechPop(this.coyote.x, this.coyote.y - 25, 'TICK TICK!', '#e53935');
    this.updateCallbacks();
  }

  // --- Particle & Visual FX Spawners ---
  public addPuffCloud(x: number, y: number, count: number = 5, color: string = '#eed8be'): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 2 - 1,
        size: 8 + Math.random() * 8,
        color,
        alpha: 0.9,
        life: 25 + Math.random() * 15,
        maxLife: 40,
        shape: 'smoke'
      });
    }
  }

  public addExplosionParticles(x: number, y: number): void {
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      const colors = ['#ff1744', '#ff9100', '#ffd600', '#424242', '#ffffff'];
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 6 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        shape: Math.random() > 0.4 ? 'smoke' : 'spark'
      });
    }
  }

  public spawnSpeechPop(x: number, y: number, text: string, color: string = '#ffeb3b'): void {
    this.speechPops.push({
      id: `pop_${Date.now()}_${Math.random()}`,
      x,
      y,
      text,
      life: 55,
      maxLife: 55,
      color,
      scale: 1.2
    });
  }

  // Main Game Loop Update
  public update(): void {
    this.tickCount++;

    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake *= 0.88;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }

    // Iris wipe transition
    if (this.irisRadius !== this.irisTarget) {
      if (this.irisRadius > this.irisTarget) {
        this.irisRadius = Math.max(this.irisTarget, this.irisRadius - this.irisSpeed);
      } else {
        this.irisRadius = Math.min(this.irisTarget, this.irisRadius + this.irisSpeed);
      }
    }

    if (this.state !== 'PLAYING') return;

    // Moving platforms update
    this.platforms.forEach(p => {
      if (p.moving) {
        if (p.moving.axis === 'y') {
          p.y = p.moving.initialPos + Math.sin(this.tickCount * p.moving.speed) * p.moving.range;
        } else {
          p.x = p.moving.initialPos + Math.sin(this.tickCount * p.moving.speed) * p.moving.range;
        }
      }
    });

    // --- COYOTE UPDATE & SLAPSTICK PHYSICS ---
    this.updateCoyote();

    // --- ROAD RUNNER AI UPDATE ---
    this.updateRoadRunner();

    // --- TNT & SPRINGS UPDATE ---
    this.updateTntAndSprings();

    // --- HAZARDS & OBSTACLES UPDATE ---
    this.updateObstacles();

    // --- PARTICLES & TUMBLEWEEDS UPDATE ---
    this.updateParticles();

    // --- DISTANCE & WIN/LOSE CHECKS ---
    this.checkProgression();

    // Camera follow smoothly
    const targetCamX = this.coyote.x - 220;
    this.cameraX += (targetCamX - this.cameraX) * 0.12;
    if (this.cameraX < 0) this.cameraX = 0;

    // Callbacks periodically
    if (this.tickCount % 4 === 0) {
      this.updateCallbacks();
    }
  }

  private updateCoyote(): void {
    const c = this.coyote;
    c.animFrame++;

    // Invulnerability decay
    if (c.invulnerableTimer > 0) c.invulnerableTimer--;

    // Squash recovery (from hitting painted tunnel or anvil)
    if (c.squashTimer > 0) {
      c.squashTimer--;
      c.vx *= 0.8;
      if (c.squashTimer === 0) {
        c.actionState = 'idle';
      }
      return;
    }

    // Burn recovery (from TNT explosion)
    if (c.burnTimer > 0) {
      c.burnTimer--;
      if (c.burnTimer % 5 === 0) {
        this.particles.push({
          x: c.x + Math.random() * c.w,
          y: c.y + Math.random() * c.h,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -2,
          size: 6,
          color: '#333333',
          alpha: 0.8,
          life: 20,
          maxLife: 20,
          shape: 'smoke'
        });
      }
    }

    // Rocket mechanics
    if (c.isRocketing && c.rocketFuel > 0) {
      c.rocketFuel = Math.max(0, c.rocketFuel - 0.7);
      const thrust = c.facing * 10;
      c.vx = thrust;
      c.actionState = 'rocket';

      // Rocket particles
      const exhaustX = c.facing === 1 ? c.x - 12 : c.x + c.w + 12;
      const exhaustY = c.y + c.h - 18;
      this.particles.push({
        x: exhaustX,
        y: exhaustY,
        vx: (c.facing === 1 ? -1 : 1) * (4 + Math.random() * 4),
        vy: (Math.random() - 0.5) * 2,
        size: 10 + Math.random() * 8,
        color: Math.random() > 0.4 ? '#ff3d00' : '#ffea00',
        alpha: 1,
        life: 18,
        maxLife: 20,
        shape: 'spark'
      });

      if (c.rocketFuel <= 0) {
        c.isRocketing = false;
        sound.playFallWhistle();
        this.spawnSpeechPop(c.x, c.y - 20, 'OUT OF GAS!', '#f44336');
      }
    } else {
      c.isRocketing = false;
      // Slow passive fuel recharge
      if (c.rocketFuel < 100) c.rocketFuel = Math.min(100, c.rocketFuel + 0.12);
    }

    // SLAPSTICK CLIFF HANG GAG
    if (c.cliffHangTimer > 0) {
      c.cliffHangTimer--;
      c.vx = 0;
      c.vy = 0;
      c.actionState = 'cliff_hang';

      // Comic leg bicycling animation
      if (c.cliffHangTimer === 44) {
        sound.playSignClick();
        c.cliffSignText = SIGN_TEXTS[Math.floor(Math.random() * SIGN_TEXTS.length)];
      }

      if (c.cliffHangTimer === 1) {
        // Drop down!
        c.actionState = 'falling';
        c.vy = 5;
        sound.playFallWhistle();
      }
      return;
    }

    // Normal Movement & Friction
    c.x += c.vx;
    c.y += c.vy;

    // Air friction vs ground friction
    if (c.grounded) {
      c.vx *= 0.82;
      if (Math.abs(c.vx) < 0.2) c.vx = 0;
      if (Math.abs(c.vx) > 0.5) {
        c.actionState = 'running';
        if (c.animFrame % 6 === 0) {
          this.addPuffCloud(c.x + (c.facing === 1 ? 0 : c.w), c.y + c.h - 5, 2, '#ecd8bf');
        }
      } else {
        c.actionState = 'idle';
      }
    } else {
      c.vy += 0.65; // Gravity
      c.vx *= 0.96;
      if (c.vy > 0 && c.actionState !== 'spring' && c.actionState !== 'rocket') {
        c.actionState = 'falling';
      }
    }

    // Platform collision detection
    let landed = false;
    for (const p of this.platforms) {
      if (c.x + c.w * 0.7 > p.x && c.x + c.w * 0.3 < p.x + p.w) {
        // Landing on top
        if (c.y + c.h >= p.y && c.y + c.h <= p.y + 26 && c.vy >= 0) {
          c.y = p.y - c.h;
          c.vy = 0;
          c.grounded = true;
          landed = true;
          break;
        }
      }
    }

    if (!landed) {
      c.grounded = false;

      // Check if stepped off a cliff without jumping (Y is at ground level and no platform underneath)
      if (c.y >= 320 && c.y < 355 && c.vy >= 0 && c.actionState !== 'jumping' && c.actionState !== 'spring') {
        // Check if there is platform beneath
        let platformUnderneath = false;
        for (const p of this.platforms) {
          if (c.x + c.w > p.x && c.x < p.x + p.w && p.y >= 340) {
            platformUnderneath = true;
            break;
          }
        }

        if (!platformUnderneath && c.cliffHangTimer === 0) {
          // TRIGGER CLASSIC CARTOON CLIFF HANG!
          c.cliffHangTimer = 48; // ~0.8 second pause in mid-air
          c.vx = 0;
          c.vy = 0;
          c.y = 350 - c.h;
          c.cliffSignText = SIGN_TEXTS[Math.floor(Math.random() * SIGN_TEXTS.length)];
          sound.playSignClick();
          return;
        }
      }
    }

    // Fell down bottom chasm
    if (c.y > 520) {
      this.respawnCoyote('FELL IN CANYON!');
    }

    // Item pickups
    this.items.forEach(item => {
      if (!item.collected && this.checkOverlap(c, item)) {
        item.collected = true;
        sound.playPickup();
        this.addScore(150);

        if (item.type === 'rocket_fuel') {
          c.rocketFuel = 100;
          this.spawnSpeechPop(item.x, item.y - 15, 'ACME FUEL +100%', '#ff9800');
        } else if (item.type === 'spring') {
          c.springsCount = Math.min(5, c.springsCount + 2);
          this.spawnSpeechPop(item.x, item.y - 15, 'SUPER SPRINGS +2', '#ffeb3b');
        } else if (item.type === 'tnt') {
          c.tntCount = Math.min(6, c.tntCount + 2);
          this.spawnSpeechPop(item.x, item.y - 15, 'ACME DYNAMITE +2', '#f44336');
        } else if (item.type === 'bird_seed') {
          this.addScore(300);
          this.spawnSpeechPop(item.x, item.y - 15, 'FREE BIRD SEED! +300', '#8bc34a');
        } else if (item.type === 'mystery_box') {
          c.rocketFuel = 100;
          c.springsCount += 2;
          c.tntCount += 2;
          this.addScore(500);
          this.spawnSpeechPop(item.x, item.y - 15, 'ACME DELUXE PACK! +500', '#e91e63');
        }
        this.addPuffCloud(item.x + item.w / 2, item.y + item.h / 2, 8, '#ffeb3b');
      }
    });
  }

  private updateRoadRunner(): void {
    const rr = this.roadRunner;
    rr.feetSpin += 0.45;
    rr.animFrame++;

    // Ground Road Runner on platform or default Y
    rr.x += rr.vx;
    rr.y = 294;

    // Road Runner speed cloud
    if (rr.animFrame % 4 === 0) {
      this.particles.push({
        x: rr.x + 10,
        y: rr.y + rr.h - 8,
        vx: -3 - Math.random() * 2,
        vy: (Math.random() - 0.5) * 2,
        size: 7 + Math.random() * 6,
        color: '#f0dfc8',
        alpha: 0.7,
        life: 20,
        maxLife: 20,
        shape: 'smoke'
      });
    }

    // Periodic "BEEP-BEEP!" taunt
    rr.tauntTimer++;
    if (rr.tauntTimer > 200 + Math.random() * 60) {
      rr.tauntTimer = 0;
      sound.playBeep();
      this.spawnSpeechPop(rr.x, rr.y - 25, 'BEEP-BEEP!! 💨', '#00e5ff');
      
      // Temporary supersonic burst
      const prevSpeed = rr.vx;
      rr.vx = prevSpeed + 3.5;
      setTimeout(() => {
        rr.vx = prevSpeed;
      }, 1200);

      // Drop feathers
      for (let i = 0; i < 4; i++) {
        this.particles.push({
          x: rr.x + 20,
          y: rr.y + 20,
          vx: -2 + Math.random() * 4,
          vy: -2 + Math.random() * 2,
          size: 8,
          color: Math.random() > 0.5 ? '#1976d2' : '#7b1fa2',
          alpha: 1,
          life: 40,
          maxLife: 40,
          shape: 'feather',
          rot: Math.random() * Math.PI
        });
      }
    }
  }

  private updateTntAndSprings(): void {
    // TNT Physics
    for (let i = this.activeTnts.length - 1; i >= 0; i--) {
      const tnt = this.activeTnts[i];
      tnt.x += tnt.vx;
      tnt.y += tnt.vy;
      tnt.vy += 0.5; // gravity
      tnt.vx *= 0.95;

      // Bounce on ground
      if (tnt.y > 340) {
        tnt.y = 340;
        tnt.vy = -tnt.vy * 0.4;
      }

      tnt.fuseTimer--;

      // Fuse smoke
      if (tnt.fuseTimer % 4 === 0) {
        this.particles.push({
          x: tnt.x + 12,
          y: tnt.y,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -1.5,
          size: 4,
          color: '#ffeb3b',
          alpha: 1,
          life: 15,
          maxLife: 15,
          shape: 'spark'
        });
      }

      if (tnt.fuseTimer <= 0) {
        // DETONATE!
        sound.playExplosion();
        this.screenShake = 18;
        this.addExplosionParticles(tnt.x + 12, tnt.y + 12);
        this.spawnSpeechPop(tnt.x, tnt.y - 25, 'KABOOM!! 💥', '#ff1744');

        // Check if Coyote is caught in blast
        const distCoyote = Math.hypot(this.coyote.x - tnt.x, this.coyote.y - tnt.y);
        if (distCoyote < 90) {
          this.coyote.burnTimer = 80;
          this.coyote.vy = -12;
          this.coyote.vx = (this.coyote.x > tnt.x ? 8 : -8);
          this.spawnSpeechPop(this.coyote.x, this.coyote.y - 30, 'OUCH! CHARRED!', '#212121');
        }

        // Destroy nearby obstacles (e.g. boulders, cacti)
        this.obstacles.forEach(obs => {
          const distObs = Math.hypot(obs.x - tnt.x, obs.y - tnt.y);
          if (distObs < 110 && obs.type !== 'painted_tunnel') {
            obs.x = -9999; // Remove
            this.addScore(250);
            this.spawnSpeechPop(tnt.x + 20, tnt.y - 40, 'OBSTACLE DEMOLISHED! +250', '#ffeb3b');
          }
        });

        this.activeTnts.splice(i, 1);
      }
    }

    // Springs timer decay
    for (let i = this.activeSprings.length - 1; i >= 0; i--) {
      this.activeSprings[i].timer--;
      if (this.activeSprings[i].timer <= 0) {
        this.activeSprings.splice(i, 1);
      }
    }
  }

  private updateObstacles(): void {
    const c = this.coyote;

    this.obstacles.forEach(obs => {
      // Falling Anvil Trap Trigger
      if (obs.type === 'anvil') {
        if (!obs.triggered && Math.abs(c.x - obs.x) < 130) {
          obs.triggered = true;
          obs.vy = 2;
          sound.playSignClick();
          this.spawnSpeechPop(obs.x, obs.y - 20, 'LOOK OUT BELOW!', '#ff5722');
        }

        if (obs.triggered && obs.y < 330) {
          obs.vy = (obs.vy || 0) + 0.9;
          obs.y += obs.vy;

          if (obs.y >= 330) {
            obs.y = 330;
            obs.vy = 0;
            sound.playCrash();
            this.screenShake = 14;
            this.addPuffCloud(obs.x + obs.w / 2, obs.y + obs.h, 12, '#9e9e9e');
            this.spawnSpeechPop(obs.x, obs.y - 20, 'CLANG!! 🔔', '#fff');
          }
        }
      }

      // Check collision with Coyote
      if (c.invulnerableTimer <= 0 && this.checkOverlap(c, obs)) {
        if (obs.type === 'painted_tunnel') {
          // COMIC GAG: CRASH INTO PAINTED TUNNEL WALL!
          sound.playCrash();
          this.screenShake = 16;
          c.squashTimer = 65;
          c.actionState = 'squashed';
          c.vx = -6;
          c.vy = -3;
          c.invulnerableTimer = 80;
          this.spawnSpeechPop(obs.x, obs.y - 30, 'THUD!! FAKE TUNNEL!', '#ff1744');

          // Stars circling head
          for (let i = 0; i < 6; i++) {
            this.particles.push({
              x: c.x + 20,
              y: c.y - 5,
              vx: (Math.random() - 0.5) * 4,
              vy: -2 + (Math.random() - 0.5) * 2,
              size: 8,
              color: '#ffd600',
              alpha: 1,
              life: 45,
              maxLife: 45,
              shape: 'star'
            });
          }
        } else if (obs.type === 'cactus') {
          sound.playCrash();
          c.vy = -8;
          c.vx = c.facing * -5;
          c.invulnerableTimer = 60;
          this.addScore(-100);
          this.spawnSpeechPop(c.x, c.y - 25, 'OUCH! CACTUS PRICKS!', '#4caf50');
        } else if (obs.type === 'boulder') {
          sound.playCrash();
          c.vy = -6;
          c.vx = -7;
          c.invulnerableTimer = 60;
          this.addScore(-120);
          this.spawnSpeechPop(c.x, c.y - 25, 'CRASH! ROCK WALL!', '#795548');
        } else if (obs.type === 'tnt_barrel') {
          // Explode barrel!
          sound.playExplosion();
          this.screenShake = 20;
          this.addExplosionParticles(obs.x + 20, obs.y + 20);
          obs.x = -9999;
          c.burnTimer = 80;
          c.vy = -14;
          c.vx = -8;
          c.invulnerableTimer = 90;
          this.spawnSpeechPop(c.x, c.y - 35, 'KABOOM! TNT STOCKPILE!', '#d50000');
        } else if (obs.type === 'anvil') {
          sound.playCrash();
          this.screenShake = 16;
          c.squashTimer = 60;
          c.actionState = 'squashed';
          c.invulnerableTimer = 80;
          this.spawnSpeechPop(c.x, c.y - 25, 'CLANG! 100-TON ANVIL!', '#607d8b');
        }
      }
    });
  }

  private updateParticles(): void {
    // Particles update
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.shape === 'smoke') {
        p.size += 0.25;
        p.vy -= 0.05;
      }
      if (p.shape === 'star' || p.shape === 'feather') {
        if (p.rot !== undefined) p.rot += 0.1;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Speech pops
    for (let i = this.speechPops.length - 1; i >= 0; i--) {
      const sp = this.speechPops[i];
      sp.y -= 0.6;
      sp.life--;
      if (sp.life <= 0) {
        this.speechPops.splice(i, 1);
      }
    }

    // Tumbleweeds
    this.tumbleweeds.forEach(tw => {
      tw.x += tw.vx;
      tw.rot += 0.08;
      // Loop tumbleweeds
      if (tw.x < this.cameraX - 100) {
        tw.x = this.cameraX + 900 + Math.random() * 200;
      }
    });

    // Procedural terrain expansion for endless mode
    if (this.mode === 'endless') {
      if (this.coyote.x + 1200 > this.endlessMaxX) {
        const chunk = createProceduralChunk(this.endlessMaxX, this.endlessChunkIndex++);
        this.platforms.push(...chunk.platforms);
        this.items.push(...chunk.items);
        this.obstacles.push(...chunk.obstacles);
        this.endlessMaxX += 800;

        // Clean up old distant objects behind camera
        this.platforms = this.platforms.filter(p => p.x + p.w > this.cameraX - 800);
        this.items = this.items.filter(item => item.x > this.cameraX - 800);
        this.obstacles = this.obstacles.filter(obs => obs.x > this.cameraX - 800);
      }
    }
  }

  private checkProgression(): void {
    const dist = this.getDistanceToRoadRunner();

    // CAUGHT ROAD RUNNER! (Victory / Stage Clear)
    if (dist <= 48 && this.roadRunner.x > this.coyote.x - 20) {
      sound.playFanfare();
      this.addScore(2000);
      this.spawnSpeechPop(this.coyote.x, this.coyote.y - 40, 'CAUGHT ROAD RUNNER!! 🎉', '#00e676');

      if (this.mode === 'story') {
        if (this.currentLevelIndex < LEVELS.length - 1) {
          this.setState('STAGE_CLEAR');
        } else {
          this.setState('GAME_OVER'); // Won all stages!
        }
      } else {
        // Endless: Push Road Runner forward for the next chase!
        this.roadRunner.x += 800;
        this.roadRunner.vx += 0.3;
        this.spawnSpeechPop(this.roadRunner.x, this.roadRunner.y - 25, 'HE ZOOMED AWAY AGAIN! 💨', '#00e5ff');
      }
    }

    // Road Runner got too far ahead (Lost)
    if (this.mode === 'story' && dist > 1400) {
      sound.playFallWhistle();
      this.setState('GAME_OVER');
    }
  }

  private respawnCoyote(reason: string): void {
    sound.playCrash();
    this.screenShake = 18;
    this.addScore(-300);
    this.coyote.x = Math.max(100, this.coyote.x - 200);
    this.coyote.y = 280;
    this.coyote.vx = 0;
    this.coyote.vy = 0;
    this.coyote.grounded = true;
    this.coyote.cliffHangTimer = 0;
    this.coyote.squashTimer = 0;
    this.coyote.burnTimer = 40;
    this.coyote.invulnerableTimer = 90;
    this.spawnSpeechPop(this.coyote.x, this.coyote.y - 30, reason, '#f44336');
  }

  public addScore(points: number): void {
    this.score = Math.max(0, this.score + points);
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try { localStorage.setItem('desert_high_score', String(this.highScore)); } catch {}
    }
    if (this.onScoreChange) this.onScoreChange(this.score, this.combo);
  }

  private checkOverlap(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  private updateCallbacks(): void {
    if (this.onDistanceChange) {
      const dist = this.getDistanceToRoadRunner();
      const percent = Math.max(0, Math.min(100, Math.round((1 - (dist / 1200)) * 100)));
      this.onDistanceChange(dist, percent);
    }
    if (this.onInventoryChange) {
      this.onInventoryChange(this.coyote.rocketFuel, this.coyote.tntCount, this.coyote.springsCount);
    }
    if (this.onScoreChange) {
      this.onScoreChange(this.score, this.combo);
    }
  }

  public nextLevel(): void {
    if (this.currentLevelIndex < LEVELS.length - 1) {
      this.resetLevel(this.currentLevelIndex + 1, 'story');
      this.setState('PLAYING');
      sound.enableAudio();
    }
  }
}
