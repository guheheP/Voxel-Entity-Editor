import fs from 'fs';
import path from 'path';

import { humanoidDef } from './src/data/entities/humanoid.js';
import { catDef } from './src/data/entities/cat.js';
import { dogDef } from './src/data/entities/dog.js';
import { knightDef } from './src/data/entities/knight.js';
import { skeletonDef } from './src/data/entities/skeleton.js';
import { slimeDef } from './src/data/entities/slime.js';
import { birdDef } from './src/data/entities/bird.js';
import { goblinDef } from './src/data/entities/goblin.js';
import { orcDef } from './src/data/entities/orc.js';
import { gargoyleDef } from './src/data/entities/gargoyle.js';

import { houseDef } from './src/data/objects/house.js';
import { streetLightDef } from './src/data/objects/streetLight.js';
import { fenceDef } from './src/data/objects/fence.js';
import { treeDef } from './src/data/objects/tree.js';
import { pineTreeDef } from './src/data/objects/pineTree.js';
import { chestDef } from './src/data/objects/chest.js';
import { barrelDef } from './src/data/objects/barrel.js';
import { campfireDef } from './src/data/objects/campfire.js';
import { rockDef } from './src/data/objects/rock.js';
import { arrowTowerDef } from './src/data/objects/arrowTower.js';
import { cannonTowerDef } from './src/data/objects/cannonTower.js';
import { magicTowerDef } from './src/data/objects/magicTower.js';
import { castleBaseDef } from './src/data/objects/castleBase.js';
import { barricadeDef } from './src/data/objects/barricade.js';
import { goldMineDef } from './src/data/objects/goldMine.js';

const categories = [
  {
    genre: 'RPG Characters',
    items: [
      { label: '🧑 Chibi Human', def: humanoidDef },
      { label: '🐾 Cat', def: catDef },
      { label: '🐕 Dog', def: dogDef },
      { label: '⚔️ Knight', def: knightDef },
      { label: '💀 Skeleton', def: skeletonDef },
      { label: '💧 Slime', def: slimeDef },
      { label: '🐦 Bird', def: birdDef },
    ]
  },
  {
    genre: 'RPG Props',
    items: [
      { label: '🏠 House', def: houseDef },
      { label: '💡 Street Light', def: streetLightDef },
      { label: '🪵 Fence', def: fenceDef },
      { label: '🌳 Tree', def: treeDef },
      { label: '🌲 Pine Tree', def: pineTreeDef },
      { label: '🧰 Chest', def: chestDef },
      { label: '🛢️ Barrel', def: barrelDef },
      { label: '🔥 Campfire', def: campfireDef },
      { label: '🪨 Rock', def: rockDef },
    ]
  },
  {
    genre: 'TD Towers',
    items: [
      { label: '🏹 Arrow Tower', def: arrowTowerDef },
      { label: '💣 Cannon Tower', def: cannonTowerDef },
      { label: '🔮 Magic Tower', def: magicTowerDef },
    ]
  },
  {
    genre: 'TD Enemies',
    items: [
      { label: '🟢 Goblin', def: goblinDef },
      { label: '🧌 Orc', def: orcDef },
      { label: '🦇 Gargoyle', def: gargoyleDef },
    ]
  },
  {
    genre: 'TD Bases & Traps',
    items: [
      { label: '🏰 Castle Base', def: castleBaseDef },
      { label: '🚧 Barricade', def: barricadeDef },
      { label: '💰 Gold Mine', def: goldMineDef },
    ]
  }
];

const baseOutDir = path.join(process.cwd(), 'public', 'presets');
if (fs.existsSync(baseOutDir)) {
  fs.rmSync(baseOutDir, { recursive: true, force: true });
}

const manifest = [];

categories.forEach(cat => {
  const catDirName = cat.genre.replace(/ /g, '_').replace(/&/g, 'and');
  const catOutDir = path.join(baseOutDir, catDirName);
  fs.mkdirSync(catOutDir, { recursive: true });

  const manifestCategory = {
    genre: cat.genre,
    items: []
  };

  cat.items.forEach(item => {
    const fileName = `${item.def.name}.json`;
    const filePath = path.join(catOutDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(item.def, null, 2));

    manifestCategory.items.push({
      label: item.label,
      name: item.def.name,
      type: item.def.type,
      url: `/presets/${catDirName}/${encodeURIComponent(fileName)}`
    });
  });

  manifest.push(manifestCategory);
});

fs.writeFileSync(path.join(process.cwd(), 'public', 'presets.json'), JSON.stringify(manifest, null, 2));
console.log('Exported all presets to public/presets/ and generated public/presets.json');
