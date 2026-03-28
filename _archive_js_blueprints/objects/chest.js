import { box, mergeVoxels } from '../helpers.js';

function buildBase() {
  return mergeVoxels(
    box(0, 0, 0, 8, 4, 6, 0),  // wood base
    box(3, 3, 6, 2, 1, 1, 1)   // lock bottom
  );
}

function buildLid() {
  return mergeVoxels(
    box(0, 0, 0, 8, 2, 6, 0),  // wood top
    box(3, 0, 6, 2, 1, 1, 1)   // lock top
  );
}

export const chestDef = {
  name: 'Chest', type: 'static', voxelSize: 1,
  palette: ['#8D6E63', '#FFD54F'],
  parts: [
    { name: 'base', parent: null, position: [0, 0, 0], center: [4, 0, 3], voxels: buildBase() },
    { name: 'lid', parent: 'base', position: [0, 4, -3], center: [4, 0, 0], voxels: buildLid() }
  ],
  animations: {
    idle: {
      duration: 1.0, loop: true,
      keyframes: [{ time: 0, parts: { lid: { rotation: [0, 0, 0] } } }]
    },
    open: {
      duration: 0.5, loop: false,
      keyframes: [
        { time: 0, parts: { lid: { rotation: [0, 0, 0] } } },
        { time: 0.5, parts: { lid: { rotation: [-1.6, 0, 0] } } },
        { time: 1.0, parts: { lid: { rotation: [-1.6, 0, 0] } } }
      ]
    }
  }
};
