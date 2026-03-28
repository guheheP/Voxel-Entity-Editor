/**
 * Editor Main — Entry point for the Voxel Entity Editor.
 *
 * Phase 1: Sets up the editor layout, loads a default entity,
 * and initializes the 3D viewport with basic panel shells.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VoxelEntity } from '../engine/VoxelEntity.js';
import { EditorState } from './EditorState.js';
import { EditorTools } from './tools/EditorTools.js';

// Import preset entities for the "Load Preset" menu
import { humanoidDef } from '../data/entities/humanoid.js';
import { catDef } from '../data/entities/cat.js';
import { houseDef } from '../data/objects/house.js';
import { streetLightDef } from '../data/objects/streetLight.js';
import { fenceDef } from '../data/objects/fence.js';

const presets = [
  { label: '🧑 Chibi Human', def: humanoidDef },
  { label: '🐾 Cat', def: catDef },
  { label: '🏠 House', def: houseDef },
  { label: '💡 Street Light', def: streetLightDef },
  { label: '🪵 Fence', def: fenceDef },
];

// ===== State =====
const state = new EditorState();

// ===== 3D Setup =====
const canvas = document.getElementById('editor-canvas');
const viewportEl = document.getElementById('panel-viewport');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.setClearColor(0x12151e);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x12151e, 0.006);

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 500);
camera.position.set(25, 20, 25);
camera.lookAt(0, 6, 0);

// Lights (named for editor theme control)
const ambientLight = new THREE.AmbientLight(0x8899bb, 0.6);
scene.add(ambientLight);
const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x3d5c3a, 0.4);
scene.add(hemiLight);
const sun = new THREE.DirectionalLight(0xfff4e6, 1.2);
sun.position.set(20, 30, 15);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -30;
sun.shadow.camera.right = 30;
sun.shadow.camera.top = 30;
sun.shadow.camera.bottom = -30;
sun.shadow.bias = -0.001;
scene.add(sun);

// Ground
const groundGeo = new THREE.PlaneGeometry(200, 200);
const groundMat = new THREE.MeshLambertMaterial({ color: 0x2d4a3e });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const gridHelper = new THREE.GridHelper(40, 40, 0x3a6b5a, 0x2f5a49);
gridHelper.position.y = 0.01;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.4;
scene.add(gridHelper);

// ===== Viewport Theme Presets =====
const viewportThemes = {
  dark: {
    label: '🌙 Dark',
    clearColor: 0x12151e,
    fogColor: 0x12151e, fogDensity: 0.006,
    groundColor: 0x2d4a3e,
    gridColors: [0x3a6b5a, 0x2f5a49], gridOpacity: 0.4,
    ambient: { color: 0x8899bb, intensity: 0.6 },
    hemi: { sky: 0x87ceeb, ground: 0x3d5c3a, intensity: 0.4 },
    sun: { color: 0xfff4e6, intensity: 1.2 },
  },
  daylight: {
    label: '☀️ Daylight',
    clearColor: 0x87ceeb,
    fogColor: 0x87ceeb, fogDensity: 0.003,
    groundColor: 0x5a9e6f,
    gridColors: [0x7db892, 0x6aad80], gridOpacity: 0.3,
    ambient: { color: 0xc8daf0, intensity: 0.8 },
    hemi: { sky: 0x87ceeb, ground: 0x6b8f5e, intensity: 0.6 },
    sun: { color: 0xfff8e8, intensity: 1.6 },
  },
  studio: {
    label: '💡 Studio',
    clearColor: 0x303030,
    fogColor: 0x303030, fogDensity: 0.002,
    groundColor: 0x404040,
    gridColors: [0x555555, 0x4a4a4a], gridOpacity: 0.5,
    ambient: { color: 0xffffff, intensity: 1.0 },
    hemi: { sky: 0xffffff, ground: 0x888888, intensity: 0.5 },
    sun: { color: 0xffffff, intensity: 1.8 },
  },
  neutral: {
    label: '⬜ Neutral',
    clearColor: 0xe8e8e8,
    fogColor: 0xe8e8e8, fogDensity: 0.002,
    groundColor: 0xcccccc,
    gridColors: [0xbbbbbb, 0xb0b0b0], gridOpacity: 0.35,
    ambient: { color: 0xffffff, intensity: 0.9 },
    hemi: { sky: 0xffffff, ground: 0xaaaaaa, intensity: 0.4 },
    sun: { color: 0xfff8f0, intensity: 1.4 },
  },
};

let currentThemeName = 'dark';
let brightnessMultiplier = 1.0;

function applyViewportTheme(themeName) {
  const t = viewportThemes[themeName];
  if (!t) return;
  currentThemeName = themeName;

  renderer.setClearColor(t.clearColor);
  scene.fog = new THREE.FogExp2(t.fogColor, t.fogDensity);
  groundMat.color.set(t.groundColor);

  // Update grid colors
  gridHelper.material[0]?.color?.set(t.gridColors[0]);
  gridHelper.material[1]?.color?.set(t.gridColors[1]);
  if (Array.isArray(gridHelper.material)) {
    gridHelper.material.forEach(m => { m.opacity = t.gridOpacity; });
  } else {
    gridHelper.material.opacity = t.gridOpacity;
  }

  applyBrightness();
}

function applyBrightness() {
  const t = viewportThemes[currentThemeName];
  if (!t) return;
  const b = brightnessMultiplier;

  ambientLight.color.set(t.ambient.color);
  ambientLight.intensity = t.ambient.intensity * b;

  hemiLight.color.set(t.hemi.sky);
  hemiLight.groundColor.set(t.hemi.ground);
  hemiLight.intensity = t.hemi.intensity * b;

  sun.color.set(t.sun.color);
  sun.intensity = t.sun.intensity * b;
}

// Pivot gizmo group
const gizmoGroup = new THREE.Group();
gizmoGroup.name = 'gizmos';
scene.add(gizmoGroup);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 6, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 5;
controls.maxDistance = 80;
controls.maxPolarAngle = Math.PI / 2 - 0.05;

// Disable orbit controls on left-click when tools are active
controls.mouseButtons = {
  LEFT: null,  // We handle left click via tools
  MIDDLE: THREE.MOUSE.DOLLY,
  RIGHT: THREE.MOUSE.ROTATE,
};

// ===== Entity Rendering =====
let currentEntity = null;

function rebuildEntity() {
  if (currentEntity) {
    currentEntity.removeFrom(scene);
    currentEntity.dispose();
  }
  if (!state.entityDef) return;
  currentEntity = new VoxelEntity(state.entityDef);
  currentEntity.addTo(scene);
  rebuildGizmos();
}

function rebuildGizmos() {
  // Clear existing gizmos
  while (gizmoGroup.children.length) {
    gizmoGroup.remove(gizmoGroup.children[0]);
  }
  if (!state.showGizmos || !state.entityDef) return;

  const s = state.entityDef.voxelSize || 1;
  for (const part of state.entityDef.parts) {
    // Find world position of pivot through parent chain
    const pivotWorld = computePivotWorld(part, state.entityDef, s);
    const axisLen = 2;
    const colors = [0xff4444, 0x44ff44, 0x4488ff]; // X R, Y G, Z B
    const dirs = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, 0, 1),
    ];
    for (let i = 0; i < 3; i++) {
      const geo = new THREE.BufferGeometry().setFromPoints([
        pivotWorld.clone(),
        pivotWorld.clone().add(dirs[i].clone().multiplyScalar(axisLen)),
      ]);
      const mat = new THREE.LineBasicMaterial({
        color: colors[i],
        transparent: true,
        opacity: state.selectedPart === part.name ? 0.9 : 0.3,
        depthTest: false,
      });
      const line = new THREE.Line(geo, mat);
      line.renderOrder = 999;
      gizmoGroup.add(line);
    }
  }
}

function computePivotWorld(partDef, entityDef, s) {
  const pos = new THREE.Vector3(
    partDef.position[0] * s,
    partDef.position[1] * s,
    partDef.position[2] * s
  );
  if (partDef.parent) {
    const parentDef = entityDef.parts.find(p => p.name === partDef.parent);
    if (parentDef) {
      pos.add(computePivotWorld(parentDef, entityDef, s));
    }
  }
  return pos;
}

// ===== Build Header =====
function buildHeader() {
  const header = document.getElementById('editor-header');
  header.innerHTML = `
    <div class="header-title">🧊 Voxel Entity Editor</div>
    <div class="header-divider"></div>
    <button class="header-btn" id="btn-new">✨ New</button>
    <select class="input-select" id="preset-select" style="width:160px;font-size:12px;">
      <option value="">📦 Load Preset...</option>
      ${presets.map((p, i) => `<option value="${i}">${p.label}</option>`).join('')}
    </select>
    <div class="header-divider"></div>
    <button class="header-btn" id="btn-import">📂 Import</button>
    <button class="header-btn primary" id="btn-export">💾 Export JSON</button>
    <div class="header-spacer"></div>
    <button class="header-btn" id="btn-undo" title="Ctrl+Z">↩ Undo</button>
    <button class="header-btn" id="btn-redo" title="Ctrl+Y">↪ Redo</button>
    <div class="header-divider"></div>
    <a href="/" class="header-link">← Preview</a>
  `;

  document.getElementById('btn-new').addEventListener('click', () => state.newEntity());
  document.getElementById('preset-select').addEventListener('change', (e) => {
    const idx = parseInt(e.target.value);
    if (!isNaN(idx)) state.loadEntity(presets[idx].def);
    e.target.value = '';
  });
  document.getElementById('btn-undo').addEventListener('click', () => state.undo());
  document.getElementById('btn-redo').addEventListener('click', () => state.redo());
  // Import/Export will be implemented in Phase 5
  document.getElementById('btn-export').addEventListener('click', () => {
    if (!state.entityDef) return;
    const json = JSON.stringify(state.entityDef, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.entityDef.name || 'entity'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById('btn-import').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const def = JSON.parse(ev.target.result);
          state.loadEntity(def);
        } catch (err) {
          console.error('Import failed:', err);
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });
}

// ===== Build Tools Panel (Phase 1 shell) =====
function buildToolsPanel() {
  const panel = document.getElementById('panel-tools');
  panel.innerHTML = `
    <div class="panel-section">
      <div class="panel-section-title">Tools</div>
      <div class="tool-grid">
        <button class="tool-btn active" data-tool="place">🧱 Place</button>
        <button class="tool-btn" data-tool="erase">🧹 Erase</button>
        <button class="tool-btn" data-tool="paint">🖌 Paint</button>
        <button class="tool-btn" data-tool="select">👆 Select</button>
      </div>
    </div>

    <div class="panel-section">
      <div class="panel-section-title">Palette <button class="sm-btn" id="btn-add-color">+</button></div>
      <div class="palette-grid" id="palette-grid"></div>
    </div>

    <div class="panel-section">
      <div class="panel-section-title">Options</div>
      <div class="toggle-row">
        <label>Mirror (X 軸対称)</label>
        <div class="toggle-switch" id="toggle-mirror"></div>
      </div>
      <div class="toggle-row">
        <label>Show Gizmos</label>
        <div class="toggle-switch on" id="toggle-gizmos"></div>
      </div>
      <div class="toggle-row">
        <label>Show Grid</label>
        <div class="toggle-switch on" id="toggle-grid"></div>
      </div>
    </div>

    <div class="panel-section">
      <div class="panel-section-title">Viewport</div>
      <div style="margin-bottom:8px">
        <label style="font-size:11px;color:var(--text-muted);display:block;margin-bottom:4px;">Background</label>
        <select class="input-select" id="viewport-theme" style="font-size:12px;">
          ${Object.entries(viewportThemes).map(([k, v]) =>
            `<option value="${k}" ${currentThemeName === k ? 'selected' : ''}>${v.label}</option>`
          ).join('')}
        </select>
      </div>
      <div>
        <label style="font-size:11px;color:var(--text-muted);display:flex;justify-content:space-between;margin-bottom:4px;">
          <span>Brightness</span>
          <span id="brightness-val" style="font-family:var(--font-mono);">${Math.round(brightnessMultiplier * 100)}%</span>
        </label>
        <input type="range" id="brightness-slider" min="20" max="200" value="${Math.round(brightnessMultiplier * 100)}" style="width:100%;accent-color:var(--accent);" />
      </div>
    </div>
  `;

  // Tool selection
  panel.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      panel.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.setTool(btn.dataset.tool);
    });
  });

  // Toggles
  setupToggle('toggle-mirror', false, (v) => state.setMirrorPaint(v));
  setupToggle('toggle-gizmos', true, (v) => state.setShowGizmos(v));
  setupToggle('toggle-grid', true, (v) => {
    state.setShowGrid(v);
    gridHelper.visible = v;
  });

  // Viewport theme
  document.getElementById('viewport-theme')?.addEventListener('change', (e) => {
    applyViewportTheme(e.target.value);
  });

  // Brightness slider
  document.getElementById('brightness-slider')?.addEventListener('input', (e) => {
    brightnessMultiplier = parseInt(e.target.value) / 100;
    applyBrightness();
    const valEl = document.getElementById('brightness-val');
    if (valEl) valEl.textContent = `${Math.round(brightnessMultiplier * 100)}%`;
  });

  // Palette add
  document.getElementById('btn-add-color').addEventListener('click', () => {
    if (!state.entityDef) return;
    state.entityDef.palette.push('#808080');
    updatePalette();
    rebuildEntity();
  });
}

function setupToggle(id, initial, onChange) {
  const el = document.getElementById(id);
  if (!el) return;
  let val = initial;
  el.classList.toggle('on', val);
  el.addEventListener('click', () => {
    val = !val;
    el.classList.toggle('on', val);
    onChange(val);
  });
}

function updatePalette() {
  const grid = document.getElementById('palette-grid');
  if (!grid || !state.entityDef) return;
  grid.innerHTML = '';
  state.entityDef.palette.forEach((hex, i) => {
    const swatch = document.createElement('div');
    swatch.className = 'color-swatch' + (i === state.selectedColor ? ' active' : '');
    swatch.style.background = hex;
    swatch.title = `Color ${i}: ${hex}`;
    swatch.addEventListener('click', () => {
      state.selectColor(i);
      updatePalette();
    });
    // Double-click to change color
    swatch.addEventListener('dblclick', () => {
      const input = document.createElement('input');
      input.type = 'color';
      input.value = hex;
      input.addEventListener('input', (e) => {
        state.entityDef.palette[i] = e.target.value;
        updatePalette();
        rebuildEntity();
      });
      input.click();
    });
    grid.appendChild(swatch);
  });
}

// ===== Build Properties Panel (Phase 1 shell) =====
function buildPropertiesPanel() {
  const panel = document.getElementById('panel-properties');

  function render() {
    if (!state.entityDef) {
      panel.innerHTML = '<p class="placeholder-msg">No entity loaded.<br>Click "New" or load a preset.</p>';
      return;
    }

    const def = state.entityDef;
    const selPart = state.getSelectedPartDef();

    panel.innerHTML = `
      <div class="panel-section">
        <div class="panel-section-title">Entity</div>
        <div class="input-row">
          <input class="input-text" id="entity-name" value="${def.name}" placeholder="Name" />
        </div>
        <div class="input-row" style="margin-top:6px">
          <select class="input-select" id="entity-type">
            <option value="humanoid" ${def.type === 'humanoid' ? 'selected' : ''}>Humanoid</option>
            <option value="quadruped" ${def.type === 'quadruped' ? 'selected' : ''}>Quadruped</option>
            <option value="static" ${def.type === 'static' ? 'selected' : ''}>Static</option>
          </select>
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-section-title">Parts <button class="sm-btn" id="btn-add-part">+ Add</button></div>
        <div id="parts-tree"></div>
      </div>

      ${selPart ? `
      <div class="panel-section">
        <div class="panel-section-title">Part: ${selPart.name}
          <span>
            <button class="sm-btn" id="btn-rename-part" title="Rename">✏️</button>
            <button class="sm-btn" id="btn-dup-part" title="Duplicate">📋</button>
            <button class="sm-btn" id="btn-del-part" style="color:var(--accent-red)" title="Delete">🗑</button>
          </span>
        </div>
        <div style="margin-bottom:8px">
          <label style="font-size:11px;color:var(--text-muted);">Parent</label>
          <select class="input-select" id="part-parent" style="margin-top:4px">
            <option value="">None (root)</option>
            ${def.parts.filter(p => p.name !== selPart.name).map(p =>
              `<option value="${p.name}" ${selPart.parent === p.name ? 'selected' : ''}>${p.name}</option>`
            ).join('')}
          </select>
        </div>
        <label style="font-size:11px;color:var(--text-muted);">Position (pivot)</label>
        <div class="input-row">
          <span class="input-label" style="color:var(--accent-red)">X</span>
          <input class="input-num" id="pos-x" type="number" step="0.5" value="${selPart.position[0]}" />
          <span class="input-label" style="color:var(--accent-green)">Y</span>
          <input class="input-num" id="pos-y" type="number" step="0.5" value="${selPart.position[1]}" />
          <span class="input-label" style="color:#4488ff">Z</span>
          <input class="input-num" id="pos-z" type="number" step="0.5" value="${selPart.position[2]}" />
        </div>
        <label style="font-size:11px;color:var(--text-muted);">Center (local pivot)</label>
        <div class="input-row">
          <span class="input-label" style="color:var(--accent-red)">X</span>
          <input class="input-num" id="ctr-x" type="number" step="0.5" value="${selPart.center[0]}" />
          <span class="input-label" style="color:var(--accent-green)">Y</span>
          <input class="input-num" id="ctr-y" type="number" step="0.5" value="${selPart.center[1]}" />
          <span class="input-label" style="color:#4488ff">Z</span>
          <input class="input-num" id="ctr-z" type="number" step="0.5" value="${selPart.center[2]}" />
        </div>
        <p style="font-size:11px;color:var(--text-muted);margin-top:6px;">
          Voxels: ${selPart.voxels.length}
        </p>
      </div>
      ` : ''}
    `;

    // Build parts tree
    const tree = document.getElementById('parts-tree');
    if (tree) {
      buildPartsTree(tree, def.parts);
    }

    // Entity name
    document.getElementById('entity-name')?.addEventListener('change', (e) => {
      def.name = e.target.value;
      state.emit('entityChanged', {});
    });

    // Entity type
    document.getElementById('entity-type')?.addEventListener('change', (e) => {
      def.type = e.target.value;
    });

    // Part add/delete
    document.getElementById('btn-add-part')?.addEventListener('click', () => {
      const name = prompt('Part name:');
      if (name) {
        state.addPart(name, state.selectedPart);
        rebuildEntity();
        render();
      }
    });

    document.getElementById('btn-del-part')?.addEventListener('click', () => {
      if (selPart && confirm(`Delete part "${selPart.name}"?`)) {
        state.removePart(selPart.name);
        rebuildEntity();
        render();
      }
    });

    // Part rename
    document.getElementById('btn-rename-part')?.addEventListener('click', () => {
      if (!selPart) return;
      const newName = prompt('New name:', selPart.name);
      if (newName && newName !== selPart.name) {
        const oldName = selPart.name;
        // Update references in other parts
        def.parts.forEach(p => {
          if (p.parent === oldName) p.parent = newName;
        });
        // Update animation keyframes
        Object.values(def.animations || {}).forEach(anim => {
          anim.keyframes?.forEach(kf => {
            if (kf.parts && kf.parts[oldName]) {
              kf.parts[newName] = kf.parts[oldName];
              delete kf.parts[oldName];
            }
          });
        });
        selPart.name = newName;
        state.selectedPart = newName;
        state.emit('entityChanged', {});
        rebuildEntity();
        render();
      }
    });

    // Part duplicate
    document.getElementById('btn-dup-part')?.addEventListener('click', () => {
      if (!selPart) return;
      const newName = selPart.name + '_copy';
      const clone = JSON.parse(JSON.stringify(selPart));
      clone.name = newName;
      clone.position = [...selPart.position];
      clone.position[0] += 2; // offset to avoid overlap
      def.parts.push(clone);
      state.selectPart(newName);
      state.emit('entityChanged', {});
      rebuildEntity();
      render();
    });

    // Part parent
    document.getElementById('part-parent')?.addEventListener('change', (e) => {
      if (selPart) {
        state.updatePartProperty(selPart.name, 'parent', e.target.value || null);
        rebuildEntity();
      }
    });

    // Position & Center inputs
    bindVec3Input('pos', selPart, 'position');
    bindVec3Input('ctr', selPart, 'center');
  }

  function buildPartsTree(container, parts) {
    container.innerHTML = '';
    const roots = parts.filter(p => !p.parent);
    const childMap = {};
    parts.forEach(p => {
      if (p.parent) {
        if (!childMap[p.parent]) childMap[p.parent] = [];
        childMap[p.parent].push(p);
      }
    });

    function renderNode(part, depth) {
      const item = document.createElement('div');
      item.className = 'part-tree-item' + (state.selectedPart === part.name ? ' active' : '');
      item.innerHTML = `${'<span class="indent"></span>'.repeat(depth)}📦 ${part.name}`;
      item.addEventListener('click', () => {
        state.selectPart(part.name);
        render();
        rebuildGizmos();
      });
      container.appendChild(item);
      (childMap[part.name] || []).forEach(c => renderNode(c, depth + 1));
    }
    roots.forEach(r => renderNode(r, 0));
  }

  function bindVec3Input(prefix, part, prop) {
    if (!part) return;
    ['x', 'y', 'z'].forEach((axis, i) => {
      const el = document.getElementById(`${prefix}-${axis}`);
      if (el) {
        el.addEventListener('change', () => {
          const newVal = [...part[prop]];
          newVal[i] = parseFloat(el.value) || 0;
          state.updatePartProperty(part.name, prop, newVal);
          rebuildEntity();
        });
      }
    });
  }

  // Re-render on state changes
  state.on('entityLoaded', () => { render(); updatePalette(); });
  state.on('selectionChanged', render);
  state.on('entityChanged', () => { render(); updatePalette(); });

  render();
}

// ===== Build Timeline Panel (Phase 4: Full Animation Editor) =====
function buildTimelinePanel() {
  const panel = document.getElementById('panel-timeline');
  let playheadPos = 0; // 0..1 normalized
  let isDraggingPlayhead = false;

  function getAnimDef() {
    if (!state.entityDef || !state.selectedAnim) return null;
    return state.entityDef.animations?.[state.selectedAnim] || null;
  }

  function render() {
    if (!state.entityDef) {
      panel.innerHTML = '<p class="placeholder-msg">Load an entity to edit animations</p>';
      return;
    }
    const anims = Object.keys(state.entityDef.animations || {});
    const animDef = getAnimDef();
    const keyframes = animDef?.keyframes || [];
    const duration = animDef?.duration || 1;

    panel.innerHTML = `
      <div style="display:flex;gap:12px;height:100%;">
        <div style="flex:1;display:flex;flex-direction:column;min-width:0;">
          <div class="timeline-header">
            <span style="font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:1.5px;text-transform:uppercase;">Animation</span>
            <select class="input-select" id="anim-select" style="width:130px;font-size:12px;">
              <option value="">Select...</option>
              ${anims.map(a => `<option value="${a}" ${state.selectedAnim === a ? 'selected' : ''}>${a}</option>`).join('')}
            </select>
            <button class="sm-btn" id="btn-new-anim">+ New</button>
            <button class="sm-btn" id="btn-del-anim" style="color:var(--accent-red)">🗑</button>
            <div style="width:1px;height:18px;background:var(--border);margin:0 4px"></div>
            <button class="sm-btn" id="btn-play-anim">▶ Play</button>
            <button class="sm-btn" id="btn-stop-anim">⏹ Stop</button>
            <div style="width:1px;height:18px;background:var(--border);margin:0 4px"></div>
            <span style="font-size:11px;color:var(--text-muted);">Duration:</span>
            <input class="input-num" id="anim-duration" type="number" min="0.1" step="0.1" value="${duration}" style="width:55px" />
            <span style="font-size:11px;color:var(--text-muted);">s</span>
            <div style="width:1px;height:18px;background:var(--border);margin:0 4px"></div>
            <span style="font-size:11px;color:var(--text-muted);">Loop:</span>
            <div class="toggle-switch ${animDef?.loop ? 'on' : ''}" id="toggle-loop" style="transform:scale(0.85)"></div>
            <div style="width:1px;height:18px;background:var(--border);margin:0 4px"></div>
            <span style="font-size:11px;color:var(--text-muted);">Speed:</span>
            <select class="input-select" id="anim-speed" style="width:65px;font-size:11px;padding:3px 6px;">
              <option value="0.1" ${(currentEntity?.animController?.speed || 1) === 0.1 ? 'selected' : ''}>0.1x</option>
              <option value="0.25" ${(currentEntity?.animController?.speed || 1) === 0.25 ? 'selected' : ''}>0.25x</option>
              <option value="0.5" ${(currentEntity?.animController?.speed || 1) === 0.5 ? 'selected' : ''}>0.5x</option>
              <option value="1" ${(currentEntity?.animController?.speed || 1) === 1 ? 'selected' : ''}>1x</option>
              <option value="1.5" ${(currentEntity?.animController?.speed || 1) === 1.5 ? 'selected' : ''}>1.5x</option>
              <option value="2" ${(currentEntity?.animController?.speed || 1) === 2 ? 'selected' : ''}>2x</option>
              <option value="3" ${(currentEntity?.animController?.speed || 1) === 3 ? 'selected' : ''}>3x</option>
            </select>
          </div>

          ${animDef ? `
          <div style="position:relative;flex:1;min-height:36px;">
            <div class="timeline-track" id="timeline-track" style="height:100%;margin:0;">
              <div class="timeline-playhead" id="timeline-playhead" style="left:${playheadPos * 100}%"></div>
              ${keyframes.map((kf, i) =>
                `<div class="keyframe-dot ${state.selectedKeyframe === i ? 'active' : ''}"
                      data-kf="${i}" style="left:${kf.time * 100}%"
                      title="t=${kf.time.toFixed(2)}"></div>`
              ).join('')}
              <div style="position:absolute;bottom:2px;left:4px;font-size:9px;color:var(--text-muted);font-family:var(--font-mono)">0.0</div>
              <div style="position:absolute;bottom:2px;right:4px;font-size:9px;color:var(--text-muted);font-family:var(--font-mono)">1.0</div>
            </div>
          </div>
          <div style="display:flex;gap:6px;margin-top:6px;">
            <button class="sm-btn" id="btn-add-kf">+ Keyframe</button>
            <button class="sm-btn" id="btn-del-kf" style="color:var(--accent-red)">- Keyframe</button>
            <span style="font-size:11px;color:var(--text-muted);line-height:24px;" id="kf-time-label">
              ${state.selectedKeyframe !== null ? `KF ${state.selectedKeyframe}: t=${keyframes[state.selectedKeyframe]?.time.toFixed(2)}` : 'Click a keyframe dot to edit'}
            </span>
          </div>
          ` : '<p class="placeholder-msg" style="padding:8px">Select or create an animation</p>'}
        </div>

        ${animDef && state.selectedKeyframe !== null && keyframes[state.selectedKeyframe] ? `
        <div style="width:320px;border-left:1px solid var(--border);padding-left:12px;overflow-y:auto;">
          <div style="font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">
            Keyframe ${state.selectedKeyframe} — Pose
          </div>
          <div style="display:flex;gap:4px;margin-bottom:6px;">
            <input class="input-num" id="kf-time-input" type="number" min="0" max="1" step="0.05"
                   value="${keyframes[state.selectedKeyframe].time}" style="width:60px" />
            <span style="font-size:11px;color:var(--text-muted);line-height:28px;">time (0-1)</span>
          </div>
          ${state.entityDef.parts.map(part => {
            const kfParts = keyframes[state.selectedKeyframe].parts || {};
            const partData = kfParts[part.name] || {};
            const rot = partData.rotation || [0, 0, 0];
            const pos = partData.position || [0, 0, 0];
            return `
            <div style="margin-bottom:4px;padding:4px 0;border-bottom:1px solid var(--border);">
              <div style="font-size:11px;font-weight:600;color:var(--text-secondary);margin-bottom:2px;">${part.name}</div>
              <div style="display:flex;gap:4px;align-items:center;">
                <span style="font-size:9px;color:var(--text-muted);width:18px;">rot</span>
                <input class="input-num kf-rot" data-part="${part.name}" data-axis="0" type="number" step="0.1" value="${rot[0].toFixed(2)}" style="width:52px;font-size:10px;padding:2px 4px" />
                <input class="input-num kf-rot" data-part="${part.name}" data-axis="1" type="number" step="0.1" value="${rot[1].toFixed(2)}" style="width:52px;font-size:10px;padding:2px 4px" />
                <input class="input-num kf-rot" data-part="${part.name}" data-axis="2" type="number" step="0.1" value="${rot[2].toFixed(2)}" style="width:52px;font-size:10px;padding:2px 4px" />
              </div>
              <div style="display:flex;gap:4px;align-items:center;margin-top:2px;">
                <span style="font-size:9px;color:var(--text-muted);width:18px;">pos</span>
                <input class="input-num kf-pos" data-part="${part.name}" data-axis="0" type="number" step="0.1" value="${pos[0].toFixed(2)}" style="width:52px;font-size:10px;padding:2px 4px" />
                <input class="input-num kf-pos" data-part="${part.name}" data-axis="1" type="number" step="0.1" value="${pos[1].toFixed(2)}" style="width:52px;font-size:10px;padding:2px 4px" />
                <input class="input-num kf-pos" data-part="${part.name}" data-axis="2" type="number" step="0.1" value="${pos[2].toFixed(2)}" style="width:52px;font-size:10px;padding:2px 4px" />
              </div>
            </div>`;
          }).join('')}
        </div>
        ` : ''}
      </div>
    `;

    // === Event Bindings ===

    // Animation select
    document.getElementById('anim-select')?.addEventListener('change', (e) => {
      state.selectedAnim = e.target.value || null;
      state.selectedKeyframe = null;
      playheadPos = 0;
      if (currentEntity && state.selectedAnim) {
        currentEntity.playAnimation(state.selectedAnim);
        currentEntity.animController.stop();
      }
      render();
    });

    // New animation
    document.getElementById('btn-new-anim')?.addEventListener('click', () => {
      const name = prompt('Animation name:');
      if (!name || !state.entityDef) return;
      if (!state.entityDef.animations) state.entityDef.animations = {};
      state.entityDef.animations[name] = {
        duration: 2,
        loop: true,
        keyframes: [
          { time: 0, parts: {} },
          { time: 1, parts: {} },
        ],
      };
      state.selectedAnim = name;
      state.selectedKeyframe = 0;
      state.emit('entityChanged', {});
      render();
    });

    // Delete animation
    document.getElementById('btn-del-anim')?.addEventListener('click', () => {
      if (!state.selectedAnim || !state.entityDef?.animations) return;
      if (!confirm(`Delete animation "${state.selectedAnim}"?`)) return;
      delete state.entityDef.animations[state.selectedAnim];
      state.selectedAnim = null;
      state.selectedKeyframe = null;
      state.emit('entityChanged', {});
      render();
    });

    // Play / Stop
    document.getElementById('btn-play-anim')?.addEventListener('click', () => {
      if (currentEntity && state.selectedAnim) {
        const ad = getAnimDef();
        if (ad) {
          currentEntity.animController.play(state.selectedAnim, ad, true);
        }
      }
    });
    document.getElementById('btn-stop-anim')?.addEventListener('click', () => {
      if (currentEntity) {
        currentEntity.animController.stop();
      }
    });

    // Duration
    document.getElementById('anim-duration')?.addEventListener('change', (e) => {
      const ad = getAnimDef();
      if (ad) {
        ad.duration = Math.max(0.1, parseFloat(e.target.value) || 1);
      }
    });

    // Loop toggle
    const loopToggle = document.getElementById('toggle-loop');
    loopToggle?.addEventListener('click', () => {
      const ad = getAnimDef();
      if (ad) {
        ad.loop = !ad.loop;
        loopToggle.classList.toggle('on', ad.loop);
      }
    });

    // Speed control
    document.getElementById('anim-speed')?.addEventListener('change', (e) => {
      if (currentEntity) {
        currentEntity.animController.speed = parseFloat(e.target.value) || 1;
      }
    });

    // Timeline track — click to seek, drag playhead
    const track = document.getElementById('timeline-track');
    if (track) {
      track.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('keyframe-dot')) return;
        isDraggingPlayhead = true;
        seekFromEvent(e);
      });
      document.addEventListener('mousemove', (e) => {
        if (isDraggingPlayhead) seekFromEvent(e);
      });
      document.addEventListener('mouseup', () => {
        isDraggingPlayhead = false;
      });
    }

    function seekFromEvent(e) {
      const trackEl = document.getElementById('timeline-track');
      if (!trackEl) return;
      const rect = trackEl.getBoundingClientRect();
      playheadPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const playheadEl = document.getElementById('timeline-playhead');
      if (playheadEl) playheadEl.style.left = `${playheadPos * 100}%`;

      // Apply pose at this time
      if (currentEntity && state.selectedAnim) {
        const ad = getAnimDef();
        if (ad) {
          currentEntity.animController.play(state.selectedAnim, ad);
          const transforms = currentEntity.animController.seekTo(playheadPos);
          applyTransforms(transforms);
        }
      }
    }

    function applyTransforms(transforms) {
      if (!currentEntity) return;
      const s = state.entityDef?.voxelSize || 1;
      for (const [partName, transform] of Object.entries(transforms)) {
        const group = currentEntity.partGroups[partName];
        if (!group) continue;
        if (transform.rotation) {
          group.rotation.set(...transform.rotation);
        }
        if (transform.position) {
          const rest = group.userData.restPosition;
          group.position.set(
            rest.x + transform.position[0] * s,
            rest.y + transform.position[1] * s,
            rest.z + transform.position[2] * s
          );
        }
      }
    }

    // Keyframe dot click
    document.querySelectorAll('.keyframe-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(dot.dataset.kf);
        state.selectedKeyframe = idx;
        const kf = getAnimDef()?.keyframes[idx];
        if (kf) {
          playheadPos = kf.time;
          // Seek to keyframe time
          if (currentEntity && state.selectedAnim) {
            const ad = getAnimDef();
            currentEntity.animController.play(state.selectedAnim, ad);
            const transforms = currentEntity.animController.seekTo(kf.time);
            applyTransforms(transforms);
          }
        }
        render();
      });
    });

    // Add keyframe
    document.getElementById('btn-add-kf')?.addEventListener('click', () => {
      const ad = getAnimDef();
      if (!ad) return;
      // Add a keyframe at current playhead position
      const newKf = { time: Math.round(playheadPos * 100) / 100, parts: {} };
      ad.keyframes.push(newKf);
      ad.keyframes.sort((a, b) => a.time - b.time);
      state.selectedKeyframe = ad.keyframes.indexOf(newKf);
      render();
    });

    // Delete keyframe
    document.getElementById('btn-del-kf')?.addEventListener('click', () => {
      const ad = getAnimDef();
      if (!ad || state.selectedKeyframe === null) return;
      if (ad.keyframes.length <= 1) return; // keep at least 1
      ad.keyframes.splice(state.selectedKeyframe, 1);
      state.selectedKeyframe = Math.min(state.selectedKeyframe, ad.keyframes.length - 1);
      render();
    });

    // Keyframe time input
    document.getElementById('kf-time-input')?.addEventListener('change', (e) => {
      const ad = getAnimDef();
      if (!ad || state.selectedKeyframe === null) return;
      const kf = ad.keyframes[state.selectedKeyframe];
      kf.time = Math.max(0, Math.min(1, parseFloat(e.target.value) || 0));
      ad.keyframes.sort((a, b) => a.time - b.time);
      state.selectedKeyframe = ad.keyframes.indexOf(kf);
      playheadPos = kf.time;
      render();
    });

    // Keyframe rotation/position inputs
    document.querySelectorAll('.kf-rot').forEach(input => {
      input.addEventListener('change', () => {
        updateKfTransform(input.dataset.part, 'rotation', parseInt(input.dataset.axis), parseFloat(input.value) || 0);
      });
    });
    document.querySelectorAll('.kf-pos').forEach(input => {
      input.addEventListener('change', () => {
        updateKfTransform(input.dataset.part, 'position', parseInt(input.dataset.axis), parseFloat(input.value) || 0);
      });
    });

    function updateKfTransform(partName, prop, axis, value) {
      const ad = getAnimDef();
      if (!ad || state.selectedKeyframe === null) return;
      const kf = ad.keyframes[state.selectedKeyframe];
      if (!kf.parts) kf.parts = {};
      if (!kf.parts[partName]) kf.parts[partName] = {};
      if (!kf.parts[partName][prop]) kf.parts[partName][prop] = [0, 0, 0];
      kf.parts[partName][prop][axis] = value;

      // Live preview the pose
      if (currentEntity && state.selectedAnim) {
        currentEntity.animController.play(state.selectedAnim, ad);
        const transforms = currentEntity.animController.seekTo(kf.time);
        applyTransforms(transforms);
      }
    }
  }

  state.on('entityLoaded', () => {
    state.selectedAnim = null;
    state.selectedKeyframe = null;
    playheadPos = 0;
    render();
  });
  state.on('entityChanged', render);
  render();
}

// ===== Resize =====
function onResize() {
  const rect = viewportEl.getBoundingClientRect();
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
  renderer.setSize(rect.width, rect.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
window.addEventListener('resize', onResize);

// ===== Keyboard shortcuts =====
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

  if (e.ctrlKey && e.key === 'z') { e.preventDefault(); state.undo(); rebuildEntity(); }
  if (e.ctrlKey && e.key === 'y') { e.preventDefault(); state.redo(); rebuildEntity(); }
  if (e.key === 'b') state.setTool('place');
  if (e.key === 'e') state.setTool('erase');
  if (e.key === 'p') state.setTool('paint');
  if (e.key === 's' && !e.ctrlKey) state.setTool('select');

  // Update tool button UI
  document.querySelectorAll('.tool-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tool === state.activeTool);
  });
});

// ===== Render Loop =====
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  if (currentEntity) {
    currentEntity.update(dt);

    // Sync timeline playhead with animation playback
    const ac = currentEntity.animController;
    if (ac.playing && ac.currentDef) {
      const normalized = ac.time / (ac.currentDef.duration || 1);
      const playheadEl = document.getElementById('timeline-playhead');
      if (playheadEl) {
        playheadEl.style.left = `${(normalized % 1) * 100}%`;
      }
    }
  }
  controls.update();
  renderer.render(scene, camera);
}

// ===== State Change Listeners =====
state.on('entityLoaded', rebuildEntity);
state.on('entityChanged', rebuildEntity);
state.on('gizmosChanged', rebuildGizmos);

// ===== AutoSave (Phase 5) =====
const AUTOSAVE_KEY = 'voxelEditor_autosave';
const AUTOSAVE_INTERVAL = 5000; // 5 seconds
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
      if (def && def.name && def.parts) {
        return def;
      }
    }
  } catch (e) {
    console.warn('[AutoSave] Failed to load:', e);
  }
  return null;
}

// Mark dirty on changes
state.on('entityChanged', () => { autosaveDirty = true; });
state.on('entityLoaded', () => { autosaveDirty = true; });

// Periodic autosave
setInterval(() => {
  if (autosaveDirty) saveToLocalStorage();
}, AUTOSAVE_INTERVAL);

// Save on page unload
window.addEventListener('beforeunload', () => {
  if (autosaveDirty) saveToLocalStorage();
});

// Ctrl+S to save explicitly
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key === 's') {
    e.preventDefault();
    saveToLocalStorage();
  }
});

// ===== Init =====
buildHeader();
buildToolsPanel();
buildPropertiesPanel();
buildTimelinePanel();
onResize();

// Try to restore from autosave, fallback to default
const restored = loadFromLocalStorage();
if (restored) {
  console.log('[AutoSave] Restored entity:', restored.name);
  state.loadEntity(restored);
} else {
  state.loadEntity(humanoidDef);
}

// Initialize editor tools (raycasting & paint/erase/fill/select)
const editorTools = new EditorTools(camera, canvas, scene, state, () => currentEntity);

clock.start();
animate();

