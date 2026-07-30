import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('brand-score')
export class BrandScore extends LitElement {
  @property({ type: Number }) score = 0;
  @property({ type: Array }) factors: string[] = [];

  static styles = css`
    :host {
      display: block;
    }

    .score-container {
      background: var(--spectrum-gray-50, white);
      border: 1px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 10px;
      padding: 14px;
    }

    .score-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .score-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--spectrum-gray-600, #6e6e6e);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .score-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 700;
    }

    .score-badge.excellent {
      background: var(--spectrum-positive-background-color-hover, #dcfce7);
      color: var(--spectrum-positive-color-default, #16a34a);
    }

    .score-badge.good {
      background: var(--spectrum-notice-background-color-hover, #fef3c7);
      color: var(--spectrum-notice-color-default, #d97706);
    }

    .score-badge.needs-work {
      background: var(--spectrum-negative-background-color-hover, #fee2e2);
      color: var(--spectrum-negative-color-default, #dc2626);
    }

    .score-bar-container {
      height: 6px;
      background: var(--spectrum-gray-200, #e5e5e5);
      border-radius: 3px;
      overflow: hidden;
      margin-bottom: 12px;
    }

    .score-bar {
      height: 100%;
      border-radius: 3px;
      transition: width 0.5s ease-out;
    }

    .score-bar.excellent {
      background: linear-gradient(90deg, #22c55e, #16a34a);
    }

    .score-bar.good {
      background: linear-gradient(90deg, #fbbf24, #d97706);
    }

    .score-bar.needs-work {
      background: linear-gradient(90deg, #f87171, #dc2626);
    }

    .factors-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .factor {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: var(--spectrum-gray-700, #666);
    }

    .factor-icon {
      font-size: 12px;
    }

    .factor-icon.pass {
      color: var(--spectrum-positive-color-default, #16a34a);
    }

    .factor-icon.warn {
      color: var(--spectrum-notice-color-default, #d97706);
    }
  `;

  render() {
    const scoreClass = this.score >= 85 ? 'excellent' : this.score >= 65 ? 'good' : 'needs-work';
    const scoreLabel = this.score >= 85 ? 'Excellent' : this.score >= 65 ? 'Good' : 'Needs Work';

    return html`
      <div class="score-container">
        <div class="score-header">
          <span class="score-title">
            <span>✨</span>
            Brand Alignment
          </span>
          <span class="score-badge ${scoreClass}"> ${this.score}% ${scoreLabel} </span>
        </div>

        <div class="score-bar-container">
          <div class="score-bar ${scoreClass}" style="width: ${this.score}%"></div>
        </div>

        <div class="factors-list">
          ${this.factors.map(
            (factor) => html`
              <div class="factor">
                <span class="factor-icon pass">✓</span>
                ${factor}
              </div>
            `,
          )}
        </div>
      </div>
    `;
  }

  // Calculate score based on content
  public static calculateScore(content: { title?: string; subtitle?: string; description?: string; cta?: string }): {
    score: number;
    factors: string[];
  } {
    const factors: string[] = [];
    let score = 70; // Base score

    // Check for action-oriented headline
    if (content.title) {
      const actionWords = ['transform', 'discover', 'unlock', 'accelerate', 'simplify', 'elevate', 'power', 'build'];
      if (actionWords.some((word) => content.title!.toLowerCase().includes(word))) {
        score += 8;
        factors.push('Action-oriented headline');
      }

      // Check headline length (concise)
      if (content.title.split(' ').length <= 6) {
        score += 5;
        factors.push('Concise headline');
      }
    }

    // Check for value-focused messaging
    if (content.description) {
      const valueWords = ['efficiency', 'security', 'scale', 'integration', 'seamless', 'enterprise'];
      if (valueWords.some((word) => content.description!.toLowerCase().includes(word))) {
        score += 7;
        factors.push('Value pillar messaging');
      }

      // Check for short paragraphs
      if (content.description.length < 150) {
        score += 5;
        factors.push('Scannable copy length');
      }
    }

    // Check CTA
    if (content.cta) {
      const goodCTAs = ['start', 'get', 'try', 'see', 'explore', 'discover', 'learn'];
      if (goodCTAs.some((word) => content.cta!.toLowerCase().includes(word))) {
        score += 5;
        factors.push('Action-driven CTA');
      }
    }

    // Cap at 98
    score = Math.min(score, 98);

    // Ensure minimum factors
    if (factors.length === 0) {
      factors.push('Follows brand voice guidelines');
    }

    return { score, factors };
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'brand-score': BrandScore;
  }
}
