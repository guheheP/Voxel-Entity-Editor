/**
 * EditorState — Central state management for the voxel editor.
 *
 * Holds the mutable entity definition being edited, tracks selection,
 * active tool, and provides undo/redo via command pattern.
 * Uses an event emitter to notify UI panels of state changes.
 */

export class EditorState {
  constructor() {
    /** @type {object|null} The entity definition being edited */
    this.entityDef = null;

    /** @type {string|null} Currently selected part name */
    this.selectedPart = null;

    /** @type {number} Currently selected palette color index */
    this.selectedColor = 0;

    /** @type {string} Active tool: 'place' | 'erase' | 'paint' | 'select' */
    this.activeTool = 'place';

    /** @type {boolean} Mirror paint mode (X axis symmetry) */
    this.mirrorPaint = false;

    /** @type {boolean} Show pivot gizmos */
    this.showGizmos = true;

    /** @type {boolean} Show grid */
    this.showGrid = true;

    /** @type {string|null} Currently selected animation name */
    this.selectedAnim = null;

    /** @type {number|null} Currently selected keyframe index */
    this.selectedKeyframe = null;

    // Undo / Redo stacks
    this._undoStack = [];
    this._redoStack = [];
    this._maxUndo = 50;

    // Event listeners
    this._listeners = {};
  }

  // ========== Event System ==========

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    const list = this._listeners[event];
    if (list) {
      const idx = list.indexOf(callback);
      if (idx >= 0) list.splice(idx, 1);
    }
  }

  emit(event, data) {
    const list = this._listeners[event];
    if (list) {
      for (const cb of list) cb(data);
    }
  }

  // ========== Entity Management ==========

  /**
   * Load an entity definition for editing. Creates a deep clone.
   * @param {object} def
   */
  loadEntity(def) {
    this.entityDef = JSON.parse(JSON.stringify(def));
    this.selectedPart = this.entityDef.parts.length > 0
      ? this.entityDef.parts[0].name
      : null;
    this.selectedColor = 0;
    this.selectedAnim = null;
    this.selectedKeyframe = null;
    this._undoStack = [];
    this._redoStack = [];
    this.emit('entityLoaded', this.entityDef);
    this.emit('selectionChanged', { part: this.selectedPart });
  }

  /** Create a new blank entity */
  newEntity() {
    this.loadEntity({
      name: 'New Entity',
      type: 'humanoid',
      voxelSize: 1,
      palette: ['#4A90D9', '#FFD5B8', '#5C3317', '#3D3D3D'],
      parts: [
        {
          name: 'body',
          parent: null,
          position: [0, 0, 0],
          center: [0, 0, 0],
          voxels: [],
        },
      ],
      animations: {},
    });
  }

  // ========== Selection ==========

  selectPart(name) {
    this.selectedPart = name;
    this.emit('selectionChanged', { part: name });
  }

  selectColor(index) {
    this.selectedColor = index;
    this.emit('colorChanged', { index });
  }

  setTool(tool) {
    this.activeTool = tool;
    this.emit('toolChanged', { tool });
  }

  setMirrorPaint(enabled) {
    this.mirrorPaint = enabled;
    this.emit('mirrorChanged', { enabled });
  }

  setShowGizmos(show) {
    this.showGizmos = show;
    this.emit('gizmosChanged', { show });
  }

  setShowGrid(show) {
    this.showGrid = show;
    this.emit('gridChanged', { show });
  }

  // ========== Part Getters ==========

  getSelectedPartDef() {
    if (!this.entityDef || !this.selectedPart) return null;
    return this.entityDef.parts.find(p => p.name === this.selectedPart) || null;
  }

  getPartDef(name) {
    if (!this.entityDef) return null;
    return this.entityDef.parts.find(p => p.name === name) || null;
  }

  // ========== Undo / Redo ==========

  /**
   * Execute an action with undo support.
   * @param {string} description
   * @param {Function} doFn - Function to apply the change
   * @param {Function} undoFn - Function to reverse the change
   */
  execute(description, doFn, undoFn) {
    doFn();
    this._undoStack.push({ description, doFn, undoFn });
    if (this._undoStack.length > this._maxUndo) {
      this._undoStack.shift();
    }
    this._redoStack = [];
    this.emit('entityChanged', { action: description });
  }

  undo() {
    const action = this._undoStack.pop();
    if (!action) return;
    action.undoFn();
    this._redoStack.push(action);
    this.emit('entityChanged', { action: 'undo: ' + action.description });
  }

  redo() {
    const action = this._redoStack.pop();
    if (!action) return;
    action.doFn();
    this._undoStack.push(action);
    this.emit('entityChanged', { action: 'redo: ' + action.description });
  }

  get canUndo() { return this._undoStack.length > 0; }
  get canRedo() { return this._redoStack.length > 0; }

  // ========== Voxel Operations ==========

  addVoxel(partName, x, y, z, colorIndex) {
    const part = this.getPartDef(partName);
    if (!part) return;
    const key = `${x},${y},${z}`;
    const existing = part.voxels.findIndex(v => v[0] === x && v[1] === y && v[2] === z);
    if (existing >= 0) return; // already exists

    this.execute(
      `Add voxel (${x},${y},${z})`,
      () => { part.voxels.push([x, y, z, colorIndex]); },
      () => { part.voxels.pop(); }
    );
  }

  removeVoxel(partName, x, y, z) {
    const part = this.getPartDef(partName);
    if (!part) return;
    const idx = part.voxels.findIndex(v => v[0] === x && v[1] === y && v[2] === z);
    if (idx < 0) return;

    const removed = part.voxels[idx];
    this.execute(
      `Remove voxel (${x},${y},${z})`,
      () => { part.voxels.splice(idx, 1); },
      () => { part.voxels.splice(idx, 0, removed); }
    );
  }

  recolorVoxel(partName, x, y, z, newColor) {
    const part = this.getPartDef(partName);
    if (!part) return;
    const voxel = part.voxels.find(v => v[0] === x && v[1] === y && v[2] === z);
    if (!voxel) return;

    const oldColor = voxel[3];
    if (oldColor === newColor) return;

    this.execute(
      `Recolor voxel (${x},${y},${z})`,
      () => { voxel[3] = newColor; },
      () => { voxel[3] = oldColor; }
    );
  }

  // ========== Part Operations ==========

  updatePartProperty(partName, prop, value) {
    const part = this.getPartDef(partName);
    if (!part) return;
    const oldValue = JSON.parse(JSON.stringify(part[prop]));
    const newValue = JSON.parse(JSON.stringify(value));

    this.execute(
      `Update ${partName}.${prop}`,
      () => { part[prop] = JSON.parse(JSON.stringify(newValue)); },
      () => { part[prop] = JSON.parse(JSON.stringify(oldValue)); }
    );
  }

  addPart(name, parentName = null) {
    if (!this.entityDef) return;
    const newPart = {
      name,
      parent: parentName,
      position: [0, 0, 0],
      center: [0, 0, 0],
      voxels: [],
    };

    this.execute(
      `Add part '${name}'`,
      () => { this.entityDef.parts.push(newPart); },
      () => { this.entityDef.parts.pop(); }
    );
    this.selectPart(name);
  }

  removePart(name) {
    if (!this.entityDef) return;
    const idx = this.entityDef.parts.findIndex(p => p.name === name);
    if (idx < 0) return;
    const removed = this.entityDef.parts[idx];

    this.execute(
      `Remove part '${name}'`,
      () => { this.entityDef.parts.splice(idx, 1); },
      () => { this.entityDef.parts.splice(idx, 0, removed); }
    );

    if (this.selectedPart === name) {
      this.selectPart(this.entityDef.parts.length > 0 ? this.entityDef.parts[0].name : null);
    }
  }
}
