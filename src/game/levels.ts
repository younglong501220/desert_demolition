import { LevelConfig, Platform, AcmeItem, Obstacle } from './types';

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: '第一關：紅岩大峽谷',
    subtitle: 'Classic Red Rock Gorge',
    zoneName: 'RED ROCK CANYON',
    length: 3600,
    roadRunnerBaseSpeed: 4.2,
    skyGradient: ['#ff8c42', '#ffd166'],
    canyonColor: '#c85a17',
    plateauColor: '#a0380c',
    platforms: [
      { x: 0, y: 350, w: 900, h: 70, type: 'rock' },
      { x: 1050, y: 350, w: 650, h: 70, type: 'rock' },
      { x: 1320, y: 250, w: 260, h: 24, type: 'rock' }, // High mesa
      { x: 1800, y: 350, w: 850, h: 70, type: 'rock' },
      { x: 2150, y: 220, w: 320, h: 24, type: 'rock' }, // Higher plateau
      { x: 2750, y: 350, w: 950, h: 70, type: 'rock' }
    ],
    items: [
      { id: 'item_1_1', x: 400, y: 300, w: 34, h: 34, type: 'rocket_fuel', collected: false, floatOffset: 0 },
      { id: 'item_1_2', x: 800, y: 300, w: 34, h: 34, type: 'bird_seed', collected: false, floatOffset: 0 },
      { id: 'item_1_3', x: 1420, y: 200, w: 34, h: 34, type: 'spring', collected: false, floatOffset: 0 },
      { id: 'item_1_4', x: 2000, y: 300, w: 34, h: 34, type: 'tnt', collected: false, floatOffset: 0 },
      { id: 'item_1_5', x: 2300, y: 170, w: 34, h: 34, type: 'rocket_fuel', collected: false, floatOffset: 0 },
      { id: 'item_1_6', x: 3000, y: 300, w: 34, h: 34, type: 'mystery_box', collected: false, floatOffset: 0 }
    ],
    obstacles: [
      { id: 'obs_1_1', x: 550, y: 305, w: 32, h: 46, type: 'cactus' },
      { id: 'obs_1_2', x: 1250, y: 305, w: 36, h: 46, type: 'cactus' },
      // Painted Tunnel gag!
      { id: 'obs_1_3', x: 1650, y: 230, w: 50, h: 120, type: 'painted_tunnel' },
      { id: 'obs_1_4', x: 2500, y: 300, w: 42, h: 50, type: 'boulder' }
    ]
  },
  {
    id: 2,
    title: '第二關：險峰索橋 & 懸崖秘境',
    subtitle: 'Danger Mesa & Rope Bridges',
    zoneName: 'DANGER MESA',
    length: 4200,
    roadRunnerBaseSpeed: 4.8,
    skyGradient: ['#e74c3c', '#f39c12'],
    canyonColor: '#962d14',
    plateauColor: '#6c1d09',
    platforms: [
      { x: 0, y: 350, w: 600, h: 70, type: 'rock' },
      { x: 720, y: 350, w: 400, h: 22, type: 'bridge' }, // Wobbly suspension bridge
      { x: 1250, y: 320, w: 200, h: 24, type: 'floating', moving: { axis: 'y', range: 60, speed: 0.03, initialPos: 320 } },
      { x: 1550, y: 350, w: 700, h: 70, type: 'rock' },
      { x: 1850, y: 210, w: 260, h: 24, type: 'rock' },
      { x: 2380, y: 330, w: 180, h: 24, type: 'floating', moving: { axis: 'x', range: 100, speed: 0.025, initialPos: 2380 } },
      { x: 2700, y: 350, w: 500, h: 22, type: 'bridge' },
      { x: 3300, y: 350, w: 1000, h: 70, type: 'rock' }
    ],
    items: [
      { id: 'item_2_1', x: 350, y: 300, w: 34, h: 34, type: 'spring', collected: false, floatOffset: 0 },
      { id: 'item_2_2', x: 880, y: 300, w: 34, h: 34, type: 'bird_seed', collected: false, floatOffset: 0 },
      { id: 'item_2_3', x: 1700, y: 300, w: 34, h: 34, type: 'rocket_fuel', collected: false, floatOffset: 0 },
      { id: 'item_2_4', x: 1950, y: 160, w: 34, h: 34, type: 'tnt', collected: false, floatOffset: 0 },
      { id: 'item_2_5', x: 2850, y: 300, w: 34, h: 34, type: 'mystery_box', collected: false, floatOffset: 0 },
      { id: 'item_2_6', x: 3600, y: 300, w: 34, h: 34, type: 'rocket_fuel', collected: false, floatOffset: 0 }
    ],
    obstacles: [
      { id: 'obs_2_1', x: 450, y: 150, w: 40, h: 36, type: 'anvil', vy: 0, triggered: false }, // Falling anvil trap
      { id: 'obs_2_2', x: 1680, y: 305, w: 34, h: 45, type: 'cactus' },
      { id: 'obs_2_3', x: 2150, y: 300, w: 44, h: 50, type: 'boulder' },
      { id: 'obs_2_4', x: 3450, y: 120, w: 42, h: 38, type: 'anvil', vy: 0, triggered: false }
    ]
  },
  {
    id: 3,
    title: '第三關：ACME 軍火庫 & 採礦鐵道',
    subtitle: 'Acme Industrial Depot & Rail Mines',
    zoneName: 'ACME DEPOT',
    length: 5000,
    roadRunnerBaseSpeed: 5.4,
    skyGradient: ['#8e44ad', '#d35400'],
    canyonColor: '#4a235a',
    plateauColor: '#341940',
    platforms: [
      { x: 0, y: 350, w: 800, h: 70, type: 'depot' },
      { x: 920, y: 280, w: 350, h: 24, type: 'depot' },
      { x: 1400, y: 350, w: 900, h: 70, type: 'depot' },
      { x: 1750, y: 210, w: 400, h: 24, type: 'depot' },
      { x: 2450, y: 320, w: 250, h: 24, type: 'floating', moving: { axis: 'y', range: 70, speed: 0.035, initialPos: 320 } },
      { x: 2850, y: 350, w: 850, h: 70, type: 'depot' },
      { x: 3850, y: 250, w: 400, h: 24, type: 'depot' },
      { x: 4350, y: 350, w: 1000, h: 70, type: 'depot' }
    ],
    items: [
      { id: 'item_3_1', x: 450, y: 300, w: 34, h: 34, type: 'rocket_fuel', collected: false, floatOffset: 0 },
      { id: 'item_3_2', x: 1050, y: 230, w: 34, h: 34, type: 'tnt', collected: false, floatOffset: 0 },
      { id: 'item_3_3', x: 1550, y: 300, w: 34, h: 34, type: 'spring', collected: false, floatOffset: 0 },
      { id: 'item_3_4', x: 1900, y: 160, w: 34, h: 34, type: 'rocket_fuel', collected: false, floatOffset: 0 },
      { id: 'item_3_5', x: 3100, y: 300, w: 34, h: 34, type: 'tnt', collected: false, floatOffset: 0 },
      { id: 'item_3_6', x: 4000, y: 200, w: 34, h: 34, type: 'mystery_box', collected: false, floatOffset: 0 }
    ],
    obstacles: [
      { id: 'obs_3_1', x: 600, y: 300, w: 38, h: 48, type: 'tnt_barrel' },
      { id: 'obs_3_2', x: 1650, y: 300, w: 38, h: 48, type: 'tnt_barrel' },
      { id: 'obs_3_3', x: 2100, y: 110, w: 42, h: 38, type: 'anvil', vy: 0, triggered: false },
      { id: 'obs_3_4', x: 3400, y: 240, w: 50, h: 110, type: 'painted_tunnel' },
      { id: 'obs_3_5', x: 4600, y: 300, w: 38, h: 48, type: 'tnt_barrel' }
    ]
  }
];

export function createProceduralChunk(startX: number, chunkIndex: number): {
  platforms: Platform[];
  items: AcmeItem[];
  obstacles: Obstacle[];
} {
  const platforms: Platform[] = [];
  const items: AcmeItem[] = [];
  const obstacles: Obstacle[] = [];

  const groundWidth = 700 + Math.random() * 400;
  const gapWidth = 140 + Math.random() * 120;
  
  // Main ground
  platforms.push({
    x: startX,
    y: 350,
    w: groundWidth,
    h: 70,
    type: chunkIndex % 3 === 2 ? 'depot' : 'rock'
  });

  // Elevated ledge
  if (Math.random() > 0.4) {
    const ledgeX = startX + 200 + Math.random() * 200;
    const ledgeY = 220 + Math.random() * 50;
    const ledgeW = 200 + Math.random() * 100;
    platforms.push({
      x: ledgeX,
      y: ledgeY,
      w: ledgeW,
      h: 24,
      type: Math.random() > 0.5 ? 'floating' : 'rock',
      moving: Math.random() > 0.6 ? {
        axis: Math.random() > 0.5 ? 'y' : 'x',
        range: 40 + Math.random() * 40,
        speed: 0.02 + Math.random() * 0.02,
        initialPos: ledgeY
      } : undefined
    });

    // Item on ledge
    const types: AcmeItem['type'][] = ['rocket_fuel', 'spring', 'tnt', 'mystery_box', 'bird_seed'];
    items.push({
      id: `proc_item_ledge_${startX}`,
      x: ledgeX + ledgeW / 2 - 17,
      y: ledgeY - 40,
      w: 34,
      h: 34,
      type: types[Math.floor(Math.random() * types.length)],
      collected: false,
      floatOffset: 0
    });
  }

  // Ground item
  if (Math.random() > 0.5) {
    const types: AcmeItem['type'][] = ['rocket_fuel', 'spring', 'tnt', 'bird_seed'];
    items.push({
      id: `proc_item_ground_${startX}`,
      x: startX + 150 + Math.random() * 300,
      y: 305,
      w: 34,
      h: 34,
      type: types[Math.floor(Math.random() * types.length)],
      collected: false,
      floatOffset: 0
    });
  }

  // Obstacle
  if (Math.random() > 0.35) {
    const obsTypes: Obstacle['type'][] = ['cactus', 'boulder', 'anvil', 'tnt_barrel'];
    const chosen = obsTypes[Math.floor(Math.random() * obsTypes.length)];
    obstacles.push({
      id: `proc_obs_${startX}`,
      x: startX + 350 + Math.random() * (groundWidth - 450),
      y: chosen === 'anvil' ? 120 : (chosen === 'cactus' ? 305 : 300),
      w: chosen === 'cactus' ? 32 : (chosen === 'boulder' ? 44 : 38),
      h: chosen === 'cactus' ? 45 : (chosen === 'boulder' ? 50 : 42),
      type: chosen,
      vy: chosen === 'anvil' ? 0 : undefined,
      triggered: false
    });
  }

  return { platforms, items, obstacles };
}
