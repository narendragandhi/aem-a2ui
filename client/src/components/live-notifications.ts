import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('live-notifications')
export class LiveNotifications extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family-base, 'Adobe Clean', sans-serif);
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 2000;
      max-width: 360px;
    }

    .notification {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 16px;
      margin-bottom: 12px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      animation: slideIn 0.3s ease-out;
      border-left: 4px solid;
    }

    .notification.info { border-color: var(--spectrum-blue-500); }
    .notification.success { border-color: var(--spectrum-green-500); }
    .notification.warning { border-color: var(--spectrum-orange-500); }
    .notification.error { border-color: var(--spectrum-red-500); }
    .notification.review { border-color: var(--spectrum-purple-500); }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .notification.exit {
      animation: slideOut 0.3s ease-in forwards;
    }

    @keyframes slideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100px);
      }
    }

    .notification-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .info .notification-icon { background: var(--spectrum-blue-100); }
    .success .notification-icon { background: var(--spectrum-green-100); }
    .warning .notification-icon { background: var(--spectrum-orange-100); }
    .error .notification-icon { background: var(--spectrum-red-100); }
    .review .notification-icon { background: var(--spectrum-purple-100); }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      font-weight: 600;
      font-size: 14px;
      color: var(--spectrum-gray-900);
      margin-bottom: 4px;
    }

    .notification-message {
      font-size: 13px;
      color: var(--spectrum-gray-700);
      line-height: 1.4;
    }

    .notification-meta {
      font-size: 11px;
      color: var(--spectrum-gray-500);
      margin-top: 8px;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      color: var(--spectrum-gray-400);
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: color 0.15s;
    }

    .close-btn:hover {
      color: var(--spectrum-gray-600);
    }

    .unread-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      width: 10px;
      height: 10px;
      background: var(--spectrum-red-500);
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.8; }
    }
  `;

  @property({ type: Array }) notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'review';
    title: string;
    message: string;
    fromUser?: string;
    timestamp: string;
  }> = [];

  @state() private exitingIds: Set<string> = new Set();

  private getIcon(type: string): string {
    const icons: Record<string, string> = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      review: '📝'
    };
    return icons[type] || 'ℹ️';
  }

  private close(id: string) {
    this.exitingIds.add(id);
    this.requestUpdate();

    setTimeout(() => {
      this.notifications = this.notifications.filter(n => n.id !== id);
      this.exitingIds.delete(id);
    }, 300);
  }

  private formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  render() {
    return html`
      ${this.notifications.map(notification => html`
        <div
          class="notification ${notification.type} ${this.exitingIds.has(notification.id) ? 'exit' : ''}"
        >
          <div class="notification-icon">${this.getIcon(notification.type)}</div>
          <div class="notification-content">
            <div class="notification-title">${notification.title}</div>
            <div class="notification-message">${notification.message}</div>
            ${notification.fromUser ? html`
              <div class="notification-meta">From ${notification.fromUser} · ${this.formatTime(notification.timestamp)}</div>
            ` : ''}
          </div>
          <button class="close-btn" @click=${() => this.close(notification.id)}>×</button>
        </div>
      `)}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'live-notifications': LiveNotifications;
  }
}
