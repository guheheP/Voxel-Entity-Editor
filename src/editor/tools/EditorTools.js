import * as THREE from 'three';
import { VoxelRaycaster } from './VoxelRaycaster.js';

/**
 * EditorTools — Manages all voxel editing tools and the highlight cursor.
 *
 * Handles mouse interaction on the 3D viewport and dispatches to
 * the active tool (place, erase, paint, select).
 */
export class EditorTools {
  constructor(camera, canvas, scene, state, getEntity) {
    this.camera = camera;
    this.canvas = canvas;
    this.scene = scene;
    this.state = state;
    this.getEntity = getEntity; // function that returns current VoxelEntity
    this.raycaster = new VoxelRaycaster(camera, canvas);

    // Highlight cursor mesh
    this.cursorMat = new THREE.MeshBasicMaterial({
      color: 0x58a6ff,
      transparent: true,
      opacity: 0.35,
      depthTest: true,
    });
    this.cursorEraseMat = new THREE.MeshBasicMaterial({
      color: 0xf85149,
      transparent: true,
      opacity: 0.35,
      depthTest: true,
    });
    this.cursorFillMat = new THREE.MeshBasicMaterial({
      color: 0x3fb950,
      transparent: true,
      opacity: 0.4,
      depthTest: true,
    });
    this.cursorGeom = new THREE.BoxGeometry(1, 1, 1);
    this.cursor = new THREE.Mesh(this.cursorGeom, this.cursorMat);
    this.cursor.visible = false;
    this.cursor.renderOrder = 998;
    scene.add(this.cursor);

    // Mirror cursor
    this.mirrorCursor = new THREE.Mesh(this.cursorGeom, this.cursorMat.clone());
    this.mirrorCursor.material.opacity = 0.2;
    this.mirrorCursor.visible = false;
    this.mirrorCursor.renderOrder = 998;
    scene.add(this.mirrorCursor);

    this._painting = false;
    this._lastHit = null;

    this._bindEvents();
  }

  _bindEvents() {
    this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
    this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
    this.canvas.addEventListener('mouseup', () => this._onMouseUp());
    this.canvas.addEventListener('mouseleave', () => {
      this.cursor.visible = false;
      this.mirrorCursor.visible = false;
    });
  }

  _onMouseMove(e) {
    // Don't show cursor if right-click dragging (orbit controls)
    if (e.buttons === 2) {
      this.cursor.visible = false;
      this.mirrorCursor.visible = false;
      return;
    }

    const entity = this.getEntity();
    const hit = this.raycaster.cast(e, entity);
    this._lastHit = hit;

    if (!hit) {
      this.cursor.visible = false;
      this.mirrorCursor.visible = false;
      return;
    }

    const tool = this.state.activeTool;
    const s = this.state.entityDef?.voxelSize || 1;

    if (tool === 'place') {
      // Show cursor at adjacent position (place new block)
      this._positionCursorAtVoxel(this.cursor, hit.partName, hit.adjacentCoord, s, entity);
      this.cursor.material = this.cursorMat;
      this.cursor.visible = true;

      // Mirror cursor
      if (this.state.mirrorPaint) {
        const mirrorCoord = this._getMirrorCoord(hit.partName, hit.adjacentCoord);
        if (mirrorCoord) {
          this._positionCursorAtVoxel(this.mirrorCursor, hit.partName, mirrorCoord, s, entity);
          this.mirrorCursor.visible = true;
        } else {
          this.mirrorCursor.visible = false;
        }
      } else {
        this.mirrorCursor.visible = false;
      }

      // If placing with button held
      if (this._painting) this._doPlace(hit);
    } else if (tool === 'erase') {
      // Show cursor on existing voxel
      this._positionCursorAtVoxel(this.cursor, hit.partName, hit.voxelCoord, s, entity);
      this.cursor.material = this.cursorEraseMat;
      this.cursor.visible = true;
      this.mirrorCursor.visible = false;
      if (this._painting) this._doErase(hit);
    } else if (tool === 'paint') {
      // Show cursor on existing voxel (recolor)
      this._positionCursorAtVoxel(this.cursor, hit.partName, hit.voxelCoord, s, entity);
      this.cursor.material = this.cursorMat;
      this.cursor.visible = true;
      if (this.state.mirrorPaint) {
        const mirrorCoord = this._getMirrorCoord(hit.partName, hit.voxelCoord);
        if (mirrorCoord) {
          this._positionCursorAtVoxel(this.mirrorCursor, hit.partName, mirrorCoord, s, entity);
          this.mirrorCursor.visible = true;
        } else {
          this.mirrorCursor.visible = false;
        }
      } else {
        this.mirrorCursor.visible = false;
      }
      if (this._painting) this._doPaint(hit);
    } else if (tool === 'fill') {
      // Show cursor on existing voxel (fill target)
      this._positionCursorAtVoxel(this.cursor, hit.partName, hit.voxelCoord, s, entity);
      this.cursor.material = this.cursorFillMat;
      this.cursor.visible = true;
      this.mirrorCursor.visible = false;
    } else {
      // select
      this.cursor.visible = false;
      this.mirrorCursor.visible = false;
    }
  }

  _onMouseDown(e) {
    if (e.button !== 0) return; // left click only
    const entity = this.getEntity();
    const hit = this.raycaster.cast(e, entity);
    if (!hit) return;

    const tool = this.state.activeTool;
    this._painting = true;

    if (tool === 'place') {
      this._doPlace(hit);
    } else if (tool === 'erase') {
      this._doErase(hit);
    } else if (tool === 'paint') {
      this._doPaint(hit);
    } else if (tool === 'fill') {
      this._doFill(hit);
    } else if (tool === 'select') {
      this.state.selectPart(hit.partName);
    }
  }

  _onMouseUp() {
    this._painting = false;
  }

  _doPlace(hit) {
    const partName = this.state.selectedPart || hit.partName;
    const [x, y, z] = hit.adjacentCoord;
    const color = this.state.selectedColor;

    this.state.addVoxel(partName, x, y, z, color);

    // Mirror
    if (this.state.mirrorPaint) {
      const mirror = this._getMirrorCoord(partName, hit.adjacentCoord);
      if (mirror) {
        this.state.addVoxel(partName, mirror[0], mirror[1], mirror[2], color);
      }
    }
  }

  _doErase(hit) {
    this.state.removeVoxel(hit.partName, ...hit.voxelCoord);

    if (this.state.mirrorPaint) {
      const mirror = this._getMirrorCoord(hit.partName, hit.voxelCoord);
      if (mirror) {
        this.state.removeVoxel(hit.partName, mirror[0], mirror[1], mirror[2]);
      }
    }
  }

  _doPaint(hit) {
    this.state.recolorVoxel(hit.partName, ...hit.voxelCoord, this.state.selectedColor);

    if (this.state.mirrorPaint) {
      const mirror = this._getMirrorCoord(hit.partName, hit.voxelCoord);
      if (mirror) {
        this.state.recolorVoxel(hit.partName, mirror[0], mirror[1], mirror[2], this.state.selectedColor);
      }
    }
  }

  /**
   * Flood-fill connected voxels of the same color with the selected color.
   * Uses BFS to find all connected voxels (6-connected: face-adjacent).
   */
  _doFill(hit) {
    const partDef = this.state.getPartDef(hit.partName);
    if (!partDef) return;

    const targetColor = hit.colorIndex;
    const newColor = this.state.selectedColor;
    if (targetColor === newColor) return; // No change needed

    // Build a spatial index for fast neighbor lookup
    const voxelMap = new Map();
    for (let i = 0; i < partDef.voxels.length; i++) {
      const [vx, vy, vz, ci] = partDef.voxels[i];
      voxelMap.set(`${vx},${vy},${vz}`, { idx: i, ci });
    }

    // BFS from the hit voxel
    const startKey = `${hit.voxelCoord[0]},${hit.voxelCoord[1]},${hit.voxelCoord[2]}`;
    const visited = new Set();
    const toRecolor = [];
    const queue = [startKey];
    visited.add(startKey);

    const directions = [
      [1, 0, 0], [-1, 0, 0],
      [0, 1, 0], [0, -1, 0],
      [0, 0, 1], [0, 0, -1],
    ];

    while (queue.length > 0) {
      const key = queue.shift();
      const entry = voxelMap.get(key);
      if (!entry || entry.ci !== targetColor) continue;

      toRecolor.push(key);

      const [cx, cy, cz] = key.split(',').map(Number);
      for (const [dx, dy, dz] of directions) {
        const nk = `${cx + dx},${cy + dy},${cz + dz}`;
        if (!visited.has(nk)) {
          visited.add(nk);
          const neighbor = voxelMap.get(nk);
          if (neighbor && neighbor.ci === targetColor) {
            queue.push(nk);
          }
        }
      }
    }

    if (toRecolor.length === 0) return;

    // Batch recolor using a single undo action
    const oldColors = toRecolor.map(key => {
      const entry = voxelMap.get(key);
      return { key, idx: entry.idx, oldColor: entry.ci };
    });

    this.state.execute(
      `Fill ${toRecolor.length} voxels`,
      () => {
        for (const { key } of oldColors) {
          const entry = voxelMap.get(key);
          if (entry) partDef.voxels[entry.idx][3] = newColor;
        }
      },
      () => {
        for (const { key, oldColor } of oldColors) {
          const entry = voxelMap.get(key);
          if (entry) partDef.voxels[entry.idx][3] = oldColor;
        }
      }
    );
  }

  /**
   * Compute world position for a voxel coordinate within a part.
   */
  _positionCursorAtVoxel(cursorMesh, partName, coord, s, entity) {
    const partGroup = entity.partGroups[partName];
    if (!partGroup) return;

    const partDef = this.state.getPartDef(partName);
    if (!partDef) return;

    const cx = partDef.center[0];
    const cy = partDef.center[1];
    const cz = partDef.center[2];

    // Local position within the part group
    const localPos = new THREE.Vector3(
      (coord[0] - cx + 0.5) * s,
      (coord[1] - cy + 0.5) * s,
      (coord[2] - cz + 0.5) * s
    );

    // Convert to world position
    const worldPos = partGroup.localToWorld(localPos);
    cursorMesh.position.copy(worldPos);
    cursorMesh.scale.setScalar(s);
  }

  /**
   * Mirror a voxel coordinate across the X axis of a part.
   * Uses the part's center as the mirror axis.
   */
  _getMirrorCoord(partName, coord) {
    const partDef = this.state.getPartDef(partName);
    if (!partDef) return null;

    const cx = partDef.center[0];
    // Mirror X around the center
    const mirrorX = Math.round(2 * cx - coord[0] - 1);

    // Don't return same position
    if (mirrorX === coord[0]) return null;

    return [mirrorX, coord[1], coord[2]];
  }

  dispose() {
    this.scene.remove(this.cursor);
    this.scene.remove(this.mirrorCursor);
    this.cursorGeom.dispose();
    this.cursorMat.dispose();
    this.cursorEraseMat.dispose();
    this.cursorFillMat.dispose();
  }
}
