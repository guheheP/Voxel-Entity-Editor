/**
 * Editor Main — Entry point for the Voxel Entity Editor.
 *
 * Thin orchestrator that initializes state, viewport, panels,
 * tools, autosave, and keyboard shortcuts.
 */

import { EditorState } from './EditorState.js';
import { EditorViewport } from './EditorViewport.js';
import { EditorTools } from './tools/EditorTools.js';
import { HeaderPanel } from './panels/HeaderPanel.js';
import { ToolsPanel } from './panels/ToolsPanel.js';
import { PropertiesPanel } from './panels/PropertiesPanel.js';
import { TimelinePanel } from './panels/TimelinePanel.js';

// ===== State =====
const state = new EditorState();

// ===== Viewport =====
const canvas = document.getElementById('editor-canvas');
const viewportEl = document.getElementById('panel-viewport');
const viewport = new EditorViewport(canvas, viewportEl, state);

// ===== Panels =====
const headerPanel = new HeaderPanel(state, viewport);
const toolsPanel = new ToolsPanel(state, viewport);
const propertiesPanel = new PropertiesPanel(state, viewport, toolsPanel);
const timelinePanel = new TimelinePanel(state, viewport);

// Build all panels
headerPanel.build();
toolsPanel.build();
propertiesPanel.build();
timelinePanel.build();

// ===== State Change Listeners =====
state.on('entityLoaded', () => {
  viewport.rebuildEntity();
  toolsPanel.updatePalette();
});

state.on('entityChanged', () => {
  viewport.rebuildEntity();
  toolsPanel.updatePalette();
});

state.on('gizmosChanged', () => viewport.rebuildGizmos());

// ===== Editor Tools (raycasting & paint/erase/fill/select) =====
const editorTools = new EditorTools(
  viewport.camera,
  canvas,
  viewport.scene,
  state,
  () => viewport.currentEntity
);

// ===== Keyboard Shortcuts =====
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  if (e.ctrlKey && e.key === 'z') {
    e.preventDefault();
    state.undo();
    viewport.rebuildEntity();
  }
  if (e.ctrlKey && e.key === 'y') {
    e.preventDefault();
    state.redo();
    viewport.rebuildEntity();
  }
  if (e.key === 'b') state.setTool('place');
  if (e.key === 'e') state.setTool('erase');
  if (e.key === 'p') state.setTool('paint');
  if (e.key === 'f') state.setTool('fill');
  if (e.key === 's' && !e.ctrlKey) state.setTool('select');
});

// Ctrl+S to save explicitly
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    saveToLocalStorage();
  }
});

// ===== AutoSave =====
const AUTOSAVE_KEY = 'voxelEditor_autosave';
const AUTOSAVE_INTERVAL = 5000;
let autosaveDirty = false;

function saveToLocalStorage() {
  if (!state.entityDef) return;
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(state.entityDef));
    autosaveDirty = false;
    console.log('[AutoSave] Saved to localStorage');
  } catch (e) {
    console.warn('[AutoSave] Failed:', e);
  }
}

function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem(AUTOSAVE_KEY);
    if (saved) {
      const def = JSON.parse(saved);
      if (def && def.name && def.parts) return def;
    }
  } catch (e) {
    console.warn('[AutoSave] Failed to load:', e);
  }
  return null;
}

state.on('entityChanged', () => { autosaveDirty = true; });
state.on('entityLoaded', () => { autosaveDirty = true; });

setInterval(() => {
  if (autosaveDirty) saveToLocalStorage();
}, AUTOSAVE_INTERVAL);

window.addEventListener('beforeunload', () => {
  if (autosaveDirty) saveToLocalStorage();
});

// ===== Init =====
// Try to restore from autosave, fallback to empty
const restored = loadFromLocalStorage();
if (restored) {
  console.log('[AutoSave] Restored entity:', restored.name);
  state.loadEntity(restored);
} else {
  state.newEntity();
}

viewport.start();
