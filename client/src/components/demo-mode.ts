import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { collaborationService } from '../services/collaboration-service.js';

interface SimulatedUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cursorX: number;
  cursorY: number;
  message?: string;
  reaction?: string;
}

@customElement('demo-mode')
export class DemoMode extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family-base, 'Adobe Clean', sans-serif);
    }

    .demo-controls {
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 16px;
      z-index: 1000;
    }

    .demo-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--spectrum-gray-600);
      text-transform: uppercase;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .demo-badge {
      background: var(--spectrum-green-500);
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }

    .simulated-users {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .sim-user {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: white;
      font-size: 14px;
      cursor: pointer;
      transition: transform 0.2s;
      position: relative;
    }

    .sim-user:hover {
      transform: scale(1.1);
    }

    .sim-user.active::after {
      content: '';
      position: absolute;
      top: -2px;
      right: -2px;
      width: 10px;
      height: 10px;
      background: var(--spectrum-green-500);
      border: 2px solid white;
      border-radius: 50%;
    }

    .toggle-btn {
      width: 100%;
      padding: 8px 16px;
      border-radius: 6px;
      border: none;
      background: var(--spectrum-gray-100);
      color: var(--spectrum-gray-700);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .toggle-btn:hover {
      background: var(--spectrum-gray-200);
    }

    .toggle-btn.active {
      background: var(--spectrum-blue-500);
      color: white;
    }

    .actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .action-btn {
      flex: 1;
      padding: 8px;
      border-radius: 6px;
      border: none;
      background: var(--spectrum-gray-100);
      font-size: 20px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .action-btn:hover {
      background: var(--spectrum-gray-200);
      transform: scale(1.1);
    }
  `;

  @property({ type: Boolean }) enabled = false;
  @state() private users: SimulatedUser[] = [
    { id: 'sim-1', name: 'Alice', avatar: 'A', color: '#1473e6', cursorX: 200, cursorY: 150 },
    { id: 'sim-2', name: 'Bob', avatar: 'B', color: '#0d66d0', cursorX: 400, cursorY: 200 },
    { id: 'sim-3', name: 'Carol', avatar: 'C', color: '#8b5cf6', cursorX: 300, cursorY: 300 },
  ];
  @state() private activeUsers: Set<string> = new Set(['sim-1', 'sim-2']);

  private interval: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    if (this.enabled) {
      this.startSimulation();
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopSimulation();
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('enabled')) {
      if (this.enabled) {
        this.startSimulation();
      } else {
        this.stopSimulation();
      }
    }
  }

  private startSimulation() {
    this.interval = setInterval(() => {
      this.users = this.users.map(user => {
        if (!this.activeUsers.has(user.id)) return user;

        return {
          ...user,
          cursorX: Math.max(100, Math.min(600, user.cursorX + (Math.random() - 0.5) * 30)),
          cursorY: Math.max(100, Math.min(500, user.cursorY + (Math.random() - 0.5) * 30)),
        };
      });
    }, 100);
  }

  private stopSimulation() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private toggleUser(userId: string) {
    if (this.activeUsers.has(userId)) {
      this.activeUsers.delete(userId);
    } else {
      this.activeUsers.add(userId);
    }
    this.activeUsers = new Set(this.activeUsers);
  }

  private triggerRandomAction() {
    const actions = ['chat', 'reaction', 'comment'];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const activeUser = this.users.find(u => this.activeUsers.has(u.id));

    if (activeUser) {
      if (action === 'chat') {
        collaborationService.sendChatMessage(`Demo: ${activeUser.name} says hello!`);
      } else if (action === 'reaction') {
        const emojis = ['👍', '❤️', '🎉', '🔥'];
        collaborationService.addReaction(emojis[Math.floor(Math.random() * emojis.length)], 'title');
      }
    }
  }

  render() {
    return html`
      <div class="demo-controls">
        <div class="demo-title">
          🏭 Demo Mode
          <span class="demo-badge">LIVE</span>
        </div>

        <div class="simulated-users">
          ${this.users.map(user => html`
            <div
              class="sim-user ${this.activeUsers.has(user.id) ? 'active' : ''}"
              style="background: ${user.color}"
              @click=${() => this.toggleUser(user.id)}
              title="${user.name}"
            >
              ${user.avatar}
            </div>
          `)}
        </div>

        <button
          class="toggle-btn ${this.enabled ? 'active' : ''}"
          @click=${() => this.enabled = !this.enabled}
        >
          ${this.enabled ? 'Demo Active' : 'Enable Demo'}
        </button>

        ${this.enabled ? html`
          <div class="actions">
            <button class="action-btn" @click=${() => this.triggerRandomAction()} title="Send demo message">
              💬
            </button>
            <button class="action-btn" @click=${() => {
              collaborationService.sendChatMessage('Alice: Great work team! 👏');
            }} title="Applaud">
              👏
            </button>
            <button class="action-btn" @click=${() => {
              this.users[0].cursorX = 150 + Math.random() * 400;
              this.users[0].cursorY = 150 + Math.random() * 300;
            }} title="Randomize cursors">
              🎲
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'demo-mode': DemoMode;
  }
}
