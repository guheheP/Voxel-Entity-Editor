import { box, mergeVoxels } from '../helpers.js';

function buildStructure() {
  return mergeVoxels(
    box(2, 0, 2, 4, 8, 4, 0), // wooden legs/base
    box(1, 8, 1, 6, 1, 6, 0), // platform
    box(1, 9, 1, 1, 2, 1, 1), // railing corners
    box(6, 9, 1, 1, 2, 1, 1),
    box(1, 9, 6, 1, 2, 1, 1),
    box(6, 9, 6, 1, 2, 1, 1),
  );
}

function buildWeapon() {
  return mergeVoxels(
    box(3, 0, 3, 2, 1, 5, 2), // ballista body
    box(1, 0, 5, 6, 1, 1, 0), // bow arms
  );
}

export const arrowTowerDef = {
  name: 'Arrow Tower', type: 'static', voxelSize: 1,
  palette: ['#8D6E63', '#5D4037', '#757575'],
  parts: [
    { name: 'structure', parent: null, position: [0, 0, 0], center: [4, 0, 4], voxels: buildStructure() },
    { name: 'weapon', parent: 'structure', position: [0, 9, 0], center: [4, 0, 4], voxels: buildWeapon() }
  ],
  animations: {
    idle: {
      duration: 3.0, loop: true,
      keyframes: [
        { time: 0, parts: { weapon: { rotation: [0, -0.2, 0] } } },
        { time: 1.5, parts: { weapon: { rotation: [0, 0.2, 0] } } },
        { time: 3.0, parts: { weapon: { rotation: [0, -0.2, 0] } } }
      ]
    },
    shoot: {
      duration: 0.5, loop: false,
      keyframes: [
        { time: 0, parts: { weapon: { position: [0, 0, 0] } } },
        { time: 0.1, parts: { weapon: { position: [0, 0, -1] } } }, // recoil
        { time: 0.5, parts: { weapon: { position: [0, 0, 0] } } }
      ]
    }
  }
};
