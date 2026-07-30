import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CursorPosition } from '../services/collaboration-service.js';

@customElement('live-cursors')
export class LiveCursors extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: 100;
      overflow: hidden;
    }

    .cursor {
      position: absolute;
      transition: transform 0.1s ease-out;
      pointer-events: none;
    }

    .cursor-pointer {
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-bottom: 16px solid;
      transform: rotate(-45deg);
    }

    .cursor-label {
      position: absolute;
      left: 16px;
      top: 12px;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
      color: white;
      white-space: nowrap;
    }
  `;

  @property({ type: Array }) cursors: CursorPosition[] = [];
  @property({ type: String }) currentUserId = '';

  private getAvatarColor(sessionId: string): string {
    const colors = ['#1473e6', '#0d66d0', '#2680eb', '#8b5cf6', '#d946ef', '#ec4899', '#ef4444', '#f97316'];
    let hash = 0;
    for (let i = 0; i < sessionId.length; i++) {
      hash = sessionId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  private isRecent(cursor: CursorPosition): boolean {
    const timestamp = new Date(cursor.timestamp || Date.now()).getTime();
    return Date.now() - timestamp < 10000;
  }

  render() {
    const activeCursors = this.cursors.filter((c) => c.sessionId !== this.currentUserId && this.isRecent(c));

    return html`
      ${activeCursors.map(
        (cursor) => html`
          <div class="cursor" style="transform: translate(${cursor.x}px, ${cursor.y}px)">
            <div class="cursor-pointer" style="border-bottom-color: ${this.getAvatarColor(cursor.sessionId)}"></div>
            <div class="cursor-label" style="background: ${this.getAvatarColor(cursor.sessionId)}">
              ${cursor.username}
            </div>
          </div>
        `,
      )}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'live-cursors': LiveCursors;
  }
}
