import { box, mergeVoxels } from '../helpers.js';

function buildStructure() {
  return mergeVoxels(
    box(1, 0, 1, 6, 6, 6, 0), // stone base
    box(0, 6, 0, 8, 2, 8, 1), // dark stone rim
  );
}

function buildCannon() {
  return mergeVoxels(
    box(3, 0, 1, 2, 3, 7, 2), // cannon barrel
    box(2, 0, 3, 4, 1, 4, 0), // cannon mount
  );
}

export const cannonTowerDef = {
  name: 'Cannon Tower', type: 'static', voxelSize: 1,
  palette: ['#9E9E9E', '#616161', '#212121'],
  parts: [
    { name: 'structure', parent: null, position: [0, 0, 0], center: [4, 0, 4], voxels: buildStructure() },
    { name: 'cannon', parent: 'structure', position: [0, 8, 0], center: [4, 0, 4], voxels: buildCannon() }
  ],
  animations: {
    idle: {
      duration: 4.0, loop: true,
      keyframes: [
        { time: 0, parts: { cannon: { rotation: [0, -0.3, 0] } } },
        { time: 2.0, parts: { cannon: { rotation: [0, 0.3, 0] } } },
        { time: 4.0, parts: { cannon: { rotation: [0, -0.3, 0] } } }
      ]
    },
    fire: {
      duration: 0.8, loop: false,
      keyframes: [
        { time: 0, parts: { cannon: { position: [0, 0, 0], rotation: [-0.2, 0, 0] } } }, // angle up slightly
        { time: 0.1, parts: { cannon: { position: [0, 0, -1.5], rotation: [0.3, 0, 0] } } }, // massive recoil
        { time: 0.8, parts: { cannon: { position: [0, 0, 0], rotation: [0, 0, 0] } } } // reset
      ]
    }
  }
};
