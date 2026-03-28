import { box, mergeVoxels } from '../helpers.js';

function buildStructure() {
  return mergeVoxels(
    box(1, 0, 1, 6, 3, 5, 0),
    box(0, 0, 2, 8, 2, 3, 0),
    box(2, 3, 2, 4, 1, 3, 1),
  );
}

export const rockDef = {
  name: 'Rock', type: 'static', voxelSize: 1,
  palette: ['#757575', '#9E9E9E'],
  parts: [{ name: 'structure', parent: null, position: [0, 0, 0], center: [4, 0, 3], voxels: buildStructure() }],
  animations: {}
};
