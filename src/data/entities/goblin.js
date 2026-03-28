import { box, mergeVoxels, setVoxels } from '../helpers.js';

const P = { SKIN: 0, CLOTHES: 1, EYE: 2, WEAPON: 3 };

function buildBody() {
  return box(0, 0, 0, 4, 3, 3, P.CLOTHES);
}

function buildHead() {
  return mergeVoxels(
    box(0, 0, 0, 4, 3, 4, P.SKIN),
    setVoxels([1, 1, 0, P.EYE], [2, 1, 0, P.EYE]),
    box(-1, 1, 2, 1, 1, 2, P.SKIN), // pointy ears
    box(4, 1, 2, 1, 1, 2, P.SKIN)
  );
}

function buildArm() { return box(0, 0, 0, 1, 3, 1, P.SKIN); }
function buildLeg() { return box(0, 0, 0, 1.5, 2, 1.5, P.SKIN); }
function buildWeapon() { return box(0, 0, 0, 1, 4, 1, P.WEAPON); } // small dagger

export const goblinDef = {
  name: 'Goblin', type: 'humanoid', voxelSize: 1,
  palette: ['#558B2F', '#5D4037', '#FFEB3B', '#9E9E9E'], // dark green skin
  parts: [
    { name: 'body', parent: null, position: [0, 4, 0], center: [2, 1.5, 1.5], voxels: buildBody() },
    { name: 'head', parent: 'body', position: [0, 1.5, -0.5], center: [2, 0, 2], voxels: buildHead() },
    { name: 'rightArm', parent: 'body', position: [-2, 1.5, 1], center: [0.5, 2.5, 0.5], voxels: buildArm() },
    { name: 'leftArm', parent: 'body', position: [2, 1.5, 1], center: [0.5, 2.5, 0.5], voxels: buildArm() },
    { name: 'rightLeg', parent: 'body', position: [-0.5, -1.5, 1], center: [0.5, 2, 0.5], voxels: buildLeg() },
    { name: 'leftLeg', parent: 'body', position: [1, -1.5, 1], center: [0.5, 2, 0.5], voxels: buildLeg() },
    { name: 'dagger', parent: 'rightArm', position: [0, -1, 1], center: [0.5, 1, 0.5], voxels: buildWeapon() }
  ],
  animations: {
    idle: {
      duration: 1.0, loop: true,
      keyframes: [
        { time: 0, parts: { body: { position: [0, -0.5, 0], rotation: [0.2, 0, 0] }, rightArm: { rotation: [0.5, 0, 0] } } }, // leaning forward
        { time: 0.5, parts: { body: { position: [0, 0, 0], rotation: [0.2, 0, 0] }, rightArm: { rotation: [0.4, 0, 0] } } },
        { time: 1.0, parts: { body: { position: [0, -0.5, 0], rotation: [0.2, 0, 0] }, rightArm: { rotation: [0.5, 0, 0] } } }
      ]
    },
    run: {
      duration: 0.4, loop: true,
      keyframes: [ // fast run
        { time: 0, parts: { rightLeg: { rotation: [-0.6, 0, 0] }, leftLeg: { rotation: [0.6, 0, 0] }, leftArm: { rotation: [-0.6, 0, 0] }, rightArm: { rotation: [0.4, 0, 0] }, body: { position: [0, 0, 0], rotation: [0.4, 0, 0] } } },
        { time: 0.2, parts: { rightLeg: { rotation: [0.6, 0, 0] }, leftLeg: { rotation: [-0.6, 0, 0] }, leftArm: { rotation: [0.6, 0, 0] }, rightArm: { rotation: [-0.2, 0, 0] }, body: { position: [0, 0.5, 0], rotation: [0.4, 0, 0] } } },
        { time: 0.4, parts: { rightLeg: { rotation: [-0.6, 0, 0] }, leftLeg: { rotation: [0.6, 0, 0] }, leftArm: { rotation: [-0.6, 0, 0] }, rightArm: { rotation: [0.4, 0, 0] }, body: { position: [0, 0, 0], rotation: [0.4, 0, 0] } } }
      ]
    }
  }
};
