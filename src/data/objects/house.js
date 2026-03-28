import { box, mergeVoxels, setVoxels } from '../helpers.js';

/**
 * House - Static voxel building
 *
 * Palette:
 *  0 = wall (warm beige)
 *  1 = roof (red-brown)
 *  2 = door (dark wood)
 *  3 = window frame (light blue)
 *  4 = window glass (blue)
 *  5 = chimney (gray)
 *  6 = floor/foundation (stone)
 */

function buildStructure() {
  return mergeVoxels(
    // Foundation
    box(0, 0, 0, 10, 1, 8, 6),
    // Walls
    box(0, 1, 0, 10, 7, 1, 0),  // front wall
    box(0, 1, 7, 10, 7, 1, 0),  // back wall
    box(0, 1, 0, 1, 7, 8, 0),   // left wall
    box(9, 1, 0, 1, 7, 8, 0),   // right wall

    // Door (front wall, z=0)
    box(4, 1, 0, 2, 4, 1, 2),

    // Windows - front
    box(1, 4, 0, 2, 2, 1, 3),   // left window frame
    box(7, 4, 0, 2, 2, 1, 3),   // right window frame
    setVoxels([1, 4, 0, 4], [2, 4, 0, 4], [1, 5, 0, 4], [2, 5, 0, 4]),  // glass
    setVoxels([7, 4, 0, 4], [8, 4, 0, 4], [7, 5, 0, 4], [8, 5, 0, 4]),  // glass

    // Roof - triangle shape
    box(0, 8, 0, 10, 1, 8, 1),   // base roof layer
    box(1, 9, 1, 8, 1, 6, 1),    // middle
    box(2, 10, 2, 6, 1, 4, 1),   // upper
    box(3, 11, 3, 4, 1, 2, 1),   // peak

    // Chimney
    box(7, 8, 5, 2, 4, 2, 5),
  );
}

export const houseDef = {
  name: 'House',
  type: 'static',
  voxelSize: 1,

  palette: [
    '#E8D5B7', // 0: wall beige
    '#A0522D', // 1: roof brown-red
    '#5C3A1E', // 2: door dark wood
    '#DDEEFF', // 3: window frame
    '#88BBEE', // 4: window glass
    '#777777', // 5: chimney gray
    '#999988', // 6: foundation stone
  ],

  parts: [
    {
      name: 'structure',
      parent: null,
      position: [0, 0, 0],
      center: [5, 0, 4],
      voxels: buildStructure(),
    },
  ],

  animations: {},
};
