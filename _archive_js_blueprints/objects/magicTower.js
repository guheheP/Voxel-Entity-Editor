import { box, mergeVoxels } from '../helpers.js';

function buildBase() {
  return mergeVoxels(
    box(2, 0, 2, 4, 6, 4, 0), // stone pillar
    box(1, 6, 1, 6, 2, 6, 1)  // gold rim
  );
}

function buildCrystal() {
  return mergeVoxels(
    box(3, 0, 3, 2, 4, 2, 2)  // floating crystal
  );
}

export const magicTowerDef = {
  name: 'Magic Tower', type: 'static', voxelSize: 1,
  palette: ['#757575', '#FFD54F', '#00BCD4'], // stone, gold, cyan crystal
  parts: [
    { name: 'base', parent: null, position: [0, 0, 0], center: [4, 0, 4], voxels: buildBase() },
    { name: 'crystal', parent: 'base', position: [0, 9, 0], center: [4, 2, 4], voxels: buildCrystal() } // center pivot in middle of crystal
  ],
  animations: {
    idle: {
      duration: 4.0, loop: true,
      keyframes: [
        { time: 0, parts: { crystal: { position: [0, 0, 0], rotation: [0, 0, 0] } } },
        { time: 2.0, parts: { crystal: { position: [0, 0.5, 0], rotation: [0, 3.14, 0] } } }, // float up and half turn
        { time: 4.0, parts: { crystal: { position: [0, 0, 0], rotation: [0, 6.28, 0] } } } // float down and complete turn
      ]
    },
    cast: {
      duration: 1.0, loop: false,
      keyframes: [
        { time: 0, parts: { crystal: { position: [0, 0, 0], rotation: [0, 0, 0] } } },
        { time: 0.5, parts: { crystal: { position: [0, 1.5, 0], rotation: [0, 6.28, 0] } } }, // spin fast and jump up
        { time: 1.0, parts: { crystal: { position: [0, 0, 0], rotation: [0, 12.56, 0] } } }
      ]
    }
  }
};
