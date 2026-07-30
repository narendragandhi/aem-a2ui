import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

interface SeoSuggestion {
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
  readabilityScore: number;
  keywordDensity?: { keyword: string; density: number }[];
  issues?: string[];
}

@customElement('seo-panel')
export class SeoPanel extends LitElement {
  @property({ type: Object }) seoSuggestions: SeoSuggestion | null = null;
  @property({ type: Number }) seoScore: number | null = null;

  static styles = css`
    :host {
      display: block;
      border-bottom: 1px solid var(--border-color);
      background: var(--card-background);
    }

    .seo-panel {
      padding: 16px;
    }

    .seo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      cursor: pointer;
    }

    .seo-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-color);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .seo-title sp-icon {
      color: var(--primary-color);
    }

    .seo-score-badge {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      color: white;
      background-color: var(--primary-color);
    }

    .seo-score-badge.good {
      background-color: var(--spectrum-positive-color-default, #2d9d78);
    }

    .seo-score-badge.medium {
      background-color: var(--spectrum-yellow-700, #ff8f00);
    }

    .seo-score-badge.low {
      background-color: var(--spectrum-negative-color-default, #d7373f);
    }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-color-light);
      margin-top: 16px;
      margin-bottom: 8px;
    }

    .seo-item {
      margin-bottom: 8px;
      font-size: 13px;
      color: var(--text-color);
      line-height: 1.4;
    }

    .seo-item.meta-description {
      font-style: italic;
      color: var(--text-color-light);
    }

    .seo-item.readability {
      font-weight: 500;
    }

    .keyword-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .keyword-tag {
      padding: 4px 10px;
      background: var(--button-secondary-bg);
      color: var(--button-secondary-text);
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .issue-list {
      color: var(--spectrum-negative-color-default, #d7373f);
    }

    .issue-list li {
      margin-bottom: 4px;
    }
  `;

  render() {
    if (!this.seoSuggestions) {
      return html``;
    }

    const scoreClass =
      this.seoScore && this.seoScore >= 70 ? 'good' : this.seoScore && this.seoScore >= 40 ? 'medium' : 'low';

    return html`
      <div class="seo-panel">
        <div class="seo-header">
          <h2 class="seo-title"><sp-icon size="m" name="FolderOutline"></sp-icon>SEO Analysis</h2>
          ${
                      this.seoScore !== null
                        ? html` <span class="seo-score-badge ${scoreClass}">Score: ${this.seoScore}%</span> `
                        : ''
                    }
        </div>

        ${
                  this.seoSuggestions.metaTitle
                    ? html`
                        <div class="section-title">Meta Title</div>
                        <div class="seo-item">${this.seoSuggestions.metaTitle}</div>
                      `
                    : ''
                }
        ${
                  this.seoSuggestions.metaDescription
                    ? html`
                        <div class="section-title">Meta Description</div>
                        <div class="seo-item meta-description">${this.seoSuggestions.metaDescription}</div>
                      `
                    : ''
                }
        ${
                  this.seoSuggestions.keywords && this.seoSuggestions.keywords.length > 0
                    ? html`
                        <div class="section-title">Recommended Keywords</div>
                        <div class="keyword-list">
                          ${this.seoSuggestions.keywords.map(
                          (keyword) => html` <span class="keyword-tag">${keyword}</span> `,
                        )}
                        </div>
                      `
                    : ''
                }
        ${
                  this.seoSuggestions.readabilityScore
                    ? html`
                        <div class="section-title">Readability Score</div>
                        <div class="seo-item readability">
                          ${this.seoSuggestions.readabilityScore.toFixed(1)} (Higher is better)
                        </div>
                      `
                    : ''
                }
        ${
                  this.seoSuggestions.issues && this.seoSuggestions.issues.length > 0
                    ? html`
                        <div class="section-title">Issues</div>
                        <ul class="issue-list">
                          ${this.seoSuggestions.issues.map((issue) => html`<li>${issue}</li>`)}
                        </ul>
                      `
                    : ''
                }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'seo-panel': SeoPanel;
  }
}
