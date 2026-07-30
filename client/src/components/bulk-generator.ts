import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AEM_COMPONENTS, AemComponentDefinition, getComponentsByCategory } from '../lib/aem-components.js';
import { ContentSuggestion } from '../lib/types.js';
import { logger } from '../services/logger.js';

interface BulkItem {
  id: string;
  componentType: string;
  prompt: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  result?: ContentSuggestion;
  error?: string;
}

@customElement('bulk-generator')
export class BulkGenerator extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family-base, 'Adobe Clean', sans-serif);
    }

    .bulk-panel {
      background: var(--spectrum-gray-50, white);
      border: 1px solid var(--spectrum-gray-300);
      border-radius: 8px;
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: linear-gradient(135deg, var(--spectrum-blue-600) 0%, var(--spectrum-blue-700) 100%);
      color: white;
    }

    .panel-title {
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .panel-body {
      padding: 16px;
    }

    .context-input {
      margin-bottom: 16px;
    }

    .context-input label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--spectrum-gray-700);
      margin-bottom: 6px;
    }

    .context-input textarea {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--spectrum-gray-400);
      border-radius: 6px;
      font-size: 13px;
      resize: vertical;
      min-height: 60px;
    }

    .items-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .items-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--spectrum-gray-800);
    }

    .add-btn {
      padding: 6px 12px;
      background: var(--spectrum-blue-500);
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .add-btn:hover {
      background: var(--spectrum-blue-600);
    }

    .bulk-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 300px;
      overflow-y: auto;
    }

    .bulk-item {
      display: grid;
      grid-template-columns: 140px 1fr auto;
      gap: 8px;
      padding: 10px;
      background: var(--spectrum-gray-100);
      border-radius: 6px;
      align-items: center;
    }

    .bulk-item.generating {
      background: var(--spectrum-blue-100);
      border: 1px solid var(--spectrum-blue-300);
    }

    .bulk-item.complete {
      background: var(--spectrum-green-100);
      border: 1px solid var(--spectrum-green-300);
    }

    .bulk-item.error {
      background: var(--spectrum-red-100);
      border: 1px solid var(--spectrum-red-300);
    }

    .bulk-item select {
      padding: 6px 8px;
      border: 1px solid var(--spectrum-gray-400);
      border-radius: 4px;
      font-size: 12px;
    }

    .bulk-item input {
      padding: 6px 10px;
      border: 1px solid var(--spectrum-gray-400);
      border-radius: 4px;
      font-size: 12px;
    }

    .item-actions {
      display: flex;
      gap: 4px;
    }

    .item-btn {
      padding: 4px 8px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
      background: transparent;
    }

    .item-btn:hover {
      background: var(--spectrum-gray-200);
    }

    .item-btn.delete:hover {
      background: var(--spectrum-red-200);
    }

    .status-icon {
      font-size: 14px;
    }

    .actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--spectrum-gray-300);
    }

    .generate-btn {
      flex: 1;
      padding: 12px 20px;
      background: linear-gradient(135deg, var(--spectrum-green-500) 0%, var(--spectrum-green-600) 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .generate-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, var(--spectrum-green-600) 0%, var(--spectrum-green-700) 100%);
    }

    .generate-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .clear-btn {
      padding: 12px 20px;
      background: var(--spectrum-gray-200);
      color: var(--spectrum-gray-800);
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
    }

    .clear-btn:hover {
      background: var(--spectrum-gray-300);
    }

    .progress {
      margin-top: 12px;
      padding: 10px;
      background: var(--spectrum-blue-100);
      border-radius: 6px;
      font-size: 12px;
      color: var(--spectrum-blue-700);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background: var(--spectrum-gray-300);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--spectrum-blue-500);
      transition: width 0.3s ease;
    }

    .templates {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .template-chip {
      padding: 6px 12px;
      background: var(--spectrum-gray-200);
      border: none;
      border-radius: 16px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .template-chip:hover {
      background: var(--spectrum-blue-100);
      color: var(--spectrum-blue-700);
    }
  `;

  @property({ type: String }) agentUrl = 'http://localhost:10003';

  @state() private items: BulkItem[] = [];
  @state() private pageContext = '';
  @state() private isGenerating = false;
  @state() private progress = 0;

  private templates = [
    { name: 'Landing Page', items: ['hero', 'teaser', 'teaser', 'teaser', 'button'] },
    { name: 'Product Page', items: ['hero', 'product', 'tabs', 'teaser', 'button'] },
    { name: 'Blog Article', items: ['hero', 'text', 'image', 'text', 'teaser'] },
    { name: 'Contact Page', items: ['hero', 'text', 'form-container', 'teaser'] },
  ];

  render() {
    const completedCount = this.items.filter((i) => i.status === 'complete').length;

    return html`
      <div class="bulk-panel">
        <div class="panel-header">
          <span class="panel-title"> ⚡ Bulk Component Generator </span>
          <span>${this.items.length} components</span>
        </div>

        <div class="panel-body">
          <!-- Quick Templates -->
          <div class="templates">
            ${this.templates.map(
              (t) => html` <button class="template-chip" @click=${() => this.applyTemplate(t)}>${t.name}</button> `,
            )}
          </div>

          <!-- Page Context -->
          <div class="context-input">
            <label>Page Context (applied to all components)</label>
            <textarea
              placeholder="e.g., Summer sale landing page for outdoor furniture. Target audience: homeowners 30-50."
              .value=${this.pageContext}
              @input=${(e: Event) => (this.pageContext = (e.target as HTMLTextAreaElement).value)}
            ></textarea>
          </div>

          <!-- Items List -->
          <div class="items-header">
            <span class="items-title">Components to Generate</span>
            <button class="add-btn" @click=${this.addItem}>+ Add Component</button>
          </div>

          <div class="bulk-items">
            ${this.items.map(
              (item, index) => html`
                <div class="bulk-item ${item.status}">
                  <select
                    .value=${item.componentType}
                    @change=${(e: Event) => this.updateItem(index, 'componentType', (e.target as HTMLSelectElement).value)}
                    ?disabled=${item.status === 'generating'}
                  >
                    ${AEM_COMPONENTS.map((c) => html` <option value=${c.id}>${c.icon} ${c.name}</option> `)}
                  </select>
                  <input
                    type="text"
                    placeholder="Specific prompt (optional)"
                    .value=${item.prompt}
                    @input=${(e: Event) => this.updateItem(index, 'prompt', (e.target as HTMLInputElement).value)}
                    ?disabled=${item.status === 'generating'}
                  />
                  <div class="item-actions">
                    ${
                    item.status === 'pending'
                      ? html` <button class="item-btn delete" @click=${() => this.removeItem(index)}>🗑️</button> `
                      : item.status === 'generating'
                        ? html` <span class="status-icon">⏳</span> `
                        : item.status === 'complete'
                          ? html` <span class="status-icon">✅</span> `
                          : html` <span class="status-icon">❌</span> `
                  }
                  </div>
                </div>
              `,
            )}
          </div>

          ${
            this.isGenerating
              ? html`
                  <div class="progress">
                    <span>Generating ${completedCount}/${this.items.length}...</span>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${this.progress}%"></div>
                    </div>
                  </div>
                `
              : ''
          }

          <div class="actions">
            <button class="clear-btn" @click=${this.clearItems} ?disabled=${this.isGenerating}>Clear All</button>
            <button
              class="generate-btn"
              @click=${this.generateAll}
              ?disabled=${this.items.length === 0 || this.isGenerating}
            >
              ${this.isGenerating ? '⏳ Generating...' : '🚀 Generate All Components'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private addItem() {
    this.items = [
      ...this.items,
      {
        id: `item-${Date.now()}`,
        componentType: 'teaser',
        prompt: '',
        status: 'pending',
      },
    ];
  }

  private removeItem(index: number) {
    this.items = this.items.filter((_, i) => i !== index);
  }

  private updateItem(index: number, field: keyof BulkItem, value: string) {
    this.items = this.items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
  }

  private clearItems() {
    this.items = [];
    this.progress = 0;
  }

  private applyTemplate(template: { name: string; items: string[] }) {
    this.items = template.items.map((componentType, index) => ({
      id: `item-${Date.now()}-${index}`,
      componentType,
      prompt: '',
      status: 'pending' as const,
    }));
    logger.info(`Applied template: ${template.name}`, 'BulkGenerator');
  }

  private async generateAll() {
    if (this.items.length === 0) return;

    this.isGenerating = true;
    this.progress = 0;
    const results: ContentSuggestion[] = [];

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];

      // Update status to generating
      this.items = this.items.map((it, idx) => (idx === i ? { ...it, status: 'generating' as const } : it));

      try {
        const prompt = this.buildPrompt(item);
        const result = await this.generateComponent(prompt, item.componentType);

        // Update with result
        this.items = this.items.map((it, idx) => (idx === i ? { ...it, status: 'complete' as const, result } : it));
        results.push(result);
      } catch (error) {
        this.items = this.items.map((it, idx) =>
          idx === i ? { ...it, status: 'error' as const, error: String(error) } : it,
        );
        logger.error(`Failed to generate ${item.componentType}`, 'BulkGenerator', error);
      }

      this.progress = ((i + 1) / this.items.length) * 100;
    }

    this.isGenerating = false;

    // Dispatch event with all results
    this.dispatchEvent(
      new CustomEvent('bulk-complete', {
        detail: { results, items: this.items },
        bubbles: true,
        composed: true,
      }),
    );

    logger.info(`Bulk generation complete: ${results.length}/${this.items.length} succeeded`, 'BulkGenerator');
  }

  private buildPrompt(item: BulkItem): string {
    const componentDef = AEM_COMPONENTS.find((c) => c.id === item.componentType);
    const componentName = componentDef?.name || item.componentType;

    let prompt = `Create a ${componentName} component`;

    if (this.pageContext) {
      prompt += ` for: ${this.pageContext}`;
    }

    if (item.prompt) {
      prompt += `. ${item.prompt}`;
    }

    return prompt;
  }

  private async generateComponent(prompt: string, componentType: string): Promise<ContentSuggestion> {
    const response = await fetch(`${this.agentUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          role: 'user',
          parts: [{ text: prompt }],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Extract first suggestion or create mock
    const suggestion: ContentSuggestion = {
      id: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: data.artifacts?.[0]?.parts?.[0]?.data?.title || 'Generated Title',
      description: data.artifacts?.[0]?.parts?.[0]?.data?.description || 'Generated description for this component.',
      ctaText: data.artifacts?.[0]?.parts?.[0]?.data?.ctaText || 'Learn More',
      ctaUrl: data.artifacts?.[0]?.parts?.[0]?.data?.ctaUrl || '#',
      imageUrl:
        data.artifacts?.[0]?.parts?.[0]?.data?.imageUrl ||
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      componentType,
    };

    return suggestion;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'bulk-generator': BulkGenerator;
  }
}
