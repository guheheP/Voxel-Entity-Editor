/**
 * Voxel Game — Main Entry Point (Template)
 *
 * This file sets up a minimal Three.js scene with the Voxel Engine
 * and demonstrates entity loading, animation, and the game loop.
 *
 * Replace the demo code below with your actual game logic.
 *
 * Documentation:
 *   - docs/engine-api.md     — VoxelEntity & AnimationController API
 *   - docs/entity-format.md  — JSON entity data format
 *   - docs/presets.md        — Available preset entity catalog
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VoxelEntity } from '../engine/VoxelEntity.js';

// ============================================================
//  Scene Setup
// ============================================================

const canvas = document.getElementById('game-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.setClearColor(0x87ceeb);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x87ceeb, 0.003);

const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 500);
camera.position.set(0, 20, 30);

const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 4, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;

// ============================================================
//  Lighting
// ============================================================

scene.add(new THREE.AmbientLight(0xc8daf0, 0.8));
scene.add(new THREE.HemisphereLight(0x87ceeb, 0x6b8f5e, 0.6));

const sun = new THREE.DirectionalLight(0xfff8e8, 1.6);
sun.position.set(20, 30, 15);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -30;
sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30;
sun.shadow.camera.bottom = -30;
sun.shadow.bias = -0.001;
scene.add(sun);

// ============================================================
//  Ground & Grid
// ============================================================

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(200, 200),
  new THREE.MeshLambertMaterial({ color: 0x5a9e6f }),
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(40, 40, 0x7db892, 0x6aad80);
grid.position.y = 0.01;
grid.material.transparent = true;
grid.material.opacity = 0.3;
scene.add(grid);

// ============================================================
//  Entity Management
// ============================================================

/** All active entities. Call update(dt) each frame, dispose() on removal. */
const entities = [];

/**
 * Load a VoxelEntity from a preset JSON file.
 *
 * @param {string} path - e.g. '/presets/RPG_Characters/Knight.json'
 * @param {Object} [options]
 * @param {number[]} [options.position] - [x, y, z]
 * @param {number}   [options.rotation] - Y-axis radians
 * @param {number}   [options.scale]    - uniform scale
 * @returns {Promise<VoxelEntity>}
 *
 * @example
 *   const knight = await loadEntity('/presets/RPG_Characters/Knight.json', {
 *     position: [5, 0, 0], scale: 0.6,
 *   });
 *   knight.playAnimation('idle');
 */
async function loadEntity(path, options = {}) {
  const res = await fetch(path);
  const def = await res.json();
  const entity = new VoxelEntity(def, options);
  entity.addTo(scene);
  entities.push(entity);
  return entity;
}

/**
 * Remove and dispose an entity. Always use this instead of manual removal
 * to prevent GPU memory leaks.
 */
function removeEntity(entity) {
  entity.removeFrom(scene);
  entity.dispose();
  const idx = entities.indexOf(entity);
  if (idx !== -1) entities.splice(idx, 1);
}

// ============================================================
//  Demo — Replace this section with your game init
// ============================================================

async function init() {
  try {
    // Load a character and play walk animation
    const knight = await loadEntity('/presets/RPG_Characters/Knight.json', {
      position: [0, 0, 0],
      scale: 0.6,
    });
    knight.playAnimation('idle');

    console.log('[VoxelGame] Demo loaded. Replace init() with your game logic!');
  } catch (err) {
    console.error('[VoxelGame] Failed to load:', err);
  }
}

init();

// ============================================================
//  Game Loop
// ============================================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  // Update all entity animations
  for (const entity of entities) {
    entity.update(dt);
  }

  // TODO: Add your per-frame game logic here

  controls.update();
  renderer.render(scene, camera);
}

// ============================================================
//  Resize
// ============================================================

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener('resize', onResize);
onResize();

animate();
