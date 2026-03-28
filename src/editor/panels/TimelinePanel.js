/**
 * TimelinePanel — Bottom panel: animation selection, keyframe timeline,
 * playback controls, speed control, and per-part rotation/position editing.
 */

export class TimelinePanel {
  constructor(state, viewport) {
    this.state = state;
    this.viewport = viewport;
    this.playheadPos = 0;
    this.isDraggingPlayhead = false;

    this.state.on('entityLoaded', () => {
      this.state.selectedAnim = null;
      this.state.selectedKeyframe = null;
      this.playheadPos = 0;
      this.render();
    });
    this.state.on('entityChanged', () => this.render());
  }

  build() {
    this.render();
  }

  _getAnimDef() {
    if (!this.state.entityDef || !this.state.selectedAnim) return null;
    return this.state.entityDef.animations?.[this.state.selectedAnim] || null;
  }

  render() {
    const panel = document.getElementById('panel-timeline');
    const entity = this.viewport.currentEntity;

    if (!this.state.entityDef) {
      panel.innerHTML = '<p class="placeholder-msg">Load an entity to edit animations</p>';
      return;
    }

    const anims = Object.keys(this.state.entityDef.animations || {});
    const animDef = this._getAnimDef();
    const keyframes = animDef?.keyframes || [];
    const duration = animDef?.duration || 1;

    panel.innerHTML = `
      <div style="display:flex;gap:12px;height:100%;">
        <div style="flex:1;display:flex;flex-direction:column;min-width:0;">
          <div class="timeline-header">
            <span style="font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:1.5px;text-transform:uppercase;">Animation</span>
            <select class="input-select" id="anim-select" style="width:130px;font-size:12px;">
              <option value="">Select...</option>
              ${anims.map(a => `<option value="${a}" ${this.state.selectedAnim === a ? 'selected' : ''}>${a}</option>`).join('')}
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
              <option value="0.1" ${(entity?.animController?.speed || 1) === 0.1 ? 'selected' : ''}>0.1x</option>
              <option value="0.25" ${(entity?.animController?.speed || 1) === 0.25 ? 'selected' : ''}>0.25x</option>
              <option value="0.5" ${(entity?.animController?.speed || 1) === 0.5 ? 'selected' : ''}>0.5x</option>
              <option value="1" ${(entity?.animController?.speed || 1) === 1 ? 'selected' : ''}>1x</option>
              <option value="1.5" ${(entity?.animController?.speed || 1) === 1.5 ? 'selected' : ''}>1.5x</option>
              <option value="2" ${(entity?.animController?.speed || 1) === 2 ? 'selected' : ''}>2x</option>
              <option value="3" ${(entity?.animController?.speed || 1) === 3 ? 'selected' : ''}>3x</option>
            </select>
          </div>

          ${animDef ? `
          <div style="position:relative;flex:1;min-height:36px;">
            <div class="timeline-track" id="timeline-track" style="height:100%;margin:0;">
              <div class="timeline-playhead" id="timeline-playhead" style="left:${this.playheadPos * 100}%"></div>
              ${keyframes.map((kf, i) =>
                `<div class="keyframe-dot ${this.state.selectedKeyframe === i ? 'active' : ''}"
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
              ${this.state.selectedKeyframe !== null ? `KF ${this.state.selectedKeyframe}: t=${keyframes[this.state.selectedKeyframe]?.time.toFixed(2)}` : 'Click a keyframe dot to edit'}
            </span>
          </div>
          ` : '<p class="placeholder-msg" style="padding:8px">Select or create an animation</p>'}
        </div>

        ${animDef && this.state.selectedKeyframe !== null && keyframes[this.state.selectedKeyframe] ? `
        <div style="width:320px;border-left:1px solid var(--border);padding-left:12px;overflow-y:auto;">
          <div style="font-size:10px;font-weight:700;color:var(--text-muted);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px;">
            Keyframe ${this.state.selectedKeyframe} — Pose
          </div>
          <div style="display:flex;gap:4px;margin-bottom:6px;">
            <input class="input-num" id="kf-time-input" type="number" min="0" max="1" step="0.05"
                   value="${keyframes[this.state.selectedKeyframe].time}" style="width:60px" />
            <span style="font-size:11px;color:var(--text-muted);line-height:28px;">time (0-1)</span>
          </div>
          ${this.state.entityDef.parts.map(part => {
            const kfParts = keyframes[this.state.selectedKeyframe].parts || {};
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

    this._bindEvents();
  }

  _bindEvents() {
    const entity = this.viewport.currentEntity;

    // Animation select
    document.getElementById('anim-select')?.addEventListener('change', (e) => {
      this.state.selectedAnim = e.target.value || null;
      this.state.selectedKeyframe = null;
      this.playheadPos = 0;
      if (entity && this.state.selectedAnim) {
        entity.playAnimation(this.state.selectedAnim);
        entity.animController.stop();
      }
      this.render();
    });

    // New animation
    document.getElementById('btn-new-anim')?.addEventListener('click', () => {
      const name = prompt('Animation name:');
      if (!name || !this.state.entityDef) return;
      if (!this.state.entityDef.animations) this.state.entityDef.animations = {};
      this.state.entityDef.animations[name] = {
        duration: 2,
        loop: true,
        keyframes: [
          { time: 0, parts: {} },
          { time: 1, parts: {} },
        ],
      };
      this.state.selectedAnim = name;
      this.state.selectedKeyframe = 0;
      this.state.emit('entityChanged', {});
      this.render();
    });

    // Delete animation
    document.getElementById('btn-del-anim')?.addEventListener('click', () => {
      if (!this.state.selectedAnim || !this.state.entityDef?.animations) return;
      if (!confirm(`Delete animation "${this.state.selectedAnim}"?`)) return;
      delete this.state.entityDef.animations[this.state.selectedAnim];
      this.state.selectedAnim = null;
      this.state.selectedKeyframe = null;
      this.state.emit('entityChanged', {});
      this.render();
    });

    // Play / Stop
    document.getElementById('btn-play-anim')?.addEventListener('click', () => {
      if (entity && this.state.selectedAnim) {
        const ad = this._getAnimDef();
        if (ad) entity.animController.play(this.state.selectedAnim, ad, true);
      }
    });

    document.getElementById('btn-stop-anim')?.addEventListener('click', () => {
      if (entity) entity.animController.stop();
    });

    // Duration
    document.getElementById('anim-duration')?.addEventListener('change', (e) => {
      const ad = this._getAnimDef();
      if (ad) ad.duration = Math.max(0.1, parseFloat(e.target.value) || 1);
    });

    // Loop toggle
    const loopToggle = document.getElementById('toggle-loop');
    loopToggle?.addEventListener('click', () => {
      const ad = this._getAnimDef();
      if (ad) {
        ad.loop = !ad.loop;
        loopToggle.classList.toggle('on', ad.loop);
      }
    });

    // Speed control
    document.getElementById('anim-speed')?.addEventListener('change', (e) => {
      if (entity) entity.animController.speed = parseFloat(e.target.value) || 1;
    });

    // Timeline track — click to seek, drag playhead
    const track = document.getElementById('timeline-track');
    if (track) {
      track.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('keyframe-dot')) return;
        this.isDraggingPlayhead = true;
        this._seekFromEvent(e);
      });
      document.addEventListener('mousemove', (e) => {
        if (this.isDraggingPlayhead) this._seekFromEvent(e);
      });
      document.addEventListener('mouseup', () => {
        this.isDraggingPlayhead = false;
      });
    }

    // Keyframe dot click
    document.querySelectorAll('.keyframe-dot').forEach(dot => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(dot.dataset.kf);
        this.state.selectedKeyframe = idx;
        const kf = this._getAnimDef()?.keyframes[idx];
        if (kf) {
          this.playheadPos = kf.time;
          if (entity && this.state.selectedAnim) {
            const ad = this._getAnimDef();
            entity.animController.play(this.state.selectedAnim, ad);
            const transforms = entity.animController.seekTo(kf.time);
            this._applyTransforms(transforms);
          }
        }
        this.render();
      });
    });

    // Add keyframe
    document.getElementById('btn-add-kf')?.addEventListener('click', () => {
      const ad = this._getAnimDef();
      if (!ad) return;
      const newKf = { time: Math.round(this.playheadPos * 100) / 100, parts: {} };
      ad.keyframes.push(newKf);
      ad.keyframes.sort((a, b) => a.time - b.time);
      this.state.selectedKeyframe = ad.keyframes.indexOf(newKf);
      this.render();
    });

    // Delete keyframe
    document.getElementById('btn-del-kf')?.addEventListener('click', () => {
      const ad = this._getAnimDef();
      if (!ad || this.state.selectedKeyframe === null) return;
      if (ad.keyframes.length <= 1) return;
      ad.keyframes.splice(this.state.selectedKeyframe, 1);
      this.state.selectedKeyframe = Math.min(this.state.selectedKeyframe, ad.keyframes.length - 1);
      this.render();
    });

    // Keyframe time input
    document.getElementById('kf-time-input')?.addEventListener('change', (e) => {
      const ad = this._getAnimDef();
      if (!ad || this.state.selectedKeyframe === null) return;
      const kf = ad.keyframes[this.state.selectedKeyframe];
      kf.time = Math.max(0, Math.min(1, parseFloat(e.target.value) || 0));
      ad.keyframes.sort((a, b) => a.time - b.time);
      this.state.selectedKeyframe = ad.keyframes.indexOf(kf);
      this.playheadPos = kf.time;
      this.render();
    });

    // Keyframe rotation/position inputs
    document.querySelectorAll('.kf-rot').forEach(input => {
      input.addEventListener('change', () => {
        this._updateKfTransform(input.dataset.part, 'rotation', parseInt(input.dataset.axis), parseFloat(input.value) || 0);
      });
    });
    document.querySelectorAll('.kf-pos').forEach(input => {
      input.addEventListener('change', () => {
        this._updateKfTransform(input.dataset.part, 'position', parseInt(input.dataset.axis), parseFloat(input.value) || 0);
      });
    });
  }

  _seekFromEvent(e) {
    const trackEl = document.getElementById('timeline-track');
    if (!trackEl) return;
    const rect = trackEl.getBoundingClientRect();
    this.playheadPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const playheadEl = document.getElementById('timeline-playhead');
    if (playheadEl) playheadEl.style.left = `${this.playheadPos * 100}%`;

    const entity = this.viewport.currentEntity;
    if (entity && this.state.selectedAnim) {
      const ad = this._getAnimDef();
      if (ad) {
        entity.animController.play(this.state.selectedAnim, ad);
        const transforms = entity.animController.seekTo(this.playheadPos);
        this._applyTransforms(transforms);
      }
    }
  }

  _applyTransforms(transforms) {
    const entity = this.viewport.currentEntity;
    if (!entity) return;
    const s = this.state.entityDef?.voxelSize || 1;
    for (const [partName, transform] of Object.entries(transforms)) {
      const group = entity.partGroups[partName];
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

  _updateKfTransform(partName, prop, axis, value) {
    const ad = this._getAnimDef();
    if (!ad || this.state.selectedKeyframe === null) return;
    const kf = ad.keyframes[this.state.selectedKeyframe];
    if (!kf.parts) kf.parts = {};
    if (!kf.parts[partName]) kf.parts[partName] = {};
    if (!kf.parts[partName][prop]) kf.parts[partName][prop] = [0, 0, 0];
    kf.parts[partName][prop][axis] = value;

    const entity = this.viewport.currentEntity;
    if (entity && this.state.selectedAnim) {
      entity.animController.play(this.state.selectedAnim, ad);
      const transforms = entity.animController.seekTo(kf.time);
      this._applyTransforms(transforms);
    }
  }
}
