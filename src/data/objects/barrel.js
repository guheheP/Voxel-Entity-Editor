import { box, mergeVoxels } from '../helpers.js';

function buildStructure() {
  return mergeVoxels(
    box(1, 0, 1, 4, 6, 4, 0),
    box(0, 1, 1, 6, 4, 4, 0),
    box(1, 1, 0, 4, 4, 6, 0),
    // Metal bands
    box(0, 1, 1, 6, 1, 4, 1),
    box(0, 4, 1, 6, 1, 4, 1),
    box(1, 1, 0, 4, 1, 6, 1),
    box(1, 4, 0, 4, 1, 6, 1),
  );
}

export const barrelDef = {
  name: 'Barrel', type: 'static', voxelSize: 1,
  palette: ['#A0522D', '#757575'],
  parts: [{ name: 'structure', parent: null, position: [0, 0, 0], center: [3, 0, 3], voxels: buildStructure() }],
  animations: {}
};
