import { box, mergeVoxels, setVoxels } from '../helpers.js';

const P = { SKIN: 0, PANTS: 1, LEATHER: 2, EYE: 3, METAL: 4, TUSK: 5 };

function buildBody() {
  return mergeVoxels(
    box(0, 2, 0, 8, 6, 6, P.SKIN), // huge chest
    box(1, 0, 1, 6, 2, 4, P.PANTS) // waist
  );
}

function buildHead() {
  return mergeVoxels(
    box(0, 0, 0, 4, 4, 4, P.SKIN),
    setVoxels([1, 2, -1, P.EYE], [2, 2, -1, P.EYE]), // small eyes
    setVoxels([0, 0, -1, P.TUSK], [3, 0, -1, P.TUSK]) // tusks protruding up from mouth level
  );
}

function buildArm() { return box(0, 0, 0, 3, 6, 3, P.SKIN); }
function buildLeg() {
  return mergeVoxels(
    box(0, 2, 0, 3, 4, 3, P.PANTS),
    box(0, 0, 0, 3, 2, 3, P.LEATHER) // boots
  );
}

function buildClub() {
  return mergeVoxels(
    box(1, 0, 1, 2, 4, 2, P.LEATHER), // handle
    box(0, 4, 0, 4, 6, 4, P.METAL)    // heavy spiky head
  );
}

export const orcDef = {
  name: 'Orc', type: 'humanoid', voxelSize: 1.2, // scaled up
  palette: ['#33691E', '#3E2723', '#5D4037', '#D50000', '#263238', '#F5F5F5'], // dark green skin, red eyes
  parts: [
    { name: 'body', parent: null, position: [0, 8, 0], center: [4, 4, 3], voxels: buildBody() },
    { name: 'head', parent: 'body', position: [2, 4, -1], center: [2, 0, 2], voxels: buildHead() },
    { name: 'rightArm', parent: 'body', position: [-3, 4, 1.5], center: [1.5, 5, 1.5], voxels: buildArm() },
    { name: 'leftArm', parent: 'body', position: [8, 4, 1.5], center: [1.5, 5, 1.5], voxels: buildArm() },
    { name: 'rightLeg', parent: 'body', position: [1, -4, 1.5], center: [1.5, 5, 1.5], voxels: buildLeg() },
    { name: 'leftLeg', parent: 'body', position: [4, -4, 1.5], center: [1.5, 5, 1.5], voxels: buildLeg() },
    { name: 'club', parent: 'rightArm', position: [0, -2, 3], center: [2, 2, 2], voxels: buildClub() },
  ],
  animations: {
    idle: {
      duration: 3.0, loop: true,
      keyframes: [
        { time: 0, parts: { body: { rotation: [0, 0, 0] }, club: { rotation: [-0.5, 0, 0] } } },
        { time: 0.5, parts: { body: { rotation: [0.05, 0, 0] }, club: { rotation: [-0.4, 0, 0] } } },
        { time: 1.0, parts: { body: { rotation: [0, 0, 0] }, club: { rotation: [-0.5, 0, 0] } } }
      ]
    },
    walk: {
      duration: 1.5, loop: true, // slower walk
      keyframes: [
        { time: 0, parts: { rightLeg: { rotation: [-0.3, 0, 0] }, leftLeg: { rotation: [0.3, 0, 0] }, leftArm: { rotation: [-0.3, 0, 0] }, rightArm: { rotation: [0.2, 0, 0] } } },
        { time: 0.75, parts: { rightLeg: { rotation: [0.3, 0, 0] }, leftLeg: { rotation: [-0.3, 0, 0] }, leftArm: { rotation: [0.3, 0, 0] }, rightArm: { rotation: [-0.2, 0, 0] } } },
        { time: 1.5, parts: { rightLeg: { rotation: [-0.3, 0, 0] }, leftLeg: { rotation: [0.3, 0, 0] }, leftArm: { rotation: [-0.3, 0, 0] }, rightArm: { rotation: [0.2, 0, 0] } } }
      ]
    },
    attack: {
      duration: 1.5, loop: false, // heavy slam
      keyframes: [
        { time: 0, parts: { rightArm: { rotation: [0.2, 0, 0] }, body: { rotation: [0, 0, 0] } } },
        { time: 0.5, parts: { rightArm: { rotation: [-2.5, 0, 0] }, body: { rotation: [-0.2, 0, 0] } } }, // wind up huge
        { time: 0.7, parts: { rightArm: { rotation: [1.5, 0, 0] }, club: { rotation: [0.5, 0, 0] }, body: { rotation: [0.2, 0, 0] } } }, // smash down!
        { time: 1.5, parts: { rightArm: { rotation: [0, 0, 0] }, club: { rotation: [0, 0, 0] }, body: { rotation: [0, 0, 0] } } }
      ]
    }
  }
};
