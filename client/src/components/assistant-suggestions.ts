import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ContentSuggestion } from '../lib/types.js';

@customElement('assistant-suggestions')
export class AssistantSuggestions extends LitElement {
  @property({ type: Array }) suggestions: ContentSuggestion[] = [];
  @property({ type: Object }) selectedSuggestion: ContentSuggestion | null = null;

  static styles = css`
    .suggestions-section {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .suggestions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .suggestions-header h2 {
      margin: 0;
      font-size: 14px;
      color: #666;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .suggestion-count {
      font-size: 12px;
      color: #999;
    }

    .suggestions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .suggestion-card {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .suggestion-card:hover {
      border-color: #1473e6;
      box-shadow: 0 4px 12px rgba(20, 115, 230, 0.15);
    }

    .suggestion-card.selected {
      border-color: #1473e6;
      background: #f0f7ff;
    }

    .suggestion-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .suggestion-card h3 {
      margin: 0;
      font-size: 16px;
      color: #333;
    }

    .component-type-badge {
      font-size: 10px;
      padding: 4px 8px;
      background: #e8f4ff;
      color: #1473e6;
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .suggestion-card p {
      margin: 0;
      font-size: 13px;
      color: #666;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .suggestion-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .btn-apply {
      flex: 1;
      padding: 10px 16px;
      background: #1473e6;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-apply:hover {
      background: #0d66d0;
    }

    .btn-copy {
      padding: 10px 16px;
      background: #f0f0f0;
      color: #333;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-copy:hover {
      background: #e0e0e0;
    }

    .error-message {
      background: #ffebee;
      color: #c62828;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .error-message .error-icon {
      font-size: 20px;
    }

    .empty-suggestions {
      text-align: center;
      padding: 40px;
      color: #999;
    }

    .empty-suggestions-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
  `;

  render() {
    return html`
      <div class="suggestions-section">
        <div class="suggestions-header">
          <h2>Generated Suggestions</h2>
          ${
            this.suggestions.length > 0
              ? html`
                  <span class="suggestion-count"
                    >${this.suggestions.length} variation${this.suggestions.length > 1 ? 's' : ''}</span
                  >
                `
              : ''
          }
        </div>

        ${
          this.suggestions.length === 0
            ? html`
                <div class="empty-suggestions">
                  <div class="empty-suggestions-icon">&#128161;</div>
                  <p>Enter a prompt above to generate content suggestions</p>
                </div>
              `
            : html`
                <div class="suggestions-list">
                  ${this.suggestions.map(
              (suggestion) => html`
                <div
                  class="suggestion-card ${this.selectedSuggestion?.id === suggestion.id ? 'selected' : ''}"
                  @click=${() => this.selectSuggestion(suggestion)}
                >
                  <div class="suggestion-card-header">
                    <h3>${suggestion.title}</h3>
                    <span class="component-type-badge">${suggestion.componentType}</span>
                  </div>
                  <p>${suggestion.description}</p>
                  <div class="suggestion-actions">
                    <button
                      class="btn-apply"
                      @click=${(e: Event) => {
                    e.stopPropagation();
                    this.applySuggestion(suggestion);
                  }}
                    >
                      Apply to Preview
                    </button>
                    <button
                      class="btn-copy"
                      @click=${(e: Event) => {
                    e.stopPropagation();
                    this.copyToClipboard(suggestion);
                  }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              `,
            )}
                </div>
              `
        }
      </div>
    `;
  }

  private selectSuggestion(suggestion: ContentSuggestion) {
    this.dispatchEvent(
      new CustomEvent('suggestion-selected', {
        detail: { suggestion },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private applySuggestion(suggestion: ContentSuggestion) {
    this.dispatchEvent(
      new CustomEvent('suggestion-applied', {
        detail: { suggestion },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private copyToClipboard(suggestion: ContentSuggestion) {
    this.dispatchEvent(
      new CustomEvent('copy-suggestion', {
        detail: { suggestion },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'assistant-suggestions': AssistantSuggestions;
  }
}
