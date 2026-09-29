export type GameMode = 'story' | 'endless' | 'acme_lab';

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'STAGE_CLEAR' | 'GAME_OVER';

export interface Vector2D {
  x: number;
  y: number;
}

export type CoyoteActionState = 
  | 'idle' 
  | 'running' 
  | 'jumping' 
  | 'rocket' 
  | 'spring' 
  | 'cliff_hang' 
  | 'falling' 
  | 'squashed' 
  | 'exploded';

export interface CoyoteEntity {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  grounded: boolean;
  actionState: CoyoteActionState;
  rocketFuel: number; // 0 - 100
  isRocketing: boolean;
  tntCount: number;
  springsCount: number;
  cliffHangTimer: number; // In frames
  cliffSignText: string;
  squashTimer: number;
  burnTimer: number;
  invulnerableTimer: number;
  animFrame: number;
}

export interface RoadRunnerEntity {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  feetSpin: number;
  tauntTimer: number;
  isBeeping: boolean;
  peckingTimer: number;
  animFrame: number;
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
  type?: 'rock' | 'bridge' | 'floating' | 'depot';
  moving?: {
    axis: 'x' | 'y';
    range: number;
    speed: number;
    initialPos: number;
  };
}

export interface AcmeItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'rocket_fuel' | 'spring' | 'tnt' | 'bird_seed' | 'mystery_box';
  collected: boolean;
  floatOffset: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'cactus' | 'boulder' | 'anvil' | 'painted_tunnel' | 'tnt_barrel';
  vy?: number;
  triggered?: boolean;
}

export interface ActiveTnt {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fuseTimer: number; // frames until explosion
}

export interface ActiveSpring {
  id: string;
  x: number;
  y: number;
  compressed: boolean;
  timer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'smoke' | 'spark' | 'feather' | 'star';
  rot?: number;
}

export interface SpeechPop {
  id: string;
  x: number;
  y: number;
  text: string;
  life: number;
  maxLife: number;
  color?: string;
  scale?: number;
}

export interface Tumbleweed {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
}

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  zoneName: string;
  length: number;
  roadRunnerBaseSpeed: number;
  platforms: Platform[];
  items: AcmeItem[];
  obstacles: Obstacle[];
  skyGradient: [string, string];
  canyonColor: string;
  plateauColor: string;
}
