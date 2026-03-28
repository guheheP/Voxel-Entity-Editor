/**
 * ToolsPanel — Manages the left sidebar: tool selection,
 * color palette, editing options (mirror, gizmos, grid),
 * and viewport theme controls.
 */

export class ToolsPanel {
  constructor(state, viewport) {
    this.state = state;
    this.viewport = viewport;
  }

  build() {
    const panel = document.getElementById('panel-tools');
    const vp = this.viewport;

    panel.innerHTML = `
      <div class="panel-section">
        <div class="panel-section-title">Tools</div>
        <div class="tool-grid">
          <button class="tool-btn active" data-tool="place">🧱 Place</button>
          <button class="tool-btn" data-tool="erase">🧹 Erase</button>
          <button class="tool-btn" data-tool="paint">🖌 Paint</button>
          <button class="tool-btn" data-tool="fill">🪣 Fill</button>
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
            ${Object.entries(vp.themes).map(([k, v]) =>
              `<option value="${k}" ${vp.currentThemeName === k ? 'selected' : ''}>${v.label}</option>`
            ).join('')}
          </select>
        </div>
        <div>
          <label style="font-size:11px;color:var(--text-muted);display:flex;justify-content:space-between;margin-bottom:4px;">
            <span>Brightness</span>
            <span id="brightness-val" style="font-family:var(--font-mono);">${Math.round(vp.brightnessMultiplier * 100)}%</span>
          </label>
          <input type="range" id="brightness-slider" min="20" max="200" value="${Math.round(vp.brightnessMultiplier * 100)}" style="width:100%;accent-color:var(--accent);" />
        </div>
      </div>

      <div class="panel-section">
        <div class="panel-section-title">Camera</div>
        <div class="tool-grid" style="grid-template-columns: 1fr 1fr 1fr;">
          <button class="sm-btn cam-btn" data-cam="front" title="Front view (Numpad 1)">▶ Front</button>
          <button class="sm-btn cam-btn" data-cam="right" title="Right view (Numpad 3)">▶ Right</button>
          <button class="sm-btn cam-btn" data-cam="top" title="Top view (Numpad 7)">▼ Top</button>
          <button class="sm-btn cam-btn" data-cam="back" title="Back view">◀ Back</button>
          <button class="sm-btn cam-btn" data-cam="left" title="Left view">◀ Left</button>
          <button class="sm-btn cam-btn" data-cam="perspective" title="Perspective view (Numpad 0)">◆ 3D</button>
        </div>
        <button class="sm-btn" id="btn-reset-camera" style="width:100%;margin-top:6px;">🏠 Reset Camera</button>
      </div>
    `;

    // Tool selection
    panel.querySelectorAll('.tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        panel.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.setTool(btn.dataset.tool);
      });
    });

    // Toggles
    this._setupToggle('toggle-mirror', false, (v) => this.state.setMirrorPaint(v));
    this._setupToggle('toggle-gizmos', true, (v) => this.state.setShowGizmos(v));
    this._setupToggle('toggle-grid', true, (v) => {
      this.state.setShowGrid(v);
      vp.setGridVisible(v);
    });

    // Viewport theme
    document.getElementById('viewport-theme')?.addEventListener('change', (e) => {
      vp.applyTheme(e.target.value);
    });

    // Brightness slider
    document.getElementById('brightness-slider')?.addEventListener('input', (e) => {
      vp.setBrightness(parseInt(e.target.value) / 100);
      const valEl = document.getElementById('brightness-val');
      if (valEl) valEl.textContent = `${e.target.value}%`;
    });

    // Camera presets
    panel.querySelectorAll('.cam-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        vp.setCameraPreset(btn.dataset.cam);
      });
    });

    document.getElementById('btn-reset-camera')?.addEventListener('click', () => {
      vp.resetCamera();
    });

    // Palette add
    document.getElementById('btn-add-color').addEventListener('click', () => {
      if (!this.state.entityDef) return;
      this.state.entityDef.palette.push('#808080');
      this.updatePalette();
      this.viewport.rebuildEntity();
    });

    // Listen for state changes to update tool buttons
    this.state.on('toolChanged', ({ tool }) => {
      panel.querySelectorAll('.tool-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tool === tool);
      });
    });
  }

  updatePalette() {
    const grid = document.getElementById('palette-grid');
    if (!grid || !this.state.entityDef) return;
    grid.innerHTML = '';
    this.state.entityDef.palette.forEach((hex, i) => {
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch' + (i === this.state.selectedColor ? ' active' : '');
      swatch.style.background = hex;
      swatch.title = `Color ${i}: ${hex}`;
      swatch.addEventListener('click', () => {
        this.state.selectColor(i);
        this.updatePalette();
      });
      // Double-click to change color
      swatch.addEventListener('dblclick', () => {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = hex;
        input.addEventListener('input', (e) => {
          this.state.entityDef.palette[i] = e.target.value;
          this.updatePalette();
          this.viewport.rebuildEntity();
        });
        input.click();
      });
      grid.appendChild(swatch);
    });
  }

  _setupToggle(id, initial, onChange) {
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
}
