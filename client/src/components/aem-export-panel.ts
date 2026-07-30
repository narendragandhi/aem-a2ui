import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ContentSuggestion } from '../lib/types.js';
import {
  contentToJcr,
  contentToSlingModel,
  generateHTL,
  generatePageStructure,
  getAssetReferences,
} from '../lib/aem-content-structure.js';
import { getComponentById } from '../lib/aem-components.js';
import { logger } from '../services/logger.js';

type ExportFormat = 'jcr' | 'sling' | 'htl' | 'package';

@customElement('aem-export-panel')
export class AemExportPanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family-base, 'Adobe Clean', sans-serif);
    }

    .export-panel {
      background: var(--spectrum-gray-50, white);
      border: 1px solid var(--spectrum-gray-300);
      border-radius: 8px;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--spectrum-gray-100);
      border-bottom: 1px solid var(--spectrum-gray-300);
    }

    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--spectrum-gray-800);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .component-badge {
      background: var(--spectrum-blue-500);
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }

    .export-tabs {
      display: flex;
      border-bottom: 1px solid var(--spectrum-gray-300);
    }

    .export-tab {
      flex: 1;
      padding: 10px 12px;
      border: none;
      background: transparent;
      font-size: 12px;
      font-weight: 500;
      color: var(--spectrum-gray-700);
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .export-tab:hover {
      background: var(--spectrum-gray-100);
    }

    .export-tab.active {
      color: var(--spectrum-blue-600);
      border-bottom: 2px solid var(--spectrum-blue-600);
      margin-bottom: -1px;
    }

    .export-tab-icon {
      font-size: 16px;
    }

    .export-content {
      padding: 16px;
    }

    .code-block {
      background: var(--spectrum-gray-800);
      border-radius: 6px;
      padding: 16px;
      overflow-x: auto;
      max-height: 300px;
      overflow-y: auto;
    }

    .code-block pre {
      margin: 0;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
      color: var(--spectrum-gray-100);
      white-space: pre-wrap;
      word-break: break-word;
    }

    .actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .action-btn {
      flex: 1;
      padding: 10px 16px;
      border-radius: 6px;
      border: none;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .action-btn.primary {
      background: var(--spectrum-blue-500);
      color: white;
    }

    .action-btn.primary:hover {
      background: var(--spectrum-blue-600);
    }

    .action-btn.secondary {
      background: var(--spectrum-gray-200);
      color: var(--spectrum-gray-800);
    }

    .action-btn.secondary:hover {
      background: var(--spectrum-gray-300);
    }

    .action-btn.success {
      background: var(--spectrum-green-500);
      color: white;
    }

    .action-btn.success:hover {
      background: var(--spectrum-green-600);
    }

    .action-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .deploy-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--spectrum-gray-300);
    }

    .deploy-header {
      font-size: 13px;
      font-weight: 600;
      color: var(--spectrum-gray-800);
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .path-input {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .path-input input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid var(--spectrum-gray-400);
      border-radius: 4px;
      font-size: 13px;
      font-family: 'SF Mono', Monaco, monospace;
    }

    .status-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 12px;
      margin-top: 12px;
    }

    .status-message.success {
      background: var(--spectrum-green-100);
      color: var(--spectrum-green-700);
    }

    .status-message.error {
      background: var(--spectrum-red-100);
      color: var(--spectrum-red-700);
    }

    .status-message.info {
      background: var(--spectrum-blue-100);
      color: var(--spectrum-blue-700);
    }

    .asset-warning {
      background: var(--spectrum-yellow-100);
      border: 1px solid var(--spectrum-yellow-400);
      border-radius: 6px;
      padding: 12px;
      margin-top: 12px;
    }

    .asset-warning-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--spectrum-yellow-700);
      margin-bottom: 6px;
    }

    .asset-warning-list {
      font-size: 11px;
      color: var(--spectrum-gray-700);
    }

    .asset-warning-list li {
      margin: 4px 0;
      font-family: 'SF Mono', Monaco, monospace;
    }
  `;

  @property({ type: Object }) content: ContentSuggestion | null = null;
  @property({ type: String }) aemUrl = 'http://localhost:4502';
  @property({ type: Boolean }) aemConnected = false;

  @state() private activeTab: ExportFormat = 'jcr';
  @state() private deployPath = '/content/aem-component-factory/us/en/generated';
  @state() private deployStatus: 'idle' | 'deploying' | 'success' | 'error' = 'idle';
  @state() private deployMessage = '';
  @state() private copied = false;

  render() {
    if (!this.content) {
      return html`<div class="export-panel">
        <div class="panel-header">
          <span class="panel-title">No content to export</span>
        </div>
      </div>`;
    }

    const componentDef = getComponentById(this.content.componentType || 'teaser');
    const assets = getAssetReferences(this.content);

    return html`
      <div class="export-panel">
        <div class="panel-header">
          <span class="panel-title">
            📦 Export to AEM
            <span class="component-badge">${componentDef?.name || this.content.componentType}</span>
          </span>
        </div>

        <div class="export-tabs">
          <button
            class="export-tab ${this.activeTab === 'jcr' ? 'active' : ''}"
            @click=${() => (this.activeTab = 'jcr')}
          >
            <span class="export-tab-icon">🗂️</span>
            JCR Content
          </button>
          <button
            class="export-tab ${this.activeTab === 'sling' ? 'active' : ''}"
            @click=${() => (this.activeTab = 'sling')}
          >
            <span class="export-tab-icon">📄</span>
            Sling Model
          </button>
          <button
            class="export-tab ${this.activeTab === 'htl' ? 'active' : ''}"
            @click=${() => (this.activeTab = 'htl')}
          >
            <span class="export-tab-icon">🔧</span>
            HTL Template
          </button>
        </div>

        <div class="export-content">
          ${this.renderCodeBlock()}

          <div class="actions">
            <button class="action-btn secondary" @click=${this.copyToClipboard}>
              ${this.copied ? '✓ Copied!' : '📋 Copy'}
            </button>
            <button class="action-btn primary" @click=${this.downloadFile}>⬇️ Download</button>
          </div>

          ${
            assets.length > 0
              ? html`
                  <div class="asset-warning">
                    <div class="asset-warning-title">⚠️ Assets to upload to DAM</div>
                    <ul class="asset-warning-list">
                      ${assets.map((a) => html`<li>${a.sourcePath} → ${a.targetPath}</li>`)}
                    </ul>
                  </div>
                `
              : ''
          }

          <div class="deploy-section">
            <div class="deploy-header">
              🚀 Deploy to AEM
              ${
                this.aemConnected
                  ? html`<span style="color: var(--spectrum-green-600)">● Connected</span>`
                  : html`<span style="color: var(--spectrum-red-600)">● Disconnected</span>`
              }
            </div>

            <div class="path-input">
              <input
                type="text"
                .value=${this.deployPath}
                @input=${(e: Event) => (this.deployPath = (e.target as HTMLInputElement).value)}
                placeholder="/content/site/page"
              />
            </div>

            <button
              class="action-btn success"
              ?disabled=${!this.aemConnected || this.deployStatus === 'deploying'}
              @click=${this.deployToAem}
            >
              ${this.deployStatus === 'deploying' ? '⏳ Deploying...' : '🚀 Deploy Component'}
            </button>

            ${
              this.deployStatus !== 'idle'
                ? html`
                    <div class="status-message ${this.deployStatus}">
                      ${this.deployStatus === 'success' ? '✓' : this.deployStatus === 'error' ? '✗' : 'ℹ️'}
                      ${this.deployMessage}
                    </div>
                  `
                : ''
            }
          </div>
        </div>
      </div>
    `;
  }

  private renderCodeBlock() {
    if (!this.content) return '';

    let code = '';
    switch (this.activeTab) {
      case 'jcr':
        code = JSON.stringify(contentToJcr(this.content, { includeActions: true }), null, 2);
        break;
      case 'sling':
        code = JSON.stringify(contentToSlingModel(this.content), null, 2);
        break;
      case 'htl':
        code = generateHTL(this.content);
        break;
    }

    return html`
      <div class="code-block">
        <pre>${code}</pre>
      </div>
    `;
  }

  private getExportCode(): string {
    if (!this.content) return '';

    switch (this.activeTab) {
      case 'jcr':
        return JSON.stringify(contentToJcr(this.content, { includeActions: true }), null, 2);
      case 'sling':
        return JSON.stringify(contentToSlingModel(this.content), null, 2);
      case 'htl':
        return generateHTL(this.content);
      default:
        return '';
    }
  }

  private async copyToClipboard() {
    const code = this.getExportCode();
    try {
      await navigator.clipboard.writeText(code);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
      logger.info('Copied to clipboard', 'Export');
    } catch (err) {
      logger.error('Failed to copy', 'Export', err);
    }
  }

  private downloadFile() {
    const code = this.getExportCode();
    const filename = this.getFilename();
    const mimeType = this.activeTab === 'htl' ? 'text/html' : 'application/json';

    const blob = new Blob([code], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    logger.info(`Downloaded ${filename}`, 'Export');
  }

  private getFilename(): string {
    const baseName = this.content?.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'component';
    switch (this.activeTab) {
      case 'jcr':
        return `${baseName}.content.json`;
      case 'sling':
        return `${baseName}.model.json`;
      case 'htl':
        return `${baseName}.html`;
      default:
        return `${baseName}.json`;
    }
  }

  private async deployToAem() {
    if (!this.content || !this.aemConnected) return;

    this.deployStatus = 'deploying';
    this.deployMessage = 'Deploying to AEM...';

    try {
      const jcrContent = contentToJcr(this.content, {
        pagePath: this.deployPath,
        includeActions: true,
      });

      // POST to AEM
      const response = await fetch(`${this.aemUrl}/api/aem/content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: `${this.deployPath}/${this.content.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'component'}`,
          content: jcrContent,
        }),
      });

      if (response.ok) {
        this.deployStatus = 'success';
        this.deployMessage = `Successfully deployed to ${this.deployPath}`;
        logger.info('Deployed to AEM', 'Export', { path: this.deployPath });

        this.dispatchEvent(
          new CustomEvent('deployed', {
            detail: { path: this.deployPath, content: this.content },
            bubbles: true,
            composed: true,
          }),
        );
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      this.deployStatus = 'error';
      this.deployMessage = `Deploy failed: ${error}`;
      logger.error('Deploy failed', 'Export', error);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aem-export-panel': AemExportPanel;
  }
}
