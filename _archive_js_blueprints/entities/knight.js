import { box, mergeVoxels, setVoxels } from '../helpers.js';

const P = { ARMOR: 0, TRIM: 1, DARK: 2, SKIN: 3, EYE: 4, SWORD: 5, HANDLE: 6 };

function buildHead() {
  return mergeVoxels(
    box(0, 0, 0, 6, 6, 6, P.ARMOR),
    box(1, 1, -1, 4, 3, 2, P.DARK), // visor hole
    setVoxels([2, 2, -1, P.EYE], [3, 2, -1, P.EYE]),
    box(2, 6, 2, 2, 2, 5, P.TRIM) // plume
  );
}

function buildBody() {
  return mergeVoxels(box(0, 0, 0, 6, 5, 4, P.ARMOR), box(0, -1, 0, 6, 1, 4, P.TRIM));
}

function buildArm() {
  return box(0, 0, 0, 2, 5, 2, P.ARMOR);
}

function buildLeg() {
  return box(0, 0, 0, 3, 5, 3, P.ARMOR);
}

function buildSword() {
  return mergeVoxels(
    box(0, 0, 0, 1, 2, 1, P.HANDLE),
    box(-1, 2, 0, 3, 1, 1, P.TRIM),
    box(0, 3, 0, 1, 6, 1, P.SWORD)
  );
}

export const knightDef = {
  name: 'Knight', type: 'humanoid', voxelSize: 1,
  palette: ['#B0BEC5', '#FFD54F', '#263238', '#FFCCBC', '#FFFFFF', '#ECEFF1', '#795548'],
  parts: [
    { name: 'body', parent: null, position: [0, 8, 0], center: [3, 2.5, 2], voxels: buildBody() },
    { name: 'head', parent: 'body', position: [0, 2.5, 0], center: [3, 0, 3], voxels: buildHead() },
    { name: 'rightArm', parent: 'body', position: [-4, 2.5, 0], center: [1, 4, 1], voxels: buildArm() },
    { name: 'leftArm', parent: 'body', position: [4, 2.5, 0], center: [1, 4, 1], voxels: buildArm() },
    { name: 'rightLeg', parent: 'body', position: [-1.5, -3.5, 0], center: [1.5, 5, 1.5], voxels: buildLeg() },
    { name: 'leftLeg', parent: 'body', position: [1.5, -3.5, 0], center: [1.5, 5, 1.5], voxels: buildLeg() },
    { name: 'sword', parent: 'rightArm', position: [0, -1, 1], center: [0.5, 1, 0.5], voxels: buildSword() }
  ],
  animations: {
    idle: { duration: 2.5, loop: true, keyframes: [
      { time: 0, parts: { rightArm: { rotation: [0.5, 0, 0] }, leftArm: { rotation: [0.1, 0, 0] } } },
      { time: 1.25, parts: { rightArm: { rotation: [0.3, 0, 0] }, leftArm: { rotation: [-0.1, 0, 0] } } },
      { time: 2.5, parts: { rightArm: { rotation: [0.5, 0, 0] }, leftArm: { rotation: [0.1, 0, 0] } } }
    ]},
    walk: { duration: 1.0, loop: true, keyframes: [
      { time: 0, parts: { rightLeg: { rotation: [-0.5, 0, 0] }, leftLeg: { rotation: [0.5, 0, 0] }, leftArm: { rotation: [-0.5, 0, 0] }, rightArm: { rotation: [0.3, 0, 0] } } },
      { time: 0.5, parts: { rightLeg: { rotation: [0.5, 0, 0] }, leftLeg: { rotation: [-0.5, 0, 0] }, leftArm: { rotation: [0.5, 0, 0] }, rightArm: { rotation: [0.5, 0, 0] } } },
      { time: 1.0, parts: { rightLeg: { rotation: [-0.5, 0, 0] }, leftLeg: { rotation: [0.5, 0, 0] }, leftArm: { rotation: [-0.5, 0, 0] }, rightArm: { rotation: [0.3, 0, 0] } } }
    ]},
    attack: { duration: 0.6, loop: false, keyframes: [
      { time: 0, parts: { rightArm: { rotation: [0.3, 0, 0] }, sword: { rotation: [0, 0, 0] } } },
      { time: 0.2, parts: { rightArm: { rotation: [-2.5, 0, 0] }, sword: { rotation: [0.5, 0, 0] } } },
      { time: 0.4, parts: { rightArm: { rotation: [1.0, 0, 0] }, sword: { rotation: [-0.5, 0, 0] } } },
      { time: 0.6, parts: { rightArm: { rotation: [0.3, 0, 0] }, sword: { rotation: [0, 0, 0] } } }
    ]}
  }
};
