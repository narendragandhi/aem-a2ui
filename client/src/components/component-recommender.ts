import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { PageRecommendation, SectionRecommendation } from '../lib/types.js';

/**
 * AI-Driven Component Recommender
 *
 * This is a key A2UI feature that demonstrates agent intelligence:
 * Instead of the user manually selecting components, they describe what they want
 * and the agent recommends an optimal page layout.
 *
 * Flow:
 * 1. User enters description (e.g., "landing page for summer sale")
 * 2. Component calls /recommend endpoint
 * 3. Agent analyzes and recommends components with reasoning
 * 4. User can accept, modify, or regenerate recommendations
 * 5. On accept, emits layout to page builder
 */
@customElement('component-recommender')
export class ComponentRecommender extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family);
    }

    .recommender-container {
      padding: 20px;
      background: var(--spectrum-gray-50);
      border-radius: 8px;
    }

    .input-section {
      margin-bottom: 24px;
    }

    .input-section h3 {
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
      color: var(--spectrum-gray-900);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .input-section h3::before {
      content: '🤖';
      font-size: 24px;
    }

    .input-row {
      display: flex;
      gap: 12px;
    }

    .input-field {
      flex: 1;
      padding: 12px 16px;
      font-size: 15px;
      border: 2px solid var(--spectrum-gray-300);
      border-radius: 8px;
      outline: none;
      transition: border-color 0.2s;
    }

    .input-field:focus {
      border-color: var(--spectrum-blue-500);
    }

    .input-field::placeholder {
      color: var(--spectrum-gray-500);
    }

    .recommend-btn {
      padding: 12px 24px;
      background: linear-gradient(135deg, var(--spectrum-blue-500), var(--spectrum-purple-500));
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition:
        transform 0.2s,
        box-shadow 0.2s;
    }

    .recommend-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    .recommend-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 12px;
      color: var(--spectrum-gray-600);
    }

    .loading-spinner {
      width: 24px;
      height: 24px;
      border: 3px solid var(--spectrum-gray-300);
      border-top-color: var(--spectrum-blue-500);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .result-section {
      animation: fadeIn 0.3s ease;
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

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--spectrum-gray-200);
    }

    .result-info h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      color: var(--spectrum-gray-900);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-type-badge {
      display: inline-block;
      padding: 4px 12px;
      background: var(--spectrum-blue-100);
      color: var(--spectrum-blue-700);
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      text-transform: capitalize;
    }

    .confidence {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--spectrum-gray-600);
    }

    .confidence-bar {
      width: 60px;
      height: 6px;
      background: var(--spectrum-gray-200);
      border-radius: 3px;
      overflow: hidden;
    }

    .confidence-fill {
      height: 100%;
      background: var(--spectrum-green-500);
      transition: width 0.3s;
    }

    .reasoning {
      font-size: 14px;
      color: var(--spectrum-gray-700);
      line-height: 1.5;
      margin-top: 8px;
      padding: 12px;
      background: var(--spectrum-gray-100);
      border-radius: 6px;
      border-left: 3px solid var(--spectrum-blue-500);
    }

    .sections-list {
      margin: 20px 0;
    }

    .section-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: white;
      border: 1px solid var(--spectrum-gray-200);
      border-radius: 8px;
      margin-bottom: 8px;
      transition:
        border-color 0.2s,
        box-shadow 0.2s;
    }

    .section-item:hover {
      border-color: var(--spectrum-blue-400);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .section-item.required {
      border-left: 3px solid var(--spectrum-blue-500);
    }

    .section-item.optional {
      border-left: 3px solid var(--spectrum-gray-300);
    }

    .section-position {
      width: 28px;
      height: 28px;
      background: var(--spectrum-gray-100);
      color: var(--spectrum-gray-700);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 13px;
      flex-shrink: 0;
    }

    .section-icon {
      font-size: 24px;
      flex-shrink: 0;
    }

    .section-details {
      flex: 1;
      min-width: 0;
    }

    .section-name {
      font-weight: 600;
      color: var(--spectrum-gray-900);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .required-badge {
      font-size: 10px;
      padding: 2px 6px;
      background: var(--spectrum-blue-100);
      color: var(--spectrum-blue-700);
      border-radius: 4px;
      font-weight: 600;
    }

    .optional-badge {
      font-size: 10px;
      padding: 2px 6px;
      background: var(--spectrum-gray-100);
      color: var(--spectrum-gray-600);
      border-radius: 4px;
      font-weight: 500;
    }

    .section-reason {
      font-size: 13px;
      color: var(--spectrum-gray-600);
      margin-top: 4px;
    }

    .section-prompt {
      font-size: 12px;
      color: var(--spectrum-gray-500);
      margin-top: 4px;
      font-style: italic;
    }

    .section-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .section-action-btn {
      width: 28px;
      height: 28px;
      border: none;
      background: var(--spectrum-gray-100);
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }

    .section-action-btn:hover {
      background: var(--spectrum-gray-200);
    }

    .section-action-btn.remove:hover {
      background: var(--spectrum-red-100);
    }

    .alternatives {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--spectrum-gray-200);
    }

    .alternatives-label {
      font-size: 13px;
      color: var(--spectrum-gray-600);
      margin-bottom: 8px;
    }

    .alternatives-list {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .alternative-chip {
      padding: 6px 12px;
      background: var(--spectrum-gray-100);
      border: 1px solid var(--spectrum-gray-200);
      border-radius: 20px;
      font-size: 13px;
      color: var(--spectrum-gray-700);
      cursor: pointer;
      transition: all 0.2s;
    }

    .alternative-chip:hover {
      background: var(--spectrum-blue-100);
      border-color: var(--spectrum-blue-300);
      color: var(--spectrum-blue-700);
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 24px;
      justify-content: flex-end;
    }

    .secondary-btn {
      padding: 10px 20px;
      background: white;
      border: 2px solid var(--spectrum-gray-300);
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .secondary-btn:hover {
      border-color: var(--spectrum-gray-400);
      background: var(--spectrum-gray-50);
    }

    .primary-btn {
      padding: 10px 24px;
      background: var(--spectrum-blue-500);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .primary-btn:hover {
      background: var(--spectrum-blue-600);
    }

    .error {
      padding: 12px 16px;
      background: var(--spectrum-red-100);
      color: var(--spectrum-red-700);
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--spectrum-gray-600);
    }

    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-state h4 {
      margin: 0 0 8px 0;
      color: var(--spectrum-gray-800);
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
    }

    .example-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 16px;
      justify-content: center;
    }

    .example-chip {
      padding: 6px 12px;
      background: white;
      border: 1px solid var(--spectrum-gray-300);
      border-radius: 20px;
      font-size: 12px;
      color: var(--spectrum-gray-700);
      cursor: pointer;
      transition: all 0.2s;
    }

    .example-chip:hover {
      background: var(--spectrum-blue-50);
      border-color: var(--spectrum-blue-300);
    }
  `;

  @property({ type: String }) agentUrl = 'http://localhost:10003';
  @property({ type: Object }) recommendation: PageRecommendation | null = null;

  @state() private inputValue = '';
  @state() private loading = false;
  @state() private error = '';

  private examplePrompts = [
    'Landing page for summer sale',
    'Product page for enterprise software',
    'Blog post about AI trends',
    'Company about page with team',
    'Contact page with FAQ',
  ];

  override render() {
    return html`
      <div class="recommender-container">
        <div class="input-section">
          <h3>AI Page Recommendation</h3>
          <div class="input-row">
            <input
              class="input-field"
              type="text"
              placeholder="Describe the page you want to create..."
              .value=${this.inputValue}
              @input=${(e: Event) => (this.inputValue = (e.target as HTMLInputElement).value)}
              @keypress=${(e: KeyboardEvent) => e.key === 'Enter' && this.getRecommendation()}
            />
            <button
              class="recommend-btn"
              ?disabled=${!this.inputValue.trim() || this.loading}
              @click=${this.getRecommendation}
            >
              ${this.loading ? 'Analyzing...' : 'Get Recommendation'}
            </button>
          </div>
        </div>

        ${
          this.loading
            ? this.renderLoading()
            : this.error
              ? this.renderError()
              : this.recommendation
                ? this.renderRecommendation()
                : this.renderEmptyState()
        }
      </div>
    `;
  }

  private renderLoading() {
    return html`
      <div class="loading">
        <div class="loading-spinner"></div>
        <span>AI is analyzing your request and recommending components...</span>
      </div>
    `;
  }

  private renderError() {
    return html`
      <div class="error">
        <span>Error: ${this.error}</span>
        <button class="secondary-btn" @click=${() => (this.error = '')}>Dismiss</button>
      </div>
    `;
  }

  private renderEmptyState() {
    return html`
      <div class="empty-state">
        <div class="empty-state-icon">🎯</div>
        <h4>Let AI Design Your Page</h4>
        <p>Describe what you want to create and the agent will recommend the optimal components and layout.</p>
        <div class="example-chips">
          ${this.examplePrompts.map(
            (prompt) => html` <button class="example-chip" @click=${() => this.useExample(prompt)}>${prompt}</button> `,
          )}
        </div>
      </div>
    `;
  }

  private renderRecommendation() {
    const rec = this.recommendation!;
    return html`
      <div class="result-section">
        <div class="result-header">
          <div class="result-info">
            <h4>
              Recommended Layout
              <span class="page-type-badge">${rec.pageType} Page</span>
            </h4>
            <div class="confidence">
              Confidence:
              <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${rec.confidence}%"></div>
              </div>
              <span>${rec.confidence}%</span>
            </div>
          </div>
        </div>

        <div class="reasoning">${rec.reasoning}</div>

        <div class="sections-list">${rec.sections.map((section, index) => this.renderSection(section, index))}</div>

        ${
          rec.alternatives?.length > 0
            ? html`
                <div class="alternatives">
                  <div class="alternatives-label">Alternative layouts to consider:</div>
                  <div class="alternatives-list">
                    ${rec.alternatives.map(
                (alt) => html`
                  <button class="alternative-chip" @click=${() => this.tryAlternative(alt)}>${alt}</button>
                `,
              )}
                  </div>
                </div>
              `
            : ''
        }

        <div class="action-buttons">
          <button class="secondary-btn" @click=${this.regenerate}>Regenerate</button>
          <button class="primary-btn" @click=${this.acceptRecommendation}>Accept & Build Page</button>
        </div>
      </div>
    `;
  }

  private renderSection(section: SectionRecommendation, index: number) {
    return html`
      <div class="section-item ${section.required ? 'required' : 'optional'}">
        <div class="section-position">${section.position}</div>
        <div class="section-icon">${section.icon}</div>
        <div class="section-details">
          <div class="section-name">
            ${section.displayName}
            ${
              section.required
                ? html`<span class="required-badge">Required</span>`
                : html`<span class="optional-badge">Optional</span>`
            }
          </div>
          <div class="section-reason">${section.reason}</div>
          <div class="section-prompt">"${section.suggestedPrompt}"</div>
        </div>
        <div class="section-actions">
          <button
            class="section-action-btn"
            title="Move up"
            ?disabled=${index === 0}
            @click=${() => this.moveSection(index, -1)}
          >
            ↑
          </button>
          <button
            class="section-action-btn"
            title="Move down"
            ?disabled=${index === this.recommendation!.sections.length - 1}
            @click=${() => this.moveSection(index, 1)}
          >
            ↓
          </button>
          <button class="section-action-btn remove" title="Remove" @click=${() => this.removeSection(index)}>×</button>
        </div>
      </div>
    `;
  }

  private useExample(prompt: string) {
    this.inputValue = prompt;
    this.getRecommendation();
  }

  private async getRecommendation() {
    if (!this.inputValue.trim()) return;

    this.loading = true;
    this.error = '';

    try {
      const response = await fetch(`${this.agentUrl}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: this.inputValue }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get recommendation: ${response.status}`);
      }

      this.recommendation = await response.json();
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to get recommendation';
    } finally {
      this.loading = false;
    }
  }

  private regenerate() {
    this.recommendation = null;
    this.getRecommendation();
  }

  private tryAlternative(alternative: string) {
    this.inputValue = alternative;
    this.recommendation = null;
    this.getRecommendation();
  }

  private moveSection(index: number, direction: number) {
    if (!this.recommendation) return;

    const sections = [...this.recommendation.sections];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sections.length) return;

    // Swap sections
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];

    // Update positions
    sections.forEach((s, i) => (s.position = i + 1));

    this.recommendation = { ...this.recommendation, sections };
  }

  private removeSection(index: number) {
    if (!this.recommendation) return;

    const sections = this.recommendation.sections.filter((_, i) => i !== index);
    sections.forEach((s, i) => (s.position = i + 1));

    this.recommendation = { ...this.recommendation, sections };
  }

  private acceptRecommendation() {
    if (!this.recommendation) return;

    this.dispatchEvent(
      new CustomEvent('recommendation-accepted', {
        detail: {
          recommendation: this.recommendation,
          userInput: this.inputValue,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'component-recommender': ComponentRecommender;
  }
}
