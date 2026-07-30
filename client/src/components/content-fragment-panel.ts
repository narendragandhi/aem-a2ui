import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ContentSuggestion } from '../lib/types.js';
import {
  CF_MODELS,
  ContentFragmentModel,
  contentToFragment,
  fragmentToJcr,
  fragmentToGraphQL,
  generateModelDefinition,
} from '../lib/aem-content-fragments.js';
import { logger } from '../services/logger.js';

@customElement('content-fragment-panel')
export class ContentFragmentPanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family-base, 'Adobe Clean', sans-serif);
    }

    .cf-panel {
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
      background: linear-gradient(135deg, var(--spectrum-purple-600) 0%, var(--spectrum-purple-700) 100%);
      color: white;
    }

    .panel-title {
      font-size: 14px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .panel-body {
      padding: 16px;
    }

    .model-selector {
      margin-bottom: 16px;
    }

    .model-selector label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--spectrum-gray-700);
      margin-bottom: 6px;
    }

    .model-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .model-card {
      padding: 10px;
      border: 2px solid var(--spectrum-gray-300);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
      text-align: center;
    }

    .model-card:hover {
      border-color: var(--spectrum-purple-400);
      background: var(--spectrum-purple-50);
    }

    .model-card.selected {
      border-color: var(--spectrum-purple-600);
      background: var(--spectrum-purple-100);
    }

    .model-card-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .model-card-name {
      font-size: 11px;
      font-weight: 600;
      color: var(--spectrum-gray-800);
    }

    .variations-input {
      margin-bottom: 16px;
    }

    .variations-input label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--spectrum-gray-700);
      margin-bottom: 6px;
    }

    .variations-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .variation-chip {
      padding: 4px 10px;
      background: var(--spectrum-gray-200);
      border: none;
      border-radius: 12px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .variation-chip:hover {
      background: var(--spectrum-gray-300);
    }

    .variation-chip.selected {
      background: var(--spectrum-purple-500);
      color: white;
    }

    .export-tabs {
      display: flex;
      border-bottom: 1px solid var(--spectrum-gray-300);
      margin-bottom: 12px;
    }

    .export-tab {
      flex: 1;
      padding: 8px;
      border: none;
      background: transparent;
      font-size: 11px;
      font-weight: 500;
      color: var(--spectrum-gray-700);
      cursor: pointer;
      transition: all 0.15s;
    }

    .export-tab:hover {
      background: var(--spectrum-gray-100);
    }

    .export-tab.active {
      color: var(--spectrum-purple-600);
      border-bottom: 2px solid var(--spectrum-purple-600);
      margin-bottom: -1px;
    }

    .code-block {
      background: var(--spectrum-gray-800);
      border-radius: 6px;
      padding: 12px;
      overflow-x: auto;
      max-height: 200px;
      overflow-y: auto;
    }

    .code-block pre {
      margin: 0;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 11px;
      line-height: 1.4;
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
      padding: 8px 12px;
      border-radius: 6px;
      border: none;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .action-btn.primary {
      background: var(--spectrum-purple-500);
      color: white;
    }

    .action-btn.primary:hover {
      background: var(--spectrum-purple-600);
    }

    .action-btn.secondary {
      background: var(--spectrum-gray-200);
      color: var(--spectrum-gray-800);
    }

    .action-btn.secondary:hover {
      background: var(--spectrum-gray-300);
    }

    .field-preview {
      margin-top: 12px;
      padding: 12px;
      background: var(--spectrum-gray-100);
      border-radius: 6px;
    }

    .field-preview-title {
      font-size: 11px;
      font-weight: 600;
      color: var(--spectrum-gray-600);
      margin-bottom: 8px;
    }

    .field-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 11px;
      border-bottom: 1px solid var(--spectrum-gray-200);
    }

    .field-row:last-child {
      border-bottom: none;
    }

    .field-name {
      color: var(--spectrum-gray-700);
    }

    .field-value {
      color: var(--spectrum-gray-900);
      font-weight: 500;
      max-width: 60%;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: var(--spectrum-gray-600);
      font-size: 13px;
    }
  `;

  @property({ type: Object }) content: ContentSuggestion | null = null;
  @property({ type: String }) agentUrl = 'http://localhost:10003';
  @property({ type: String }) aemUrl = 'http://localhost:4502';
  @property({ type: Boolean }) aemConnected = false;

  @state() private selectedModel: string = 'hero';
  @state() private selectedVariations: string[] = [];
  @state() private activeTab: 'jcr' | 'graphql' | 'model' = 'jcr';
  @state() private copied = false;
  @state() private deployStatus: 'idle' | 'saving' | 'updating' | 'success' | 'error' = 'idle';
  @state() private deployMessage = '';
  @state() private savedPath: string | null = null;

  private variationOptions = ['Mobile', 'Tablet', 'Holiday', 'Sale', 'A/B Test'];
  private modelIcons: Record<string, string> = {
    article: '📰',
    product: '🛒',
    hero: '🎯',
    testimonial: '💬',
    faq: '❓',
    'team-member': '👤',
  };

  render() {
    if (!this.content) {
      return html`
        <div class="cf-panel">
          <div class="panel-header">
            <span class="panel-title">📦 Content Fragment</span>
          </div>
          <div class="empty-state">Select content to export as Content Fragment</div>
        </div>
      `;
    }

    const fragment = contentToFragment(this.content, this.selectedModel, {
      variations: this.selectedVariations,
    });

    return html`
      <div class="cf-panel">
        <div class="panel-header">
          <span class="panel-title"> 📦 Content Fragment Export </span>
        </div>

        <div class="panel-body">
          <!-- Model Selection -->
          <div class="model-selector">
            <label>Fragment Model</label>
            <div class="model-grid">
              ${CF_MODELS.map(
                (model) => html`
                  <div
                    class="model-card ${this.selectedModel === model.id ? 'selected' : ''}"
                    @click=${() => (this.selectedModel = model.id)}
                  >
                    <div class="model-card-icon">${this.modelIcons[model.id] || '📄'}</div>
                    <div class="model-card-name">${model.name}</div>
                  </div>
                `,
              )}
            </div>
          </div>

          <!-- Variations -->
          <div class="variations-input">
            <label>Content Variations (optional)</label>
            <div class="variations-chips">
              ${this.variationOptions.map(
                (v) => html`
                  <button
                    class="variation-chip ${this.selectedVariations.includes(v) ? 'selected' : ''}"
                    @click=${() => this.toggleVariation(v)}
                  >
                    ${v}
                  </button>
                `,
              )}
            </div>
          </div>

          <!-- Field Preview -->
          <div class="field-preview">
            <div class="field-preview-title">Mapped Fields</div>
            ${Object.entries(fragment.data)
              .slice(0, 5)
              .map(
                ([key, value]) => html`
                  <div class="field-row">
                    <span class="field-name">${key}</span>
                    <span class="field-value">${this.formatValue(value)}</span>
                  </div>
                `,
              )}
          </div>

          <!-- Export Tabs -->
          <div class="export-tabs">
            <button
              class="export-tab ${this.activeTab === 'jcr' ? 'active' : ''}"
              @click=${() => (this.activeTab = 'jcr')}
            >
              JCR JSON
            </button>
            <button
              class="export-tab ${this.activeTab === 'graphql' ? 'active' : ''}"
              @click=${() => (this.activeTab = 'graphql')}
            >
              GraphQL
            </button>
            <button
              class="export-tab ${this.activeTab === 'model' ? 'active' : ''}"
              @click=${() => (this.activeTab = 'model')}
            >
              Model Def
            </button>
          </div>

          <div class="code-block">
            <pre>${this.getExportCode()}</pre>
          </div>

          <div class="actions">
            <button class="action-btn secondary" @click=${this.copyToClipboard}>
              ${this.copied ? '✓ Copied!' : '📋 Copy'}
            </button>
            <button class="action-btn primary" @click=${this.downloadFile}>⬇️ Download</button>
            <button
              class="action-btn primary"
              ?disabled=${!this.aemConnected || this.deployStatus === 'saving'}
              @click=${this.saveToAem}
            >
              ${this.deployStatus === 'saving' ? '⏳ Saving...' : 'Save to AEM'}
            </button>
            <button
              class="action-btn secondary"
              ?disabled=${!this.aemConnected || !this.savedPath || this.deployStatus === 'updating'}
              @click=${this.updateInAem}
            >
              ${this.deployStatus === 'updating' ? '⏳ Updating...' : 'Update in AEM'}
            </button>
          </div>
          ${
            this.deployStatus !== 'idle'
              ? html`
                  <div class="field-preview" style="margin-top: 12px;">
                    <div class="field-preview-title">
                      ${this.deployStatus === 'success' ? '✓' : this.deployStatus === 'error' ? '✗' : 'ℹ️'}
                      ${this.deployMessage}
                    </div>
                    ${this.savedPath ? html`<div class="field-row"><span class="field-name">Path</span><span class="field-value">${this.savedPath}</span></div>` : ''}
                  </div>
                `
              : ''
          }
        </div>
      </div>
    `;
  }

  private toggleVariation(variation: string) {
    if (this.selectedVariations.includes(variation)) {
      this.selectedVariations = this.selectedVariations.filter((v) => v !== variation);
    } else {
      this.selectedVariations = [...this.selectedVariations, variation];
    }
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'object') {
      if ('path' in (value as Record<string, unknown>)) {
        return (value as { path: string }).path;
      }
      return JSON.stringify(value).substring(0, 30) + '...';
    }
    const str = String(value);
    return str.length > 40 ? str.substring(0, 40) + '...' : str;
  }

  private getExportCode(): string {
    if (!this.content) return '';

    const fragment = contentToFragment(this.content, this.selectedModel, {
      variations: this.selectedVariations,
    });

    switch (this.activeTab) {
      case 'jcr':
        return JSON.stringify(fragmentToJcr(fragment), null, 2);
      case 'graphql':
        return JSON.stringify(fragmentToGraphQL(fragment, this.selectedModel), null, 2);
      case 'model':
        const model = CF_MODELS.find((m) => m.id === this.selectedModel);
        return model ? JSON.stringify(generateModelDefinition(model), null, 2) : '';
      default:
        return '';
    }
  }

  private async copyToClipboard() {
    try {
      await navigator.clipboard.writeText(this.getExportCode());
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
      logger.info('Copied Content Fragment to clipboard', 'ContentFragment');
    } catch (err) {
      logger.error('Failed to copy', 'ContentFragment', err);
    }
  }

  private downloadFile() {
    const code = this.getExportCode();
    const filename = this.getFilename();

    const blob = new Blob([code], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    logger.info(`Downloaded ${filename}`, 'ContentFragment');
  }

  private getFilename(): string {
    const baseName = this.content?.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'fragment';
    switch (this.activeTab) {
      case 'jcr':
        return `${baseName}.cf.json`;
      case 'graphql':
        return `${baseName}.graphql.json`;
      case 'model':
        return `${this.selectedModel}-model.json`;
      default:
        return `${baseName}.json`;
    }
  }

  private async saveToAem() {
    if (!this.content || !this.aemConnected) return;
    const model = CF_MODELS.find((m) => m.id === this.selectedModel);
    const fragment = contentToFragment(this.content, this.selectedModel, {
      variations: this.selectedVariations,
    });

    this.deployStatus = 'saving';
    this.deployMessage = 'Saving Content Fragment to AEM...';

    try {
      const response = await fetch(`${this.agentUrl}/aem/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'fragment',
          name: this.content.title || 'fragment',
          folder: '/content/dam/aem-demo/generated',
          model: model?.modelPath,
          properties: fragment.data,
          content: this.content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.savedPath = data.path;
        this.deployStatus = 'success';
        this.deployMessage = 'Saved successfully';
        logger.info('Saved Content Fragment to AEM', 'ContentFragment', data);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      this.deployStatus = 'error';
      this.deployMessage = `Save failed: ${err}`;
      logger.error('Failed to save Content Fragment', 'ContentFragment', err);
    }
  }

  private async updateInAem() {
    if (!this.content || !this.aemConnected || !this.savedPath) return;
    const fragment = contentToFragment(this.content, this.selectedModel, {
      variations: this.selectedVariations,
    });

    this.deployStatus = 'updating';
    this.deployMessage = 'Updating Content Fragment in AEM...';

    try {
      const response = await fetch(`${this.agentUrl}/aem/content/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'fragment',
          path: this.savedPath,
          properties: fragment.data,
          content: this.content,
        }),
      });

      if (response.ok) {
        this.deployStatus = 'success';
        this.deployMessage = 'Updated successfully';
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err) {
      this.deployStatus = 'error';
      this.deployMessage = `Update failed: ${err}`;
      logger.error('Failed to update Content Fragment', 'ContentFragment', err);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'content-fragment-panel': ContentFragmentPanel;
  }
}
