import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ContentVersion, ContentSuggestion } from '../lib/types.js';

import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/dialog/sp-dialog.js';
import '@spectrum-web-components/illustrated-message/sp-illustrated-message.js';

const API_BASE = 'http://localhost:10003';

@customElement('version-history')
export class VersionHistory extends LitElement {
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

    .version-count {
      font-size: 11px;
      color: var(--spectrum-gray-600);
      font-weight: normal;
    }

    .timeline {
      position: relative;
      padding-left: 24px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 7px;
      top: 8px;
      bottom: 8px;
      width: 2px;
      background: var(--spectrum-gray-300);
    }

    .version-item {
      position: relative;
      padding: 12px;
      background: white;
      border-radius: 8px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
    }

    .version-item:hover {
      border-color: var(--spectrum-blue-400);
    }

    .version-item.selected {
      border-color: var(--spectrum-blue-500);
      background: var(--spectrum-blue-50);
    }

    .version-item.current {
      border-color: var(--spectrum-green-400);
    }

    .version-dot {
      position: absolute;
      left: -24px;
      top: 16px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--spectrum-gray-400);
      border: 3px solid var(--spectrum-gray-100);
    }

    .version-item.current .version-dot {
      background: var(--spectrum-green-500);
    }

    .version-item.selected .version-dot {
      background: var(--spectrum-blue-500);
    }

    .version-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .version-info {
      flex: 1;
    }

    .version-number {
      font-size: 13px;
      font-weight: 600;
      color: var(--spectrum-gray-800);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .current-badge {
      font-size: 10px;
      padding: 2px 6px;
      background: var(--spectrum-green-100);
      color: var(--spectrum-green-700);
      border-radius: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .version-meta {
      font-size: 11px;
      color: var(--spectrum-gray-600);
      margin-top: 4px;
    }

    .change-note {
      font-size: 12px;
      color: var(--spectrum-gray-700);
      margin-top: 8px;
      padding: 8px;
      background: var(--spectrum-gray-100);
      border-radius: 4px;
    }

    .version-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: var(--spectrum-gray-600);
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
    }

    .compare-section {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--spectrum-gray-300);
    }

    .compare-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--spectrum-gray-600);
      margin-bottom: 12px;
      text-transform: uppercase;
    }

    .compare-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .compare-panel {
      background: white;
      border-radius: 8px;
      padding: 12px;
      border: 1px solid var(--spectrum-gray-300);
    }

    .compare-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--spectrum-gray-600);
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .preview-thumbnail {
      width: 100%;
      height: 120px;
      background: var(--spectrum-gray-200);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--spectrum-gray-500);
      font-size: 11px;
      overflow: hidden;
    }

    .preview-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .diff-highlight {
      background: #fff3cd;
      padding: 2px 4px;
      border-radius: 2px;
    }

    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--spectrum-gray-700);
      margin: 12px 0 8px 0;
    }

    .field-diff {
      font-size: 11px;
      color: var(--spectrum-gray-600);
      margin-top: 4px;
    }

    .restore-warning {
      background: var(--spectrum-orange-100);
      border: 1px solid var(--spectrum-orange-300);
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 16px;
      font-size: 12px;
      color: var(--spectrum-orange-800);
    }
  `;

  @property({ type: String }) contentId: string = '';
  @property({ type: Object }) currentContent: ContentSuggestion | null = null;
  @property({ type: String }) currentUser: string = 'demo-user';

  @state() private versions: ContentVersion[] = [];
  @state() private loading = false;
  @state() private selectedVersion: ContentVersion | null = null;
  @state() private showRestoreConfirm = false;
  @state() private comparing = false;

  connectedCallback() {
    super.connectedCallback();
    if (this.contentId) {
      this.loadVersionHistory();
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('contentId') && this.contentId) {
      this.loadVersionHistory();
    }
  }

  private async loadVersionHistory() {
    if (!this.contentId) return;

    this.loading = true;
    try {
      const response = await fetch(`${API_BASE}/content/${this.contentId}/versions`);
      if (response.ok) {
        this.versions = await response.json();
        if (this.versions.length > 0 && !this.selectedVersion) {
          this.selectedVersion = this.versions[0];
        }
      }
    } catch (error) {
      console.error('Failed to load version history:', error);
    } finally {
      this.loading = false;
    }
  }

  private async restoreVersion() {
    if (!this.selectedVersion || !this.contentId) return;

    this.loading = true;
    try {
      const response = await fetch(`${API_BASE}/reviews/${this.contentId}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: this.selectedVersion.content,
          updatedBy: this.currentUser,
          changeNote: `Restored to version ${this.selectedVersion.version}`
        })
      });

      if (response.ok) {
        const updatedReview = await response.json();
        this.dispatchEvent(new CustomEvent('version-restored', {
          detail: { content: updatedReview.content },
          bubbles: true,
          composed: true
        }));
        this.showRestoreConfirm = false;
        this.loadVersionHistory();
      }
    } catch (error) {
      console.error('Failed to restore version:', error);
    } finally {
      this.loading = false;
    }
  }

  private selectVersion(version: ContentVersion) {
    this.selectedVersion = version;
    this.comparing = true;
  }

  private formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getFieldDiff(content1: ContentSuggestion, content2: ContentSuggestion, field: keyof ContentSuggestion): string {
    const val1 = String(content1[field] || '');
    const val2 = String(content2[field] || '');
    if (val1 === val2) return '';
    return `${field}: "${val1}" → "${val2}"`;
  }

  render() {
    if (this.loading && this.versions.length === 0) {
      return html`
        <div class="panel">
          <div class="loading">
            <sp-progress-circle indeterminate size="m"></sp-progress-circle>
          </div>
        </div>
      `;
    }

    if (this.versions.length === 0) {
      return html`
        <div class="panel">
          <div class="empty-state">
            <div class="empty-icon">📚</div>
            <div>No version history</div>
            <div style="font-size: 12px; margin-top: 8px;">
              Content versions will appear here as changes are made
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">
            Version History
            <span class="version-count">(${this.versions.length} versions)</span>
          </span>
          ${this.comparing ? html`
            <sp-button variant="secondary" size="s" @click=${() => this.comparing = false}>
              Back to List
            </sp-button>
          ` : ''}
        </div>

        ${this.comparing && this.selectedVersion ? this.renderComparison() : this.renderTimeline()}
      </div>
    `;
  }

  private renderTimeline() {
    return html`
      <div class="timeline">
        ${this.versions.map((version, index) => {
          const isCurrent = index === 0 && this.currentContent?.id === version.contentId;
          const isSelected = this.selectedVersion?.id === version.id;

          return html`
            <div
              class="version-item ${isSelected ? 'selected' : ''} ${isCurrent ? 'current' : ''}"
              @click=${() => this.selectVersion(version)}
            >
              <div class="version-dot"></div>
              <div class="version-header">
                <div class="version-info">
                  <div class="version-number">
                    Version ${version.version}
                    ${isCurrent ? html`<span class="current-badge">Current</span>` : ''}
                  </div>
                  <div class="version-meta">
                    ${version.createdBy} · ${this.formatDate(version.createdAt)}
                  </div>
                </div>
              </div>

              ${version.changeNote ? html`
                <div class="change-note">${version.changeNote}</div>
              ` : ''}

              <div class="version-actions">
                <sp-button variant="secondary" size="s">
                  View
                </sp-button>
                ${!isCurrent ? html`
                  <sp-button variant="primary" size="s" @click=${(e: Event) => {
                    e.stopPropagation();
                    this.selectedVersion = version;
                    this.showRestoreConfirm = true;
                  }}>
                    Restore
                  </sp-button>
                ` : ''}
              </div>
            </div>
          `;
        })}
      </div>

      ${this.showRestoreConfirm ? this.renderRestoreConfirm() : ''}
    `;
  }

  private renderComparison() {
    if (!this.selectedVersion || !this.currentContent) return '';

    const diffs = [
      this.getFieldDiff(this.currentContent, this.selectedVersion.content, 'title'),
      this.getFieldDiff(this.currentContent, this.selectedVersion.content, 'description'),
      this.getFieldDiff(this.currentContent, this.selectedVersion.content, 'ctaText')
    ].filter(d => d);

    return html`
      <div class="compare-section">
        <div class="compare-title">Comparing Versions</div>

        <div class="compare-grid">
          <div class="compare-panel">
            <div class="compare-label">Current Version</div>
            ${this.renderPreview(this.currentContent, 'Current')}
          </div>
          <div class="compare-panel">
            <div class="compare-label">Version ${this.selectedVersion.version}</div>
            ${this.renderPreview(this.selectedVersion.content, `v${this.selectedVersion.version}`)}
          </div>
        </div>

        ${diffs.length > 0 ? html`
          <div style="margin-top: 16px;">
            <div class="compare-title">Changes</div>
            ${diffs.map(diff => html`
              <div class="field-diff">${diff}</div>
            `)}
          </div>
        ` : html`
          <div style="margin-top: 16px; font-size: 12px; color: var(--spectrum-gray-600);">
            No significant changes detected between these versions.
          </div>
        `}

        <div class="version-actions" style="margin-top: 16px;">
          <sp-button variant="primary" @click=${() => this.showRestoreConfirm = true}>
            Restore This Version
          </sp-button>
        </div>
      </div>

      ${this.showRestoreConfirm ? this.renderRestoreConfirm() : ''}
    `;
  }

  private renderPreview(content: ContentSuggestion, label: string) {
    return html`
      <div style="font-size: 12px;">
        ${content.imageUrl ? html`
          <div class="preview-thumbnail">
            <img src="${content.imageUrl}" alt="${content.imageAlt || ''}" />
          </div>
        ` : html`
          <div class="preview-thumbnail">No Image</div>
        `}

        <div class="section-title">${label}</div>
        <div style="font-weight: 600; margin-bottom: 4px;">${content.title}</div>
        ${content.description ? html`
          <div style="color: var(--spectrum-gray-600); font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${content.description}
          </div>
        ` : ''}
        ${content.ctaText ? html`
          <div style="margin-top: 8px;">
            <span style="background: var(--spectrum-blue-100); padding: 2px 6px; border-radius: 4px; font-size: 10px;">
              ${content.ctaText}
            </span>
          </div>
        ` : ''}
      </div>
    `;
  }

  private renderRestoreConfirm() {
    if (!this.selectedVersion) return '';

    return html`
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
        <div class="panel" style="width: 400px; max-width: 90%;">
          <div class="restore-warning">
            ⚠️ Restoring an older version will create a new version with the old content. This cannot be undone.
          </div>

          <div style="font-size: 13px; margin-bottom: 16px;">
            Restore to <strong>Version ${this.selectedVersion.version}</strong>?
            <div style="font-size: 11px; color: var(--spectrum-gray-600); margin-top: 4px;">
              Created by ${this.selectedVersion.createdBy} on ${this.formatDate(this.selectedVersion.createdAt)}
            </div>
          </div>

          <div style="display: flex; gap: 8px; justify-content: flex-end;">
            <sp-button variant="secondary" @click=${() => this.showRestoreConfirm = false}>
              Cancel
            </sp-button>
            <sp-button variant="primary" ?disabled=${this.loading} @click=${this.restoreVersion}>
              ${this.loading ? 'Restoring...' : 'Restore'}
            </sp-button>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'version-history': VersionHistory;
  }
}
