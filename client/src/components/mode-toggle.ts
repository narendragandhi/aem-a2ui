import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ViewMode } from '../services/app-state.js';

/**
 * Simplified mode toggle - just 2 modes instead of 4
 * - Create: For creating single content pieces (combines wizard + quick + AI recommend)
 * - Build: For building full pages (page builder)
 */
@customElement('mode-toggle')
export class ModeToggle extends LitElement {
  @property({ type: String }) mode: ViewMode = 'create';

  static styles = css`
    :host {
      display: block;
    }

    .toggle-container {
      display: flex;
      justify-content: center;
      padding: 16px;
      background: var(--spectrum-gray-50, white);
      border-bottom: 1px solid var(--spectrum-gray-200, #e8e8e8);
    }

    .toggle-group {
      display: flex;
      background: var(--spectrum-gray-200, #e8e8e8);
      border-radius: 8px;
      padding: 4px;
      gap: 4px;
    }

    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border: none;
      background: transparent;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      color: var(--spectrum-gray-700, #666);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .toggle-btn:hover {
      color: var(--spectrum-gray-900, #333);
    }

    .toggle-btn.active {
      background: var(--spectrum-gray-50, white);
      color: var(--spectrum-accent-color-default, #1473e6);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .toggle-icon {
      font-size: 16px;
    }

    .toggle-label {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .toggle-title {
      line-height: 1.2;
    }

    .toggle-subtitle {
      font-size: 11px;
      font-weight: 400;
      color: var(--spectrum-gray-600, #888);
    }

    .toggle-btn.active .toggle-subtitle {
      color: var(--spectrum-blue-600, #0d66d0);
    }

    /* Responsive */
    @media (max-width: 480px) {
      .toggle-btn {
        padding: 8px 16px;
      }

      .toggle-subtitle {
        display: none;
      }
    }
  `;

  render() {
    return html`
      <div class="toggle-container">
        <div class="toggle-group">
          <button
            class="toggle-btn ${this.mode === 'create' ? 'active' : ''}"
            @click=${() => this.selectMode('create')}
          >
            <span class="toggle-icon">✨</span>
            <span class="toggle-label">
              <span class="toggle-title">Create Content</span>
              <span class="toggle-subtitle">Generate single components</span>
            </span>
          </button>

          <button
            class="toggle-btn ${this.mode === 'build' ? 'active' : ''}"
            @click=${() => this.selectMode('build')}
          >
            <span class="toggle-icon">🏗️</span>
            <span class="toggle-label">
              <span class="toggle-title">Build Page</span>
              <span class="toggle-subtitle">Create multi-section layouts</span>
            </span>
          </button>
        </div>
      </div>
    `;
  }

  private selectMode(mode: ViewMode) {
    if (mode !== this.mode) {
      this.mode = mode;
      this.dispatchEvent(
        new CustomEvent('mode-change', {
          detail: { mode },
          bubbles: true,
          composed: true,
        })
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mode-toggle': ModeToggle;
  }
}
