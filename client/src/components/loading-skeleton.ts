import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Loading skeleton component for smooth loading states
 * Provides visual placeholders while content is loading
 */
@customElement('loading-skeleton')
export class LoadingSkeleton extends LitElement {
  @property({ type: String }) variant: 'text' | 'title' | 'paragraph' | 'card' | 'preview' | 'suggestions' = 'text';
  @property({ type: Number }) lines = 3;

  static styles = css`
    :host {
      display: block;
    }

    .skeleton {
      background: linear-gradient(
        90deg,
        var(--spectrum-gray-200, #e8e8e8) 25%,
        var(--spectrum-gray-100, #f5f5f5) 50%,
        var(--spectrum-gray-200, #e8e8e8) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    /* Text variants */
    .skeleton-text {
      height: 14px;
      width: 100%;
      margin-bottom: 8px;
    }

    .skeleton-text:last-child {
      width: 60%;
    }

    .skeleton-title {
      height: 24px;
      width: 70%;
      margin-bottom: 16px;
    }

    /* Card skeleton */
    .skeleton-card {
      padding: 20px;
      background: var(--spectrum-gray-50, white);
      border: 1px solid var(--spectrum-gray-200, #e8e8e8);
      border-radius: 8px;
    }

    .skeleton-card-image {
      height: 160px;
      margin-bottom: 16px;
      border-radius: 6px;
    }

    .skeleton-card-title {
      height: 20px;
      width: 80%;
      margin-bottom: 12px;
    }

    .skeleton-card-text {
      height: 14px;
      margin-bottom: 8px;
    }

    .skeleton-card-text:last-child {
      width: 50%;
    }

    .skeleton-card-button {
      height: 36px;
      width: 120px;
      margin-top: 16px;
      border-radius: 18px;
    }

    /* Preview skeleton */
    .skeleton-preview {
      padding: 24px;
    }

    .skeleton-preview-header {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }

    .skeleton-preview-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .skeleton-preview-meta {
      flex: 1;
    }

    .skeleton-preview-image {
      height: 200px;
      margin-bottom: 24px;
      border-radius: 8px;
    }

    .skeleton-preview-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Suggestions skeleton */
    .skeleton-suggestions {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }

    .skeleton-suggestion-card {
      padding: 16px;
      background: var(--spectrum-gray-50, white);
      border: 1px solid var(--spectrum-gray-200, #e8e8e8);
      border-radius: 8px;
    }

    .skeleton-suggestion-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .skeleton-suggestion-badge {
      width: 60px;
      height: 20px;
      border-radius: 10px;
    }

    .skeleton-suggestion-title {
      flex: 1;
      height: 18px;
    }

    .skeleton-suggestion-text {
      height: 14px;
      margin-bottom: 8px;
    }

    /* Wizard skeleton */
    .skeleton-wizard {
      padding: 24px;
    }

    .skeleton-wizard-step {
      margin-bottom: 32px;
    }

    .skeleton-wizard-step-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .skeleton-wizard-step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
    }

    .skeleton-wizard-step-title {
      height: 20px;
      width: 150px;
    }

    .skeleton-wizard-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .skeleton-wizard-option {
      height: 80px;
      border-radius: 8px;
    }

    /* Paragraph */
    .skeleton-paragraph {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .skeleton-line {
      height: 14px;
    }

    .skeleton-line:nth-child(1) {
      width: 100%;
    }
    .skeleton-line:nth-child(2) {
      width: 95%;
    }
    .skeleton-line:nth-child(3) {
      width: 85%;
    }
    .skeleton-line:nth-child(4) {
      width: 90%;
    }
    .skeleton-line:nth-child(5) {
      width: 60%;
    }
  `;

  render() {
    switch (this.variant) {
      case 'title':
        return html`<div class="skeleton skeleton-title"></div>`;

      case 'paragraph':
        return html`
          <div class="skeleton-paragraph">
            ${Array.from({ length: this.lines }).map(() => html`<div class="skeleton skeleton-line"></div>`)}
          </div>
        `;

      case 'card':
        return html`
          <div class="skeleton-card">
            <div class="skeleton skeleton-card-image"></div>
            <div class="skeleton skeleton-card-title"></div>
            <div class="skeleton skeleton-card-text"></div>
            <div class="skeleton skeleton-card-text"></div>
            <div class="skeleton skeleton-card-button"></div>
          </div>
        `;

      case 'preview':
        return html`
          <div class="skeleton-preview">
            <div class="skeleton-preview-header">
              <div class="skeleton skeleton-preview-avatar"></div>
              <div class="skeleton-preview-meta">
                <div class="skeleton skeleton-title" style="width: 150px; margin-bottom: 8px;"></div>
                <div class="skeleton skeleton-text" style="width: 100px;"></div>
              </div>
            </div>
            <div class="skeleton skeleton-preview-image"></div>
            <div class="skeleton-preview-content">
              <div class="skeleton skeleton-title"></div>
              <div class="skeleton skeleton-text"></div>
              <div class="skeleton skeleton-text" style="width: 80%;"></div>
              <div class="skeleton skeleton-text" style="width: 40%;"></div>
            </div>
          </div>
        `;

      case 'suggestions':
        return html`
          <div class="skeleton-suggestions">
            ${[1, 2, 3].map(
              () => html`
                <div class="skeleton-suggestion-card">
                  <div class="skeleton-suggestion-header">
                    <div class="skeleton skeleton-suggestion-badge"></div>
                    <div class="skeleton skeleton-suggestion-title"></div>
                  </div>
                  <div class="skeleton skeleton-suggestion-text"></div>
                  <div class="skeleton skeleton-suggestion-text" style="width: 70%;"></div>
                </div>
              `,
            )}
          </div>
        `;

      case 'text':
      default:
        return html`<div class="skeleton skeleton-text"></div>`;
    }
  }
}

/**
 * Content skeleton specifically for the main preview area
 */
@customElement('content-skeleton')
export class ContentSkeleton extends LitElement {
  @property({ type: String }) type: 'hero' | 'product' | 'teaser' | 'general' = 'general';

  static styles = css`
    :host {
      display: block;
      padding: 24px;
    }

    .skeleton {
      background: linear-gradient(
        90deg,
        var(--spectrum-gray-200, #e8e8e8) 25%,
        var(--spectrum-gray-100, #f5f5f5) 50%,
        var(--spectrum-gray-200, #e8e8e8) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
    }

    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    /* Hero layout */
    .hero-skeleton {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      min-height: 300px;
    }

    .hero-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 16px;
    }

    .hero-image {
      height: 100%;
      min-height: 250px;
      border-radius: 8px;
    }

    .hero-title {
      height: 36px;
      width: 80%;
    }

    .hero-subtitle {
      height: 20px;
      width: 60%;
    }

    .hero-description {
      height: 60px;
      width: 100%;
    }

    .hero-cta {
      height: 44px;
      width: 140px;
      border-radius: 22px;
    }

    /* Product layout */
    .product-skeleton {
      max-width: 300px;
      margin: 0 auto;
    }

    .product-image {
      height: 200px;
      margin-bottom: 16px;
      border-radius: 8px;
    }

    .product-title {
      height: 20px;
      width: 70%;
      margin-bottom: 8px;
    }

    .product-price {
      height: 24px;
      width: 80px;
      margin-bottom: 12px;
    }

    .product-description {
      height: 40px;
      margin-bottom: 16px;
    }

    .product-cta {
      height: 40px;
      width: 100%;
      border-radius: 20px;
    }

    /* Teaser layout */
    .teaser-skeleton {
      display: flex;
      gap: 24px;
      align-items: center;
    }

    .teaser-image {
      width: 200px;
      height: 150px;
      border-radius: 8px;
      flex-shrink: 0;
    }

    .teaser-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .teaser-title {
      height: 24px;
      width: 60%;
    }

    .teaser-description {
      height: 48px;
    }

    .teaser-cta {
      height: 32px;
      width: 100px;
    }

    /* General layout */
    .general-skeleton {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .general-header {
      height: 32px;
      width: 50%;
    }

    .general-image {
      height: 200px;
      border-radius: 8px;
    }

    .general-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .general-line {
      height: 16px;
    }

    .line-1 {
      width: 100%;
    }
    .line-2 {
      width: 90%;
    }
    .line-3 {
      width: 75%;
    }

    /* Generating indicator */
    .generating-indicator {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--spectrum-blue-100, #e6f2ff);
      border-radius: 8px;
      margin-bottom: 24px;
    }

    .generating-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--spectrum-blue-200, #b3d4fc);
      border-top-color: var(--spectrum-accent-color-default, #1473e6);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .generating-text {
      font-size: 14px;
      color: var(--spectrum-blue-800, #0054b4);
    }
  `;

  render() {
    return html`
      <div class="generating-indicator">
        <div class="generating-spinner"></div>
        <span class="generating-text">Generating content...</span>
      </div>
      ${this.renderSkeleton()}
    `;
  }

  private renderSkeleton() {
    switch (this.type) {
      case 'hero':
        return html`
          <div class="hero-skeleton">
            <div class="hero-content">
              <div class="skeleton hero-title"></div>
              <div class="skeleton hero-subtitle"></div>
              <div class="skeleton hero-description"></div>
              <div class="skeleton hero-cta"></div>
            </div>
            <div class="skeleton hero-image"></div>
          </div>
        `;

      case 'product':
        return html`
          <div class="product-skeleton">
            <div class="skeleton product-image"></div>
            <div class="skeleton product-title"></div>
            <div class="skeleton product-price"></div>
            <div class="skeleton product-description"></div>
            <div class="skeleton product-cta"></div>
          </div>
        `;

      case 'teaser':
        return html`
          <div class="teaser-skeleton">
            <div class="skeleton teaser-image"></div>
            <div class="teaser-content">
              <div class="skeleton teaser-title"></div>
              <div class="skeleton teaser-description"></div>
              <div class="skeleton teaser-cta"></div>
            </div>
          </div>
        `;

      case 'general':
      default:
        return html`
          <div class="general-skeleton">
            <div class="skeleton general-header"></div>
            <div class="skeleton general-image"></div>
            <div class="general-content">
              <div class="skeleton general-line line-1"></div>
              <div class="skeleton general-line line-2"></div>
              <div class="skeleton general-line line-3"></div>
            </div>
          </div>
        `;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'loading-skeleton': LoadingSkeleton;
    'content-skeleton': ContentSkeleton;
  }
}
