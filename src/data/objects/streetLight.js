import { box, mergeVoxels, setVoxels } from '../helpers.js';

/**
 * Street Light - Static voxel object
 *
 * Palette:
 *  0 = pole (dark iron)
 *  1 = lamp housing (dark gray)
 *  2 = light (warm yellow glow)
 *  3 = base (stone)
 */

function buildPole() {
  return mergeVoxels(
    // Base
    box(0, 0, 0, 3, 1, 3, 3),
    box(1, 1, 1, 1, 1, 1, 3),

    // Pole
    box(1, 2, 1, 1, 9, 1, 0),

    // Lamp arm (extends forward at top)
    box(1, 11, 0, 1, 1, 2, 0),

    // Lamp housing
    box(0, 11, -1, 3, 1, 2, 1),
    box(0, 10, -1, 3, 1, 2, 1),

    // Light (glowing part underneath)
    setVoxels([1, 10, -1, 2], [1, 10, 0, 2]),
  );
}

export const streetLightDef = {
  name: 'Street Light',
  type: 'static',
  voxelSize: 1,

  palette: [
    '#3A3A3A', // 0: pole dark iron
    '#4A4A4A', // 1: lamp housing
    '#FFE066', // 2: light warm yellow
    '#888877', // 3: base stone
  ],

  parts: [
    {
      name: 'structure',
      parent: null,
      position: [0, 0, 0],
      center: [1.5, 0, 1],
      voxels: buildPole(),
    },
  ],

  animations: {},
};
