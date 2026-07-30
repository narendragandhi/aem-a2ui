import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { Review, ReviewStatusType, Reviewer, ContentSuggestion } from '../lib/types.js';

import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/textfield/sp-textfield.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';

const API_BASE = 'http://localhost:10003';

/**
 * Review panel component for managing content review workflow.
 * Shows review status, reviewers, and approve/reject actions.
 */
@customElement('review-panel')
export class ReviewPanel extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family-base, 'Adobe Clean', sans-serif);
    }

    .panel {
      background: var(--spectrum-gray-100);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--spectrum-gray-800);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-draft {
      background: var(--spectrum-gray-300);
      color: var(--spectrum-gray-700);
    }
    .status-pending_review {
      background: #fff3cd;
      color: #856404;
    }
    .status-in_review {
      background: #cce5ff;
      color: #004085;
    }
    .status-approved {
      background: #d4edda;
      color: #155724;
    }
    .status-rejected {
      background: #f8d7da;
      color: #721c24;
    }
    .status-changes_requested {
      background: #fff3cd;
      color: #856404;
    }

    .reviewers-section {
      margin-bottom: 16px;
    }

    .reviewers-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--spectrum-gray-600);
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .reviewers-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .reviewer-chip {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      background: var(--spectrum-gray-200);
      border-radius: 16px;
      font-size: 12px;
    }

    .reviewer-avatar {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--spectrum-blue-400);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
    }

    .reviewer-reviewed {
      color: var(--spectrum-green-600);
      font-size: 10px;
    }

    .actions-section {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }

    .timeline {
      margin-top: 16px;
      border-top: 1px solid var(--spectrum-gray-300);
      padding-top: 16px;
    }

    .timeline-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--spectrum-gray-600);
      margin-bottom: 12px;
      text-transform: uppercase;
    }

    .timeline-item {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      font-size: 12px;
    }

    .timeline-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--spectrum-blue-400);
      margin-top: 4px;
      flex-shrink: 0;
    }

    .timeline-content {
      flex: 1;
    }

    .timeline-action {
      font-weight: 500;
      color: var(--spectrum-gray-800);
    }

    .timeline-meta {
      color: var(--spectrum-gray-600);
      font-size: 11px;
    }

    .start-review-form {
      margin-top: 16px;
    }

    .form-field {
      margin-bottom: 12px;
    }

    .form-label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--spectrum-gray-700);
      margin-bottom: 4px;
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: var(--spectrum-gray-600);
    }

    .empty-state-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .empty-state-text {
      font-size: 12px;
      margin-bottom: 16px;
    }

    .comments-count {
      font-size: 11px;
      color: var(--spectrum-gray-600);
      margin-top: 8px;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
    }

    .version-badge {
      font-size: 11px;
      color: var(--spectrum-gray-600);
      margin-left: 8px;
    }
  `;

  @property({ type: Object }) content: ContentSuggestion | null = null;
  @property({ type: String }) contentId: string = '';
  @property({ type: String }) currentUser: string = 'demo-user';
  @property({ type: String }) currentUserName: string = 'Demo User';

  @state() private review: Review | null = null;
  @state() private loading = false;
  @state() private showStartForm = false;

  connectedCallback() {
    super.connectedCallback();
    if (this.contentId) {
      this.loadReview();
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('contentId') && this.contentId) {
      this.loadReview();
    }
  }

  private async loadReview() {
    if (!this.contentId) return;

    this.loading = true;
    try {
      const response = await fetch(`${API_BASE}/reviews?contentId=${this.contentId}`);
      if (response.ok) {
        const reviews: Review[] = await response.json();
        this.review = reviews.length > 0 ? reviews[0] : null;
      }
    } catch (error) {
      console.error('Failed to load review:', error);
    } finally {
      this.loading = false;
    }
  }

  private async startReview() {
    if (!this.content || !this.contentId) return;

    this.loading = true;
    try {
      const response = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: this.contentId,
          content: this.content,
          reviewers: [
            { id: 'reviewer-1', name: 'Content Reviewer', role: 'REVIEWER', hasReviewed: false },
            { id: 'approver-1', name: 'Content Approver', role: 'APPROVER', hasReviewed: false },
          ],
          createdBy: this.currentUser,
        }),
      });

      if (response.ok) {
        const review = (await response.json()) as Review;
        this.review = review;
        this.showStartForm = false;
        this.dispatchReviewEvent('review-started', review);
      }
    } catch (error) {
      console.error('Failed to start review:', error);
    } finally {
      this.loading = false;
    }
  }

  private async approveReview() {
    if (!this.review) return;

    this.loading = true;
    try {
      const response = await fetch(`${API_BASE}/reviews/${this.review.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: this.currentUserName }),
      });

      if (response.ok) {
        const review = (await response.json()) as Review;
        this.review = review;
        this.dispatchReviewEvent('review-approved', review);
      }
    } catch (error) {
      console.error('Failed to approve review:', error);
    } finally {
      this.loading = false;
    }
  }

  private async rejectReview() {
    if (!this.review) return;

    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    this.loading = true;
    try {
      const response = await fetch(`${API_BASE}/reviews/${this.review.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectedBy: this.currentUserName, reason }),
      });

      if (response.ok) {
        const review = (await response.json()) as Review;
        this.review = review;
        this.dispatchReviewEvent('review-rejected', review);
      }
    } catch (error) {
      console.error('Failed to reject review:', error);
    } finally {
      this.loading = false;
    }
  }

  private async requestChanges() {
    if (!this.review) return;

    const reason = prompt('What changes are needed?');
    if (!reason) return;

    this.loading = true;
    try {
      const response = await fetch(`${API_BASE}/reviews/${this.review.id}/request-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedBy: this.currentUserName, reason }),
      });

      if (response.ok) {
        const review = (await response.json()) as Review;
        this.review = review;
        this.dispatchReviewEvent('changes-requested', review);
      }
    } catch (error) {
      console.error('Failed to request changes:', error);
    } finally {
      this.loading = false;
    }
  }

  private dispatchReviewEvent(eventName: string, review: Review) {
    this.dispatchEvent(
      new CustomEvent(eventName, {
        detail: { review },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private openComments() {
    this.dispatchEvent(
      new CustomEvent('open-comments', {
        detail: { review: this.review },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private getStatusLabel(status: ReviewStatusType): string {
    const labels: Record<ReviewStatusType, string> = {
      draft: 'Draft',
      pending_review: 'Pending Review',
      in_review: 'In Review',
      approved: 'Approved',
      rejected: 'Rejected',
      changes_requested: 'Changes Requested',
    };
    return labels[status] || status;
  }

  private formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  render() {
    if (this.loading) {
      return html`
        <div class="panel">
          <div class="loading">
            <sp-progress-circle indeterminate size="m"></sp-progress-circle>
          </div>
        </div>
      `;
    }

    if (!this.review) {
      return html`
        <div class="panel">
          <div class="empty-state">
            <div class="empty-state-title">No Review Started</div>
            <div class="empty-state-text">Start a review to get feedback from your team</div>
            <sp-button variant="primary" @click=${this.startReview}> Start Review </sp-button>
          </div>
        </div>
      `;
    }

    const status = this.review.status.toLowerCase() as ReviewStatusType;
    const unresolvedComments = this.review.comments.filter((c) => !c.resolved).length;

    return html`
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title">
            Review Status
            <span class="version-badge">v${this.review.version}</span>
          </div>
          <span class="status-badge status-${status}"> ${this.getStatusLabel(status)} </span>
        </div>

        <div class="reviewers-section">
          <div class="reviewers-title">Reviewers</div>
          <div class="reviewers-list">
            ${this.review.reviewers.map(
              (reviewer) => html`
                <div class="reviewer-chip">
                  <div class="reviewer-avatar">${reviewer.name.charAt(0)}</div>
                  <span>${reviewer.name}</span>
                  ${reviewer.hasReviewed ? html`<span class="reviewer-reviewed">✓</span>` : ''}
                </div>
              `,
            )}
          </div>
        </div>

        <div class="comments-count">
          ${this.review.comments.length} comments
          ${unresolvedComments > 0 ? html`<span>(${unresolvedComments} unresolved)</span>` : ''}
          <sp-button variant="secondary" size="s" @click=${this.openComments}> View Comments </sp-button>
        </div>

        ${this.renderActions()} ${this.renderTimeline()}
      </div>
    `;
  }

  private renderActions() {
    if (!this.review) return '';

    const status = this.review.status.toLowerCase();
    const canApprove = status === 'pending_review' || status === 'in_review';
    const canReject = status === 'pending_review' || status === 'in_review';
    const canRequestChanges = status === 'pending_review' || status === 'in_review';

    if (!canApprove && !canReject) return '';

    return html`
      <div class="actions-section">
        ${canApprove ? html` <sp-button variant="primary" @click=${this.approveReview}> Approve </sp-button> ` : ''}
        ${
          canRequestChanges
            ? html` <sp-button variant="secondary" @click=${this.requestChanges}> Request Changes </sp-button> `
            : ''
        }
        ${canReject ? html` <sp-button variant="negative" @click=${this.rejectReview}> Reject </sp-button> ` : ''}
      </div>
    `;
  }

  private renderTimeline() {
    if (!this.review) return '';

    const events = [];

    events.push({
      action: 'Review started',
      user: this.review.createdBy,
      date: this.review.createdAt,
    });

    if (this.review.approvedAt) {
      events.push({
        action: 'Approved',
        user: this.review.approvedBy,
        date: this.review.approvedAt,
      });
    }

    if (this.review.rejectedAt) {
      events.push({
        action: `Rejected: ${this.review.rejectionReason}`,
        user: this.review.rejectedBy,
        date: this.review.rejectedAt,
      });
    }

    return html`
      <div class="timeline">
        <div class="timeline-title">Activity</div>
        ${events.map(
          (event) => html`
            <div class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-action">${event.action}</div>
                <div class="timeline-meta">${event.user} · ${this.formatDate(event.date)}</div>
              </div>
            </div>
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'review-panel': ReviewPanel;
  }
}
