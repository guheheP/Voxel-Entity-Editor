import { VoxelEngine } from './engine/VoxelEngine.js';
import { VoxelEntity } from './engine/VoxelEntity.js';
import { ControlPanel } from './ui/ControlPanel.js';

// Entity & Object definitions
import { humanoidDef } from './data/entities/humanoid.js';
import { catDef } from './data/entities/cat.js';
import { houseDef } from './data/objects/house.js';
import { streetLightDef } from './data/objects/streetLight.js';
import { fenceDef } from './data/objects/fence.js';

// ===== Registry of all available entity definitions =====
const entityRegistry = [
  humanoidDef,
  catDef,
  houseDef,
  streetLightDef,
  fenceDef,
];

// ===== Initialize Engine =====
const canvas = document.getElementById('voxel-canvas');
const engine = new VoxelEngine(canvas);

// ===== State =====
let currentEntity = null;
let currentDefIndex = 0;

// ===== Functions =====
function spawnEntity(defIndex) {
  // Remove current entity if exists
  if (currentEntity) {
    engine.removeEntity(currentEntity);
    currentEntity.dispose();
    currentEntity = null;
  }

  const def = entityRegistry[defIndex];
  currentEntity = new VoxelEntity(def);
  engine.addEntity(currentEntity);

  // Auto-play first animation if available
  const animNames = currentEntity.getAnimationNames();
  if (animNames.length > 0) {
    currentEntity.playAnimation(animNames[0]);
  }

  // Update UI
  ui.setAnimations(animNames);
  currentDefIndex = defIndex;
}

// ===== UI Setup =====
const overlay = document.getElementById('ui-overlay');
const ui = new ControlPanel(overlay);

ui.setEntities(entityRegistry.map(d => ({ name: d.name, type: d.type })));

ui.onEntitySelect = (index) => {
  spawnEntity(index);
};

ui.onAnimationSelect = (name) => {
  if (currentEntity) {
    currentEntity.playAnimation(name);
  }
};

ui.onCameraReset = () => {
  engine.resetCamera();
};

ui.onJsonImport = (def) => {
  // Add to registry and select it
  entityRegistry.push(def);
  ui.setEntities(entityRegistry.map(d => ({ name: d.name, type: d.type })));
  spawnEntity(entityRegistry.length - 1);
};

// ===== Drag & Drop JSON Import =====
window.addEventListener('dragover', (e) => {
  e.preventDefault(); // Prevent default to allow drop
});

window.addEventListener('drop', (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith('.json')) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const def = JSON.parse(ev.target.result);
        ui.onJsonImport(def);
      } catch (err) {
        console.error('JSON parse error:', err);
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  }
});

// ===== Spawn initial entity =====
spawnEntity(0);

// ===== Start render loop =====
engine.start();
