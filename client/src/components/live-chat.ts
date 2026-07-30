import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ChatMessage } from '../services/collaboration-service.js';

@customElement('live-chat')
export class LiveChat extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    .chat-toggle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: var(--spectrum-blue-500);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition:
        transform 0.2s,
        background 0.2s;
    }

    .chat-toggle:hover {
      transform: scale(1.05);
      background: var(--spectrum-blue-600);
    }

    .chat-toggle[data-open='true'] {
      display: none;
    }

    .unread-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--spectrum-red-500);
      color: white;
      font-size: 11px;
      font-weight: 600;
      min-width: 20px;
      height: 20px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }

    .chat-panel {
      position: absolute;
      bottom: 60px;
      right: 0;
      width: 320px;
      height: 400px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.2s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .chat-header {
      padding: 16px;
      background: var(--spectrum-blue-500);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chat-header-title {
      font-weight: 600;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .live-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10px;
      text-transform: uppercase;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .close-btn:hover {
      opacity: 1;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .message {
      margin-bottom: 12px;
      animation: fadeIn 0.2s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }

    .message-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
      color: white;
    }

    .message-author {
      font-weight: 600;
      font-size: 12px;
      color: var(--spectrum-gray-800);
    }

    .message-time {
      font-size: 10px;
      color: var(--spectrum-gray-500);
    }

    .message-content {
      margin-left: 32px;
      font-size: 13px;
      color: var(--spectrum-gray-700);
      line-height: 1.4;
    }

    .empty-state {
      text-align: center;
      padding: 48px 16px;
      color: var(--spectrum-gray-500);
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .input-container {
      padding: 12px;
      border-top: 1px solid var(--spectrum-gray-200);
      display: flex;
      gap: 8px;
    }

    .message-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid var(--spectrum-gray-300);
      border-radius: 20px;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }

    .message-input:focus {
      border-color: var(--spectrum-blue-400);
    }

    .send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--spectrum-blue-500);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .send-btn:hover:not(:disabled) {
      background: var(--spectrum-blue-600);
    }

    .send-btn:disabled {
      background: var(--spectrum-gray-300);
      cursor: not-allowed;
    }
  `;

  @property({ type: Boolean }) open = false;
  @property({ type: Array }) messages: ChatMessage[] = [];
  @property({ type: String }) currentUserId = '';
  @property({ type: String }) currentUserName = 'Demo User';

  @state() private newMessage = '';
  @state() private unreadCount = 0;
  @state() private showPanel = false;

  private getAvatarColor(sessionId: string): string {
    const colors = ['#1473e6', '#0d66d0', '#2680eb', '#8b5cf6', '#d946ef', '#ec4899', '#ef4444', '#f97316'];
    let hash = 0;
    for (let i = 0; i < sessionId.length; i++) {
      hash = sessionId.charCodeAt(i) + ((hash << 5) - hash);
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

  private formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private handleInput(e: Event) {
    this.newMessage = (e.target as HTMLInputElement).value;
  }

  private handleSend() {
    if (!this.newMessage.trim()) return;

    this.dispatchEvent(
      new CustomEvent('send-message', {
        detail: { message: this.newMessage },
        bubbles: true,
        composed: true,
      }),
    );

    this.newMessage = '';
  }

  private handleKeyPress(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSend();
    }
  }

  private toggleChat() {
    this.showPanel = !this.showPanel;
    if (this.showPanel) {
      this.unreadCount = 0;
    }
  }

  private closeChat() {
    this.showPanel = false;
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('messages') && !this.showPanel) {
      const newMessages = this.messages.length;
      const lastMessage = this.messages[this.messages.length - 1];
      if (lastMessage && lastMessage.sessionId !== this.currentUserId) {
        this.unreadCount++;
      }
    }
  }

  render() {
    return html`
      ${
        !this.showPanel
          ? html`
              <button class="chat-toggle" @click=${this.toggleChat} data-open="${this.open}">
                💬 ${this.unreadCount > 0 ? html` <span class="unread-badge">${this.unreadCount}</span> ` : ''}
              </button>
            `
          : ''
      }
      ${
        this.showPanel
          ? html`
              <div class="chat-panel">
                <div class="chat-header">
                  <div class="chat-header-title">
                    <span>Team Chat</span>
                    <span class="live-badge">LIVE</span>
                  </div>
                  <button class="close-btn" @click=${this.closeChat}>×</button>
                </div>

                <div class="messages-container">
                  ${
              this.messages.length === 0
                ? html`
                    <div class="empty-state">
                      <div class="empty-icon">💬</div>
                      <div>No messages yet</div>
                      <div style="font-size: 12px; margin-top: 8px;">Start a conversation with your team!</div>
                    </div>
                  `
                : this.messages.map(
                    (msg) => html`
                      <div class="message">
                        <div class="message-header">
                          <div class="message-avatar" style="background: ${this.getAvatarColor(msg.sessionId)}">
                            ${this.getInitials(msg.username)}
                          </div>
                          <span class="message-author">${msg.username}</span>
                          <span class="message-time">${this.formatTime(msg.timestamp)}</span>
                        </div>
                        <div class="message-content">${msg.content}</div>
                      </div>
                    `,
                  )
            }
                </div>

                <div class="input-container">
                  <input
                    type="text"
                    class="message-input"
                    placeholder="Type a message..."
                    .value=${this.newMessage}
                    @input=${this.handleInput}
                    @keypress=${this.handleKeyPress}
                  />
                  <button class="send-btn" ?disabled=${!this.newMessage.trim()} @click=${this.handleSend}>→</button>
                </div>
              </div>
            `
          : ''
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'live-chat': LiveChat;
  }
}
