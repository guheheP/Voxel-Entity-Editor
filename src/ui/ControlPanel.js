/**
 * ControlPanel - UI controls for the voxel demo
 */
export class ControlPanel {
  constructor(overlay) {
    this.overlay = overlay;
    this.onAnimationSelect = null;
    this.onEntitySelect = null;
    this.onCameraReset = null;
    this.onJsonImport = null;
    this._currentAnimBtn = null;
    this._currentEntityBtn = null;

    this._buildInfoBadge();
    this._buildEntityPanel();
    this._buildAnimPanel();
  }

  _buildInfoBadge() {
    const badge = document.createElement('div');
    badge.className = 'info-badge';
    badge.innerHTML = `
      <h1>🧊 Voxel Art Demo</h1>
      <p>MODULAR ENTITY SYSTEM — CLICK TO EXPLORE</p>
    `;
    badge.style.pointerEvents = 'auto';
    this.overlay.appendChild(badge);
  }

  _buildEntityPanel() {
    this.entityPanel = document.createElement('div');
    this.entityPanel.className = 'side-panel';
    this.entityPanel.innerHTML = '<h3>Entities</h3>';

    // File Import Button
    const importBtn = document.createElement('button');
    importBtn.className = 'btn';
    importBtn.style.width = '100%';
    importBtn.style.marginBottom = '12px';
    importBtn.style.background = 'var(--accent, #4a7abf)';
    importBtn.style.color = '#fff';
    importBtn.innerHTML = '📂 Import JSON';
    importBtn.addEventListener('click', () => {
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
            if (this.onJsonImport) this.onJsonImport(def);
          } catch (err) {
            console.error('JSON parse error:', err);
            alert('Failed to parse JSON file.');
          }
        };
        reader.readAsText(file);
      });
      input.click();
    });
    this.entityPanel.appendChild(importBtn);

    this.entityList = document.createElement('div');
    this.entityList.className = 'entity-list';
    this.entityPanel.appendChild(this.entityList);
    this.overlay.appendChild(this.entityPanel);
  }

  _buildAnimPanel() {
    this.animPanel = document.createElement('div');
    this.animPanel.className = 'control-panel';
    this.animPanel.id = 'anim-controls';
    this.overlay.appendChild(this.animPanel);
  }

  /**
   * Set the categorized list of available entities.
   * @param {Array<{genre: string, items: Array}>} groups
   */
  setEntities(groups) {
    this.entityList.innerHTML = '';
    this._currentEntityBtn = null;

    groups.forEach((group, groupIdx) => {
      const groupDiv = document.createElement('div');
      groupDiv.style.marginBottom = '6px';

      const header = document.createElement('div');
      header.style.padding = '6px 4px';
      header.style.color = 'var(--text-primary)';
      header.style.fontSize = '12px';
      header.style.fontWeight = '700';
      header.style.textTransform = 'uppercase';
      header.style.letterSpacing = '1px';
      header.style.cursor = 'pointer';
      header.style.display = 'flex';
      header.style.alignItems = 'center';
      header.style.userSelect = 'none';
      header.style.background = 'rgba(255, 255, 255, 0.04)';
      header.style.borderRadius = '6px';

      header.addEventListener('mouseenter', () => header.style.background = 'rgba(255, 255, 255, 0.08)');
      header.addEventListener('mouseleave', () => header.style.background = 'rgba(255, 255, 255, 0.04)');

      const isFirst = groupIdx === 0;
      
      const caret = document.createElement('span');
      caret.textContent = isFirst ? '▼' : '▶';
      caret.style.fontSize = '10px';
      caret.style.marginRight = '8px';
      caret.style.color = 'var(--accent)';
      
      const titleSpan = document.createElement('span');
      titleSpan.textContent = group.genre;

      header.appendChild(caret);
      header.appendChild(titleSpan);

      const contentWrapper = document.createElement('div');
      contentWrapper.style.display = isFirst ? 'flex' : 'none';
      contentWrapper.style.flexDirection = 'column';
      contentWrapper.style.gap = '4px';
      contentWrapper.style.marginTop = '4px';
      contentWrapper.style.paddingLeft = '6px';

      header.addEventListener('click', () => {
        const isExpanded = contentWrapper.style.display !== 'none';
        if (isExpanded) {
          contentWrapper.style.display = 'none';
          caret.textContent = '▶';
        } else {
          contentWrapper.style.display = 'flex';
          caret.textContent = '▼';
        }
      });

      groupDiv.appendChild(header);

      group.items.forEach((item, itemIdx) => {
        const btn = document.createElement('button');
        btn.className = 'entity-btn';
        btn.textContent = item.label;
        btn.addEventListener('click', () => {
          if (this._currentEntityBtn) this._currentEntityBtn.classList.remove('active');
          btn.classList.add('active');
          this._currentEntityBtn = btn;
          if (this.onEntityFetch) this.onEntityFetch(item.url);
        });

        if (groupIdx === 0 && itemIdx === 0) {
          btn.classList.add('active');
          this._currentEntityBtn = btn;
        }

        contentWrapper.appendChild(btn);
      });

      groupDiv.appendChild(contentWrapper);
      this.entityList.appendChild(groupDiv);
    });
  }

  /**
   * Set the available animations for the currently selected entity.
   * @param {string[]} animNames
   */
  setAnimations(animNames) {
    this.animPanel.innerHTML = '';
    this._currentAnimBtn = null;

    if (animNames.length === 0) {
      const label = document.createElement('span');
      label.style.color = 'var(--text-muted)';
      label.style.fontSize = '13px';
      label.textContent = 'No animations available';
      this.animPanel.appendChild(label);
      return;
    }

    // Animation label
    const label = document.createElement('span');
    label.style.color = 'var(--text-muted)';
    label.style.fontSize = '11px';
    label.style.fontWeight = '600';
    label.style.letterSpacing = '1px';
    label.style.textTransform = 'uppercase';
    label.textContent = 'Anim';
    this.animPanel.appendChild(label);

    const divider = document.createElement('div');
    divider.className = 'divider';
    this.animPanel.appendChild(divider);

    animNames.forEach((name, i) => {
      const btn = document.createElement('button');
      btn.className = 'btn';
      btn.id = `anim-btn-${name}`;
      btn.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      btn.addEventListener('click', () => {
        if (this._currentAnimBtn) this._currentAnimBtn.classList.remove('active');
        btn.classList.add('active');
        this._currentAnimBtn = btn;
        if (this.onAnimationSelect) this.onAnimationSelect(name);
      });
      if (i === 0) {
        btn.classList.add('active');
        this._currentAnimBtn = btn;
      }
      this.animPanel.appendChild(btn);
    });

    // Camera reset button
    const divider2 = document.createElement('div');
    divider2.className = 'divider';
    this.animPanel.appendChild(divider2);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'btn';
    resetBtn.id = 'camera-reset-btn';
    resetBtn.textContent = '📷 Reset';
    resetBtn.addEventListener('click', () => {
      if (this.onCameraReset) this.onCameraReset();
    });
    this.animPanel.appendChild(resetBtn);
  }
}
