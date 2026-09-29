import { GameEngine } from './engine';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private bgImage: HTMLImageElement | null = null;
  private titleImage: HTMLImageElement | null = null;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;

    // Load generated backdrops
    const bg = new Image();
    bg.src = '/src/assets/images/desert_canyon_backdrop_1790691068104.jpg';
    bg.onload = () => { this.bgImage = bg; };

    const titleImg = new Image();
    titleImg.src = '/src/assets/images/coyote_title_poster_1790691095041.jpg';
    titleImg.onload = () => { this.titleImage = titleImg; };
  }

  public setDimensions(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  public render(engine: GameEngine): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();

    // Screen Shake effect
    if (engine.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * engine.screenShake;
      const shakeY = (Math.random() - 0.5) * engine.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. SKY & DISTANT MOUNTAINS (Parallax)
    this.drawSkyAndParallax(engine);

    // 2. WORLD SPACE (Camera translate)
    ctx.save();
    ctx.translate(-Math.round(engine.cameraX), 0);

    // 2.1 Platforms & Bridges
    this.drawPlatforms(engine);

    // 2.2 Obstacles & Painted Tunnel
    this.drawObstacles(engine);

    // 2.3 Items & ACME Crates
    this.drawItems(engine);

    // 2.4 Active Thrown TNT & Springs
    this.drawActiveGadgets(engine);

    // 2.5 Road Runner
    this.drawRoadRunner(engine);

    // 2.6 Wile E. Coyote
    this.drawCoyote(engine);

    // 2.7 Particles & Tumbleweeds
    this.drawParticles(engine);

    // 2.8 Comic Speech Pops ("BEEP-BEEP!", "BOING!", "KABOOM!")
    this.drawSpeechPops(engine);

    ctx.restore(); // End world space

    // 3. Vintage "That's All Folks!" Iris Circular Wipe
    if (engine.irisRadius < 0.99) {
      this.drawIrisWipe(engine.irisRadius);
    }

    ctx.restore();
  }

  private drawSkyAndParallax(engine: GameEngine): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const level = engine.getCurrentLevel();

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, level.skyGradient[0]);
    skyGrad.addColorStop(0.7, level.skyGradient[1]);
    skyGrad.addColorStop(1, '#ffc078');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Sun in sky
    ctx.fillStyle = '#fff9c4';
    ctx.beginPath();
    ctx.arc(w * 0.75, 75, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 245, 157, 0.25)';
    ctx.beginPath();
    ctx.arc(w * 0.75, 75, 70, 0, Math.PI * 2);
    ctx.fill();

    // Distant Red Mesas (Distant parallax: 0.15x camera speed)
    ctx.save();
    const camOffsetFar = (engine.cameraX * 0.12) % 600;
    ctx.translate(-camOffsetFar, 0);

    ctx.fillStyle = level.plateauColor;
    for (let x = -300; x < w + 900; x += 400) {
      ctx.beginPath();
      ctx.moveTo(x, 340);
      ctx.lineTo(x + 50, 200);
      ctx.lineTo(x + 220, 200);
      ctx.lineTo(x + 280, 340);
      ctx.fill();

      // Flat top mesa cap
      ctx.fillStyle = '#e67e22';
      ctx.fillRect(x + 45, 196, 180, 8);
      ctx.fillStyle = level.plateauColor;
    }
    ctx.restore();

    // Mid-ground Canyon Pillars & Saguaro silhouettes (Parallax: 0.4x camera speed)
    ctx.save();
    const camOffsetMid = (engine.cameraX * 0.35) % 500;
    ctx.translate(-camOffsetMid, 0);

    ctx.fillStyle = level.canyonColor;
    for (let x = -200; x < w + 700; x += 320) {
      // Rock spire
      ctx.beginPath();
      ctx.moveTo(x, 350);
      ctx.lineTo(x + 30, 240);
      ctx.lineTo(x + 70, 240);
      ctx.lineTo(x + 100, 350);
      ctx.fill();

      // Cactus silhouette
      this.drawCactusSilhouette(x + 150, 280, 40);
    }
    ctx.restore();
  }

  private drawCactusSilhouette(x: number, y: number, h: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#2d5a27';
    // Main stem
    ctx.fillRect(x + 10, y, 10, h);
    // Left arm
    ctx.fillRect(x, y + 14, 12, 6);
    ctx.fillRect(x, y + 6, 6, 14);
    // Right arm
    ctx.fillRect(x + 18, y + 18, 12, 6);
    ctx.fillRect(x + 24, y + 10, 6, 14);
    ctx.restore();
  }

  private drawPlatforms(engine: GameEngine): void {
    const ctx = this.ctx;
    const level = engine.getCurrentLevel();

    engine.platforms.forEach(p => {
      // Cull off-screen platforms
      if (p.x + p.w < engine.cameraX - 100 || p.x > engine.cameraX + this.width + 100) return;

      if (p.type === 'bridge') {
        // Wooden Rope Suspension Bridge
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + 4);
        ctx.quadraticCurveTo(p.x + p.w / 2, p.y + 14, p.x + p.w, p.y + 4);
        ctx.stroke();

        // Planks
        const plankCount = Math.floor(p.w / 20);
        for (let i = 0; i <= plankCount; i++) {
          const px = p.x + i * 20;
          const curveOffset = Math.sin((i / plankCount) * Math.PI) * 10;
          ctx.fillStyle = i % 2 === 0 ? '#8d6e63' : '#a1887f';
          ctx.fillRect(px - 6, p.y + curveOffset, 14, 8);
          // Nail dots
          ctx.fillStyle = '#3e2723';
          ctx.fillRect(px - 4, p.y + curveOffset + 2, 2, 2);
          ctx.fillRect(px + 4, p.y + curveOffset + 2, 2, 2);
        }
      } else if (p.type === 'depot') {
        // Industrial Depot Iron Girder & Mine Rail
        ctx.fillStyle = '#37474f';
        ctx.fillRect(p.x, p.y, p.w, p.h);

        // Yellow-black warning stripes on top edge
        ctx.fillStyle = '#ffb300';
        ctx.fillRect(p.x, p.y, p.w, 6);
        ctx.fillStyle = '#212121';
        for (let sx = p.x; sx < p.x + p.w; sx += 24) {
          ctx.beginPath();
          ctx.moveTo(sx, p.y);
          ctx.lineTo(sx + 10, p.y);
          ctx.lineTo(sx + 4, p.y + 6);
          ctx.lineTo(sx - 6, p.y + 6);
          ctx.fill();
        }

        // Rail tracks
        ctx.fillStyle = '#78909c';
        ctx.fillRect(p.x, p.y - 4, p.w, 4);
      } else {
        // Natural Desert Red Rock Mesa
        ctx.fillStyle = '#a0380c';
        ctx.fillRect(p.x, p.y, p.w, p.h);

        // Top highlighted sandy layer
        ctx.fillStyle = '#ff9e56';
        ctx.fillRect(p.x, p.y, p.w, 8);

        // Rock strata horizontal bands
        ctx.fillStyle = '#6b2005';
        ctx.fillRect(p.x, p.y + 18, p.w, 5);
        ctx.fillRect(p.x, p.y + 36, p.w, 4);

        // Cartoon outline
        ctx.strokeStyle = '#3e1405';
        ctx.lineWidth = 3;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
      }
    });
  }

  private drawObstacles(engine: GameEngine): void {
    const ctx = this.ctx;

    engine.obstacles.forEach(obs => {
      if (obs.x + obs.w < engine.cameraX - 100 || obs.x > engine.cameraX + this.width + 100) return;

      if (obs.type === 'painted_tunnel') {
        // CLASSIC GAG: FAKE PAINTED TUNNEL ON CLIFF WALL!
        ctx.save();
        // Cliff rock face
        ctx.fillStyle = '#8d3b14';
        ctx.fillRect(obs.x, obs.y - 40, obs.w + 10, obs.h + 50);

        // The painted tunnel arch
        ctx.fillStyle = '#111111';
        ctx.beginPath();
        ctx.arc(obs.x + obs.w / 2, obs.y + 35, 26, Math.PI, 0);
        ctx.lineTo(obs.x + obs.w / 2 + 26, obs.y + obs.h);
        ctx.lineTo(obs.x + obs.w / 2 - 26, obs.y + obs.h);
        ctx.closePath();
        ctx.fill();

        // Painted yellow road stripe inside tunnel (that fools the eye!)
        ctx.strokeStyle = '#ffd600';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(obs.x + obs.w / 2, obs.y + 35);
        ctx.lineTo(obs.x + obs.w / 2, obs.y + obs.h);
        ctx.stroke();

        // Wooden sign on top: "SHORTCUT"
        ctx.fillStyle = '#d7ccc8';
        ctx.fillRect(obs.x - 10, obs.y - 30, 70, 18);
        ctx.strokeStyle = '#5d4037';
        ctx.strokeRect(obs.x - 10, obs.y - 30, 70, 18);
        ctx.fillStyle = '#000';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('TUNNEL', obs.x + 4, obs.y - 18);

        ctx.restore();
      } else if (obs.type === 'cactus') {
        // Detailed Saguaro Cactus with spines
        ctx.save();
        ctx.fillStyle = '#2e7d32';
        // Main trunk
        ctx.fillRect(obs.x + 10, obs.y, 14, obs.h);
        // Arms
        ctx.fillRect(obs.x, obs.y + 12, 12, 8);
        ctx.fillRect(obs.x, obs.y + 4, 8, 16);
        ctx.fillRect(obs.x + 22, obs.y + 16, 12, 8);
        ctx.fillRect(obs.x + 26, obs.y + 8, 8, 16);

        // Highlights & needles
        ctx.fillStyle = '#81c784';
        ctx.fillRect(obs.x + 12, obs.y + 2, 3, obs.h - 4);
        ctx.restore();
      } else if (obs.type === 'boulder') {
        // Heavy Cracked Granite Boulder
        ctx.save();
        ctx.fillStyle = '#78909c';
        ctx.beginPath();
        ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#37474f';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cracks
        ctx.beginPath();
        ctx.moveTo(obs.x + 15, obs.y + 12);
        ctx.lineTo(obs.x + 24, obs.y + 26);
        ctx.lineTo(obs.x + 32, obs.y + 35);
        ctx.stroke();
        ctx.restore();
      } else if (obs.type === 'anvil') {
        // 100-TON ACME ANVIL
        ctx.save();
        ctx.fillStyle = '#37474f';
        // Anvil horn (left)
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + 12);
        ctx.lineTo(obs.x + 12, obs.y);
        ctx.lineTo(obs.x + obs.w, obs.y);
        ctx.lineTo(obs.x + obs.w, obs.y + 14);
        ctx.lineTo(obs.x + 28, obs.y + 18);
        ctx.lineTo(obs.x + 32, obs.y + obs.h);
        ctx.lineTo(obs.x + 6, obs.y + obs.h);
        ctx.lineTo(obs.x + 12, obs.y + 18);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 2;
        ctx.stroke();

        // "ACME" stencil
        ctx.fillStyle = '#cfd8dc';
        ctx.font = 'bold 8px monospace';
        ctx.fillText('ACME', obs.x + 12, obs.y + 12);
        ctx.restore();
      } else if (obs.type === 'tnt_barrel') {
        // Red TNT Explosive Barrel
        ctx.save();
        ctx.fillStyle = '#d32f2f';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        // Metal hoops
        ctx.fillStyle = '#424242';
        ctx.fillRect(obs.x, obs.y + 6, obs.w, 4);
        ctx.fillRect(obs.x, obs.y + obs.h - 10, obs.w, 4);
        // "TNT" in yellow
        ctx.fillStyle = '#ffeb3b';
        ctx.font = 'bold 12px monospace';
        ctx.fillText('TNT', obs.x + 6, obs.y + 26);
        ctx.restore();
      }
    });
  }

  private drawItems(engine: GameEngine): void {
    const ctx = this.ctx;

    engine.items.forEach(item => {
      if (item.collected) return;
      if (item.x + item.w < engine.cameraX - 100 || item.x > engine.cameraX + this.width + 100) return;

      const floatY = item.y + Math.sin(Date.now() * 0.005 + item.x) * 4;

      // Wooden ACME Crate Box
      ctx.save();
      ctx.fillStyle = '#b71c1c';
      ctx.fillRect(item.x, floatY, item.w, item.h);
      ctx.strokeStyle = '#ffeb3b';
      ctx.lineWidth = 2;
      ctx.strokeRect(item.x, floatY, item.w, item.h);

      // Label / Icon inside crate
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('ACME', item.x + 4, floatY + 12);

      if (item.type === 'rocket_fuel') {
        ctx.font = '14px sans-serif';
        ctx.fillText('🚀', item.x + 8, floatY + 28);
      } else if (item.type === 'spring') {
        ctx.font = '14px sans-serif';
        ctx.fillText('🦘', item.x + 8, floatY + 28);
      } else if (item.type === 'tnt') {
        ctx.font = '14px sans-serif';
        ctx.fillText('💣', item.x + 8, floatY + 28);
      } else if (item.type === 'bird_seed') {
        ctx.font = '14px sans-serif';
        ctx.fillText('🌾', item.x + 8, floatY + 28);
      } else {
        ctx.font = '14px sans-serif';
        ctx.fillText('❓', item.x + 8, floatY + 28);
      }
      ctx.restore();
    });
  }

  private drawActiveGadgets(engine: GameEngine): void {
    const ctx = this.ctx;

    // Active Ticking TNT sticks
    engine.activeTnts.forEach(tnt => {
      ctx.save();
      ctx.translate(tnt.x, tnt.y);
      // Red dynamite stick bundle
      ctx.fillStyle = '#e53935';
      ctx.fillRect(0, 0, 20, 10);
      ctx.fillStyle = '#111';
      ctx.fillRect(4, 0, 3, 10); // tape
      ctx.fillRect(13, 0, 3, 10);

      // Fuse sparking
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(12, -6);
      ctx.stroke();

      // Spark star
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.arc(12, -6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Active Springboards
    engine.activeSprings.forEach(spring => {
      ctx.save();
      ctx.strokeStyle = '#bdbdbd';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(spring.x, spring.y);
      ctx.lineTo(spring.x + 8, spring.y - 8);
      ctx.lineTo(spring.x - 8, spring.y - 16);
      ctx.lineTo(spring.x + 8, spring.y - 24);
      ctx.lineTo(spring.x, spring.y - 32);
      ctx.stroke();
      ctx.restore();
    });
  }

  private drawRoadRunner(engine: GameEngine): void {
    const ctx = this.ctx;
    const rr = engine.roadRunner;

    ctx.save();
    ctx.translate(rr.x, rr.y);

    // Sonic dust speed trails behind Road Runner
    ctx.fillStyle = 'rgba(255, 235, 59, 0.4)';
    ctx.beginPath();
    ctx.ellipse(-15, 38, 24, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (Deep blue)
    ctx.fillStyle = '#1565c0';
    ctx.beginPath();
    ctx.ellipse(22, 24, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail Feathers (blue & purple plumage)
    ctx.fillStyle = '#0d47a1';
    ctx.beginPath();
    ctx.moveTo(6, 24);
    ctx.lineTo(-12, 14);
    ctx.lineTo(4, 20);
    ctx.lineTo(-8, 26);
    ctx.lineTo(6, 26);
    ctx.fill();

    // Slender Neck & Head
    ctx.strokeStyle = '#1565c0';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(32, 20);
    ctx.quadraticCurveTo(36, 12, 40, 4);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#1565c0';
    ctx.beginPath();
    ctx.arc(40, 4, 7, 0, Math.PI * 2);
    ctx.fill();

    // Purple Head Crest (Crown)
    ctx.fillStyle = '#6a1b9a';
    ctx.beginPath();
    ctx.moveTo(38, 2);
    ctx.lineTo(34, -10);
    ctx.lineTo(40, -4);
    ctx.lineTo(44, -12);
    ctx.lineTo(42, 2);
    ctx.fill();

    // Cartoon Beak (Yellow long bill)
    ctx.fillStyle = '#ffd600';
    ctx.beginPath();
    ctx.moveTo(44, 2);
    ctx.lineTo(58, 5);
    ctx.lineTo(44, 8);
    ctx.fill();

    // Cartoon Big Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(42, 3, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(43, 3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Tongue out when taunting
    if (rr.tauntTimer > 190) {
      ctx.fillStyle = '#e91e63';
      ctx.beginPath();
      ctx.ellipse(56, 10, 5, 2.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // ICONIC CARTOON LEG WHEELS (Whirling red/yellow blur ring)
    ctx.strokeStyle = '#ffd600';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(22, 42, 11, rr.feetSpin, rr.feetSpin + Math.PI * 1.6);
    ctx.stroke();

    ctx.strokeStyle = '#ff9100';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(24, 43, 9, rr.feetSpin + Math.PI, rr.feetSpin + Math.PI * 2.5);
    ctx.stroke();

    ctx.restore();
  }

  private drawCoyote(engine: GameEngine): void {
    const ctx = this.ctx;
    const c = engine.coyote;

    ctx.save();
    ctx.translate(c.x + (c.facing === -1 ? c.w : 0), c.y);
    ctx.scale(c.facing, 1);

    // Flashing when invulnerable
    if (c.invulnerableTimer > 0 && Math.floor(c.invulnerableTimer / 4) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // Squashed accordion gag (hit wall/anvil)
    if (c.actionState === 'squashed') {
      ctx.scale(1.4, 0.35);
      ctx.translate(-5, 80);
    }

    // Charred burnt black (from explosion)
    const bodyColor = c.burnTimer > 0 ? '#263238' : '#795548';
    const snoutColor = c.burnTimer > 0 ? '#455a64' : '#d7ccc8';
    const earColor = c.burnTimer > 0 ? '#102027' : '#5d4037';

    // 1. Torso
    ctx.fillStyle = bodyColor;
    ctx.fillRect(10, 16, 22, 28);

    // White chest patch
    if (c.burnTimer === 0) {
      ctx.fillStyle = '#efebe9';
      ctx.fillRect(16, 20, 12, 18);
    }

    // 2. Head & Snout
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(20, 12, 12, 0, Math.PI * 2);
    ctx.fill();

    // Long pointed muzzle
    ctx.fillStyle = snoutColor;
    ctx.beginPath();
    ctx.moveTo(22, 10);
    ctx.lineTo(38, 14);
    ctx.lineTo(24, 19);
    ctx.fill();

    // Black nose tip
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(38, 14, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Big expressive cartoon eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(22, 7, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    // Eye look directions
    if (c.actionState === 'cliff_hang') {
      // Looking down or at viewer with dread!
      ctx.arc(22, 9, 2, 0, Math.PI * 2);
    } else {
      ctx.arc(24, 7, 2, 0, Math.PI * 2);
    }
    ctx.fill();

    // Long twitchy ears
    ctx.fillStyle = earColor;
    ctx.beginPath();
    ctx.moveTo(14, 8); ctx.lineTo(10, -12); ctx.lineTo(18, 6);
    ctx.moveTo(20, 8); ctx.lineTo(22, -14); ctx.lineTo(26, 6);
    ctx.fill();

    // 3. Legs
    ctx.fillStyle = earColor;
    if (c.actionState === 'cliff_hang') {
      // Frantic bicycling mid-air legs
      const legCycle = Math.sin(engine.coyote.cliffHangTimer * 0.8) * 10;
      ctx.fillRect(12, 44, 6, 12 + legCycle);
      ctx.fillRect(22, 44, 6, 12 - legCycle);
    } else if (c.actionState === 'running') {
      const runCycle = Math.sin(c.animFrame * 0.5) * 8;
      ctx.fillRect(12, 44, 6, 12 + runCycle);
      ctx.fillRect(22, 44, 6, 12 - runCycle);
    } else {
      ctx.fillRect(12, 44, 6, 12);
      ctx.fillRect(22, 44, 6, 12);
    }

    // 4. ACME Rocket Booster Skates
    if (c.isRocketing) {
      // Red rocket strapped to back
      ctx.fillStyle = '#d32f2f';
      ctx.fillRect(-6, 20, 16, 12);
      // Nose cone
      ctx.fillStyle = '#ffd600';
      ctx.beginPath();
      ctx.moveTo(-6, 20); ctx.lineTo(-14, 26); ctx.lineTo(-6, 32);
      ctx.fill();

      // Rocket flame jet
      ctx.fillStyle = '#ff3d00';
      ctx.beginPath();
      ctx.moveTo(-6, 22);
      ctx.lineTo(-24 - Math.random() * 8, 26);
      ctx.lineTo(-6, 30);
      ctx.fill();
    }

    // 5. SLAPSTICK CLIFF HANG GAG: HOLDING UP A COMICAL MINI-SIGN
    if (c.actionState === 'cliff_hang') {
      ctx.save();
      // Wooden stick held in hand
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(18, 25);
      ctx.lineTo(10, 5);
      ctx.stroke();

      // Sign board ("HELP!", "YIKES!", "WHY ME?!")
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 2;
      ctx.fillRect(-20, -18, 54, 22);
      ctx.strokeRect(-20, -18, 54, 22);

      ctx.fillStyle = '#d32f2f';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(c.cliffSignText, 7, -4);
      ctx.restore();
    }

    ctx.restore();
  }

  private drawParticles(engine: GameEngine): void {
    const ctx = this.ctx;

    // Tumbleweeds
    engine.tumbleweeds.forEach(tw => {
      ctx.save();
      ctx.translate(tw.x, tw.y);
      ctx.rotate(tw.rot);
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
        ctx.arc(0, 0, tw.size / 2, a, a + Math.PI / 3);
      }
      ctx.stroke();
      ctx.restore();
    });

    // Particle FX
    engine.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === 'smoke') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'star') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.shape === 'feather') {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot || 0);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size / 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }

  private drawSpeechPops(engine: GameEngine): void {
    const ctx = this.ctx;

    engine.speechPops.forEach(sp => {
      ctx.save();
      const progress = sp.life / sp.maxLife;
      const alpha = Math.min(1, progress * 1.5);
      ctx.globalAlpha = alpha;

      // Cartoon comic speech bubble
      ctx.fillStyle = sp.color || '#ffeb3b';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;

      ctx.font = '900 13px "Press Start 2P", monospace, sans-serif';
      const textWidth = ctx.measureText(sp.text).width;
      const boxW = textWidth + 18;
      const boxH = 26;

      ctx.beginPath();
      ctx.roundRect(sp.x - boxW / 2, sp.y - boxH / 2, boxW, boxH, 8);
      ctx.fill();
      ctx.stroke();

      // Tail
      ctx.beginPath();
      ctx.moveTo(sp.x - 4, sp.y + boxH / 2);
      ctx.lineTo(sp.x, sp.y + boxH / 2 + 6);
      ctx.lineTo(sp.x + 6, sp.y + boxH / 2);
      ctx.fill();
      ctx.stroke();

      // Comic text
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sp.text, sp.x, sp.y);

      ctx.restore();
    });
  }

  private drawIrisWipe(radiusPercent: number): void {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const maxR = Math.hypot(w / 2, h / 2);
    const r = maxR * radiusPercent;

    ctx.save();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.arc(w / 2, h / 2, Math.max(0, r), 0, Math.PI * 2, true);
    ctx.fill();

    // Red cartoon concentric rings around iris edge
    if (r > 10 && r < maxR) {
      ctx.strokeStyle = '#d32f2f';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#f57c00';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r + 10, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}
