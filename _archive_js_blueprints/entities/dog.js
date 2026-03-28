import { box, mergeVoxels, setVoxels } from '../helpers.js';

function buildBody() {
  return mergeVoxels(
    box(0, 0, 0, 4, 3, 8, 0),    // fur
    box(1, 0, 1, 2, 1, 6, 1),    // belly
  );
}

function buildHead() {
  return mergeVoxels(
    box(0, 0, 0, 4, 4, 5, 0),     // main head
    box(1, 1, -1, 2, 2, 2, 1),    // snout
    setVoxels([1, 2, -1, 3], [2, 2, -1, 3]), // nose
    setVoxels([0, 3, 0, 3], [3, 3, 0, 3]), // eyes
    // Floppy ears
    box(-1, 0, 3, 1, 3, 2, 4),
    box(4, 0, 3, 1, 3, 2, 4),
  );
}

function buildLeg() {
  return box(0, 0, 0, 1, 4, 1, 0);
}

function buildTail() {
  return box(0, 0, 0, 1, 5, 1, 0);
}

export const dogDef = {
  name: 'Dog', type: 'quadruped', voxelSize: 1,
  palette: ['#8D6E63', '#D7CCC8', '#FFB6C1', '#000000', '#5D4037'],
  parts: [
    { name: 'body', parent: null, position: [0, 5, 0], center: [2, 1.5, 4], voxels: buildBody() },
    { name: 'head', parent: 'body', position: [0, 1, -4], center: [2, 1, 4], voxels: buildHead() },
    { name: 'frontRightLeg', parent: 'body', position: [-1, -1.5, -3], center: [0.5, 4, 0.5], voxels: buildLeg() },
    { name: 'frontLeftLeg', parent: 'body', position: [2, -1.5, -3], center: [0.5, 4, 0.5], voxels: buildLeg() },
    { name: 'backRightLeg', parent: 'body', position: [-1, -1.5, 3], center: [0.5, 4, 0.5], voxels: buildLeg() },
    { name: 'backLeftLeg', parent: 'body', position: [2, -1.5, 3], center: [0.5, 4, 0.5], voxels: buildLeg() },
    { name: 'tail', parent: 'body', position: [0, 2, 4], center: [0.5, 0, 0.5], voxels: buildTail() }
  ],
  animations: {
    idle: { duration: 3.0, loop: true, keyframes: [
      { time: 0, parts: { head: { rotation: [0, 0, 0] }, tail: { rotation: [0, 0, 0] } } },
      { time: 0.5, parts: { tail: { rotation: [0, 0.5, 0] } } },
      { time: 1.0, parts: { tail: { rotation: [0, -0.5, 0] } } },
    ]},
    walk: { duration: 0.8, loop: true, keyframes: [
      { time: 0, parts: { frontRightLeg: { rotation: [0.4, 0, 0] }, frontLeftLeg: { rotation: [-0.4, 0, 0] }, backRightLeg: { rotation: [-0.4, 0, 0] }, backLeftLeg: { rotation: [0.4, 0, 0] } } },
      { time: 0.5, parts: { frontRightLeg: { rotation: [-0.4, 0, 0] }, frontLeftLeg: { rotation: [0.4, 0, 0] }, backRightLeg: { rotation: [0.4, 0, 0] }, backLeftLeg: { rotation: [-0.4, 0, 0] } } },
      { time: 1.0, parts: { frontRightLeg: { rotation: [0.4, 0, 0] }, frontLeftLeg: { rotation: [-0.4, 0, 0] }, backRightLeg: { rotation: [-0.4, 0, 0] }, backLeftLeg: { rotation: [0.4, 0, 0] } } }
    ]}
  }
};
