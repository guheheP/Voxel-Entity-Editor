import { box, mergeVoxels, setVoxels } from '../helpers.js';

/**
 * Fence - Static voxel object (a section of fence)
 *
 * Palette:
 *  0 = post (dark wood)
 *  1 = rail (lighter wood)
 */

function buildFence() {
  return mergeVoxels(
    // Left post
    box(0, 0, 0, 1, 5, 1, 0),

    // Right post
    box(5, 0, 0, 1, 5, 1, 0),

    // Middle post
    box(3, 0, 0, 1, 4, 1, 0),

    // Top rail
    box(0, 4, 0, 6, 1, 1, 1),

    // Bottom rail
    box(0, 2, 0, 6, 1, 1, 1),
  );
}

export const fenceDef = {
  name: 'Fence',
  type: 'static',
  voxelSize: 1,

  palette: [
    '#6B3A1F', // 0: post dark wood
    '#A0784A', // 1: rail lighter wood
  ],

  parts: [
    {
      name: 'structure',
      parent: null,
      position: [0, 0, 0],
      center: [3, 0, 0.5],
      voxels: buildFence(),
    },
  ],

  animations: {},
};
