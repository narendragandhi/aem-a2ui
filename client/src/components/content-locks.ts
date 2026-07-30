import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('content-locks')
export class ContentLocks extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family-base, 'Adobe Clean', sans-serif);
    }

    .locks-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 50;
    }

    .lock-badge {
      position: absolute;
      background: var(--spectrum-orange-500);
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      animation: shake 0.5s ease-in-out;
    }

    @keyframes shake {
      0%,
      100% {
        transform: translateX(0);
      }
      25% {
        transform: translateX(-2px);
      }
      75% {
        transform: translateX(2px);
      }
    }

    .lock-icon {
      width: 14px;
      height: 14px;
    }

    .editing-indicator {
      position: absolute;
      background: var(--spectrum-blue-500);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .editing-dot {
      width: 6px;
      height: 6px;
      background: white;
      border-radius: 50%;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `;

  @property({ type: Array }) locks: Array<{ field: string; sessionId: string; username: string }> = [];
  @property({ type: Object }) fieldPositions: Record<
    string,
    { top: number; left: number; width: number; height: number }
  > = {};

  private getLockPosition(field: string): { top: number; left: number } | null {
    const pos = this.fieldPositions[field];
    if (!pos) return null;
    return { top: pos.top + pos.height + 4, left: pos.left + pos.width - 80 };
  }

  render() {
    return html`
      <div class="locks-overlay">
        ${this.locks.map((lock) => {
          const pos = this.getLockPosition(lock.field);
          if (!pos) return null;
          return html`
            <div class="lock-badge" style="top: ${pos.top}px; left: ${pos.left}px;">
              <svg class="lock-icon" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                />
              </svg>
              ${lock.username} editing
            </div>
          `;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'content-locks': ContentLocks;
  }
}
