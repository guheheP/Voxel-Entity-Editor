/**
 * PropertiesPanel — Right sidebar: entity metadata,
 * parts hierarchy tree, selected part properties
 * (position, center, parent, rename, duplicate, delete).
 */

export class PropertiesPanel {
  constructor(state, viewport, toolsPanel) {
    this.state = state;
    this.viewport = viewport;
    this.toolsPanel = toolsPanel;

    // Re-render on state changes
    this.state.on('entityLoaded', () => { this.render(); this.toolsPanel.updatePalette(); });
    this.state.on('selectionChanged', () => this.render());
    this.state.on('entityChanged', () => { this.render(); this.toolsPanel.updatePalette(); });
  }

  build() {
    this.render();
  }

  render() {
    const panel = document.getElementById('panel-properties');
    if (!this.state.entityDef) {
      panel.innerHTML = '<p class="placeholder-msg">No entity loaded.<br>Click "New" or load a preset.</p>';
      return;
    }

    const def = this.state.entityDef;
    const selPart = this.state.getSelectedPartDef();

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
    if (tree) this._buildPartsTree(tree, def.parts);

    // Entity name
    document.getElementById('entity-name')?.addEventListener('change', (e) => {
      def.name = e.target.value;
      this.state.emit('entityChanged', {});
    });

    // Entity type
    document.getElementById('entity-type')?.addEventListener('change', (e) => {
      def.type = e.target.value;
    });

    // Part add
    document.getElementById('btn-add-part')?.addEventListener('click', () => {
      const name = prompt('Part name:');
      if (name) {
        this.state.addPart(name, this.state.selectedPart);
        this.viewport.rebuildEntity();
        this.render();
      }
    });

    // Part delete
    document.getElementById('btn-del-part')?.addEventListener('click', () => {
      if (selPart && confirm(`Delete part "${selPart.name}"?`)) {
        this.state.removePart(selPart.name);
        this.viewport.rebuildEntity();
        this.render();
      }
    });

    // Part rename
    document.getElementById('btn-rename-part')?.addEventListener('click', () => {
      if (!selPart) return;
      const newName = prompt('New name:', selPart.name);
      if (newName && newName !== selPart.name) {
        const oldName = selPart.name;
        def.parts.forEach(p => {
          if (p.parent === oldName) p.parent = newName;
        });
        Object.values(def.animations || {}).forEach(anim => {
          anim.keyframes?.forEach(kf => {
            if (kf.parts && kf.parts[oldName]) {
              kf.parts[newName] = kf.parts[oldName];
              delete kf.parts[oldName];
            }
          });
        });
        selPart.name = newName;
        this.state.selectedPart = newName;
        this.state.emit('entityChanged', {});
        this.viewport.rebuildEntity();
        this.render();
      }
    });

    // Part duplicate
    document.getElementById('btn-dup-part')?.addEventListener('click', () => {
      if (!selPart) return;
      const newName = selPart.name + '_copy';
      const clone = JSON.parse(JSON.stringify(selPart));
      clone.name = newName;
      clone.position = [...selPart.position];
      clone.position[0] += 2;
      def.parts.push(clone);
      this.state.selectPart(newName);
      this.state.emit('entityChanged', {});
      this.viewport.rebuildEntity();
      this.render();
    });

    // Part parent
    document.getElementById('part-parent')?.addEventListener('change', (e) => {
      if (selPart) {
        this.state.updatePartProperty(selPart.name, 'parent', e.target.value || null);
        this.viewport.rebuildEntity();
      }
    });

    // Position & Center inputs
    this._bindVec3Input('pos', selPart, 'position');
    this._bindVec3Input('ctr', selPart, 'center');
  }

  _buildPartsTree(container, parts) {
    container.innerHTML = '';
    const roots = parts.filter(p => !p.parent);
    const childMap = {};
    parts.forEach(p => {
      if (p.parent) {
        if (!childMap[p.parent]) childMap[p.parent] = [];
        childMap[p.parent].push(p);
      }
    });

    const renderNode = (part, depth) => {
      const item = document.createElement('div');
      item.className = 'part-tree-item' + (this.state.selectedPart === part.name ? ' active' : '');
      item.innerHTML = `${'<span class="indent"></span>'.repeat(depth)}📦 ${part.name}`;
      item.addEventListener('click', () => {
        this.state.selectPart(part.name);
        this.render();
        this.viewport.rebuildGizmos();
      });
      container.appendChild(item);
      (childMap[part.name] || []).forEach(c => renderNode(c, depth + 1));
    };
    roots.forEach(r => renderNode(r, 0));
  }

  _bindVec3Input(prefix, part, prop) {
    if (!part) return;
    ['x', 'y', 'z'].forEach((axis, i) => {
      const el = document.getElementById(`${prefix}-${axis}`);
      if (el) {
        el.addEventListener('change', () => {
          const newVal = [...part[prop]];
          newVal[i] = parseFloat(el.value) || 0;
          this.state.updatePartProperty(part.name, prop, newVal);
          this.viewport.rebuildEntity();
        });
      }
    });
  }
}
