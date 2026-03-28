import { box, mergeVoxels, setVoxels } from '../helpers.js';

function buildHead() {
  return mergeVoxels(
    box(0, 0, 0, 6, 6, 6, 0), // skull
    setVoxels([1, 2, 0, 1], [4, 2, 0, 1]) // mouth gap
  );
}

function buildBody() {
  return mergeVoxels(
    box(2, 0, 1, 2, 5, 2, 0), // spine
    box(0, 3, 1, 6, 1, 2, 0), // ribs
    box(1, 1, 1, 4, 1, 2, 0)
  );
}

function buildBone() { return box(0, 0, 0, 2, 5, 2, 0); }

export const skeletonDef = {
  name: 'Skeleton', type: 'humanoid', voxelSize: 1,
  palette: ['#E0E0E0', '#424242'],
  parts: [
    { name: 'body', parent: null, position: [0, 8, 0], center: [3, 2.5, 2], voxels: buildBody() },
    { name: 'head', parent: 'body', position: [0, 2.5, 0], center: [3, 0, 3], voxels: buildHead() },
    { name: 'rightArm', parent: 'body', position: [-4, 2.5, 0], center: [1, 4, 1], voxels: buildBone() },
    { name: 'leftArm', parent: 'body', position: [4, 2.5, 0], center: [1, 4, 1], voxels: buildBone() },
    { name: 'rightLeg', parent: 'body', position: [-1.5, -3.5, 0], center: [1, 5, 1], voxels: buildBone() },
    { name: 'leftLeg', parent: 'body', position: [1.5, -3.5, 0], center: [1, 5, 1], voxels: buildBone() }
  ],
  animations: {
    idle: { duration: 2.0, loop: true, keyframes: [
      { time: 0, parts: { head: { rotation: [0.1, 0, -0.1] }, rightArm: { rotation: [0.2, 0, 0] }, leftArm: { rotation: [0.2, 0, 0] } } },
      { time: 1.0, parts: { head: { rotation: [0.15, 0, 0.1] }, rightArm: { rotation: [0.3, 0, 0] }, leftArm: { rotation: [0.3, 0, 0] } } },
      { time: 2.0, parts: { head: { rotation: [0.1, 0, -0.1] }, rightArm: { rotation: [0.2, 0, 0] }, leftArm: { rotation: [0.2, 0, 0] } } }
    ]},
    walk: { duration: 1.5, loop: true, keyframes: [
      { time: 0, parts: { rightLeg: { rotation: [-0.4, 0, 0] }, leftLeg: { rotation: [0.4, 0, 0] }, leftArm: { rotation: [-0.2, 0, 0] }, rightArm: { rotation: [0.2, 0, 0] } } },
      { time: 0.75, parts: { rightLeg: { rotation: [0.4, 0, 0] }, leftLeg: { rotation: [-0.4, 0, 0] }, leftArm: { rotation: [0.2, 0, 0] }, rightArm: { rotation: [-0.2, 0, 0] } } },
      { time: 1.5, parts: { rightLeg: { rotation: [-0.4, 0, 0] }, leftLeg: { rotation: [0.4, 0, 0] }, leftArm: { rotation: [-0.2, 0, 0] }, rightArm: { rotation: [0.2, 0, 0] } } }
    ]}
  }
};
