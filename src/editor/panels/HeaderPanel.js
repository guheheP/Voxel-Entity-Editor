/**
 * HeaderPanel — Builds and manages the top header bar of the editor.
 * Handles: New entity, preset loading, import/export, undo/redo, navigation.
 */

export class HeaderPanel {
  constructor(state, viewport) {
    this.state = state;
    this.viewport = viewport;
  }

  build() {
    const header = document.getElementById('editor-header');
    header.innerHTML = `
      <div class="header-title">🧊 Voxel Entity Editor</div>
      <div class="header-divider"></div>
      <button class="header-btn" id="btn-new">✨ New</button>
      <select class="input-select" id="preset-select" style="width:160px;font-size:12px;">
        <option value="">📦 Load Preset...</option>
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

    document.getElementById('btn-new').addEventListener('click', () => this.state.newEntity());

    document.getElementById('preset-select').addEventListener('change', async (e) => {
      const url = e.target.value;
      if (url) {
        try {
          const res = await fetch(url);
          const def = await res.json();
          this.state.loadEntity(def);
        } catch (err) {
          console.error('Failed to load preset:', err);
        }
      }
      e.target.value = '';
    });

    document.getElementById('btn-undo').addEventListener('click', () => {
      this.state.undo();
      this.viewport.rebuildEntity();
    });

    document.getElementById('btn-redo').addEventListener('click', () => {
      this.state.redo();
      this.viewport.rebuildEntity();
    });

    document.getElementById('btn-export').addEventListener('click', () => {
      if (!this.state.entityDef) return;
      const json = JSON.stringify(this.state.entityDef, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${this.state.entityDef.name || 'entity'}.json`;
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
            this.state.loadEntity(def);
          } catch (err) {
            console.error('Import failed:', err);
          }
        };
        reader.readAsText(file);
      });
      input.click();
    });

    // Load presets into dropdown
    this._loadPresets();
  }

  async _loadPresets() {
    try {
      const res = await fetch('/presets.json');
      const groups = await res.json();
      const select = document.getElementById('preset-select');
      groups.forEach(group => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = group.genre;
        group.items.forEach(item => {
          const option = document.createElement('option');
          option.value = item.url;
          option.textContent = item.label;
          optgroup.appendChild(option);
        });
        select.appendChild(optgroup);
      });
    } catch (err) {
      console.error('Failed to load presets for dropdown', err);
    }
  }
}
