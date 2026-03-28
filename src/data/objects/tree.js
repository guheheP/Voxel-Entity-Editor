import { box, mergeVoxels } from '../helpers.js';

function buildStructure() {
  return mergeVoxels(
    box(3, 0, 3, 2, 5, 2, 0), // trunk
    box(1, 5, 1, 6, 3, 6, 1), // bottom leaves
    box(2, 8, 2, 4, 2, 4, 1), // top leaves
  );
}

export const treeDef = {
  name: 'Tree', type: 'static', voxelSize: 1,
  palette: ['#5C3A1E', '#4CAF50'],
  parts: [{ name: 'structure', parent: null, position: [0, 0, 0], center: [4, 0, 4], voxels: buildStructure() }],
  animations: {}
};
