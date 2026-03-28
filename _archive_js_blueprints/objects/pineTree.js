import { box, mergeVoxels } from '../helpers.js';

function buildStructure() {
  return mergeVoxels(
    box(3, 0, 3, 2, 3, 2, 0), // trunk
    box(0, 3, 0, 8, 2, 8, 1),
    box(1, 4, 1, 6, 3, 6, 1),
    box(2, 6, 2, 4, 3, 4, 1),
    box(3, 8, 3, 2, 3, 2, 1)
  );
}

export const pineTreeDef = {
  name: 'Pine Tree', type: 'static', voxelSize: 1,
  palette: ['#3E2723', '#2E7D32'],
  parts: [{ name: 'structure', parent: null, position: [0, 0, 0], center: [4, 0, 4], voxels: buildStructure() }],
  animations: {}
};
