import { box, mergeVoxels, setVoxels } from '../helpers.js';

/**
 * Chibi Humanoid Character Definition
 *
 * Deformed (2.5 head-body ratio) voxel humanoid.
 * ~16 voxels tall. Large head for cute proportions.
 *
 * Part hierarchy:
 *   root
 *   └── body (torso + hips)
 *       ├── head
 *       ├── rightArm
 *       ├── leftArm
 *       ├── rightLeg
 *       └── leftLeg
 *
 * Palette:
 *  0 = shirt (blue)
 *  1 = skin (peach)
 *  2 = hair (dark brown)
 *  3 = pants (dark gray)
 *  4 = shoes (brown)
 *  5 = eye dark
 *  6 = mouth/blush
 *  7 = eye white
 */

const P = {
  SHIRT: 0, SKIN: 1, HAIR: 2, PANTS: 3,
  SHOES: 4, EYE: 5, MOUTH: 6, EYE_W: 7,
};

function buildHead() {
  return mergeVoxels(
    // Base hair block (full 6x6x6)
    box(0, 3, 0, 6, 3, 6, P.HAIR),
    // Lower half - hair on sides and back
    box(0, 0, 1, 6, 3, 5, P.HAIR),
    // Front face - skin area (z=0, inner columns)
    box(1, 0, 0, 4, 3, 1, P.SKIN),
    // Forehead skin (z=0, between hair)
    box(1, 3, 0, 4, 1, 1, P.SKIN),
    // Eyes - white
    setVoxels([1, 2, 0, P.EYE_W], [4, 2, 0, P.EYE_W]),
    // Eyes - pupils (dark)
    setVoxels([2, 2, 0, P.EYE], [3, 2, 0, P.EYE]),
    // Mouth
    setVoxels([2, 0, 0, P.MOUTH], [3, 0, 0, P.MOUTH]),
  );
}

function buildBody() {
  return mergeVoxels(
    // Main torso - shirt
    box(0, 1, 0, 6, 4, 4, P.SHIRT),
    // Belt/waist area
    box(0, 0, 0, 6, 1, 4, P.PANTS),
  );
}

function buildArm() {
  return mergeVoxels(
    // Upper arm - shirt sleeve
    box(0, 3, 0, 2, 2, 2, P.SHIRT),
    // Lower arm - skin
    box(0, 0, 0, 2, 3, 2, P.SKIN),
  );
}

function buildLeg() {
  return mergeVoxels(
    // Upper leg - pants
    box(0, 2, 0, 3, 3, 3, P.PANTS),
    // Shoe
    box(0, 0, 0, 3, 2, 3, P.SHOES),
  );
}

export const humanoidDef = {
  name: 'Chibi Human',
  type: 'humanoid',
  voxelSize: 1,

  palette: [
    '#4A90D9', // 0: shirt blue
    '#FFD5B8', // 1: skin peach
    '#5C3317', // 2: hair dark brown
    '#3D3D3D', // 3: pants dark gray
    '#7B4B2A', // 4: shoes brown
    '#1a1a1a', // 5: eye dark
    '#E8967A', // 6: mouth/blush
    '#FFFFFF', // 7: eye white
  ],

  parts: [
    {
      name: 'body',
      parent: null,
      position: [0, 7.5, 0],    // center of body in entity space
      center: [3, 2.5, 2],      // pivot at body center
      voxels: buildBody(),
    },
    {
      name: 'head',
      parent: 'body',
      position: [0, 2.5, 0],    // top of body (flush with body top face)
      center: [3, 0, 3],        // pivot at neck (bottom center)
      voxels: buildHead(),
    },
    {
      name: 'rightArm',
      parent: 'body',
      position: [-4, 2.5, 0],   // right shoulder (body side, top)
      center: [1, 5, 1],        // pivot at shoulder (top)
      voxels: buildArm(),
    },
    {
      name: 'leftArm',
      parent: 'body',
      position: [4, 2.5, 0],    // left shoulder (body side, top)
      center: [1, 5, 1],
      voxels: buildArm(),
    },
    {
      name: 'rightLeg',
      parent: 'body',
      position: [-1.5, -2.5, 0],   // right hip (centered under body)
      center: [1.5, 5, 1.5],       // pivot at hip (top)
      voxels: buildLeg(),
    },
    {
      name: 'leftLeg',
      parent: 'body',
      position: [1.5, -2.5, 0],    // left hip (centered under body)
      center: [1.5, 5, 1.5],
      voxels: buildLeg(),
    },
  ],

  animations: {
    idle: {
      duration: 2.5,
      loop: true,
      keyframes: [
        {
          time: 0,
          parts: {
            body: { rotation: [0, 0, 0], position: [0, 0, 0] },
            head: { rotation: [0, 0, 0], position: [0, 0, 0] },
            rightArm: { rotation: [0, 0, 0] },
            leftArm: { rotation: [0, 0, 0] },
            rightLeg: { rotation: [0, 0, 0] },
            leftLeg: { rotation: [0, 0, 0] },
          },
        },
        {
          time: 0.5,
          parts: {
            body: { position: [0, 0.15, 0] },
            head: { rotation: [0.06, 0.04, 0] },
            rightArm: { rotation: [0.03, 0, -0.05] },
            leftArm: { rotation: [0.03, 0, 0.05] },
          },
        },
        {
          time: 1.0,
          parts: {
            body: { rotation: [0, 0, 0], position: [0, 0, 0] },
            head: { rotation: [0, -0.04, 0] },
            rightArm: { rotation: [0, 0, 0] },
            leftArm: { rotation: [0, 0, 0] },
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
            head: { rotation: [0, 0, 0] },
            rightArm: { rotation: [0.5, 0, 0] },
            leftArm: { rotation: [-0.5, 0, 0] },
            rightLeg: { rotation: [-0.45, 0, 0] },
            leftLeg: { rotation: [0.45, 0, 0] },
          },
        },
        {
          time: 0.25,
          parts: {
            body: { position: [0, 0.2, 0] },
            rightArm: { rotation: [0, 0, 0] },
            leftArm: { rotation: [0, 0, 0] },
            rightLeg: { rotation: [0, 0, 0] },
            leftLeg: { rotation: [0, 0, 0] },
          },
        },
        {
          time: 0.5,
          parts: {
            body: { position: [0, 0, 0] },
            rightArm: { rotation: [-0.5, 0, 0] },
            leftArm: { rotation: [0.5, 0, 0] },
            rightLeg: { rotation: [0.45, 0, 0] },
            leftLeg: { rotation: [-0.45, 0, 0] },
          },
        },
        {
          time: 0.75,
          parts: {
            body: { position: [0, 0.2, 0] },
            rightArm: { rotation: [0, 0, 0] },
            leftArm: { rotation: [0, 0, 0] },
            rightLeg: { rotation: [0, 0, 0] },
            leftLeg: { rotation: [0, 0, 0] },
          },
        },
        {
          time: 1.0,
          parts: {
            body: { position: [0, 0, 0] },
            rightArm: { rotation: [0.5, 0, 0] },
            leftArm: { rotation: [-0.5, 0, 0] },
            rightLeg: { rotation: [-0.45, 0, 0] },
            leftLeg: { rotation: [0.45, 0, 0] },
          },
        },
      ],
    },

    run: {
      duration: 0.5,
      loop: true,
      keyframes: [
        {
          time: 0,
          parts: {
            body: { rotation: [0.15, 0, 0], position: [0, 0.1, 0] },
            head: { rotation: [-0.1, 0, 0] },
            rightArm: { rotation: [0.9, 0, 0] },
            leftArm: { rotation: [-0.9, 0, 0] },
            rightLeg: { rotation: [-0.7, 0, 0] },
            leftLeg: { rotation: [0.7, 0, 0] },
          },
        },
        {
          time: 0.25,
          parts: {
            body: { rotation: [0.15, 0, 0], position: [0, 0.4, 0] },
            rightArm: { rotation: [0, 0, 0] },
            leftArm: { rotation: [0, 0, 0] },
            rightLeg: { rotation: [0, 0, 0] },
            leftLeg: { rotation: [0, 0, 0] },
          },
        },
        {
          time: 0.5,
          parts: {
            body: { rotation: [0.15, 0, 0], position: [0, 0.1, 0] },
            head: { rotation: [-0.1, 0, 0] },
            rightArm: { rotation: [-0.9, 0, 0] },
            leftArm: { rotation: [0.9, 0, 0] },
            rightLeg: { rotation: [0.7, 0, 0] },
            leftLeg: { rotation: [-0.7, 0, 0] },
          },
        },
        {
          time: 0.75,
          parts: {
            body: { rotation: [0.15, 0, 0], position: [0, 0.4, 0] },
            rightArm: { rotation: [0, 0, 0] },
            leftArm: { rotation: [0, 0, 0] },
            rightLeg: { rotation: [0, 0, 0] },
            leftLeg: { rotation: [0, 0, 0] },
          },
        },
        {
          time: 1.0,
          parts: {
            body: { rotation: [0.15, 0, 0], position: [0, 0.1, 0] },
            rightArm: { rotation: [0.9, 0, 0] },
            leftArm: { rotation: [-0.9, 0, 0] },
            rightLeg: { rotation: [-0.7, 0, 0] },
            leftLeg: { rotation: [0.7, 0, 0] },
          },
        },
      ],
    },

    jump: {
      duration: 1.0,
      loop: false,
      keyframes: [
        {
          time: 0,
          parts: {
            body: { position: [0, 0, 0], rotation: [0, 0, 0] },
            head: { rotation: [0, 0, 0] },
            rightArm: { rotation: [0, 0, 0.3] },
            leftArm: { rotation: [0, 0, -0.3] },
            rightLeg: { rotation: [0, 0, 0] },
            leftLeg: { rotation: [0, 0, 0] },
          },
        },
        {
          time: 0.15,
          parts: {
            body: { position: [0, -0.5, 0], rotation: [0.1, 0, 0] },
            head: { rotation: [0.15, 0, 0] },
            rightArm: { rotation: [0, 0, 0.5] },
            leftArm: { rotation: [0, 0, -0.5] },
            rightLeg: { rotation: [0.5, 0, 0] },
            leftLeg: { rotation: [0.5, 0, 0] },
          },
        },
        {
          time: 0.4,
          parts: {
            body: { position: [0, 4, 0], rotation: [-0.1, 0, 0] },
            head: { rotation: [-0.2, 0, 0] },
            rightArm: { rotation: [2.5, 0, -0.1] },
            leftArm: { rotation: [2.5, 0, 0.1] },
            rightLeg: { rotation: [0.3, 0, 0] },
            leftLeg: { rotation: [-0.3, 0, 0] },
          },
        },
        {
          time: 0.7,
          parts: {
            body: { position: [0, 2, 0] },
            head: { rotation: [0.1, 0, 0] },
            rightArm: { rotation: [-1, 0, 0.2] },
            leftArm: { rotation: [-1, 0, -0.2] },
            rightLeg: { rotation: [0.4, 0, 0] },
            leftLeg: { rotation: [0.4, 0, 0] },
          },
        },
        {
          time: 1.0,
          parts: {
            body: { position: [0, 0, 0], rotation: [0, 0, 0] },
            head: { rotation: [0.1, 0, 0] },
            rightArm: { rotation: [0, 0, 0] },
            leftArm: { rotation: [0, 0, 0] },
            rightLeg: { rotation: [0.3, 0, 0] },
            leftLeg: { rotation: [0.3, 0, 0] },
          },
        },
      ],
    },

    attack: {
      duration: 0.6,
      loop: false,
      keyframes: [
        {
          time: 0,
          parts: {
            body: { rotation: [0, 0, 0], position: [0, 0, 0] },
            head: { rotation: [0, 0, 0] },
            rightArm: { rotation: [0, 0, 0] },
            leftArm: { rotation: [0, 0, 0] },
          },
        },
        {
          time: 0.15,
          parts: {
            body: { rotation: [0, -0.3, 0] },
            rightArm: { rotation: [-2.8, 0, -0.3] },
            leftArm: { rotation: [0.2, 0, 0] },
          },
        },
        {
          time: 0.3,
          parts: {
            body: { rotation: [0.15, 0.4, 0], position: [0, -0.2, 0] },
            head: { rotation: [-0.1, 0.2, 0] },
            rightArm: { rotation: [0.8, 0, 0.2] },
            leftArm: { rotation: [-0.3, 0, -0.1] },
          },
        },
        {
          time: 0.5,
          parts: {
            body: { rotation: [0, 0.2, 0], position: [0, 0, 0] },
            rightArm: { rotation: [0.3, 0, 0] },
            leftArm: { rotation: [0, 0, 0] },
          },
        },
        {
          time: 1.0,
          parts: {
            body: { rotation: [0, 0, 0], position: [0, 0, 0] },
            head: { rotation: [0, 0, 0] },
            rightArm: { rotation: [0, 0, 0] },
            leftArm: { rotation: [0, 0, 0] },
          },
        },
      ],
    },
  },
};
