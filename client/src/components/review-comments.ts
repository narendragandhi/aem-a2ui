import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Review, ReviewComment } from '../lib/types.js';

import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/textfield/sp-textfield.js';

const API_BASE = 'http://localhost:10003';

/**
 * Review comments component for viewing and adding comments during content review.
 */
@customElement('review-comments')
export class ReviewComments extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family-base, 'Adobe Clean', sans-serif);
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: flex-end;
      z-index: 1000;
    }

    .panel {
      width: 400px;
      max-width: 100%;
      background: white;
      height: 100%;
      display: flex;
      flex-direction: column;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--spectrum-gray-300);
      background: var(--spectrum-gray-50);
    }

    .panel-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--spectrum-gray-800);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: var(--spectrum-gray-600);
      padding: 4px 8px;
    }

    .close-btn:hover {
      color: var(--spectrum-gray-800);
    }

    .comments-list {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .comment {
      background: var(--spectrum-gray-100);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }

    .comment.resolved {
      opacity: 0.6;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .comment-author {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .author-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--spectrum-blue-400);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
    }

    .author-info {
      display: flex;
      flex-direction: column;
    }

    .author-name {
      font-weight: 600;
      font-size: 13px;
      color: var(--spectrum-gray-800);
    }

    .comment-meta {
      font-size: 11px;
      color: var(--spectrum-gray-600);
    }

    .comment-field {
      font-size: 10px;
      color: var(--spectrum-blue-600);
      background: var(--spectrum-blue-100);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .comment-content {
      font-size: 13px;
      line-height: 1.5;
      color: var(--spectrum-gray-800);
      margin-bottom: 8px;
    }

    .comment-actions {
      display: flex;
      gap: 8px;
    }

    .resolve-btn {
      font-size: 11px;
      color: var(--spectrum-gray-600);
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
    }

    .resolve-btn:hover {
      background: var(--spectrum-gray-200);
    }

    .resolved-badge {
      font-size: 11px;
      color: var(--spectrum-green-600);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .add-comment-form {
      padding: 16px;
      border-top: 1px solid var(--spectrum-gray-300);
      background: var(--spectrum-gray-50);
    }

    .form-row {
      margin-bottom: 12px;
    }

    .form-label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--spectrum-gray-700);
      margin-bottom: 4px;
    }

    .field-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }

    .field-chip {
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      background: var(--spectrum-gray-200);
      border: none;
      cursor: pointer;
    }

    .field-chip:hover {
      background: var(--spectrum-gray-300);
    }

    .field-chip.selected {
      background: var(--spectrum-blue-400);
      color: white;
    }

    textarea {
      width: 100%;
      min-height: 80px;
      padding: 10px;
      border: 1px solid var(--spectrum-gray-300);
      border-radius: 4px;
      font-family: inherit;
      font-size: 13px;
      resize: vertical;
      box-sizing: border-box;
    }

    textarea:focus {
      outline: none;
      border-color: var(--spectrum-blue-400);
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: var(--spectrum-gray-600);
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .filter-bar {
      display: flex;
      gap: 8px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--spectrum-gray-200);
      background: var(--spectrum-gray-50);
    }

    .filter-chip {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      background: var(--spectrum-gray-200);
      border: none;
      cursor: pointer;
    }

    .filter-chip:hover {
      background: var(--spectrum-gray-300);
    }

    .filter-chip.active {
      background: var(--spectrum-blue-400);
      color: white;
    }
  `;

  @property({ type: Boolean }) open = false;
  @property({ type: Object }) review: Review | null = null;
  @property({ type: String }) currentUser: string = 'demo-user';
  @property({ type: String }) currentUserName: string = 'Demo User';

  @state() private newComment = '';
  @state() private selectedField: string = '';
  @state() private filter: 'all' | 'unresolved' | 'resolved' = 'all';

  private fields = ['title', 'subtitle', 'description', 'ctaText', 'imageUrl'];

  private async addComment() {
    if (!this.review || !this.newComment.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/reviews/${this.review.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: this.currentUser,
          authorName: this.currentUserName,
          content: this.newComment,
          field: this.selectedField || null,
        }),
      });

      if (response.ok) {
        const updatedReview = await response.json();
        this.review = updatedReview;
        this.newComment = '';
        this.selectedField = '';
        this.dispatchEvent(
          new CustomEvent('comment-added', {
            detail: { review: updatedReview },
            bubbles: true,
            composed: true,
          }),
        );
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  }

  private async resolveComment(commentId: string) {
    if (!this.review) return;

    try {
      const response = await fetch(`${API_BASE}/reviews/${this.review.id}/comments/${commentId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolvedBy: this.currentUserName }),
      });

      if (response.ok) {
        this.review = await response.json();
      }
    } catch (error) {
      console.error('Failed to resolve comment:', error);
    }
  }

  private async unresolveComment(commentId: string) {
    if (!this.review) return;

    try {
      const response = await fetch(`${API_BASE}/reviews/${this.review.id}/comments/${commentId}/unresolve`, {
        method: 'PATCH',
      });

      if (response.ok) {
        this.review = await response.json();
      }
    } catch (error) {
      console.error('Failed to unresolve comment:', error);
    }
  }

  private close() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  private formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private getFilteredComments(): ReviewComment[] {
    if (!this.review) return [];

    let comments = [...this.review.comments];

    if (this.filter === 'unresolved') {
      comments = comments.filter((c) => !c.resolved);
    } else if (this.filter === 'resolved') {
      comments = comments.filter((c) => c.resolved);
    }

    return comments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  render() {
    if (!this.open) return null;

    const comments = this.getFilteredComments();
    const unresolvedCount = this.review?.comments.filter((c) => !c.resolved).length || 0;

    return html`
      <div
        class="overlay"
        @click=${(e: Event) => {
        if (e.target === e.currentTarget) this.close();
      }}
      >
        <div class="panel">
          <div class="panel-header">
            <span class="panel-title">Comments (${this.review?.comments.length || 0})</span>
            <button class="close-btn" @click=${this.close}>×</button>
          </div>

          <div class="filter-bar">
            <button class="filter-chip ${this.filter === 'all' ? 'active' : ''}" @click=${() => (this.filter = 'all')}>
              All
            </button>
            <button
              class="filter-chip ${this.filter === 'unresolved' ? 'active' : ''}"
              @click=${() => (this.filter = 'unresolved')}
            >
              Unresolved (${unresolvedCount})
            </button>
            <button
              class="filter-chip ${this.filter === 'resolved' ? 'active' : ''}"
              @click=${() => (this.filter = 'resolved')}
            >
              Resolved
            </button>
          </div>

          <div class="comments-list">
            ${
              comments.length === 0
                ? html`
                    <div class="empty-state">
                      <div class="empty-icon">💬</div>
                      <div>No comments yet</div>
                      <div style="font-size: 12px; margin-top: 8px;">Add a comment below to start the discussion</div>
                    </div>
                  `
                : comments.map((comment) => this.renderComment(comment))
            }
          </div>

          <div class="add-comment-form">
            <div class="form-row">
              <label class="form-label">Comment on field (optional)</label>
              <div class="field-selector">
                ${this.fields.map(
                  (field) => html`
                    <button
                      class="field-chip ${this.selectedField === field ? 'selected' : ''}"
                      @click=${() => (this.selectedField = this.selectedField === field ? '' : field)}
                    >
                      ${field}
                    </button>
                  `,
                )}
              </div>
            </div>

            <div class="form-row">
              <textarea
                placeholder="Add your comment..."
                .value=${this.newComment}
                @input=${(e: Event) => (this.newComment = (e.target as HTMLTextAreaElement).value)}
              ></textarea>
            </div>

            <div class="form-actions">
              <sp-button variant="primary" ?disabled=${!this.newComment.trim()} @click=${this.addComment}>
                Add Comment
              </sp-button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderComment(comment: ReviewComment) {
    return html`
      <div class="comment ${comment.resolved ? 'resolved' : ''}">
        <div class="comment-header">
          <div class="comment-author">
            <div class="author-avatar">${comment.authorName?.charAt(0) || 'U'}</div>
            <div class="author-info">
              <span class="author-name">${comment.authorName || 'Unknown'}</span>
              <span class="comment-meta">${this.formatDate(comment.timestamp)}</span>
            </div>
          </div>
          ${comment.field ? html`<span class="comment-field">${comment.field}</span>` : ''}
        </div>

        <div class="comment-content">${comment.content}</div>

        <div class="comment-actions">
          ${
            comment.resolved
              ? html`
                  <span class="resolved-badge"> ✓ Resolved by ${comment.resolvedBy} </span>
                  <button class="resolve-btn" @click=${() => this.unresolveComment(comment.id)}>Reopen</button>
                `
              : html` <button class="resolve-btn" @click=${() => this.resolveComment(comment.id)}>Resolve</button> `
          }
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'review-comments': ReviewComments;
  }
}
