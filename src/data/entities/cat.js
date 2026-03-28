import { box, mergeVoxels, setVoxels } from '../helpers.js';

/**
 * Cat (Quadruped) Entity Definition
 *
 * A small voxel cat with 4 legs, a tail, and a head.
 *
 * Part hierarchy:
 *   root
 *   └── body
 *       ├── head
 *       ├── frontRightLeg
 *       ├── frontLeftLeg
 *       ├── backRightLeg
 *       ├── backLeftLeg
 *       └── tail
 *
 * Palette:
 *  0 = fur (orange)
 *  1 = belly (cream)
 *  2 = ear inner (pink)
 *  3 = eye (green)
 *  4 = nose (dark pink)
 *  5 = paw (dark orange)
 *  6 = tail tip (cream)
 *  7 = eye pupil (dark)
 */

function buildBody() {
  return mergeVoxels(
    box(0, 0, 0, 4, 3, 7, 0),    // main body fur
    box(1, 0, 1, 2, 1, 5, 1),    // belly stripe
  );
}

function buildHead() {
  return mergeVoxels(
    box(0, 0, 0, 4, 4, 4, 0),     // main head
    // Front face details (z=0)
    box(1, 1, 0, 2, 2, 1, 1),     // lighter face patch
    // Eyes
    setVoxels([0, 3, 0, 3], [3, 3, 0, 3]),  // green eyes
    setVoxels([0, 3, 0, 7], [3, 3, 0, 7]),  // pupils (overwrite)
    // Wait, this overwrites. Let me use positions properly
    // Left eye at x=1, right eye at x=2
    setVoxels([1, 2, 0, 3], [2, 2, 0, 3]),  // green eyes
    // Nose
    setVoxels([1, 1, 0, 4], [2, 1, 0, 4]),
    // Ears (on top, y=4)
    setVoxels(
      [0, 4, 0, 0], [0, 4, 1, 0],  // left ear outer
      [3, 4, 0, 0], [3, 4, 1, 0],  // right ear outer
      [0, 4, 0, 2], [3, 4, 0, 2],  // ear inner (front face)
    ),
  );
}

function buildFrontLeg() {
  return mergeVoxels(
    box(0, 0, 0, 1, 3, 1, 0),
    setVoxels([0, 0, 0, 5]),  // paw
  );
}

function buildBackLeg() {
  return mergeVoxels(
    box(0, 0, 0, 1, 3, 2, 0),
    // Thicker thigh
    box(0, 2, 0, 1, 1, 2, 0),
    setVoxels([0, 0, 0, 5], [0, 0, 1, 5]),  // paw
  );
}

function buildTail() {
  return mergeVoxels(
    setVoxels(
      [0, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 2, 0, 0],
      [0, 3, 0, 0],
      [0, 4, 0, 6],  // tail tip lighter
    ),
  );
}

export const catDef = {
  name: 'Cat',
  type: 'quadruped',
  voxelSize: 1,

  palette: [
    '#E8863A', // 0: fur orange
    '#FFE4C4', // 1: belly cream
    '#FFB6C1', // 2: ear inner pink
    '#4CAF50', // 3: eye green
    '#CC6677', // 4: nose pink
    '#B5651D', // 5: paw dark orange
    '#FFE4C4', // 6: tail tip cream
    '#222222', // 7: pupil dark
  ],

  parts: [
    {
      name: 'body',
      parent: null,
      position: [0, 4.5, 0],       // raised so legs reach ground
      center: [2, 1.5, 3.5],
      voxels: buildBody(),
    },
    {
      name: 'head',
      parent: 'body',
      position: [0, 0.5, -4],       // front of body, slightly above center
      center: [2, 1, 3],            // pivot at back-center (neck)
      voxels: buildHead(),
    },
    {
      name: 'frontRightLeg',
      parent: 'body',
      position: [-1, -1.5, -2.5],   // centered under body
      center: [0.5, 3, 0.5],
      voxels: buildFrontLeg(),
    },
    {
      name: 'frontLeftLeg',
      parent: 'body',
      position: [1, -1.5, -2.5],    // centered under body
      center: [0.5, 3, 0.5],
      voxels: buildFrontLeg(),
    },
    {
      name: 'backRightLeg',
      parent: 'body',
      position: [-1, -1.5, 2.5],    // centered under body
      center: [0.5, 3, 1],
      voxels: buildBackLeg(),
    },
    {
      name: 'backLeftLeg',
      parent: 'body',
      position: [1, -1.5, 2.5],     // centered under body
      center: [0.5, 3, 1],
      voxels: buildBackLeg(),
    },
    {
      name: 'tail',
      parent: 'body',
      position: [0, 1.5, 3.5],      // back of body, above center
      center: [0.5, 0, 0.5],
      voxels: buildTail(),
    },
  ],

  animations: {
    idle: {
      duration: 3.0,
      loop: true,
      keyframes: [
        {
          time: 0,
          parts: {
            body: { position: [0, 0, 0] },
            head: { rotation: [0, 0, 0] },
            tail: { rotation: [0, 0, 0] },
          },
        },
        {
          time: 0.3,
          parts: {
            head: { rotation: [0.08, 0.1, 0] },
            tail: { rotation: [0.3, 0.3, 0] },
          },
        },
        {
          time: 0.6,
          parts: {
            head: { rotation: [0, -0.1, 0] },
            tail: { rotation: [-0.2, -0.3, 0] },
          },
        },
        {
          time: 1.0,
          parts: {
            head: { rotation: [0, 0, 0] },
            tail: { rotation: [0, 0, 0] },
          },
        },
      ],
    },

    walk: {
      duration: 0.8,
      loop: true,
      keyframes: [
        {
          time: 0,
          parts: {
            body: { position: [0, 0, 0] },
            frontRightLeg: { rotation: [0.4, 0, 0] },
            frontLeftLeg: { rotation: [-0.4, 0, 0] },
            backRightLeg: { rotation: [-0.35, 0, 0] },
            backLeftLeg: { rotation: [0.35, 0, 0] },
            tail: { rotation: [0.3, 0.2, 0] },
          },
        },
        {
          time: 0.25,
          parts: {
            body: { position: [0, 0.1, 0] },
            frontRightLeg: { rotation: [0, 0, 0] },
            frontLeftLeg: { rotation: [0, 0, 0] },
            backRightLeg: { rotation: [0, 0, 0] },
            backLeftLeg: { rotation: [0, 0, 0] },
            tail: { rotation: [-0.2, -0.2, 0] },
          },
        },
        {
          time: 0.5,
          parts: {
            body: { position: [0, 0, 0] },
            frontRightLeg: { rotation: [-0.4, 0, 0] },
            frontLeftLeg: { rotation: [0.4, 0, 0] },
            backRightLeg: { rotation: [0.35, 0, 0] },
            backLeftLeg: { rotation: [-0.35, 0, 0] },
            tail: { rotation: [0.3, -0.2, 0] },
          },
        },
        {
          time: 0.75,
          parts: {
            body: { position: [0, 0.1, 0] },
            frontRightLeg: { rotation: [0, 0, 0] },
            frontLeftLeg: { rotation: [0, 0, 0] },
            backRightLeg: { rotation: [0, 0, 0] },
            backLeftLeg: { rotation: [0, 0, 0] },
            tail: { rotation: [-0.2, 0.2, 0] },
          },
        },
        {
          time: 1.0,
          parts: {
            frontRightLeg: { rotation: [0.4, 0, 0] },
            frontLeftLeg: { rotation: [-0.4, 0, 0] },
            backRightLeg: { rotation: [-0.35, 0, 0] },
            backLeftLeg: { rotation: [0.35, 0, 0] },
            tail: { rotation: [0.3, 0.2, 0] },
          },
        },
      ],
    },

    run: {
      duration: 0.4,
      loop: true,
      keyframes: [
        {
          time: 0,
          parts: {
            body: { rotation: [0.05, 0, 0], position: [0, 0.2, 0] },
            frontRightLeg: { rotation: [0.7, 0, 0] },
            frontLeftLeg: { rotation: [-0.7, 0, 0] },
            backRightLeg: { rotation: [-0.6, 0, 0] },
            backLeftLeg: { rotation: [0.6, 0, 0] },
            tail: { rotation: [0.8, 0.3, 0] },
          },
        },
        {
          time: 0.25,
          parts: {
            body: { rotation: [0.05, 0, 0], position: [0, 0.5, 0] },
            frontRightLeg: { rotation: [-0.2, 0, 0] },
            frontLeftLeg: { rotation: [-0.2, 0, 0] },
            backRightLeg: { rotation: [0.3, 0, 0] },
            backLeftLeg: { rotation: [0.3, 0, 0] },
            tail: { rotation: [0.5, -0.3, 0] },
          },
        },
        {
          time: 0.5,
          parts: {
            body: { rotation: [0.05, 0, 0], position: [0, 0.2, 0] },
            frontRightLeg: { rotation: [-0.7, 0, 0] },
            frontLeftLeg: { rotation: [0.7, 0, 0] },
            backRightLeg: { rotation: [0.6, 0, 0] },
            backLeftLeg: { rotation: [-0.6, 0, 0] },
            tail: { rotation: [0.8, 0.3, 0] },
          },
        },
        {
          time: 0.75,
          parts: {
            body: { rotation: [0.05, 0, 0], position: [0, 0.5, 0] },
            frontRightLeg: { rotation: [-0.2, 0, 0] },
            frontLeftLeg: { rotation: [-0.2, 0, 0] },
            backRightLeg: { rotation: [0.3, 0, 0] },
            backLeftLeg: { rotation: [0.3, 0, 0] },
            tail: { rotation: [0.5, -0.3, 0] },
          },
        },
        {
          time: 1.0,
          parts: {
            body: { rotation: [0.05, 0, 0], position: [0, 0.2, 0] },
            frontRightLeg: { rotation: [0.7, 0, 0] },
            frontLeftLeg: { rotation: [-0.7, 0, 0] },
            backRightLeg: { rotation: [-0.6, 0, 0] },
            backLeftLeg: { rotation: [0.6, 0, 0] },
            tail: { rotation: [0.8, 0.3, 0] },
          },
        },
      ],
    },
  },
};
