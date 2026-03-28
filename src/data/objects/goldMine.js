import { box, mergeVoxels, setVoxels } from '../helpers.js';

const P = { ROCK: 0, WOOD: 1, GOLD: 2, IRON: 3 };

function buildMine() {
  return mergeVoxels(
    // Mountain/rock hill
    box(0, 0, 0, 12, 8, 12, P.ROCK),
    box(2, 8, 2, 8, 3, 8, P.ROCK),
    // Cave opening (subtracting basically, but we just leave space manually)
    // Actually box allows adding. We'll leave the front (z=10, 11) empty for cave entrance
  );
}

function buildCaveArch() {
  return mergeVoxels(
    // Left pillar
    box(3, 0, 0, 2, 6, 2, P.WOOD),
    // Right pillar
    box(7, 0, 0, 2, 6, 2, P.WOOD),
    // Top beam
    box(2, 6, 0, 8, 2, 2, P.WOOD)
  );
}

function buildCart() {
  return mergeVoxels(
    box(1, 0, 1, 4, 3, 4, P.WOOD),  // cart box
    box(0, -1, 1, 1, 2, 1, P.IRON), // wheels
    box(5, -1, 1, 1, 2, 1, P.IRON),
    box(0, -1, 4, 1, 2, 1, P.IRON),
    box(5, -1, 4, 1, 2, 1, P.IRON),
    box(2, 1, 2, 2, 3, 2, P.GOLD)   // shiny ore inside
  );
}

export const goldMineDef = {
  name: 'Gold Mine', type: 'static', voxelSize: 1,
  palette: ['#757575', '#5D4037', '#FFD54F', '#424242'],
  parts: [
    // Build the rock mound manually to allow entrance
    { name: 'rock', parent: null, position: [0, 0, 0], center: [6, 0, 6], voxels: mergeVoxels(box(0, 0, 3, 12, 10, 9, P.ROCK), box(0, 0, 0, 3, 10, 3, P.ROCK), box(9, 0, 0, 3, 10, 3, P.ROCK), box(3, 8, 0, 6, 2, 3, P.ROCK)) },
    { name: 'arch', parent: 'rock', position: [0, 0, 1], center: [6, 0, 1], voxels: buildCaveArch() },
    { name: 'cart', parent: 'arch', position: [3, 1, 0], center: [3, 0, 3], voxels: buildCart() } // cart sits in the archway
  ],
  animations: {
    work: {
      duration: 1.0, loop: true,
      keyframes: [ // cart rolling in and out slightly
        { time: 0, parts: { cart: { position: [0, 0, 0] } } },
        { time: 0.5, parts: { cart: { position: [0, 0, 2] } } }, // roll into cave
        { time: 1.0, parts: { cart: { position: [0, 0, 0] } } }
      ]
    }
  }
};
