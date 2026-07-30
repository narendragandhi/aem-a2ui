import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('aem-connection-status')
export class AemConnectionStatus extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family-base, 'Adobe Clean', sans-serif);
    }

    .status-card {
      background: white;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      border: 1px solid var(--spectrum-gray-300);
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .status-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--spectrum-gray-800);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-indicator.connected {
      background: #d4edda;
      color: #155724;
    }

    .status-indicator.disconnected {
      background: #f8d7da;
      color: #721c24;
    }

    .status-indicator.mock {
      background: #fff3cd;
      color: #856404;
    }

    .indicator-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .connected .indicator-dot {
      background: #28a745;
      animation: pulse 2s infinite;
    }

    .disconnected .indicator-dot {
      background: #dc3545;
    }

    .mock .indicator-dot {
      background: #ffc107;
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

    .connection-details {
      font-size: 12px;
      color: var(--spectrum-gray-600);
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid var(--spectrum-gray-100);
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      color: var(--spectrum-gray-500);
    }

    .detail-value {
      font-weight: 500;
      color: var(--spectrum-gray-800);
    }

    .actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .info-box {
      background: var(--spectrum-blue-100);
      border-radius: 6px;
      padding: 12px;
      font-size: 12px;
      color: var(--spectrum-blue-800);
      margin-bottom: 12px;
    }

    .page-preview {
      background: var(--spectrum-gray-100);
      border-radius: 6px;
      padding: 12px;
      margin-top: 12px;
    }

    .page-path {
      font-family: monospace;
      font-size: 12px;
      color: var(--spectrum-gray-700);
      word-break: break-all;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }

    .success-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: var(--spectrum-green-100);
      color: var(--spectrum-green-700);
      border-radius: 4px;
      font-size: 11px;
      margin-top: 8px;
    }
  `;

  @property({ type: Boolean }) connected = false;
  @property({ type: String }) authorUrl = '';
  @property({ type: String }) status = 'disconnected';
  @property({ type: String }) pagePath = '/content/aem-demo';
  @property({ type: String }) pageTitle = 'AEM Demo Page';
  @property({ type: String }) templateName = 'Hero Page Template';
  @property({ type: Boolean }) loading = false;

  private getStatusClass(): string {
    if (this.loading) return 'disconnected';
    return this.connected ? 'connected' : 'mock';
  }

  private getStatusText(): string {
    if (this.loading) return 'Connecting...';
    if (this.connected) return 'Connected';
    return 'Demo Mode';
  }

  render() {
    return html`
      <div class="status-card">
        <div class="status-header">
          <div class="status-title">🔗 AEM Author Connection</div>
          <div class="status-indicator ${this.getStatusClass()}">
            <span class="indicator-dot"></span>
            ${this.getStatusText()}
          </div>
        </div>

        ${
          !this.connected && !this.loading
            ? html`
                <div class="info-box">
                  ℹ️ Running in demo mode. Configure AEM credentials to connect to a real AEM Author instance.
                </div>
              `
            : ''
        }

        <div class="connection-details">
          <div class="detail-row">
            <span class="detail-label">Environment</span>
            <span class="detail-value">${this.connected ? 'AEM Author' : 'Local Demo'}</span>
          </div>

          <div class="detail-row">
            <span class="detail-label">Endpoint</span>
            <span class="detail-value">${this.authorUrl || 'localhost:4502'}</span>
          </div>

          <div class="page-preview">
            <div class="detail-label" style="margin-bottom: 8px;">Current Page</div>
            <div class="page-path">${this.pagePath}</div>
            <div class="success-badge">✓ ${this.pageTitle}</div>
            <div class="detail-label" style="margin-top: 8px;">Template: ${this.templateName}</div>
          </div>
        </div>

        <div class="actions">
          <sp-button variant="secondary" size="s" ?disabled=${this.loading}>
            ${this.connected ? 'Refresh' : 'Connect'}
          </sp-button>
          ${this.connected ? html` <sp-button variant="primary" size="s"> Push Changes </sp-button> ` : ''}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aem-connection-status': AemConnectionStatus;
  }
}
