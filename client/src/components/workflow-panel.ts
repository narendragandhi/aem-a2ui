import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { WorkflowModel, WorkflowInstance, WorkflowStatusType, Review } from '../lib/types.js';

import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/picker/sp-picker.js';
import '@spectrum-web-components/menu/sp-menu.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';

const API_BASE = 'http://localhost:10003';

/**
 * Workflow panel component for submitting content to AEM workflows.
 */
@customElement('workflow-panel')
export class WorkflowPanel extends LitElement {
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
    }

    .workflow-selector {
      margin-bottom: 16px;
    }

    .selector-label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--spectrum-gray-700);
      margin-bottom: 8px;
    }

    .workflow-cards {
      display: grid;
      gap: 8px;
    }

    .workflow-card {
      background: white;
      border: 2px solid var(--spectrum-gray-300);
      border-radius: 8px;
      padding: 12px;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .workflow-card:hover {
      border-color: var(--spectrum-blue-400);
    }

    .workflow-card.selected {
      border-color: var(--spectrum-blue-500);
      background: var(--spectrum-blue-50);
    }

    .workflow-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--spectrum-gray-800);
      margin-bottom: 4px;
    }

    .workflow-description {
      font-size: 11px;
      color: var(--spectrum-gray-600);
    }

    .workflow-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      margin-top: 6px;
    }

    .badge-approval {
      background: #fff3cd;
      color: #856404;
    }

    .submit-section {
      margin-top: 16px;
    }

    .status-section {
      margin-top: 16px;
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-RUNNING {
      background: #cce5ff;
      color: #004085;
    }
    .status-COMPLETED {
      background: #d4edda;
      color: #155724;
    }
    .status-SUSPENDED {
      background: #fff3cd;
      color: #856404;
    }
    .status-ABORTED {
      background: #f8d7da;
      color: #721c24;
    }

    .progress-section {
      margin-top: 12px;
    }

    .progress-label {
      font-size: 12px;
      color: var(--spectrum-gray-700);
      margin-bottom: 8px;
    }

    .progress-bar {
      height: 8px;
      background: var(--spectrum-gray-300);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--spectrum-blue-500);
      transition: width 0.3s;
    }

    .steps-list {
      margin-top: 16px;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid var(--spectrum-gray-200);
    }

    .step:last-child {
      border-bottom: none;
    }

    .step-indicator {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .step-pending {
      background: var(--spectrum-gray-300);
      color: var(--spectrum-gray-600);
    }

    .step-active {
      background: var(--spectrum-blue-500);
      color: white;
    }

    .step-completed {
      background: var(--spectrum-green-500);
      color: white;
    }

    .step-skipped {
      background: var(--spectrum-gray-400);
      color: white;
    }

    .step-info {
      flex: 1;
    }

    .step-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--spectrum-gray-800);
    }

    .step-meta {
      font-size: 11px;
      color: var(--spectrum-gray-600);
    }

    .actions-section {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: var(--spectrum-gray-600);
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
    }

    .info-box {
      background: var(--spectrum-blue-100);
      border-radius: 6px;
      padding: 12px;
      font-size: 12px;
      color: var(--spectrum-blue-800);
      margin-bottom: 16px;
    }

    .requires-approval {
      color: var(--spectrum-orange-600);
      font-size: 11px;
      margin-top: 8px;
    }
  `;

  @property({ type: String }) contentId: string = '';
  @property({ type: String }) contentPath: string = '';
  @property({ type: Object }) review: Review | null = null;
  @property({ type: String }) currentUser: string = 'demo-user';

  @state() private availableWorkflows: WorkflowModel[] = [];
  @state() private selectedWorkflowId: string = '';
  @state() private activeWorkflow: WorkflowInstance | null = null;
  @state() private loading = false;

  connectedCallback() {
    super.connectedCallback();
    this.loadWorkflowModels();
    if (this.contentId) {
      this.loadActiveWorkflow();
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('contentId') && this.contentId) {
      this.loadActiveWorkflow();
    }
  }

  private async loadWorkflowModels() {
    try {
      const response = await fetch(`${API_BASE}/workflows/models`);
      if (response.ok) {
        this.availableWorkflows = await response.json();
        if (this.availableWorkflows.length > 0) {
          this.selectedWorkflowId = this.availableWorkflows[0].id;
        }
      }
    } catch (error) {
      console.error('Failed to load workflow models:', error);
    }
  }

  private async loadActiveWorkflow() {
    if (!this.contentId) return;

    try {
      const response = await fetch(`${API_BASE}/workflows?contentId=${this.contentId}`);
      if (response.ok) {
        const workflows: WorkflowInstance[] = await response.json();
        // Get the most recent running workflow
        this.activeWorkflow =
          workflows.find((w) => w.status === 'RUNNING') || (workflows.length > 0 ? workflows[0] : null);
      }
    } catch (error) {
      console.error('Failed to load active workflow:', error);
    }
  }

  private async submitToWorkflow() {
    if (!this.contentId || !this.selectedWorkflowId) return;

    this.loading = true;
    try {
      const response = await fetch(`${API_BASE}/workflows/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: this.contentId,
          contentPath: this.contentPath || `/content/aem-demo/${this.contentId}`,
          workflowModelId: this.selectedWorkflowId,
          initiatedBy: this.currentUser,
          metadata: {
            reviewId: this.review?.id,
          },
        }),
      });

      if (response.ok) {
        this.activeWorkflow = await response.json();
        this.dispatchEvent(
          new CustomEvent('workflow-started', {
            detail: { workflow: this.activeWorkflow },
            bubbles: true,
            composed: true,
          }),
        );
      }
    } catch (error) {
      console.error('Failed to submit to workflow:', error);
    } finally {
      this.loading = false;
    }
  }

  private async advanceWorkflow() {
    if (!this.activeWorkflow) return;

    this.loading = true;
    try {
      const response = await fetch(`${API_BASE}/workflows/${this.activeWorkflow.id}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: 'Approved by ' + this.currentUser }),
      });

      if (response.ok) {
        this.activeWorkflow = await response.json();
        this.dispatchEvent(
          new CustomEvent('workflow-advanced', {
            detail: { workflow: this.activeWorkflow },
            bubbles: true,
            composed: true,
          }),
        );
      }
    } catch (error) {
      console.error('Failed to advance workflow:', error);
    } finally {
      this.loading = false;
    }
  }

  private async cancelWorkflow() {
    if (!this.activeWorkflow) return;

    const reason = prompt('Reason for cancellation:');
    if (!reason) return;

    this.loading = true;
    try {
      const response = await fetch(
        `${API_BASE}/workflows/${this.activeWorkflow.id}?reason=${encodeURIComponent(reason)}`,
        { method: 'DELETE' },
      );

      if (response.ok) {
        this.activeWorkflow = await response.json();
        this.dispatchEvent(
          new CustomEvent('workflow-cancelled', {
            detail: { workflow: this.activeWorkflow },
            bubbles: true,
            composed: true,
          }),
        );
      }
    } catch (error) {
      console.error('Failed to cancel workflow:', error);
    } finally {
      this.loading = false;
    }
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

    // If there's an active workflow, show status
    if (this.activeWorkflow && this.activeWorkflow.status === 'RUNNING') {
      return this.renderWorkflowStatus();
    }

    // Check if review is approved before allowing workflow submission
    const canSubmit = this.review?.status === 'approved';

    return html`
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">AEM Workflow</span>
        </div>

        ${
          !canSubmit
            ? html`
                <div class="info-box">
                  Content must be approved before submitting to an AEM workflow.
                  ${this.review ? html`Current status: <strong>${this.review.status}</strong>` : ''}
                </div>
              `
            : ''
        }

        <div class="workflow-selector">
          <label class="selector-label">Select Workflow</label>
          <div class="workflow-cards">
            ${this.availableWorkflows.map(
              (wf) => html`
                <div
                  class="workflow-card ${this.selectedWorkflowId === wf.id ? 'selected' : ''}"
                  @click=${() => (this.selectedWorkflowId = wf.id)}
                >
                  <div class="workflow-name">${wf.name}</div>
                  <div class="workflow-description">${wf.description}</div>
                  ${
                  wf.requiresApproval
                    ? html` <span class="workflow-badge badge-approval">Requires Approval</span> `
                    : ''
                }
                </div>
              `,
            )}
          </div>
        </div>

        <div class="submit-section">
          <sp-button
            variant="primary"
            ?disabled=${!canSubmit || !this.selectedWorkflowId}
            @click=${this.submitToWorkflow}
          >
            Submit to Workflow
          </sp-button>
        </div>

        ${
          this.activeWorkflow && this.activeWorkflow.status !== 'RUNNING'
            ? html`
                <div
                  class="status-section"
                  style="margin-top: 24px; border-top: 1px solid var(--spectrum-gray-300); padding-top: 16px;"
                >
                  <div style="font-size: 12px; color: var(--spectrum-gray-600); margin-bottom: 8px;">
                    Previous Workflow
                  </div>
                  ${this.renderCompletedWorkflow()}
                </div>
              `
            : ''
        }
      </div>
    `;
  }

  private renderWorkflowStatus() {
    if (!this.activeWorkflow) return '';

    const progress = ((this.activeWorkflow.currentStepIndex + 1) / this.activeWorkflow.steps.length) * 100;

    return html`
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Workflow Status</span>
          <span class="status-badge status-${this.activeWorkflow.status}"> ${this.activeWorkflow.status} </span>
        </div>

        <div style="font-size: 13px; color: var(--spectrum-gray-700); margin-bottom: 8px;">
          ${this.activeWorkflow.workflowModelName}
        </div>

        <div class="progress-section">
          <div class="progress-label">
            Step ${this.activeWorkflow.currentStepIndex + 1} of ${this.activeWorkflow.steps.length}:
            <strong>${this.activeWorkflow.currentStep}</strong>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
        </div>

        <div class="steps-list">
          ${this.activeWorkflow.steps.map(
            (step, index) => html`
              <div class="step">
                <div class="step-indicator step-${step.status}">
                  ${
                  step.status === 'completed'
                    ? '✓'
                    : step.status === 'active'
                      ? '●'
                      : step.status === 'skipped'
                        ? '—'
                        : index + 1
                }
                </div>
                <div class="step-info">
                  <div class="step-name">${step.name}</div>
                  ${
                  step.completedAt
                    ? html`
                        <div class="step-meta">
                          Completed ${this.formatDate(step.completedAt)} ${step.comment ? html` - ${step.comment}` : ''}
                        </div>
                      `
                    : step.startedAt
                      ? html` <div class="step-meta">Started ${this.formatDate(step.startedAt)}</div> `
                      : ''
                }
                </div>
              </div>
            `,
          )}
        </div>

        <div class="actions-section">
          <sp-button variant="primary" @click=${this.advanceWorkflow}> Complete Current Step </sp-button>
          <sp-button variant="secondary" @click=${this.cancelWorkflow}> Cancel Workflow </sp-button>
        </div>
      </div>
    `;
  }

  private renderCompletedWorkflow() {
    if (!this.activeWorkflow) return '';

    return html`
      <div style="font-size: 12px;">
        <div style="margin-bottom: 8px;">
          <span class="status-badge status-${this.activeWorkflow.status}"> ${this.activeWorkflow.status} </span>
          <span style="margin-left: 8px; color: var(--spectrum-gray-600);">
            ${this.activeWorkflow.workflowModelName}
          </span>
        </div>
        ${
          this.activeWorkflow.completedAt
            ? html`
                <div style="color: var(--spectrum-gray-600);">
                  Completed ${this.formatDate(this.activeWorkflow.completedAt)}
                </div>
              `
            : ''
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'workflow-panel': WorkflowPanel;
  }
}
