import fs from 'fs';
import path from 'path';
import { box, mergeVoxels } from './helpers.js';

const outDir = path.join(process.cwd(), '../public/presets');

function saveDef(genre, def) {
  const dir = path.join(outDir, genre);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${def.name}.json`), JSON.stringify(def, null, 2));
  console.log(`Saved ${def.name}.json to ${genre}`);
}

function createHumanoid(name, colors, features) {
  return {
    name: name, type: 'humanoid', voxelSize: 1, palette: colors,
    parts: [
      { name: 'body', parent: null, position: [0, 7.5, 0], center: [3, 2.5, 2], voxels: box(0,0,0, 6,5,4, 0) },
      { name: 'head', parent: 'body', position: [0, 2.5, 0], center: [3, 0, 3], voxels: mergeVoxels(box(1,0,0, 4,4,4, 1), ...features) },
      { name: 'rightArm', parent: 'body', position: [-4, 2.5, 0], center: [1, 5, 1], voxels: box(0,0,0, 2,5,2, 1) },
      { name: 'leftArm', parent: 'body', position: [4, 2.5, 0], center: [1, 5, 1], voxels: box(0,0,0, 2,5,2, 1) },
      { name: 'rightLeg', parent: 'body', position: [-1.5, -2.5, 0], center: [1.5, 5, 1.5], voxels: box(0,0,0, 3,5,3, 2) },
      { name: 'leftLeg', parent: 'body', position: [1.5, -2.5, 0], center: [1.5, 5, 1.5], voxels: box(0,0,0, 3,5,3, 2) }
    ],
    animations: {
      idle: { duration: 2, loop: true, keyframes: [ {time:0, parts:{body:{rotation:[0,0,0]}}}, {time:1, parts:{body:{rotation:[0.05,0,0]}}}, {time:2, parts:{body:{rotation:[0,0,0]}}} ] },
      walk: { duration: 1, loop: true, keyframes: [ {time:0, parts:{rightLeg:{rotation:[-0.5,0,0]}, leftLeg:{rotation:[0.5,0,0]}}}, {time:0.5, parts:{rightLeg:{rotation:[0.5,0,0]}, leftLeg:{rotation:[-0.5,0,0]}}}, {time:1, parts:{rightLeg:{rotation:[-0.5,0,0]}, leftLeg:{rotation:[0.5,0,0]}}} ] }
    }
  };
}

function createTower(name, colors, topFeatures) {
  return {
    name: name, type: 'tower', voxelSize: 1, palette: colors,
    parts: [
      { name: 'base', parent: null, position: [0,0,0], center: [5,0,5], voxels: mergeVoxels(box(0,0,0, 10,8,10, 0), box(1,8,1, 8,6,8, 1)) },
      { name: 'top', parent: 'base', position: [0,14,0], center: [5,0,5], voxels: mergeVoxels(...topFeatures) }
    ],
    animations: {
      idle: { duration: 3, loop: true, keyframes: [ {time:0, parts:{top:{rotation:[0,0,0]}}}, {time:1.5, parts:{top:{rotation:[0,Math.PI,0]}}}, {time:3, parts:{top:{rotation:[0,Math.PI*2,0]}}} ] }
    }
  };
}

function createProp(name, colors, voxels, center = [5,0,5]) {
  return {
    name: name, type: 'prop', voxelSize: 1, palette: colors,
    parts: [ { name: 'base', parent: null, position: [0,0,0], center: center, voxels: mergeVoxels(...voxels) } ],
    animations: { idle: { duration: 1, loop: true, keyframes: [ {time:0, parts:{base:{rotation:[0,0,0]}}}, {time:1, parts:{base:{rotation:[0,0,0]}}} ] } }
  };
}

// 1. RPG Characters
saveDef('RPG_Characters', createHumanoid('Mage', ['#4b0082', '#ffccaa', '#111111', '#e6c229'], [box(0,4,0, 6,2,6, 0), box(1,6,1, 4,3,4, 0)] )); // Hat
saveDef('RPG_Characters', createHumanoid('Archer', ['#2e8b57', '#ffccaa', '#8b4513', '#111111'], [box(0,3,-1, 6,3,6, 0)] )); // Hood
saveDef('RPG_Characters', createHumanoid('King', ['#b22222', '#ffccaa', '#111111', '#ffd700'], [box(0,4,0, 6,1,6, 3), box(1,-5,6, 4,10,1, 0)] )); // Crown & Cape
saveDef('RPG_Characters', {
  name: 'Bat', type: 'quadruped', voxelSize: 1, palette: ['#2e2e2e', '#111111', '#c1121f'],
  parts: [
    { name: 'body', parent: null, position: [0, 10, 0], center: [2,2,2], voxels: mergeVoxels(box(0,0,0, 4,4,4, 0), box(1,2,-1, 1,1,1, 2), box(2,2,-1, 1,1,1, 2)) },
    { name: 'leftWing', parent: 'body', position: [2, 2, 2], center: [0,0,0], voxels: box(0,0,0, 6,1,3, 0) },
    { name: 'rightWing', parent: 'body', position: [-2, 2, 2], center: [0,0,0], voxels: box(-6,0,0, 6,1,3, 0) }
  ],
  animations: {
    idle: { duration: 0.5, loop: true, keyframes: [ {time:0, parts:{body:{position:[0,0.5,0]}, leftWing:{rotation:[0,0,-1]}, rightWing:{rotation:[0,0,1]}}}, {time:0.25, parts:{body:{position:[0,-0.5,0]}, leftWing:{rotation:[0,0,0.8]}, rightWing:{rotation:[0,0,-0.8]}}}, {time:0.5, parts:{body:{position:[0,0.5,0]}, leftWing:{rotation:[0,0,-1]}, rightWing:{rotation:[0,0,1]}}} ] },
    walk: { duration: 0.5, loop: true, keyframes: [ {time:0, parts:{body:{position:[0,0,0]}}} ] }
  }
});

// 2. RPG Props
saveDef('RPG_Props', createProp('Well', ['#7f8c8d', '#8b4513', '#3498db', '#2c3e50'], [box(0,0,0, 8,6,8, 0), box(1,3,1, 6,1,6, 2), box(0,6,3, 1,6,2, 1), box(7,6,3, 1,6,2, 1), box(-1,12,2, 10,2,4, 3)], [4,0,4]));
saveDef('RPG_Props', createProp('Tent', ['#e67e22', '#8b4513'], [box(0,0,0, 10,6,12, 0), box(2,6,2, 6,4,8, 0), box(4,10,4, 2,2,4, 0)], [5,0,6]));
saveDef('RPG_Props', createProp('Anvil', ['#555555', '#333333', '#8b4513'], [box(2,0,2, 4,4,4, 2), box(1,4,1, 6,2,6, 0), box(0,6,0, 8,3,8, 0), box(2,6,-2, 4,2,2, 0)], [4,0,4]));

const bannerDef = createProp('Banner', ['#8b4513', '#c0392b', '#f1c40f'], [box(3,0,3, 2,16,2, 0)], [4,0,4]);
bannerDef.parts.push({ name: 'flag', parent: 'base', position: [2,12,0], center: [2,0,4], voxels: box(0,0,0, 1,4,8, 1) });
bannerDef.animations.idle = { duration: 1.5, loop: true, keyframes: [ {time:0, parts:{flag:{rotation:[0.1,0,0]}}}, {time:0.75, parts:{flag:{rotation:[-0.1,0,0]}}}, {time:1.5, parts:{flag:{rotation:[0.1,0,0]}}} ] };
saveDef('RPG_Props', bannerDef);

// 3. TD Towers
saveDef('TD_Towers', createTower('Ice Tower', ['#bdc3c7', '#2980b9', '#00ffff'], [box(3,2,3, 4,8,4, 2)]));
saveDef('TD_Towers', createTower('Poison Tower', ['#34495e', '#2c3e50', '#2ecc71'], [box(2,0,2, 6,6,6, 2), box(3,6,3, 4,2,4, 2)]));
saveDef('TD_Towers', createTower('Laser Tower', ['#2c3e50', '#7f8c8d', '#e74c3c'], [box(4,0,4, 2,6,2, 1), box(3,6,3, 4,4,4, 2)]));

// 4. TD Enemies
saveDef('TD_Enemies', createHumanoid('Troll', ['#2ecc71', '#27ae60', '#e67e22', '#111111'], [box(0,4,4, 6,4,3, 0)])); // Hunched back
saveDef('TD_Enemies', {
  name: 'Giant Spider', type: 'quadruped', voxelSize: 1, palette: ['#2c3e50', '#c0392b'],
  parts: [
    { name: 'body', parent: null, position: [0, 3, 0], center: [4,2,4], voxels: mergeVoxels(box(1,0,1, 6,4,6, 0), box(3,4,5, 2,2,4, 0), box(2,2,-1, 1,1,1, 1), box(5,2,-1, 1,1,1, 1)) },
    { name: 'leg1', parent: 'body', position: [-3, 2, -2], center: [0,0,0], voxels: box(-4,0,0, 4,1,1, 0) },
    { name: 'leg2', parent: 'body', position: [3, 2, -2], center: [0,0,0], voxels: box(0,0,0, 4,1,1, 0) },
    { name: 'leg3', parent: 'body', position: [-3, 2, 2], center: [0,0,0], voxels: box(-4,0,0, 4,1,1, 0) },
    { name: 'leg4', parent: 'body', position: [3, 2, 2], center: [0,0,0], voxels: box(0,0,0, 4,1,1, 0) }
  ],
  animations: {
    walk: { duration: 0.6, loop: true, keyframes: [ {time:0, parts:{body:{position:[0,0,0]}, leg1:{rotation:[0,-0.2,0.4]}, leg2:{rotation:[0,0.2,-0.4]}, leg3:{rotation:[0,-0.2,-0.4]}, leg4:{rotation:[0,0.2,0.4]}}}, {time:0.3, parts:{body:{position:[0,1,0]}, leg1:{rotation:[0,0.2,-0.4]}, leg2:{rotation:[0,-0.2,0.4]}, leg3:{rotation:[0,0.2,0.4]}, leg4:{rotation:[0,-0.2,-0.4]}}}, {time:0.6, parts:{body:{position:[0,0,0]}, leg1:{rotation:[0,-0.2,0.4]}, leg2:{rotation:[0,0.2,-0.4]}, leg3:{rotation:[0,-0.2,-0.4]}, leg4:{rotation:[0,0.2,0.4]}}} ] },
    idle: { duration: 1, loop: true, keyframes: [ {time:0, parts:{body:{position:[0,0,0]}}}, {time:1, parts:{body:{position:[0,0,0]}}} ] }
  }
});

// 5. TD Bases & Traps
const trapDef = createProp('Spike Trap', ['#7f8c8d', '#bdc3c7', '#c0392b'], [box(0,0,0, 10,2,10, 0)], [5,0,5]);
trapDef.parts.push({ name: 'spikes', parent: 'base', position: [0,0,0], center: [5,0,5], voxels: mergeVoxels(box(2,0,2, 1,4,1, 1), box(7,0,7, 1,4,1, 1), box(7,0,2, 1,4,1, 1), box(2,0,7, 1,4,1, 1)) });
trapDef.animations.idle = { duration: 2, loop: true, keyframes: [ {time:0, parts:{spikes:{position:[0,-3,0]}}}, {time:0.5, parts:{spikes:{position:[0,-3,0]}}}, {time:0.6, parts:{spikes:{position:[0,2,0]}}}, {time:1.5, parts:{spikes:{position:[0,2,0]}}}, {time:1.6, parts:{spikes:{position:[0,-3,0]}}}, {time:2, parts:{spikes:{position:[0,-3,0]}}} ] };
saveDef('TD_Bases_and_Traps', trapDef);

saveDef('TD_Bases_and_Traps', createProp('Stone Wall', ['#95a5a6', '#7f8c8d'], [box(0,0,0, 12,10,6, 0), box(0,10,0, 2,2,6, 1), box(5,10,0, 2,2,6, 1), box(10,10,0, 2,2,6, 1)], [6,0,3]));

const catapultDef = createProp('Catapult', ['#8b4513', '#555555', '#333333'], [box(0,0,0, 8,2,10, 0), box(-1,0,1, 1,4,4, 1), box(8,0,1, 1,4,4, 1)], [4,0,5]);
catapultDef.parts.push({ name: 'arm', parent: 'base', position: [0,2,1], center: [0,0,0], voxels: box(-1,0,-6, 2,1,8, 0) });
catapultDef.animations.idle = { duration: 1, loop: false, keyframes: [ {time:0, parts:{arm:{rotation:[0,0,0]}}}, {time:1, parts:{arm:{rotation:[0,0,0]}}} ] };
catapultDef.animations.attack = { duration: 1, loop: false, keyframes: [ {time:0, parts:{arm:{rotation:[0,0,0]}}}, {time:0.2, parts:{arm:{rotation:[-1.2,0,0]}}}, {time:0.5, parts:{arm:{rotation:[-1.2,0,0]}}}, {time:1, parts:{arm:{rotation:[0,0,0]}}} ] };
saveDef('TD_Bases_and_Traps', catapultDef);

console.log('Batch 2 generation successful!');
