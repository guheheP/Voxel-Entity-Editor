import { box, mergeVoxels } from '../helpers.js';

function buildStructure() {
  return mergeVoxels(
    box(0, 0, 0, 16, 12, 10, 0), // massive stone keep
    // Merlons (battlements leading up to edge)
    box(0, 12, 0, 2, 2, 2, 1), box(4, 12, 0, 2, 2, 2, 1),
    box(8, 12, 0, 2, 2, 2, 1), box(12, 12, 0, 2, 2, 2, 1),
    box(0, 12, 8, 2, 2, 2, 1), box(4, 12, 8, 2, 2, 2, 1),
    box(8, 12, 8, 2, 2, 2, 1), box(12, 12, 8, 2, 2, 2, 1),
    box(0, 12, 4, 2, 2, 2, 1), box(12, 12, 4, 2, 2, 2, 1),
    // Shield / Banner on front
    box(6, 6, -1, 4, 4, 1, 3), // gold trim
    box(7, 7, -1, 2, 2, 1, 4), // red center
  );
}

function buildGate() {
  return mergeVoxels(
    box(0, 0, 0, 6, 8, 1, 2), // wood
    box(0, 2, -1, 6, 1, 1, 1), // iron bands
    box(0, 5, -1, 6, 1, 1, 1)
  );
}

export const castleBaseDef = {
  name: 'Castle Base', type: 'static', voxelSize: 1.2, // very large base
  palette: ['#9E9E9E', '#616161', '#5D4037', '#FFD54F', '#D32F2F'],
  parts: [
    { name: 'structure', parent: null, position: [0, 0, 0], center: [8, 0, 5], voxels: buildStructure() },
    { name: 'gate', parent: 'structure', position: [5, 0, 0], center: [3, 0, 0], voxels: buildGate() } // gate is at Z=0 front
  ],
  animations: {}
};
