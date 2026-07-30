import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ContentSuggestion } from '../lib/types.js';
import { api } from '../services/api.js';
import { appState } from '../services/app-state.js';
import { contentLogger } from '../services/logger.js';
import { errorHandler } from '../services/error-handler.js';

// Component types organized by category
const COMPONENT_CATEGORIES = [
  {
    id: 'popular',
    name: 'Popular',
    types: [
      { id: 'hero', name: 'Hero Banner', icon: '🖼️', description: 'Full-width hero section' },
      { id: 'teaser', name: 'Teaser', icon: '📰', description: 'Content preview card' },
      { id: 'product', name: 'Product Card', icon: '🛍️', description: 'Product showcase' },
      { id: 'cta', name: 'Call to Action', icon: '🎯', description: 'Conversion focused' },
    ],
  },
  {
    id: 'marketing',
    name: 'Marketing',
    types: [
      { id: 'banner', name: 'Promo Banner', icon: '📢', description: 'Promotional messaging' },
      { id: 'carousel', name: 'Carousel', icon: '🎠', description: 'Sliding content' },
      { id: 'quote', name: 'Testimonial', icon: '💬', description: 'Customer quotes' },
    ],
  },
  {
    id: 'layout',
    name: 'Layout',
    types: [
      { id: 'navigation', name: 'Navigation', icon: '🧭', description: 'Site navigation' },
      { id: 'footer', name: 'Footer', icon: '📋', description: 'Page footer' },
      { id: 'accordion', name: 'Accordion', icon: '📑', description: 'Expandable sections' },
      { id: 'tabs', name: 'Tabs', icon: '📂', description: 'Tabbed content' },
    ],
  },
];

const QUICK_PROMPTS = [
  'Hero banner for summer sale',
  'Product card for new laptop',
  'Testimonial from happy customer',
  'CTA for newsletter signup',
  'Teaser for blog article',
];

@customElement('content-creator')
export class ContentCreator extends LitElement {
  @property({ type: String }) agentUrl = 'http://localhost:10003';

  @state() private prompt = '';
  @state() private selectedType = '';
  @state() private loading = false;
  @state() private showTypeSelector = false;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      overflow-y: auto;
    }

    .creator {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    /* Input Section */
    .input-section {
      background: var(--spectrum-gray-50, white);
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    }

    .input-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .input-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--spectrum-gray-900, #1a1a1a);
    }

    .ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-size: 10px;
      font-weight: 600;
      border-radius: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .input-wrapper {
      display: flex;
      gap: 12px;
      margin-bottom: 16px;
    }

    .prompt-input {
      flex: 1;
      padding: 14px 16px;
      font-size: 15px;
      border: 2px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 8px;
      outline: none;
      transition: border-color 0.2s;
    }

    .prompt-input:focus {
      border-color: var(--spectrum-accent-color-default, #1473e6);
    }

    .prompt-input::placeholder {
      color: var(--spectrum-gray-500, #999);
    }

    .type-selector-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 16px;
      background: var(--spectrum-gray-100, #f5f5f5);
      border: 2px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      color: var(--spectrum-gray-800, #333);
      transition: all 0.2s;
      white-space: nowrap;
    }

    .type-selector-btn:hover {
      border-color: var(--spectrum-accent-color-default, #1473e6);
      background: var(--spectrum-gray-50, white);
    }

    .type-selector-btn.has-selection {
      background: var(--spectrum-blue-100, #e6f2ff);
      border-color: var(--spectrum-accent-color-default, #1473e6);
      color: var(--spectrum-accent-color-default, #1473e6);
    }

    .generate-btn {
      padding: 14px 28px;
      background: var(--spectrum-accent-color-default, #1473e6);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .generate-btn:hover:not(:disabled) {
      background: var(--spectrum-accent-color-hover, #0d66d0);
      transform: translateY(-1px);
    }

    .generate-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .generate-btn .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    /* Quick Prompts */
    .quick-prompts {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .quick-prompt-label {
      font-size: 12px;
      color: var(--spectrum-gray-600, #666);
      margin-right: 8px;
    }

    .quick-prompt {
      padding: 6px 12px;
      background: var(--spectrum-gray-100, #f5f5f5);
      border: 1px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 16px;
      font-size: 12px;
      color: var(--spectrum-gray-700, #555);
      cursor: pointer;
      transition: all 0.2s;
    }

    .quick-prompt:hover {
      background: var(--spectrum-blue-100, #e6f2ff);
      border-color: var(--spectrum-accent-color-default, #1473e6);
      color: var(--spectrum-accent-color-default, #1473e6);
    }

    /* Type Selector Dropdown */
    .type-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--spectrum-gray-50, white);
      border: 1px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      z-index: 100;
      margin-top: 8px;
      padding: 16px;
      max-height: 400px;
      overflow-y: auto;
    }

    .type-category {
      margin-bottom: 16px;
    }

    .type-category:last-child {
      margin-bottom: 0;
    }

    .type-category-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--spectrum-gray-600, #666);
      margin: 0 0 8px 0;
    }

    .type-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }

    .type-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      background: var(--spectrum-gray-100, #f5f5f5);
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .type-option:hover {
      background: var(--spectrum-blue-100, #e6f2ff);
      border-color: var(--spectrum-blue-300, #b3d4fc);
    }

    .type-option.selected {
      background: var(--spectrum-blue-100, #e6f2ff);
      border-color: var(--spectrum-accent-color-default, #1473e6);
    }

    .type-icon {
      font-size: 20px;
    }

    .type-info {
      flex: 1;
      min-width: 0;
    }

    .type-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--spectrum-gray-900, #1a1a1a);
    }

    .type-desc {
      font-size: 11px;
      color: var(--spectrum-gray-600, #666);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Relative positioning for dropdown */
    .input-wrapper {
      position: relative;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--spectrum-gray-600, #666);
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--spectrum-gray-800, #333);
      margin: 0 0 8px 0;
    }

    .empty-text {
      font-size: 14px;
      margin: 0;
    }
  `;

  render() {
    return html`
      <div class="creator">
        <div class="input-section">
          <div class="input-header">
            <h2>What would you like to create?</h2>
            <span class="ai-badge">✨ AI Powered</span>
          </div>

          <div class="input-wrapper">
            <input
              class="prompt-input"
              type="text"
              placeholder="Describe your content... e.g., 'Hero banner for summer sale with urgency'"
              .value=${this.prompt}
              @input=${this.handlePromptInput}
              @keydown=${this.handleKeyDown}
            />

            <button
              class="type-selector-btn ${this.selectedType ? 'has-selection' : ''}"
              @click=${this.toggleTypeSelector}
            >
              ${this.selectedType ? this.getTypeDisplay(this.selectedType) : html`<span>📦</span> Component`}
              <span>▼</span>
            </button>

            <button class="generate-btn" ?disabled=${!this.prompt.trim() || this.loading} @click=${this.generate}>
              ${this.loading ? html`<span class="spinner"></span> Generating...` : html`Generate ✨`}
            </button>

            ${this.showTypeSelector ? this.renderTypeDropdown() : ''}
          </div>

          <div class="quick-prompts">
            <span class="quick-prompt-label">Try:</span>
            ${QUICK_PROMPTS.map(
              (prompt) => html`
                <button class="quick-prompt" @click=${() => this.useQuickPrompt(prompt)}>${prompt}</button>
              `,
            )}
          </div>
        </div>

        ${this.renderEmptyState()}
      </div>
    `;
  }

  private renderTypeDropdown() {
    return html`
      <div class="type-dropdown">
        ${COMPONENT_CATEGORIES.map(
          (category) => html`
            <div class="type-category">
              <h4 class="type-category-title">${category.name}</h4>
              <div class="type-grid">
                ${category.types.map(
                  (type) => html`
                    <div
                      class="type-option ${this.selectedType === type.id ? 'selected' : ''}"
                      @click=${() => this.selectType(type.id)}
                    >
                      <span class="type-icon">${type.icon}</span>
                      <div class="type-info">
                        <div class="type-name">${type.name}</div>
                        <div class="type-desc">${type.description}</div>
                      </div>
                    </div>
                  `,
                )}
              </div>
            </div>
          `,
        )}
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <div class="empty-icon">✨</div>
        <h3 class="empty-title">Ready to create</h3>
        <p class="empty-text">Describe your content above or select a component type to get started.</p>
      </div>
    `;
  }

  private getTypeDisplay(typeId: string) {
    for (const category of COMPONENT_CATEGORIES) {
      const type = category.types.find((t) => t.id === typeId);
      if (type) {
        return html`<span>${type.icon}</span> ${type.name}`;
      }
    }
    return html`<span>📦</span> ${typeId}`;
  }

  private handlePromptInput(e: Event) {
    this.prompt = (e.target as HTMLInputElement).value;
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey && this.prompt.trim()) {
      e.preventDefault();
      this.generate();
    }
  }

  private toggleTypeSelector() {
    this.showTypeSelector = !this.showTypeSelector;
  }

  private selectType(typeId: string) {
    this.selectedType = typeId;
    this.showTypeSelector = false;
  }

  private useQuickPrompt(prompt: string) {
    this.prompt = prompt;
    // Auto-detect type from prompt
    const type = this.detectType(prompt);
    if (type) {
      this.selectedType = type;
    }
  }

  private detectType(prompt: string): string {
    const lower = prompt.toLowerCase();
    if (lower.includes('hero')) return 'hero';
    if (lower.includes('product')) return 'product';
    if (lower.includes('teaser')) return 'teaser';
    if (lower.includes('cta') || lower.includes('call to action')) return 'cta';
    if (lower.includes('banner') || lower.includes('promo')) return 'banner';
    if (lower.includes('testimonial') || lower.includes('quote')) return 'quote';
    return '';
  }

  private async generate() {
    if (!this.prompt.trim() || this.loading) return;

    this.loading = true;
    contentLogger.info('Starting content generation', { prompt: this.prompt, type: this.selectedType });

    // Update global state
    appState.startGeneration(this.prompt);

    try {
      const response = this.selectedType
        ? await api.generateAdvancedContent(this.prompt, this.selectedType)
        : await api.generateContent(this.prompt);

      contentLogger.info('Generation complete', response);

      // Parse and emit suggestions
      const suggestions = this.parseResponse(response);

      this.dispatchEvent(
        new CustomEvent('content-generated', {
          detail: { suggestions },
          bubbles: true,
          composed: true,
        }),
      );

      // Update global state
      appState.completeGeneration(suggestions);
    } catch (error) {
      const appError = errorHandler.handle(error, 'ContentGeneration');
      appState.failGeneration(appError.userMessage);

      this.dispatchEvent(
        new CustomEvent('generation-error', {
          detail: { error: appError },
          bubbles: true,
          composed: true,
        }),
      );
    } finally {
      this.loading = false;
    }
  }

  private parseResponse(data: unknown): ContentSuggestion[] {
    // Basic parsing - can be extended
    const response = data as { artifacts?: Array<{ parts?: Array<{ data?: unknown }> }> };
    const suggestions: ContentSuggestion[] = [];

    if (response.artifacts) {
      for (const artifact of response.artifacts) {
        if (artifact.parts) {
          for (const part of artifact.parts) {
            if (part.data) {
              try {
                const parsed = typeof part.data === 'string' ? JSON.parse(part.data) : part.data;
                if (parsed.title) {
                  suggestions.push({
                    id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    componentType: this.selectedType || 'hero',
                    ...parsed,
                  });
                }
              } catch {
                // Skip invalid data
              }
            }
          }
        }
      }
    }

    // If no suggestions found, create mock for demo
    if (suggestions.length === 0) {
      suggestions.push(this.createMockSuggestion('1'), this.createMockSuggestion('2'), this.createMockSuggestion('3'));
    }

    return suggestions;
  }

  private createMockSuggestion(variant: string): ContentSuggestion {
    const type = this.selectedType || 'hero';
    const variations: Record<string, Partial<ContentSuggestion>> = {
      '1': { title: 'Unleash Your Potential', subtitle: 'Innovation Awaits' },
      '2': { title: 'Experience Excellence', subtitle: 'Quality Redefined' },
      '3': { title: 'Transform Today', subtitle: 'Future Ready' },
    };

    const base = variations[variant] || variations['1'];
    return {
      id: `mock-${variant}-${Date.now()}`,
      title: base.title!,
      subtitle: base.subtitle,
      description: 'Discover innovative solutions designed to transform your digital experience.',
      ctaText: 'Get Started',
      ctaUrl: '#',
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      componentType: type,
    };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'content-creator': ContentCreator;
  }
}
