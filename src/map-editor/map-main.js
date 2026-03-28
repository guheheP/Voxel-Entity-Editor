import * as THREE from 'three';
import { VoxelEngine } from '../engine/VoxelEngine.js';
import { VoxelEntity } from '../engine/VoxelEntity.js';
import MapData from './MapData.js';

const container = document.getElementById('canvas-container');
const canvas = document.createElement('canvas');
canvas.style.display = 'block';
canvas.style.width = '100%';
canvas.style.height = '100%';
container.appendChild(canvas);

const engine = new VoxelEngine(canvas);
const mapData = new MapData(32, 32);
const OBJECT_SCALE = 0.15; // Base scale for placed objects on map

// Entities
let terrainEntity = null;
const objectEntities = new Map(); // id -> VoxelEntity

// Editor state
let currentMode = 'terrain'; // 'terrain' | 'object'
let currentTool = 'build-terrain'; 
let currentColorIdx = 0;
let currentPresetUrl = null;
let selectedObjectId = null;

// UI Elements
const uiPalette = document.getElementById('main-palette');
const tabs = document.querySelectorAll('.mode-btn');
const tools = document.querySelectorAll('.tool-btn');
const terrainSettings = document.getElementById('terrain-settings');
const objectSettings = document.getElementById('object-settings');
const brushInput = document.getElementById('brush-size');
const brushVal = document.getElementById('brush-size-val');

// Brush state
let isPainting = false;
let lastPaintCoord = null;

brushInput.addEventListener('input', e => {
  brushVal.textContent = e.target.value;
});

// Helper blocks (Raycaster elements)
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Add ghost voxel for build preview
const ghostGeo = new THREE.BoxGeometry(1.05, 1.05, 1.05);
const ghostMat = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true, depthTest: false, wireframe: true });
const ghostMesh = new THREE.Mesh(ghostGeo, ghostMat);
ghostMesh.visible = false;
engine.scene.add(ghostMesh);

// Setup Map Grid & hide original Engine elements
let mapGrid = null;
function updateMapGrid() {
  for (const child of [...engine.scene.children]) {
    if (child instanceof THREE.GridHelper || (child instanceof THREE.Mesh && child.geometry instanceof THREE.PlaneGeometry)) {
      engine.scene.remove(child);
    }
  }
  const sizeX = mapData.size[0];
  const sizeZ = mapData.size[2];
  const max = Math.max(sizeX, sizeZ);
  mapGrid = new THREE.GridHelper(max, max, 0x444444, 0x222222);
  mapGrid.position.set(sizeX/2 - 0.5, -0.01, sizeZ/2 - 0.5);
  engine.scene.add(mapGrid);
}

init();

async function init() {
  engine.start();
  
  // Custom Map Camera Controls
  engine.controls.mouseButtons = {
    LEFT: null, // Used for terrain paint
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE // Right click to rotate
  };
  
  // Set camera to look at center of 32x32 terrain
  engine.camera.position.set(16, 25, 45);
  engine.controls.target.set(16, 0, 16);
  engine.controls.update();

  updateMapGrid();
  rebuildTerrainEntity();
  setupUI();
  setupMouseEvents();
  setupKeyboardWASD();
  await loadPresetsList();
}

function rebuildTerrainEntity() {
  if (terrainEntity) {
    engine.removeEntity(terrainEntity);
    terrainEntity.dispose();
  }
  
  const def = {
    name: 'Terrain',
    type: 'terrain',
    voxelSize: 1,
    palette: mapData.terrainPalette,
    parts: [
      {
        name: 'base',
        parent: null,
        position: [0,0,0],
        center: [0,0,0],
        voxels: mapData.getTerrainVoxelsList()
      }
    ],
    animations: {}
  };
  
  terrainEntity = new VoxelEntity(def);
  engine.addEntity(terrainEntity);
}

function updateTerrainMesh() {
  // fast update the voxels array and rebuild mesh
  terrainEntity.definition.parts[0].voxels = mapData.getTerrainVoxelsList();
  terrainEntity.rebuildPart('base');
}

function renderPalettes() {
  uiPalette.innerHTML = '';
  
  mapData.terrainPalette.forEach((color, idx) => {
    // Toolbar pallete
    const btn = document.createElement('div');
    btn.className = `color-swatch ${idx === currentColorIdx ? 'active' : ''}`;
    btn.style.backgroundColor = color;
    btn.onclick = () => {
      currentColorIdx = idx;
      renderPalettes();
    };
    uiPalette.appendChild(btn);
  });
}

function setupUI() {
  renderPalettes();
  
  // Mode selection
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const mode = e.target.dataset.mode;
      currentMode = mode;
      
      terrainSettings.style.display = mode === 'terrain' ? 'block' : 'none';
      objectSettings.style.display = mode === 'object' ? 'block' : 'none';

      // switch tools
      document.getElementById('terrain-tools').style.display = mode === 'terrain' ? 'flex' : 'none';
      document.getElementById('object-tools').style.display = mode === 'object' ? 'flex' : 'none';
      
      // select sensible default tool
      if (mode === 'terrain') setTool('build-terrain');
      else setTool('place-object');
      
      ghostMesh.visible = false;
    });
  });

  // Tool selection
  tools.forEach(tool => {
    tool.addEventListener('click', (e) => {
      let t = e.target;
      while(!t.classList.contains('tool-btn')) t = t.parentElement;
      setTool(t.dataset.tool);
    });
  });

  // Resize Map
  document.getElementById('btn-resize-map').onclick = () => {
    const w = parseInt(document.getElementById('map-size-x').value);
    const d = parseInt(document.getElementById('map-size-z').value);
    if (!isNaN(w) && !isNaN(d)) {
      if(confirm('Resizing map will clear current terrain. Proceed?')) {
        mapData.resize(w, d);
        updateMapGrid();
        rebuildTerrainEntity();
        clearAllObjects();
      }
    }
  };

  // Export
  document.getElementById('btn-export-map').onclick = () => {
    const jsonStr = JSON.stringify(mapData.toJSON(), null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mapData.name + '.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import
  const fileInput = document.getElementById('file-import');
  document.getElementById('btn-import-map').onclick = () => fileInput.click();
  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = JSON.parse(evt.target.result);
        mapData.fromJSON(data);
        document.getElementById('map-size-x').value = mapData.size[0];
        document.getElementById('map-size-z').value = mapData.size[2];
        rebuildTerrainEntity();
        clearAllObjects();
        // Spawning loaded objects
        for (const o of mapData.objects) {
          await spawnObject(o.preset, o.position, o.rotation, o.id);
        }
        renderPalettes();
      } catch (err) {
        alert("Failed to load map file.");
        console.error(err);
      }
    };
    reader.readAsText(file);
    fileInput.value = ''; // reset
  };

  // Add Color
  document.getElementById('btn-add-color').onclick = () => {
    const col = prompt("Enter a color (e.g., #ff0000 or red):", "#ffffff");
    if (col) {
      mapData.terrainPalette.push(col);
      currentColorIdx = mapData.terrainPalette.length - 1;
      renderPalettes();
      rebuildTerrainEntity(); // Rebuild with new palette
    }
  };
}

function setTool(toolName) {
  currentTool = toolName;
  tools.forEach(t => {
    if (t.dataset.tool === toolName) t.classList.add('active');
    else t.classList.remove('active');
  });
  ghostMesh.visible = false;
}

async function loadPresetsList() {
  try {
    const res = await fetch('/presets.json');
    const data = await res.json();
    const accordion = document.getElementById('presets-accordion');
    
    for (const group of data) {
      const genre = group.genre;
      const items = group.items;
      
      // Create section
      const header = document.createElement('div');
      header.className = 'accordion-header';
      header.textContent = genre.replace(/_/g, ' ');
      
      const content = document.createElement('div');
      content.className = 'accordion-content';
      
      header.onclick = () => {
        const isActive = content.classList.contains('active');
        document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('active'));
        if (!isActive) content.classList.add('active');
      };
      
      for (const item of items) {
        const btn = document.createElement('button');
        btn.className = 'preset-btn';
        btn.textContent = item.label;
        btn.onclick = () => {
          document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          
          // item.url is like "/presets/RPG_Characters/Mage.json"
          // spawnObject uses: fetch('/public/presets/' + currentPresetUrl)
          // so we strip "/presets/" from the beginning
          currentPresetUrl = item.url.replace('/presets/', '');
          document.getElementById('sel-preset-name').textContent = item.label;
        };
        content.appendChild(btn);
      }
      
      accordion.appendChild(header);
      accordion.appendChild(content);
    }
  } catch (err) {
    console.error("Failed to load presets map", err);
  }
}

// --------------------------------
// Mouse / Editor Interaction
// --------------------------------

function setupMouseEvents() {
  const container = engine.renderer.domElement;
  container.addEventListener('mousemove', onMouseMove);
  container.addEventListener('mousedown', onMouseDown);
  
  // Keyboard shorcuts
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    
    if (e.key === 'b') { document.querySelector('[data-mode="terrain"]').click(); setTool('build-terrain'); }
    if (e.key === 'e') { document.querySelector('[data-mode="terrain"]').click(); setTool('erase-terrain'); }
    if (e.key === 'p') { document.querySelector('[data-mode="object"]').click(); setTool('place-object'); }
    if (e.key === 's') { document.querySelector('[data-mode="object"]').click(); setTool('select-object'); }
    
    // Rotate object helper
    if (e.key === 'r' && currentMode === 'object' && currentTool === 'select-object' && selectedObjectId) {
      rotateSelectedObject();
    }
    // Delete object helper
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (currentMode === 'object' && selectedObjectId) {
        deleteSelectedObject();
      }
    }
  });
}

function setupKeyboardWASD() {
  const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
  window.addEventListener('keydown', e => { if (keys.hasOwnProperty(e.key) && e.target.tagName !== 'INPUT') keys[e.key] = true; });
  window.addEventListener('keyup', e => { if (keys.hasOwnProperty(e.key)) keys[e.key] = false; });
  
  const panSpeed = 0.4;
  const loop = () => {
    requestAnimationFrame(loop);
    let dx = 0, dz = 0;
    
    const up = keys.w || keys.ArrowUp;
    const down = keys.s || keys.ArrowDown;
    const left = keys.a || keys.ArrowLeft;
    const right = keys.d || keys.ArrowRight;
    
    if (up || down || left || right) {
       const fw = new THREE.Vector3().subVectors(engine.controls.target, engine.camera.position);
       fw.y = 0;
       fw.normalize();
       const rt = new THREE.Vector3().crossVectors(fw, new THREE.Vector3(0,1,0)).normalize();
       
       if (up) { dx += fw.x; dz += fw.z; }
       if (down) { dx -= fw.x; dz -= fw.z; }
       if (left) { dx -= rt.x; dz -= rt.z; }
       if (right) { dx += rt.x; dz += rt.z; }
       
       if (dx !== 0 || dz !== 0) {
         const move = new THREE.Vector3(dx, 0, dz).normalize().multiplyScalar(panSpeed);
         engine.camera.position.add(move);
         engine.controls.target.add(move);
         engine.controls.update();
       }
    }
  };
  loop();
}

function getIntersect(e, terrainOnly = true) {
  const rect = engine.renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(mouse, engine.camera);

  const targets = terrainOnly && terrainEntity ? [terrainEntity.root] : engine.scene.children;
  const intersects = raycaster.intersectObjects(targets, true);
  return intersects.find(i => i.object.userData.isVoxel);
}

function applyBrush(gx, gy, gz, normal, size) {
   const radius = Math.floor(size / 2);
   let painted = false;
   
   const dxArr = normal.x !== 0 ? [0] : Array.from({length: size}, (_, i) => i - radius);
   const dyArr = normal.y !== 0 ? [0] : Array.from({length: size}, (_, i) => i - radius);
   const dzArr = normal.z !== 0 ? [0] : Array.from({length: size}, (_, i) => i - radius);
   
   for (let dx of dxArr) {
     for (let dy of dyArr) {
       for (let dz of dzArr) {
          const px = gx + dx;
          const py = gy + dy;
          const pz = gz + dz;
          if (px >= 0 && px < mapData.size[0] && py >= 0 && py < mapData.size[1] && pz >= 0 && pz < mapData.size[2]) {
             if (currentTool === 'build-terrain') {
                mapData.setVoxel(px, py, pz, currentColorIdx);
                painted = true;
             } else if (currentTool === 'erase-terrain') {
                if(mapData.removeVoxel(px, py, pz)) painted = true;
             }
          }
       }
     }
   }
   if (painted) updateTerrainMesh();
}

function onMouseMove(e) {
  if (currentMode !== 'terrain') {
    ghostMesh.visible = false;
    return;
  }
  
  const hit = getIntersect(e, true);
  if (hit) {
    const normal = hit.face.normal.clone();
    normal.transformDirection(hit.object.matrixWorld).round();
    
    // hit.point is in world space.
    let gx = Math.floor(hit.point.x - normal.x * 0.5);
    let gy = Math.floor(hit.point.y - normal.y * 0.5);
    let gz = Math.floor(hit.point.z - normal.z * 0.5);
    
    if (currentTool === 'build-terrain') {
      gx += normal.x;
      gy += normal.y;
      gz += normal.z;
    }
    
    const size = parseInt(brushInput.value) || 1;
    const sx = normal.x !== 0 ? 1 : size;
    const sy = normal.y !== 0 ? 1 : size;
    const sz_axis = normal.z !== 0 ? 1 : size;
    ghostMesh.scale.set(sx, sy, sz_axis);
    
    // Validate bounds
    ghostMesh.position.set(gx + 0.5, gy + 0.5, gz + 0.5);
    ghostMesh.visible = true;
    if (currentTool === 'erase-terrain') ghostMat.color.setHex(0xff0000);
    else ghostMat.color.setHex(0x00ff00);

    // Continuous Drag Paint
    if (isPainting) {
      const coordStr = `${gx},${gy},${gz}`;
      if (coordStr !== lastPaintCoord) {
         applyBrush(gx, gy, gz, normal, size);
         lastPaintCoord = coordStr;
      }
    }
    
  } else {
    ghostMesh.visible = false;
  }
}

window.addEventListener('mouseup', () => {
  if (isPainting) {
    isPainting = false;
    lastPaintCoord = null;
  }
});

async function onMouseDown(e) {
  if (e.button !== 0) return; // Only left click
  
  if (currentMode === 'terrain') {
    if (ghostMesh.visible) {
      const hit = getIntersect(e, true);
      if (hit) {
        const normal = hit.face.normal.clone();
        normal.transformDirection(hit.object.matrixWorld).round();
        const gx = Math.floor(ghostMesh.position.x);
        const gy = Math.floor(ghostMesh.position.y);
        const gz = Math.floor(ghostMesh.position.z);
        
        isPainting = true;
        const size = parseInt(brushInput.value) || 1;
        applyBrush(gx, gy, gz, normal, size);
        lastPaintCoord = `${gx},${gy},${gz}`;
      }
    }
  } else if (currentMode === 'object') {
    const hit = getIntersect(e, false);
    if (currentTool === 'place-object' && hit) {
      if (!currentPresetUrl) return alert("Select a preset from the library first!");
      
      const normal = hit.face.normal.clone();
      normal.transformDirection(hit.object.matrixWorld).round();
      // place item on top of the surface
      let gx = Math.floor(hit.point.x - normal.x * 0.5) + normal.x;
      let gy = Math.floor(hit.point.y - normal.y * 0.5) + normal.y;
      let gz = Math.floor(hit.point.z - normal.z * 0.5) + normal.z;
      
      // if normal is y=1, just snap to floor
      
      const obj = await spawnObject(currentPresetUrl, [gx, gy, gz]);
      
    } else if (currentTool === 'select-object' && hit) {
      // Find which entity this hit belongs to
      let objNode = hit.object;
      let matchedId = null;
      while(objNode) {
        if (objNode.userData && objNode.userData.mapObjectId) {
          matchedId = objNode.userData.mapObjectId;
          break;
        }
        objNode = objNode.parent;
      }
      
      selectedObjectId = matchedId;
      highlightSelectedObject();
    }
  }
}

// --------------------------------
// Object Management Logics
// --------------------------------

async function spawnObject(presetUrl, gridPos, rotation = [0,0,0], existingId = null) {
  let mapObj;
  if (existingId) {
    mapObj = mapData.objects.find(o => o.id === existingId);
  } else {
    mapObj = mapData.addObject(presetUrl, gridPos, rotation);
  }
  
  // load the preset
  const res = await fetch(`/presets/${presetUrl}`);
  const def = await res.json();
  
  const ent = new VoxelEntity(def);
  engine.addEntity(ent);
  
  // Position it in grid coords. Since entities center is defined in their def,
  // we just place their root node at [gx, gy, gz].
  ent.root.position.set(mapObj.position[0], mapObj.position[1], mapObj.position[2]);
  ent.root.rotation.set(mapObj.rotation[0], mapObj.rotation[1], mapObj.rotation[2]);
  
  // Scale down so the map feels larger compared to the objects
  ent.root.scale.set(OBJECT_SCALE, OBJECT_SCALE, OBJECT_SCALE);
  
  ent.root.userData.mapObjectId = mapObj.id; // Tag for clicking
  
  objectEntities.set(mapObj.id, ent);
  
  // Play idle anim if exists
  if (def.animations && def.animations.idle) ent.playAnimation('idle');
  return mapObj;
}

function clearAllObjects() {
  for (const ent of objectEntities.values()) {
    engine.removeEntity(ent);
    ent.dispose();
  }
  objectEntities.clear();
  selectedObjectId = null;
}

function highlightSelectedObject() {
  for (const [id, ent] of objectEntities.entries()) {
    if (id === selectedObjectId) {
      // Very crude highlight: scale up slightly
      ent.root.scale.set(OBJECT_SCALE * 1.2, OBJECT_SCALE * 1.2, OBJECT_SCALE * 1.2);
    } else {
      ent.root.scale.set(OBJECT_SCALE, OBJECT_SCALE, OBJECT_SCALE);
    }
  }
}

function rotateSelectedObject() {
  const mapObj = mapData.objects.find(o => o.id === selectedObjectId);
  if (!mapObj) return;
  // Rotate by 90 deg on Y
  mapObj.rotation[1] += Math.PI / 2;
  const ent = objectEntities.get(selectedObjectId);
  if (ent) ent.root.rotation.set(mapObj.rotation[0], mapObj.rotation[1], mapObj.rotation[2]);
}

function deleteSelectedObject() {
  mapData.removeObject(selectedObjectId);
  const ent = objectEntities.get(selectedObjectId);
  if (ent) {
    engine.removeEntity(ent);
    ent.dispose();
    objectEntities.delete(selectedObjectId);
  }
  selectedObjectId = null;
}
