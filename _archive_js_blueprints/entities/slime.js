import { box, mergeVoxels, setVoxels } from '../helpers.js';

export const slimeDef = {
  name: 'Slime', type: 'static', voxelSize: 1,
  palette: ['#00E676', '#1B5E20', '#FFFFFF', '#000000'],
  parts: [
    {
      name: 'body', parent: null, position: [0, 0, 0], center: [3, 0, 3],
      voxels: box(0, 0, 0, 6, 4, 6, 0).concat(box(1, 4, 1, 4, 1, 4, 0))
    },
    {
      name: 'eyes', parent: 'body', position: [0, 2, -3], center: [3, 0, 0],
      voxels: [
        [1, 0, 3, 2], [2, 0, 3, 3],
        [4, 0, 3, 2], [3, 0, 3, 3]
      ]
    }
  ],
  animations: {
    idle: {
      duration: 2.0, loop: true, keyframes: [
        { time: 0, parts: { body: { position: [0, 0, 0] } } },
        { time: 1.0, parts: { body: { position: [0, -0.2, 0] } } },
        { time: 2.0, parts: { body: { position: [0, 0, 0] } } }
      ]
    },
    jump: {
      duration: 1.0, loop: true, keyframes: [
        { time: 0, parts: { body: { position: [0, 0, 0] } } },
        { time: 0.2, parts: { body: { position: [0, -0.5, 0] } } },
        { time: 0.5, parts: { body: { position: [0, 2, 0] } } },
        { time: 0.8, parts: { body: { position: [0, 0, 0] } } }
      ]
    }
  }
};
