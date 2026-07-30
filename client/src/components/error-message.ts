import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { AppError } from '../services/error-handler.js';

@customElement('error-message')
export class ErrorMessage extends LitElement {
  @property({ type: String }) message = '';
  @property({ type: Object }) error: AppError | null = null;
  @property({ type: Boolean }) dismissible = true;
  @property({ type: Boolean }) showRetry = true;

  static styles = css`
    :host {
      display: block;
    }

    .error-container {
      background: var(--spectrum-negative-background-color-default, #ffebee);
      border: 1px solid var(--spectrum-negative-border-color-default, #ffcdd2);
      border-radius: 8px;
      margin: 16px;
      overflow: hidden;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .error-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--spectrum-negative-background-color-default, #ffebee);
    }

    .error-icon {
      width: 24px;
      height: 24px;
      background: var(--spectrum-negative-color-default, #d32f2f);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14px;
      flex-shrink: 0;
    }

    .error-content {
      flex: 1;
    }

    .error-title {
      font-weight: 600;
      color: var(--spectrum-negative-color-default, #c62828);
      margin: 0 0 4px 0;
      font-size: 14px;
    }

    .error-message {
      color: var(--spectrum-gray-800, #4a4a4a);
      margin: 0;
      font-size: 13px;
    }

    .error-suggestion {
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.5);
      border-top: 1px solid var(--spectrum-negative-border-color-default, #ffcdd2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .suggestion-text {
      font-size: 12px;
      color: var(--spectrum-gray-700, #666);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .suggestion-icon {
      font-size: 14px;
    }

    .error-actions {
      display: flex;
      gap: 8px;
    }

    .btn {
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-retry {
      background: var(--spectrum-accent-color-default, #1473e6);
      color: white;
    }

    .btn-retry:hover {
      background: var(--spectrum-accent-color-hover, #0d66d0);
    }

    .btn-dismiss {
      background: transparent;
      color: var(--spectrum-gray-700, #666);
      border: 1px solid var(--spectrum-gray-400, #ccc);
    }

    .btn-dismiss:hover {
      background: var(--spectrum-gray-200, #f0f0f0);
    }

    /* Simple mode - just message */
    .error-simple {
      background: var(--spectrum-negative-background-color-default, #ffebee);
      color: var(--spectrum-negative-color-default, #c62828);
      padding: 12px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 16px;
      font-size: 14px;
    }

    .error-simple .error-icon {
      width: 20px;
      height: 20px;
      font-size: 12px;
    }
  `;

  render() {
    // If we have an AppError object, render the full error UI
    if (this.error) {
      return this.renderFullError();
    }

    // Simple message mode
    if (this.message) {
      return html`
        <div class="error-simple">
          <span class="error-icon">!</span>
          <span>${this.message}</span>
        </div>
      `;
    }

    return html``;
  }

  private renderFullError() {
    if (!this.error) return html``;

    return html`
      <div class="error-container">
        <div class="error-header">
          <span class="error-icon">!</span>
          <div class="error-content">
            <p class="error-title">${this.error.userMessage}</p>
            ${
              this.error.message !== this.error.userMessage
                ? html`<p class="error-message">${this.error.message}</p>`
                : ''
            }
          </div>
        </div>
        ${
          this.error.suggestion || this.error.retryable
            ? html`
                <div class="error-suggestion">
                  ${
                  this.error.suggestion
                    ? html`
                        <span class="suggestion-text">
                          <span class="suggestion-icon">💡</span>
                          ${this.error.suggestion}
                        </span>
                      `
                    : html`<span></span>`
                }
                  <div class="error-actions">
                    ${
                    this.error.retryable && this.showRetry
                      ? html` <button class="btn btn-retry" @click=${this.handleRetry}>Try Again</button> `
                      : ''
                  }
                    ${
                    this.dismissible
                      ? html` <button class="btn btn-dismiss" @click=${this.handleDismiss}>Dismiss</button> `
                      : ''
                  }
                  </div>
                </div>
              `
            : ''
        }
      </div>
    `;
  }

  private handleRetry() {
    this.dispatchEvent(new CustomEvent('retry', { bubbles: true, composed: true }));
  }

  private handleDismiss() {
    this.dispatchEvent(new CustomEvent('dismiss', { bubbles: true, composed: true }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'error-message': ErrorMessage;
  }
}
