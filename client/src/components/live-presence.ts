import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { LiveUser, CursorPosition } from '../services/collaboration-service.js';

@customElement('live-presence')
export class LivePresence extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family-base, 'Adobe Clean', sans-serif);
    }

    .presence-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--spectrum-gray-100);
      border-radius: 20px;
      font-size: 12px;
    }

    .pulse {
      width: 8px;
      height: 8px;
      background: var(--spectrum-green-500);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.5;
        transform: scale(1.2);
      }
    }

    .avatars {
      display: flex;
      margin-left: 8px;
    }

    .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid white;
      margin-left: -8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: white;
      position: relative;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .avatar:hover {
      transform: scale(1.1);
      z-index: 10;
    }

    .avatar:first-child {
      margin-left: 0;
    }

    .avatar[data-self='true'] {
      border-color: var(--spectrum-blue-400);
    }

    .avatar-tooltip {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: var(--spectrum-gray-800);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      margin-bottom: 4px;
    }

    .avatar:hover .avatar-tooltip {
      opacity: 1;
    }

    .more-count {
      background: var(--spectrum-gray-400);
      color: white;
      font-size: 10px;
    }

    .online-text {
      color: var(--spectrum-gray-700);
      font-size: 11px;
    }
  `;

  @property({ type: Array }) users: LiveUser[] = [];
  @property({ type: String }) currentUserId = '';
  @property({ type: Boolean }) showLabels = false;

  private getAvatarColor(username: string): string {
    const colors = [
      '#1473e6',
      '#0d66d0',
      '#2680eb',
      '#3b82f6',
      '#8b5cf6',
      '#a855f7',
      '#d946ef',
      '#ec4899',
      '#ef4444',
      '#f97316',
      '#eab308',
      '#22c55e',
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  private displayUsers(): LiveUser[] {
    return this.users.filter((u) => u.sessionId !== this.currentUserId);
  }

  private extraCount(): number {
    return Math.max(0, this.displayUsers().length - 4);
  }

  render() {
    const activeUsers = this.displayUsers();

    if (activeUsers.length === 0) {
      return html`
        <div class="presence-bar">
          <div class="pulse"></div>
          <span class="online-text">You're alone here</span>
        </div>
      `;
    }

    return html`
      <div class="presence-bar">
        <div class="pulse"></div>
        <span class="online-text">${activeUsers.length + 1} online</span>
        <div class="avatars">
          ${this.renderUserAvatar(
            this.users.find((u) => u.sessionId === this.currentUserId),
            true,
          )}
          ${activeUsers.slice(0, 4).map((user) => this.renderUserAvatar(user, false))}
          ${this.extraCount() > 0 ? html` <div class="avatar more-count">+${this.extraCount()}</div> ` : ''}
        </div>
      </div>
    `;
  }

  private renderUserAvatar(user: LiveUser | undefined, isSelf: boolean) {
    if (!user) return null;

    return html`
      <div class="avatar" style="background: ${this.getAvatarColor(user.username)}" data-self="${isSelf}">
        ${this.getInitials(user.username)}
        <div class="avatar-tooltip">${user.username}${isSelf ? ' (you)' : ''}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'live-presence': LivePresence;
  }
}
