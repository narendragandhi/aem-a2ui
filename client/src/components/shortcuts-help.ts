import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { keyboardShortcuts } from '../services/keyboard-shortcuts.js';

@customElement('shortcuts-help')
export class ShortcutsHelp extends LitElement {
  @property({ type: Boolean }) open = false;

  static styles = css`
    :host {
      display: block;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal {
      background: var(--spectrum-gray-50, white);
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow: hidden;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--spectrum-gray-200, #e8e8e8);
    }

    .modal-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--spectrum-gray-900, #1a1a1a);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .modal-title-icon {
      font-size: 20px;
    }

    .close-btn {
      background: transparent;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: var(--spectrum-gray-600, #666);
      padding: 4px 8px;
      border-radius: 4px;
    }

    .close-btn:hover {
      background: var(--spectrum-gray-200, #f0f0f0);
    }

    .modal-body {
      padding: 24px;
      overflow-y: auto;
      max-height: calc(80vh - 140px);
    }

    .shortcut-category {
      margin-bottom: 24px;
    }

    .shortcut-category:last-child {
      margin-bottom: 0;
    }

    .category-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--spectrum-gray-600, #666);
      margin: 0 0 12px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--spectrum-gray-200, #e8e8e8);
    }

    .shortcut-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .shortcut-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--spectrum-gray-100, #f5f5f5);
      border-radius: 6px;
    }

    .shortcut-description {
      font-size: 14px;
      color: var(--spectrum-gray-800, #333);
    }

    .shortcut-keys {
      display: flex;
      gap: 4px;
    }

    .key {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 28px;
      padding: 0 8px;
      background: var(--spectrum-gray-50, white);
      border: 1px solid var(--spectrum-gray-300, #ccc);
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      color: var(--spectrum-gray-800, #333);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .key-separator {
      color: var(--spectrum-gray-500, #999);
      font-size: 12px;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--spectrum-gray-200, #e8e8e8);
      background: var(--spectrum-gray-100, #f5f5f5);
      text-align: center;
    }

    .footer-hint {
      font-size: 12px;
      color: var(--spectrum-gray-600, #666);
    }

    .footer-hint kbd {
      background: var(--spectrum-gray-50, white);
      border: 1px solid var(--spectrum-gray-300, #ccc);
      border-radius: 3px;
      padding: 2px 6px;
      font-family: inherit;
      font-size: 11px;
    }
  `;

  render() {
    if (!this.open) return html``;

    const shortcuts = keyboardShortcuts.getShortcutsGrouped();

    return html`
      <div class="overlay" @click=${this.handleOverlayClick}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <h2 class="modal-title">
              <span class="modal-title-icon">⌨️</span>
              Keyboard Shortcuts
            </h2>
            <button class="close-btn" @click=${this.close}>×</button>
          </div>

          <div class="modal-body">
            ${Array.from(shortcuts.entries()).map(
              ([category, items]) => html`
                <div class="shortcut-category">
                  <h3 class="category-title">${category}</h3>
                  <div class="shortcut-list">
                    ${items.map(
                      (shortcut) => html`
                        <div class="shortcut-item">
                          <span class="shortcut-description">${shortcut.description}</span>
                          <div class="shortcut-keys">
                            ${this.renderKeys(keyboardShortcuts.formatShortcut(shortcut))}
                          </div>
                        </div>
                      `
                    )}
                  </div>
                </div>
              `
            )}
          </div>

          <div class="modal-footer">
            <span class="footer-hint">
              Press <kbd>Shift</kbd> + <kbd>?</kbd> to toggle this help
            </span>
          </div>
        </div>
      </div>
    `;
  }

  private renderKeys(formatted: string) {
    const keys = formatted.split(' + ');
    return keys.map(
      (key, index) => html`
        <span class="key">${key}</span>
        ${index < keys.length - 1 ? html`<span class="key-separator">+</span>` : ''}
      `
    );
  }

  private handleOverlayClick(e: Event) {
    if ((e.target as HTMLElement).classList.contains('overlay')) {
      this.close();
    }
  }

  private close() {
    this.open = false;
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'shortcuts-help': ShortcutsHelp;
  }
}
