import { box, mergeVoxels, setVoxels } from '../helpers.js';

function buildBase() {
  return mergeVoxels(
    box(0, 0, 0, 6, 1, 6, 0), // stones (simplified as base square)
    // Wood logs
    box(1, 1, 2, 4, 1, 2, 1),
    box(2, 2, 1, 2, 1, 4, 1),
  );
}

function buildFire() {
  return mergeVoxels(
    box(2, 0, 2, 2, 2, 2, 2), // orange base
    setVoxels([2, 2, 2, 3], [3, 2, 2, 3], [2, 2, 3, 3], [3, 2, 3, 3]), // yellow top
  );
}

export const campfireDef = {
  name: 'Campfire', type: 'static', voxelSize: 1,
  palette: ['#9E9E9E', '#5D4037', '#FF5722', '#FFC107'],
  parts: [
    { name: 'base', parent: null, position: [0, 0, 0], center: [3, 0, 3], voxels: buildBase() },
    { name: 'fire', parent: 'base', position: [0, 3, 0], center: [3, 0, 3], voxels: buildFire() }
  ],
  animations: {
    burn: {
      duration: 0.6, loop: true, keyframes: [
        { time: 0, parts: { fire: { position: [0, 0, 0], rotation: [0, 0, 0] } } },
        { time: 0.3, parts: { fire: { position: [0, -0.2, 0], rotation: [0, 0.1, 0] } } },
        { time: 0.6, parts: { fire: { position: [0, 0, 0], rotation: [0, 0, 0] } } }
      ]
    }
  }
};
