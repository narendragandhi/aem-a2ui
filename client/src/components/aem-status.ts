import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';

const API_BASE = 'http://localhost:10003';

interface AemHealth {
  enabled: boolean;
  connected: boolean;
  authorUrl: string;
  status: string;
  message?: string;
}

/**
 * AEM Connection Status indicator component.
 * Shows connection status and allows testing the connection.
 */
@customElement('aem-status')
export class AemStatus extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family-base, 'Adobe Clean', sans-serif);
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--spectrum-gray-100);
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .status-indicator:hover {
      background: var(--spectrum-gray-200);
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .status-dot.connected {
      background: var(--spectrum-green-500);
      box-shadow: 0 0 6px var(--spectrum-green-400);
    }

    .status-dot.disconnected {
      background: var(--spectrum-red-500);
    }

    .status-dot.disabled {
      background: var(--spectrum-gray-400);
    }

    .status-dot.checking {
      background: var(--spectrum-yellow-500);
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

    .status-text {
      font-size: 12px;
      font-weight: 500;
      color: var(--spectrum-gray-700);
    }

    .status-label {
      font-size: 11px;
      color: var(--spectrum-gray-500);
    }

    /* Dropdown panel */
    .dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      width: 320px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      z-index: 100;
      overflow: hidden;
    }

    .dropdown-header {
      padding: 16px;
      background: var(--spectrum-gray-50);
      border-bottom: 1px solid var(--spectrum-gray-200);
    }

    .dropdown-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--spectrum-gray-800);
      margin-bottom: 4px;
    }

    .dropdown-subtitle {
      font-size: 12px;
      color: var(--spectrum-gray-600);
    }

    .dropdown-body {
      padding: 16px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;
      font-size: 12px;
    }

    .info-label {
      color: var(--spectrum-gray-600);
    }

    .info-value {
      color: var(--spectrum-gray-800);
      font-weight: 500;
    }

    .info-value.connected {
      color: var(--spectrum-green-600);
    }

    .info-value.disconnected {
      color: var(--spectrum-red-600);
    }

    .url-value {
      font-family: monospace;
      font-size: 11px;
      background: var(--spectrum-gray-100);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .dropdown-actions {
      padding: 12px 16px;
      border-top: 1px solid var(--spectrum-gray-200);
      display: flex;
      gap: 8px;
    }

    .message-box {
      padding: 12px;
      border-radius: 6px;
      font-size: 12px;
      margin-bottom: 12px;
    }

    .message-box.success {
      background: var(--spectrum-green-100);
      color: var(--spectrum-green-800);
    }

    .message-box.error {
      background: var(--spectrum-red-100);
      color: var(--spectrum-red-800);
    }

    .message-box.info {
      background: var(--spectrum-blue-100);
      color: var(--spectrum-blue-800);
    }

    .wrapper {
      position: relative;
      display: inline-block;
    }
  `;

  @property({ type: Boolean }) showLabel = true;

  @state() private health: AemHealth | null = null;
  @state() private showDropdown = false;
  @state() private checking = false;

  connectedCallback() {
    super.connectedCallback();
    this.checkHealth();

    // Periodic health check
    setInterval(() => this.checkHealth(), 30000);

    // Close dropdown on outside click
    document.addEventListener('click', this.handleOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.handleOutsideClick);
  }

  private handleOutsideClick = (e: Event) => {
    if (!this.contains(e.target as Node)) {
      this.showDropdown = false;
    }
  };

  private async checkHealth() {
    this.checking = true;
    try {
      const response = await fetch(`${API_BASE}/aem/health`);
      if (response.ok) {
        this.health = await response.json();
      }
    } catch (error) {
      console.error('Failed to check AEM health:', error);
      this.health = {
        enabled: false,
        connected: false,
        authorUrl: 'http://localhost:4502',
        status: 'ERROR',
        message: 'Cannot reach backend server',
      };
    } finally {
      this.checking = false;
    }
  }

  private toggleDropdown(e: Event) {
    e.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  private async testConnection() {
    await this.checkHealth();
  }

  private getStatusClass(): string {
    if (this.checking) return 'checking';
    if (!this.health) return 'disconnected';
    if (!this.health.enabled) return 'disabled';
    return this.health.connected ? 'connected' : 'disconnected';
  }

  private getStatusText(): string {
    if (this.checking) return 'Checking...';
    if (!this.health) return 'Unknown';
    if (!this.health.enabled) return 'Mock Mode';
    return this.health.connected ? 'Connected' : 'Disconnected';
  }

  render() {
    return html`
      <div class="wrapper">
        <div class="status-indicator" @click=${this.toggleDropdown} title="AEM Connection Status">
          <span class="status-dot ${this.getStatusClass()}"></span>
          ${
            this.showLabel
              ? html`
                  <div>
                    <div class="status-text">AEM</div>
                    <div class="status-label">${this.getStatusText()}</div>
                  </div>
                `
              : ''
          }
        </div>

        ${this.showDropdown ? this.renderDropdown() : ''}
      </div>
    `;
  }

  private renderDropdown() {
    const statusClass = this.getStatusClass();

    return html`
      <div class="dropdown" @click=${(e: Event) => e.stopPropagation()}>
        <div class="dropdown-header">
          <div class="dropdown-title">AEM Connection</div>
          <div class="dropdown-subtitle">${this.health?.enabled ? 'Real AEM Integration' : 'Mock Mode (No AEM)'}</div>
        </div>

        <div class="dropdown-body">
          ${
            this.health?.message
              ? html`
                  <div class="message-box ${this.health.connected ? 'success' : 'error'}">${this.health.message}</div>
                `
              : ''
          }

          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value ${statusClass}">${this.getStatusText()}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Integration</span>
            <span class="info-value">${this.health?.enabled ? 'Enabled' : 'Disabled'}</span>
          </div>

          <div class="info-row">
            <span class="info-label">Author URL</span>
            <span class="url-value">${this.health?.authorUrl || 'N/A'}</span>
          </div>

          ${
            !this.health?.enabled
              ? html`
                  <div class="message-box info">
                    Running in mock mode. Set AEM_ENABLED=true and ensure AEM SDK is running to enable real integration.
                  </div>
                `
              : ''
          }
        </div>

        <div class="dropdown-actions">
          <sp-button variant="secondary" size="s" @click=${this.testConnection} ?disabled=${this.checking}>
            ${
              this.checking
                ? html` <sp-progress-circle indeterminate size="s"></sp-progress-circle> `
                : 'Test Connection'
            }
          </sp-button>

          ${
            this.health?.connected
              ? html`
                  <sp-button variant="primary" size="s" @click=${() => window.open(this.health?.authorUrl, '_blank')}>
                    Open AEM
                  </sp-button>
                `
              : ''
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aem-status': AemStatus;
  }
}
