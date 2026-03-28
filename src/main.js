import { VoxelEngine } from './engine/VoxelEngine.js';
import { VoxelEntity } from './engine/VoxelEntity.js';
import { ControlPanel } from './ui/ControlPanel.js';

// ===== Initialize Engine =====
const canvas = document.getElementById('voxel-canvas');
const engine = new VoxelEngine(canvas);

// ===== UI Setup =====
const overlay = document.getElementById('ui-overlay');
const ui = new ControlPanel(overlay);

// ===== State =====
let currentEntity = null;

// ===== Functions =====
function spawnEntity(def) {
  // Remove current entity if exists
  if (currentEntity) {
    engine.removeEntity(currentEntity);
    currentEntity.dispose();
    currentEntity = null;
  }

  currentEntity = new VoxelEntity(def);
  engine.addEntity(currentEntity);

  // Auto-play first animation if available
  const animNames = currentEntity.getAnimationNames();
  if (animNames.length > 0) {
    currentEntity.playAnimation(animNames[0]);
  }

  // Update UI
  ui.setAnimations(animNames);
}

ui.onEntityFetch = async (url) => {
  try {
    const res = await fetch(url);
    const def = await res.json();
    spawnEntity(def);
  } catch (err) {
    console.error('Failed to load entity:', err);
  }
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
  spawnEntity(def);
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

// ===== Load Presets & Start =====
async function loadPresets() {
  try {
    const res = await fetch('/presets.json');
    const groups = await res.json();
    ui.setEntities(groups);
    if (groups.length > 0 && groups[0].items.length > 0) {
      ui.onEntityFetch(groups[0].items[0].url);
    }
  } catch(err) {
    console.error('Failed to load presets manifest', err);
  }
}

loadPresets();
engine.start();
