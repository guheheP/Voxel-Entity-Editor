import { box, mergeVoxels } from '../helpers.js';

function buildStructure() {
  return mergeVoxels(
    // Base rolling log
    box(0, 0, 2, 14, 2, 2, 0),
    // Angled spikes (simulated as vertical blocks with lighter tips)
    box(2, 0, 0, 2, 5, 2, 0), box(2, 5, 0, 2, 2, 2, 1),
    box(6, 0, 0, 2, 5, 2, 0), box(6, 5, 0, 2, 2, 2, 1),
    box(10, 0, 0, 2, 5, 2, 0), box(10, 5, 0, 2, 2, 2, 1),

    box(4, 0, 4, 2, 4, 2, 0), box(4, 4, 4, 2, 2, 2, 1),
    box(8, 0, 4, 2, 4, 2, 0), box(8, 4, 4, 2, 2, 2, 1)
  );
}

export const barricadeDef = {
  name: 'Barricade', type: 'static', voxelSize: 1,
  palette: ['#5D4037', '#BCAAA4'], // dark wood, peeled tip
  parts: [
    { name: 'structure', parent: null, position: [0, 0, 0], center: [7, 0, 3], voxels: buildStructure() }
  ],
  animations: {}
};
