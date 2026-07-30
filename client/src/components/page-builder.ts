import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { ContentSuggestion } from '../lib/types.js';

interface PageSection {
  id: string;
  type: string;
  content: ContentSuggestion | null;
  status: 'empty' | 'generating' | 'ready';
}

// Page templates for quick start
const PAGE_TEMPLATES = [
  {
    id: 'landing',
    name: 'Landing Page',
    icon: '🚀',
    sections: ['navigation', 'hero', 'teaser', 'teaser', 'teaser', 'cta', 'footer'],
  },
  {
    id: 'product',
    name: 'Product Page',
    icon: '🛍️',
    sections: ['navigation', 'hero', 'product', 'tabs', 'quote', 'cta', 'footer'],
  },
  {
    id: 'blog',
    name: 'Blog Article',
    icon: '📝',
    sections: ['navigation', 'hero', 'teaser', 'accordion', 'socialShare', 'footer'],
  },
  {
    id: 'custom',
    name: 'Custom Page',
    icon: '✨',
    sections: [],
  },
];

const COMPONENT_OPTIONS = [
  { id: 'navigation', name: 'Navigation', icon: '☰' },
  { id: 'hero', name: 'Hero Banner', icon: '🖼️' },
  { id: 'teaser', name: 'Teaser', icon: '📰' },
  { id: 'product', name: 'Product Card', icon: '🛒' },
  { id: 'banner', name: 'Promo Banner', icon: '🎯' },
  { id: 'carousel', name: 'Carousel', icon: '🎠' },
  { id: 'quote', name: 'Testimonial', icon: '💬' },
  { id: 'accordion', name: 'Accordion', icon: '📂' },
  { id: 'tabs', name: 'Tabs', icon: '📋' },
  { id: 'video', name: 'Video', icon: '🎬' },
  { id: 'gallery', name: 'Gallery', icon: '🖼️' },
  { id: 'form', name: 'Form', icon: '📝' },
  { id: 'cta', name: 'Call to Action', icon: '📢' },
  { id: 'team', name: 'Team Grid', icon: '👥' },
  { id: 'pricing', name: 'Pricing', icon: '💰' },
  { id: 'socialShare', name: 'Social Share', icon: '🔗' },
  { id: 'footer', name: 'Footer', icon: '📄' },
];

@customElement('page-builder')
export class PageBuilder extends LitElement {
  @state() private sections: PageSection[] = [];
  @state() private selectedTemplate: string | null = null;
  @state() private draggedIndex: number | null = null;
  @state() private dragOverIndex: number | null = null;
  @state() private showAddMenu = false;
  @state() private generating = false;
  @state() private pageDescription = '';

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .page-builder {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--spectrum-gray-100, #f5f5f5);
    }

    /* Template Selection */
    .template-selection {
      padding: 24px;
      text-align: center;
    }

    .template-title {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--spectrum-gray-900, #1a1a1a);
    }

    .template-subtitle {
      font-size: 14px;
      color: var(--spectrum-gray-600, #6e6e6e);
      margin-bottom: 24px;
    }

    .template-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      max-width: 800px;
      margin: 0 auto;
    }

    .template-card {
      background: white;
      border: 2px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }

    .template-card:hover {
      border-color: var(--spectrum-accent-color-default, #1473e6);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .template-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }

    .template-name {
      font-weight: 600;
      color: var(--spectrum-gray-900, #1a1a1a);
      margin-bottom: 4px;
    }

    .template-count {
      font-size: 12px;
      color: var(--spectrum-gray-600, #6e6e6e);
    }

    /* Builder View */
    .builder-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .builder-header {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 16px;
      padding: 12px 24px;
      background: white;
      border-bottom: 1px solid var(--spectrum-gray-300, #e0e0e0);
    }

    .builder-title {
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .generate-progress {
      font-size: 12px;
      color: var(--spectrum-gray-600, #6e6e6e);
      text-align: center;
    }

    .section-count {
      background: var(--spectrum-accent-color-default, #1473e6);
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
    }

    .builder-actions {
      display: flex;
      gap: 8px;
      justify-self: end;
    }

    /* Page Description */
    .page-description {
      padding: 16px 24px;
      background: var(--spectrum-gray-50, white);
      border-bottom: 1px solid var(--spectrum-gray-200, #e8e8e8);
    }

    .page-description label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--spectrum-gray-700, #666);
      margin-bottom: 8px;
    }

    .page-description input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 6px;
      font-size: 14px;
    }

    .page-description input:focus {
      outline: none;
      border-color: var(--spectrum-accent-color-default, #1473e6);
      box-shadow: 0 0 0 3px rgba(20, 115, 230, 0.1);
    }

    /* Sections List */
    .sections-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px 24px;
    }

    .section-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: white;
      border: 2px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: grab;
      transition: all 0.2s;
    }

    .section-item:active {
      cursor: grabbing;
    }

    .section-item.dragging {
      opacity: 0.5;
      border-style: dashed;
    }

    .section-item.drag-over {
      border-color: var(--spectrum-accent-color-default, #1473e6);
      background: var(--spectrum-accent-background-color-hover, #e5f0ff);
    }

    .section-item.generating {
      border-color: var(--spectrum-notice-color-default, #d97706);
      background: var(--spectrum-notice-background-color-hover, #fef3c7);
    }

    .section-item.ready {
      border-color: var(--spectrum-positive-color-default, #16a34a);
    }

    .drag-handle {
      color: var(--spectrum-gray-500, #999);
      font-size: 16px;
      cursor: grab;
    }

    .section-icon {
      width: 36px;
      height: 36px;
      background: var(--spectrum-gray-200, #f0f0f0);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .section-info {
      flex: 1;
    }

    .section-type {
      font-weight: 600;
      color: var(--spectrum-gray-900, #1a1a1a);
      font-size: 14px;
    }

    .section-status {
      font-size: 12px;
      color: var(--spectrum-gray-600, #6e6e6e);
    }

    .section-status.generating {
      color: var(--spectrum-notice-color-default, #d97706);
    }

    .section-status.ready {
      color: var(--spectrum-positive-color-default, #16a34a);
    }

    .section-actions {
      display: flex;
      gap: 4px;
    }

    .section-btn {
      width: 28px;
      height: 28px;
      border: none;
      background: var(--spectrum-gray-200, #f0f0f0);
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .section-btn:hover {
      background: var(--spectrum-gray-300, #e0e0e0);
    }

    .section-btn.delete:hover {
      background: var(--spectrum-negative-background-color-hover, #fee2e2);
      color: var(--spectrum-negative-color-default, #dc2626);
    }

    /* Add Section */
    .add-section {
      position: relative;
      margin-top: 8px;
    }

    .add-section-btn {
      width: 100%;
      padding: 12px;
      border: 2px dashed var(--spectrum-gray-300, #e0e0e0);
      border-radius: 8px;
      background: transparent;
      color: var(--spectrum-gray-600, #6e6e6e);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .add-section-btn:hover {
      border-color: var(--spectrum-accent-color-default, #1473e6);
      color: var(--spectrum-accent-color-default, #1473e6);
      background: var(--spectrum-accent-background-color-hover, #e5f0ff);
    }

    .add-menu {
      position: absolute;
      bottom: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      padding: 8px;
      margin-bottom: 8px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 4px;
      max-height: 300px;
      overflow-y: auto;
      z-index: 100;
    }

    .add-menu-item {
      padding: 8px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
    }

    .add-menu-item:hover {
      background: var(--spectrum-accent-background-color-hover, #e5f0ff);
    }

    .add-menu-item-icon {
      font-size: 20px;
      margin-bottom: 4px;
    }

    .add-menu-item-name {
      font-size: 11px;
      color: var(--spectrum-gray-700, #666);
    }

    /* Generate Button */

    .generate-btn {
      padding: 8px 16px;
      background: linear-gradient(135deg, var(--spectrum-accent-color-default, #1473e6) 0%, #0d66d0 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .generate-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(20, 115, 230, 0.3);
    }

    .generate-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .generate-progress {
      font-size: 12px;
      color: var(--spectrum-gray-600, #6e6e6e);
      text-align: center;
      margin-top: 8px;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--spectrum-gray-600, #6e6e6e);
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    /* Responsive Styles */
    @media (max-width: 1024px) {
      .template-grid {
        grid-template-columns: repeat(2, 1fr);
        max-width: 500px;
      }

      .add-menu {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 768px) {
      .template-selection {
        padding: 16px;
      }

      .template-title {
        font-size: 18px;
      }

      .template-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      .template-card {
        padding: 16px;
      }

      .template-icon {
        font-size: 28px;
      }

      .builder-header {
        flex-direction: column;
        gap: 12px;
        align-items: flex-start;
        padding: 12px 16px;
      }

      .builder-actions {
        width: 100%;
      }

      .builder-actions sp-button {
        width: 100%;
      }

      .page-description {
        padding: 12px 16px;
      }

      .sections-list {
        padding: 12px 16px;
      }

      .section-item {
        padding: 12px;
        gap: 8px;
      }

      .section-icon {
        width: 32px;
        height: 32px;
        font-size: 16px;
      }

      .add-menu {
        grid-template-columns: repeat(2, 1fr);
      }

      .generate-section {
        padding: 12px 16px;
      }
    }

    @media (max-width: 480px) {
      .template-selection {
        padding: 12px;
      }

      .template-grid {
        grid-template-columns: 1fr;
        max-width: 100%;
      }

      .template-card {
        display: flex;
        align-items: center;
        gap: 12px;
        text-align: left;
        padding: 12px 16px;
      }

      .template-icon {
        font-size: 24px;
        margin-bottom: 0;
      }

      .template-info {
        flex: 1;
      }

      .section-actions {
        flex-wrap: wrap;
        gap: 2px;
      }

      .section-btn {
        width: 24px;
        height: 24px;
        font-size: 10px;
      }

      .drag-handle {
        display: none;
      }

      .add-menu {
        grid-template-columns: repeat(2, 1fr);
        padding: 6px;
        gap: 2px;
      }

      .add-menu-item {
        padding: 6px;
      }

      .add-menu-item-icon {
        font-size: 18px;
      }

      .add-menu-item-name {
        font-size: 10px;
      }

      .generate-btn {
        padding: 12px;
        font-size: 14px;
      }
    }
  `;

  render() {
    if (!this.selectedTemplate) {
      return this.renderTemplateSelection();
    }
    return this.renderBuilder();
  }

  private renderTemplateSelection() {
    return html`
      <div class="page-builder">
        <div class="template-selection">
          <h2 class="template-title">Build a Complete Page</h2>
          <p class="template-subtitle">Choose a template or start from scratch</p>

          <div class="template-grid">
            ${PAGE_TEMPLATES.map(
              (template) => html`
                <div class="template-card" @click=${() => this.selectTemplate(template)}>
                  <div class="template-icon">${template.icon}</div>
                  <div class="template-name">${template.name}</div>
                  <div class="template-count">
                    ${template.sections.length > 0 ? `${template.sections.length} sections` : 'Build your own'}
                  </div>
                </div>
              `,
            )}
          </div>
        </div>
      </div>
    `;
  }

  private renderBuilder() {
    const readyCount = this.sections.filter((s) => s.status === 'ready').length;
    const template = PAGE_TEMPLATES.find((t) => t.id === this.selectedTemplate);

    return html`
      <div class="page-builder">
        <div class="builder-container">
          <div class="builder-header">
            <div class="builder-title">
              <span>${template?.icon} ${template?.name}</span>
              <span class="section-count">${this.sections.length} sections</span>
            </div>

            ${
              this.generating
                ? html`
                    <div class="generate-progress">
                      <sp-progress-circle indeterminate size="s"></sp-progress-circle>
                      <span>${readyCount} of ${this.sections.length} sections complete</span>
                    </div>
                  `
                : ''
            }

            <div class="builder-actions">
              <sp-button variant="secondary" @click=${() => (this.selectedTemplate = null)}>
                Change Template
              </sp-button>
              <button
                class="generate-btn"
                @click=${() => this.generateAllContent()}
                ?disabled=${this.sections.length === 0 || this.generating}
              >
                ✨ Generate All
              </button>
            </div>
          </div>

          <div class="page-description">
            <label>Describe your page (this context helps generate better content)</label>
            <input
              type="text"
              placeholder="e.g., A landing page for our summer sale campaign targeting young professionals..."
              .value=${this.pageDescription}
              @input=${(e: Event) => (this.pageDescription = (e.target as HTMLInputElement).value)}
            />
          </div>

          <div class="sections-list">
            ${
              this.sections.length === 0
                ? html`
                    <div class="empty-state">
                      <div class="empty-icon">📄</div>
                      <p>No sections yet. Add components to build your page.</p>
                    </div>
                  `
                : ''
            }
            ${this.sections.map((section, index) => this.renderSection(section, index))}

            <div class="add-section">
              ${
                this.showAddMenu
                  ? html`
                      <div class="add-menu">
                        ${COMPONENT_OPTIONS.map(
                    (comp) => html`
                      <button class="add-menu-item" @click=${() => this.addSection(comp.id)}>
                        <div class="add-menu-item-icon">${comp.icon}</div>
                        <div class="add-menu-item-name">${comp.name}</div>
                      </button>
                    `,
                  )}
                      </div>
                    `
                  : ''
              }
              <button class="add-section-btn" @click=${() => (this.showAddMenu = !this.showAddMenu)}>
                <span>+</span> Add Section
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderSection(section: PageSection, index: number) {
    const comp = COMPONENT_OPTIONS.find((c) => c.id === section.type);

    return html`
      <div
        class="section-item ${section.status} ${this.draggedIndex === index ? 'dragging' : ''} ${this.dragOverIndex === index ? 'drag-over' : ''}"
        draggable="true"
        @dragstart=${(e: DragEvent) => this.handleDragStart(e, index)}
        @dragend=${() => this.handleDragEnd()}
        @dragover=${(e: DragEvent) => this.handleDragOver(e, index)}
        @drop=${(e: DragEvent) => this.handleDrop(e, index)}
      >
        <span class="drag-handle">⋮⋮</span>
        <div class="section-icon">${comp?.icon || '📦'}</div>
        <div class="section-info">
          <div class="section-type">${comp?.name || section.type}</div>
          <div class="section-status ${section.status}">
            ${section.status === 'empty' ? 'Ready to generate' : ''}
            ${section.status === 'generating' ? 'Generating content...' : ''}
            ${section.status === 'ready' ? '✓ Content ready' : ''}
          </div>
        </div>
        <div class="section-actions">
          <button class="section-btn" @click=${() => this.moveSection(index, -1)} ?disabled=${index === 0}>↑</button>
          <button
            class="section-btn"
            @click=${() => this.moveSection(index, 1)}
            ?disabled=${index === this.sections.length - 1}
          >
            ↓
          </button>
          <button class="section-btn delete" @click=${() => this.removeSection(index)}>✕</button>
        </div>
      </div>
    `;
  }

  private selectTemplate(template: (typeof PAGE_TEMPLATES)[0]) {
    this.selectedTemplate = template.id;
    this.sections = template.sections.map((type, index) => ({
      id: `section-${Date.now()}-${index}`,
      type,
      content: null,
      status: 'empty',
    }));
    this.showAddMenu = false;
    this.notifySectionsChanged();
  }

  /**
   * Public method to set sections from AI recommendation.
   * Called by the parent component after user accepts a recommendation.
   */
  public setSectionsFromRecommendation(recommendations: Array<{ componentType: string; prompt: string }>) {
    this.selectedTemplate = 'ai-recommended';
    this.pageDescription = 'AI-recommended page layout';
    this.sections = recommendations.map((rec, index) => ({
      id: `section-${Date.now()}-${index}`,
      type: rec.componentType,
      content: null,
      status: 'empty' as const,
    }));
    this.showAddMenu = false;
    this.notifySectionsChanged();
  }

  private notifySectionsChanged() {
    this.dispatchEvent(
      new CustomEvent('sections-changed', {
        detail: { sections: [...this.sections] },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private addSection(type: string) {
    this.sections = [
      ...this.sections,
      {
        id: `section-${Date.now()}`,
        type,
        content: null,
        status: 'empty',
      },
    ];
    this.showAddMenu = false;
    this.notifySectionsChanged();
  }

  private removeSection(index: number) {
    this.sections = this.sections.filter((_, i) => i !== index);
    this.notifySectionsChanged();
  }

  private moveSection(index: number, direction: number) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= this.sections.length) return;

    const newSections = [...this.sections];
    const [removed] = newSections.splice(index, 1);
    newSections.splice(newIndex, 0, removed);
    this.sections = newSections;
    this.notifySectionsChanged();
  }

  // Drag and Drop handlers
  private handleDragStart(e: DragEvent, index: number) {
    this.draggedIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  private handleDragEnd() {
    this.draggedIndex = null;
    this.dragOverIndex = null;
  }

  private handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    if (this.draggedIndex !== null && this.draggedIndex !== index) {
      this.dragOverIndex = index;
    }
  }

  private handleDrop(e: DragEvent, dropIndex: number) {
    e.preventDefault();
    if (this.draggedIndex === null || this.draggedIndex === dropIndex) return;

    const newSections = [...this.sections];
    const [removed] = newSections.splice(this.draggedIndex, 1);
    newSections.splice(dropIndex, 0, removed);
    this.sections = newSections;

    this.draggedIndex = null;
    this.dragOverIndex = null;
    this.notifySectionsChanged();
  }

  private async generateAllContent() {
    this.generating = true;

    // Generate content for each section sequentially
    for (let i = 0; i < this.sections.length; i++) {
      this.sections = this.sections.map((s, idx) => (idx === i ? { ...s, status: 'generating' as const } : s));

      // Notify parent of status change
      this.notifySectionsChanged();

      // Dispatch event to generate content
      const prompt = `${this.sections[i].type} component for: ${this.pageDescription || 'a professional business page'}`;

      this.dispatchEvent(
        new CustomEvent('generate-section', {
          detail: {
            sectionId: this.sections[i].id,
            sectionIndex: i,
            componentType: this.sections[i].type,
            prompt,
            pageContext: this.pageDescription,
          },
          bubbles: true,
          composed: true,
        }),
      );

      // Wait a bit between sections to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Public method to update section content
  public updateSectionContent(sectionId: string, content: ContentSuggestion) {
    this.sections = this.sections.map((s) => (s.id === sectionId ? { ...s, content, status: 'ready' as const } : s));

    // Notify parent of changes
    this.notifySectionsChanged();

    // Check if all done
    if (this.sections.every((s) => s.status === 'ready')) {
      this.generating = false;
      this.dispatchEvent(
        new CustomEvent('page-ready', {
          detail: { sections: this.sections },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  // Public method to get all sections
  public getSections() {
    return this.sections;
  }

  // Public method to reset
  public reset() {
    this.selectedTemplate = null;
    this.sections = [];
    this.generating = false;
    this.pageDescription = '';
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'page-builder': PageBuilder;
  }
}
