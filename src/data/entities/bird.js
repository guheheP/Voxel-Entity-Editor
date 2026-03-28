import { box } from '../helpers.js';

export const birdDef = {
  name: 'Bird', type: 'quadruped', voxelSize: 1.5, 
  palette: ['#FFC107', '#FFA000', '#FFFFFF', '#000000', '#FF5722'],
  parts: [
    { name: 'body', parent: null, position: [0, 6, 0], center: [2, 2, 3], voxels: box(0, 0, 0, 4, 3, 5, 0) },
    { name: 'head', parent: 'body', position: [0, 1.5, -2.5], center: [2, 1, 3], voxels: box(0, 0, 0, 4, 4, 4, 0).concat(box(1, 1, -1, 2, 1, 2, 4)) },
    { name: 'rightWing', parent: 'body', position: [-2, 1, 0], center: [1, 0, 2], voxels: box(0, 0, 0, 1, 1, 4, 1) },
    { name: 'leftWing', parent: 'body', position: [4, 1, 0], center: [0, 0, 2], voxels: box(0, 0, 0, 1, 1, 4, 1) },
    { name: 'rightLeg', parent: 'body', position: [0.5, -1.5, 0.5], center: [0.5, 2, 0.5], voxels: box(0, 0, 0, 1, 2, 1, 1) },
    { name: 'leftLeg', parent: 'body', position: [2.5, -1.5, 0.5], center: [0.5, 2, 0.5], voxels: box(0, 0, 0, 1, 2, 1, 1) }
  ],
  animations: {
    idle: { duration: 1.0, loop: true, keyframes: [
      { time: 0, parts: { head: { rotation: [0, 0, 0] }, rightWing: { rotation: [0, 0, 0] }, leftWing: { rotation: [0, 0, 0] } } },
      { time: 0.2, parts: { head: { rotation: [0.4, 0, 0] } } },
      { time: 0.4, parts: { head: { rotation: [0, 0, 0] } } },
      { time: 1.0, parts: { head: { rotation: [0, 0, 0] } } }
    ]},
    fly: { duration: 0.4, loop: true, keyframes: [
      { time: 0, parts: { rightWing: { rotation: [0, 0, -0.5] }, leftWing: { rotation: [0, 0, 0.5] }, body: { position: [0, 0.5, 0] } } },
      { time: 0.2, parts: { rightWing: { rotation: [0, 0, 1.0] }, leftWing: { rotation: [0, 0, -1.0] }, body: { position: [0, -0.5, 0] } } },
      { time: 0.4, parts: { rightWing: { rotation: [0, 0, -0.5] }, leftWing: { rotation: [0, 0, 0.5] }, body: { position: [0, 0.5, 0] } } }
    ]}
  }
};
