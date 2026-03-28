import { box, mergeVoxels, setVoxels } from '../helpers.js';

const P = { STONE: 0, DARK_STONE: 1, EYE: 2 };

function buildBody() {
  return box(0, 0, 0, 4, 6, 4, P.STONE);
}

function buildHead() {
  return mergeVoxels(
    box(0, 0, 0, 4, 4, 4, P.STONE),
    setVoxels([1, 2, -1, P.EYE], [2, 2, -1, P.EYE]),
    box(-1, 3, 2, 1, 2, 1, P.STONE), // horns
    box(4, 3, 2, 1, 2, 1, P.STONE)
  );
}

function buildWing() {
  return mergeVoxels(
    box(0, 0, 0, 7, 1, 4, P.DARK_STONE), // span
    box(4, -2, 0, 1, 2, 4, P.DARK_STONE), // tips pointing down
    box(6, -3, 0, 1, 3, 4, P.DARK_STONE)
  );
}

function buildLeg() {
  return box(0, 0, 0, 2, 3, 2, P.DARK_STONE);
}

export const gargoyleDef = {
  name: 'Gargoyle', type: 'quadruped', voxelSize: 1,
  palette: ['#9E9E9E', '#616161', '#FFEB3B'],
  parts: [
    { name: 'body', parent: null, position: [0, 6, 0], center: [2, 3, 2], voxels: buildBody() },
    { name: 'head', parent: 'body', position: [0, 3, -2], center: [2, 1, 2], voxels: buildHead() },
    { name: 'rightWing', parent: 'body', position: [-7, 5, 2], center: [7, 0, 2], voxels: buildWing() }, // pivot at inner joint
    { name: 'leftWing', parent: 'body', position: [4, 5, 2], center: [0, 0, 2], voxels: buildWing() },
    { name: 'rightLeg', parent: 'body', position: [-1, -3, 1], center: [1, 3, 1], voxels: buildLeg() },
    { name: 'leftLeg', parent: 'body', position: [3, -3, 1], center: [1, 3, 1], voxels: buildLeg() },
  ],
  animations: {
    idle: {
      duration: 1.0, loop: true,
      keyframes: [ // floating up and down
        { time: 0, parts: { body: { position: [0, 0, 0] }, rightWing: { rotation: [0, 0, -1.0] }, leftWing: { rotation: [0, 0, 1.0] } } }, // wings down
        { time: 0.5, parts: { body: { position: [0, 0.5, 0] }, rightWing: { rotation: [0, 0, 0.5] }, leftWing: { rotation: [0, 0, -0.5] } } }, // wings up, body lifts
        { time: 1.0, parts: { body: { position: [0, 0, 0] }, rightWing: { rotation: [0, 0, -1.0] }, leftWing: { rotation: [0, 0, 1.0] } } }
      ]
    },
    fly: { // basically same as idle but faster
      duration: 0.5, loop: true,
      keyframes: [
        { time: 0, parts: { body: { position: [0, 0, 0], rotation: [0.2, 0, 0] }, rightWing: { rotation: [0, 0, -1.2] }, leftWing: { rotation: [0, 0, 1.2] } } },
        { time: 0.25, parts: { body: { position: [0, 1.0, 0], rotation: [0.2, 0, 0] }, rightWing: { rotation: [0, 0, 0.8] }, leftWing: { rotation: [0, 0, -0.8] } } },
        { time: 0.5, parts: { body: { position: [0, 0, 0], rotation: [0.2, 0, 0] }, rightWing: { rotation: [0, 0, -1.2] }, leftWing: { rotation: [0, 0, 1.2] } } }
      ]
    }
  }
};
