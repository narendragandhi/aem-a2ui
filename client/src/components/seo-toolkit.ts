/**
 * SEO Toolkit Panel
 * Comprehensive SEO analysis and optimization tools
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ContentSuggestion } from '../lib/types.js';
import {
  analyzeContent,
  calculateReadability,
  generateMetaTags,
  getSeoSuggestions,
  analyzeKeyword,
  SeoScore,
  ReadabilityMetrics,
  MetaTags,
  KeywordAnalysis,
} from '../lib/seo-analyzer.js';
import {
  autoGenerateSchema,
  generateJsonLdScript,
  validateSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
  SchemaType,
} from '../lib/seo-schema.js';
import { logger } from '../services/logger.js';

type SeoTab = 'score' | 'keywords' | 'meta' | 'schema' | 'readability';

@customElement('seo-toolkit')
export class SeoToolkit extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family-base, 'Adobe Clean', sans-serif);
    }

    .panel {
      background: var(--spectrum-gray-50, white);
      border: 1px solid var(--spectrum-gray-300);
      border-radius: 8px;
      overflow: hidden;
      margin: 16px;
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white;
      cursor: pointer;
    }

    .panel-title {
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .score-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
    }

    .score-badge.excellent {
      background: rgba(255, 255, 255, 0.3);
    }
    .score-badge.good {
      background: rgba(255, 255, 255, 0.25);
    }
    .score-badge.needs-work {
      background: rgba(255, 200, 100, 0.4);
    }
    .score-badge.poor {
      background: rgba(255, 100, 100, 0.4);
    }

    .expand-icon {
      transition: transform 0.2s;
    }

    .expand-icon.expanded {
      transform: rotate(180deg);
    }

    .panel-body {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;
    }

    .panel-body.expanded {
      max-height: 2000px;
    }

    .tabs {
      display: flex;
      border-bottom: 1px solid var(--spectrum-gray-300);
      background: var(--spectrum-gray-100);
    }

    .tab {
      flex: 1;
      padding: 12px 8px;
      border: none;
      background: transparent;
      font-size: 12px;
      font-weight: 500;
      color: var(--spectrum-gray-700);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.15s;
      text-align: center;
    }

    .tab:hover {
      background: var(--spectrum-gray-200);
    }

    .tab.active {
      color: #059669;
      border-bottom-color: #059669;
      background: white;
    }

    .tab-content {
      padding: 16px;
    }

    /* Score Overview */
    .score-overview {
      display: grid;
      grid-template-columns: 120px 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .score-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      margin: 0 auto;
    }

    .score-circle.excellent {
      background: linear-gradient(135deg, #059669, #10b981);
      color: white;
    }
    .score-circle.good {
      background: linear-gradient(135deg, #0891b2, #06b6d4);
      color: white;
    }
    .score-circle.needs-work {
      background: linear-gradient(135deg, #d97706, #f59e0b);
      color: white;
    }
    .score-circle.poor {
      background: linear-gradient(135deg, #dc2626, #ef4444);
      color: white;
    }

    .score-value {
      font-size: 32px;
      line-height: 1;
    }

    .score-label {
      font-size: 11px;
      opacity: 0.9;
      margin-top: 4px;
    }

    .score-categories {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .category-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .category-name {
      width: 80px;
      font-size: 12px;
      color: var(--spectrum-gray-700);
    }

    .category-bar {
      flex: 1;
      height: 8px;
      background: var(--spectrum-gray-200);
      border-radius: 4px;
      overflow: hidden;
    }

    .category-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .category-fill.excellent {
      background: #10b981;
    }
    .category-fill.good {
      background: #06b6d4;
    }
    .category-fill.needs-work {
      background: #f59e0b;
    }
    .category-fill.poor {
      background: #ef4444;
    }

    .category-score {
      width: 40px;
      text-align: right;
      font-size: 12px;
      font-weight: 600;
    }

    /* Issues List */
    .issues-section {
      margin-top: 16px;
    }

    .section-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--spectrum-gray-800);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .issue-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .issue-item {
      display: flex;
      gap: 10px;
      padding: 10px;
      border-radius: 6px;
      font-size: 12px;
    }

    .issue-item.error {
      background: #fef2f2;
      border-left: 3px solid #ef4444;
    }
    .issue-item.warning {
      background: #fffbeb;
      border-left: 3px solid #f59e0b;
    }
    .issue-item.info {
      background: #f0f9ff;
      border-left: 3px solid #0ea5e9;
    }

    .issue-icon {
      font-size: 14px;
    }

    .issue-content {
      flex: 1;
    }

    .issue-message {
      font-weight: 500;
      margin-bottom: 2px;
    }

    .issue-suggestion {
      color: var(--spectrum-gray-600);
      font-size: 11px;
    }

    .passed-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 12px;
    }

    .passed-item {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      background: #ecfdf5;
      color: #059669;
      border-radius: 4px;
      font-size: 11px;
    }

    /* Keyword Analysis */
    .keyword-input {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }

    .keyword-input input {
      flex: 1;
      padding: 10px 12px;
      border: 1px solid var(--spectrum-gray-400);
      border-radius: 6px;
      font-size: 13px;
    }

    .keyword-input button {
      padding: 10px 16px;
      background: #059669;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }

    .keyword-input button:hover {
      background: #047857;
    }

    .keyword-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 16px;
    }

    .stat-card {
      padding: 12px;
      background: var(--spectrum-gray-100);
      border-radius: 8px;
      text-align: center;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--spectrum-gray-900);
    }

    .stat-label {
      font-size: 11px;
      color: var(--spectrum-gray-600);
      margin-top: 2px;
    }

    .density-bar {
      margin-top: 16px;
    }

    .density-scale {
      display: flex;
      height: 8px;
      background: var(--spectrum-gray-200);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }

    .density-zone {
      flex: 1;
    }

    .density-zone.low {
      background: #fef3c7;
    }
    .density-zone.optimal {
      background: #d1fae5;
    }
    .density-zone.high {
      background: #fee2e2;
    }

    .density-marker {
      position: absolute;
      top: -4px;
      width: 4px;
      height: 16px;
      background: #1f2937;
      border-radius: 2px;
      transform: translateX(-50%);
    }

    .density-labels {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: var(--spectrum-gray-500);
      margin-top: 4px;
    }

    /* Meta Tags */
    .meta-preview {
      border: 1px solid var(--spectrum-gray-300);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }

    .meta-preview-title {
      font-size: 11px;
      color: var(--spectrum-gray-500);
      margin-bottom: 8px;
    }

    .serp-preview {
      max-width: 600px;
    }

    .serp-title {
      font-size: 18px;
      color: #1a0dab;
      text-decoration: underline;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .serp-url {
      font-size: 13px;
      color: #006621;
      margin-bottom: 4px;
    }

    .serp-description {
      font-size: 13px;
      color: #545454;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .meta-tags-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .meta-tag-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
    }

    .meta-tag-name {
      width: 120px;
      color: var(--spectrum-gray-600);
    }

    .meta-tag-value {
      flex: 1;
      padding: 6px 8px;
      background: var(--spectrum-gray-100);
      border-radius: 4px;
      font-family: monospace;
      font-size: 11px;
      word-break: break-all;
    }

    /* Schema */
    .schema-selector {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
    }

    .schema-chip {
      padding: 6px 12px;
      background: var(--spectrum-gray-200);
      border: none;
      border-radius: 16px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }

    .schema-chip:hover {
      background: var(--spectrum-gray-300);
    }

    .schema-chip.selected {
      background: #059669;
      color: white;
    }

    .code-block {
      background: #1f2937;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      max-height: 300px;
    }

    .code-block pre {
      margin: 0;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 11px;
      line-height: 1.5;
      color: #e5e7eb;
      white-space: pre-wrap;
    }

    .code-block .key {
      color: #93c5fd;
    }
    .code-block .string {
      color: #86efac;
    }
    .code-block .number {
      color: #fde68a;
    }

    .validation-result {
      margin-top: 12px;
      padding: 10px;
      border-radius: 6px;
      font-size: 12px;
    }

    .validation-result.valid {
      background: #ecfdf5;
      color: #059669;
    }

    .validation-result.invalid {
      background: #fef2f2;
      color: #dc2626;
    }

    /* Readability */
    .readability-metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    .metric-card {
      padding: 16px;
      background: var(--spectrum-gray-100);
      border-radius: 8px;
    }

    .metric-value {
      font-size: 28px;
      font-weight: 700;
      color: var(--spectrum-gray-900);
    }

    .metric-label {
      font-size: 12px;
      color: var(--spectrum-gray-600);
      margin-top: 4px;
    }

    .metric-bar {
      margin-top: 8px;
      height: 6px;
      background: var(--spectrum-gray-300);
      border-radius: 3px;
      overflow: hidden;
    }

    .metric-bar-fill {
      height: 100%;
      border-radius: 3px;
    }

    .reading-level {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      background: #f0fdf4;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .reading-level-icon {
      font-size: 24px;
    }

    .reading-level-text {
      font-size: 14px;
      font-weight: 500;
      color: #166534;
    }

    /* Actions */
    .actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid var(--spectrum-gray-200);
    }

    .btn {
      padding: 10px 16px;
      border-radius: 6px;
      border: none;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .btn-primary {
      background: #059669;
      color: white;
    }

    .btn-primary:hover {
      background: #047857;
    }

    .btn-secondary {
      background: var(--spectrum-gray-200);
      color: var(--spectrum-gray-800);
    }

    .btn-secondary:hover {
      background: var(--spectrum-gray-300);
    }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: var(--spectrum-gray-500);
    }

    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 12px;
    }
  `;

  @property({ type: Object }) content: ContentSuggestion | null = null;
  @property({ type: String }) baseUrl = '';

  @state() private expanded = false;
  @state() private activeTab: SeoTab = 'score';
  @state() private targetKeyword = '';
  @state() private seoScore: SeoScore | null = null;
  @state() private readabilityMetrics: ReadabilityMetrics | null = null;
  @state() private metaTags: MetaTags | null = null;
  @state() private keywordAnalysis: KeywordAnalysis | null = null;
  @state() private selectedSchemaType: 'auto' | SchemaType = 'auto';

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('content') && this.content) {
      this.analyzeCurrentContent();
    }
  }

  private analyzeCurrentContent() {
    if (!this.content) return;

    const fullText = `${this.content.title} ${this.content.subtitle || ''} ${this.content.description}`;
    this.seoScore = analyzeContent(this.content, this.targetKeyword || undefined);
    this.readabilityMetrics = calculateReadability(fullText);
    this.metaTags = generateMetaTags(this.content, this.baseUrl);

    if (this.targetKeyword) {
      this.keywordAnalysis = analyzeKeyword(fullText, this.targetKeyword);
    }
  }

  private getScoreClass(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'needs-work';
    return 'poor';
  }

  private getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Poor';
  }

  render() {
    const overallScore = this.seoScore?.overall || 0;
    const scoreClass = this.getScoreClass(overallScore);

    return html`
      <div class="panel">
        <div class="panel-header" @click=${() => (this.expanded = !this.expanded)}>
          <span class="panel-title">
            <span>🔍</span>
            SEO Toolkit
          </span>
          <div style="display: flex; align-items: center; gap: 12px;">
            ${this.content ? html` <span class="score-badge ${scoreClass}">${overallScore}/100</span> ` : ''}
            <span class="expand-icon ${this.expanded ? 'expanded' : ''}">▼</span>
          </div>
        </div>

        <div class="panel-body ${this.expanded ? 'expanded' : ''}">
          ${
            this.content
              ? html`
                  <div class="tabs">
                    <button
                      class="tab ${this.activeTab === 'score' ? 'active' : ''}"
                      @click=${() => (this.activeTab = 'score')}
                    >
                      📊 Score
                    </button>
                    <button
                      class="tab ${this.activeTab === 'keywords' ? 'active' : ''}"
                      @click=${() => (this.activeTab = 'keywords')}
                    >
                      🔑 Keywords
                    </button>
                    <button
                      class="tab ${this.activeTab === 'meta' ? 'active' : ''}"
                      @click=${() => (this.activeTab = 'meta')}
                    >
                      🏷️ Meta
                    </button>
                    <button
                      class="tab ${this.activeTab === 'schema' ? 'active' : ''}"
                      @click=${() => (this.activeTab = 'schema')}
                    >
                      📝 Schema
                    </button>
                    <button
                      class="tab ${this.activeTab === 'readability' ? 'active' : ''}"
                      @click=${() => (this.activeTab = 'readability')}
                    >
                      📖 Readability
                    </button>
                  </div>

                  <div class="tab-content">${this.renderActiveTab()}</div>
                `
              : html`
                  <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <p>Select content to analyze SEO</p>
                  </div>
                `
          }
        </div>
      </div>
    `;
  }

  private renderActiveTab() {
    switch (this.activeTab) {
      case 'score':
        return this.renderScoreTab();
      case 'keywords':
        return this.renderKeywordsTab();
      case 'meta':
        return this.renderMetaTab();
      case 'schema':
        return this.renderSchemaTab();
      case 'readability':
        return this.renderReadabilityTab();
    }
  }

  private renderScoreTab() {
    if (!this.seoScore) return html``;

    const { overall, categories } = this.seoScore;
    const scoreClass = this.getScoreClass(overall);

    // Collect all issues
    const allIssues = Object.values(categories).flatMap((cat) => cat.issues);
    const allPassed = Object.values(categories).flatMap((cat) => cat.passed);

    return html`
      <div class="score-overview">
        <div class="score-circle ${scoreClass}">
          <span class="score-value">${overall}</span>
          <span class="score-label">${this.getScoreLabel(overall)}</span>
        </div>

        <div class="score-categories">
          ${Object.entries(categories).map(([name, cat]) => {
            const percent = (cat.score / cat.maxScore) * 100;
            const catClass = this.getScoreClass(percent);
            return html`
              <div class="category-row">
                <span class="category-name">${this.formatCategoryName(name)}</span>
                <div class="category-bar">
                  <div class="category-fill ${catClass}" style="width: ${percent}%"></div>
                </div>
                <span class="category-score">${cat.score}/${cat.maxScore}</span>
              </div>
            `;
          })}
        </div>
      </div>

      ${
        allIssues.length > 0
          ? html`
              <div class="issues-section">
                <div class="section-title">⚠️ Issues to Fix (${allIssues.length})</div>
                <div class="issue-list">
                  ${allIssues.slice(0, 5).map(
              (issue) => html`
                <div class="issue-item ${issue.severity}">
                  <span class="issue-icon">
                    ${issue.severity === 'error' ? '❌' : issue.severity === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                  <div class="issue-content">
                    <div class="issue-message">${issue.message}</div>
                    <div class="issue-suggestion">${issue.suggestion}</div>
                  </div>
                </div>
              `,
            )}
                </div>
              </div>
            `
          : ''
      }
      ${
        allPassed.length > 0
          ? html`
              <div class="section-title" style="margin-top: 16px;">✅ Passed Checks</div>
              <div class="passed-list">
                ${allPassed.map((item) => html` <span class="passed-item">✓ ${item}</span> `)}
              </div>
            `
          : ''
      }
    `;
  }

  private renderKeywordsTab() {
    return html`
      <div class="keyword-input">
        <input
          type="text"
          placeholder="Enter target keyword..."
          .value=${this.targetKeyword}
          @input=${(e: Event) => (this.targetKeyword = (e.target as HTMLInputElement).value)}
          @keypress=${(e: KeyboardEvent) => e.key === 'Enter' && this.analyzeKeyword()}
        />
        <button @click=${this.analyzeKeyword}>Analyze</button>
      </div>

      ${
        this.keywordAnalysis
          ? html`
              <div class="keyword-stats">
                <div class="stat-card">
                  <div class="stat-value">${this.keywordAnalysis.count}</div>
                  <div class="stat-label">Occurrences</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${this.keywordAnalysis.density.toFixed(1)}%</div>
                  <div class="stat-label">Density</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${this.keywordAnalysis.prominence.toFixed(0)}%</div>
                  <div class="stat-label">Prominence</div>
                </div>
              </div>

              <div class="density-bar">
                <div class="section-title">Keyword Density</div>
                <div class="density-scale">
                  <div class="density-zone low"></div>
                  <div class="density-zone optimal"></div>
                  <div class="density-zone high"></div>
                  <div class="density-marker" style="left: ${Math.min(this.keywordAnalysis.density * 20, 100)}%"></div>
                </div>
                <div class="density-labels">
                  <span>0%</span>
                  <span>1-2% (Optimal)</span>
                  <span>5%+</span>
                </div>
              </div>

              <div class="passed-list" style="margin-top: 16px;">
                ${this.keywordAnalysis.inTitle ? html`<span class="passed-item">✓ In Title</span>` : ''}
                ${this.keywordAnalysis.inDescription ? html`<span class="passed-item">✓ In Description</span>` : ''}
                ${this.keywordAnalysis.prominence > 50 ? html`<span class="passed-item">✓ Early Placement</span>` : ''}
              </div>
            `
          : html`
              <div class="empty-state">
                <p>Enter a keyword to analyze its optimization</p>
              </div>
            `
      }
    `;
  }

  private renderMetaTab() {
    if (!this.metaTags) return html``;

    return html`
      <div class="meta-preview">
        <div class="meta-preview-title">Google Search Preview</div>
        <div class="serp-preview">
          <div class="serp-title">${this.metaTags.title}</div>
          <div class="serp-url">${this.metaTags.canonical || 'https://example.com/page'}</div>
          <div class="serp-description">${this.metaTags.description}</div>
        </div>
      </div>

      <div class="section-title">Meta Tags</div>
      <div class="meta-tags-list">
        <div class="meta-tag-row">
          <span class="meta-tag-name">Title</span>
          <span class="meta-tag-value">${this.metaTags.title} (${this.metaTags.title.length} chars)</span>
        </div>
        <div class="meta-tag-row">
          <span class="meta-tag-name">Description</span>
          <span class="meta-tag-value">${this.metaTags.description} (${this.metaTags.description.length} chars)</span>
        </div>
        <div class="meta-tag-row">
          <span class="meta-tag-name">Keywords</span>
          <span class="meta-tag-value">${this.metaTags.keywords.join(', ')}</span>
        </div>
        <div class="meta-tag-row">
          <span class="meta-tag-name">og:title</span>
          <span class="meta-tag-value">${this.metaTags.ogTitle}</span>
        </div>
        <div class="meta-tag-row">
          <span class="meta-tag-name">og:description</span>
          <span class="meta-tag-value">${this.metaTags.ogDescription}</span>
        </div>
        <div class="meta-tag-row">
          <span class="meta-tag-name">og:image</span>
          <span class="meta-tag-value">${this.metaTags.ogImage || '(none)'}</span>
        </div>
        <div class="meta-tag-row">
          <span class="meta-tag-name">twitter:card</span>
          <span class="meta-tag-value">${this.metaTags.twitterCard}</span>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" @click=${this.copyMetaTags}>📋 Copy Meta Tags</button>
        <button class="btn btn-secondary" @click=${this.downloadMetaTags}>⬇️ Download</button>
      </div>
    `;
  }

  private renderSchemaTab() {
    if (!this.content) return html``;

    const schema = autoGenerateSchema(this.content, { baseUrl: this.baseUrl });
    const validation = validateSchema(schema);
    const jsonLd = generateJsonLdScript(schema);

    return html`
      <div class="schema-selector">
        <button
          class="schema-chip ${this.selectedSchemaType === 'auto' ? 'selected' : ''}"
          @click=${() => (this.selectedSchemaType = 'auto')}
        >
          Auto-detect
        </button>
        <button
          class="schema-chip ${this.selectedSchemaType === 'Article' ? 'selected' : ''}"
          @click=${() => (this.selectedSchemaType = 'Article')}
        >
          Article
        </button>
        <button
          class="schema-chip ${this.selectedSchemaType === 'Product' ? 'selected' : ''}"
          @click=${() => (this.selectedSchemaType = 'Product')}
        >
          Product
        </button>
        <button
          class="schema-chip ${this.selectedSchemaType === 'WebPage' ? 'selected' : ''}"
          @click=${() => (this.selectedSchemaType = 'WebPage')}
        >
          WebPage
        </button>
      </div>

      <div class="section-title">JSON-LD Structured Data</div>
      <div class="code-block">
        <pre>${this.formatJson(schema)}</pre>
      </div>

      <div class="validation-result ${validation.valid ? 'valid' : 'invalid'}">
        ${validation.valid ? '✅ Schema is valid' : `❌ ${validation.errors.join(', ')}`}
        ${validation.warnings.length > 0 ? html`<br />⚠️ ${validation.warnings.join(', ')}` : ''}
      </div>

      <div class="actions">
        <button class="btn btn-primary" @click=${() => this.copySchema(schema)}>📋 Copy Schema</button>
        <button class="btn btn-secondary" @click=${() => this.copySchema(schema, true)}>🏷️ Copy with Script Tag</button>
      </div>
    `;
  }

  private renderReadabilityTab() {
    if (!this.readabilityMetrics) return html``;

    const { fleschReadingEase, fleschKincaid, wordCount, sentenceCount, avgSentenceLength, readingTime, gradeLevel } =
      this.readabilityMetrics;

    return html`
      <div class="reading-level">
        <span class="reading-level-icon">📚</span>
        <span class="reading-level-text">${gradeLevel} reading level • ${readingTime} min read</span>
      </div>

      <div class="readability-metrics">
        <div class="metric-card">
          <div class="metric-value">${fleschReadingEase.toFixed(0)}</div>
          <div class="metric-label">Flesch Reading Ease</div>
          <div class="metric-bar">
            <div
              class="metric-bar-fill"
              style="width: ${fleschReadingEase}%; background: ${this.getReadabilityColor(fleschReadingEase)}"
            ></div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${fleschKincaid.toFixed(1)}</div>
          <div class="metric-label">Grade Level</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${wordCount}</div>
          <div class="metric-label">Words</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${sentenceCount}</div>
          <div class="metric-label">Sentences</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${avgSentenceLength.toFixed(1)}</div>
          <div class="metric-label">Avg Words/Sentence</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${readingTime}</div>
          <div class="metric-label">Minutes to Read</div>
        </div>
      </div>

      <div class="section-title">Readability Scale</div>
      <div style="font-size: 12px; color: var(--spectrum-gray-600); line-height: 1.6;">
        <strong>90-100:</strong> Very easy (5th grade)<br />
        <strong>60-70:</strong> Standard (8th-9th grade) - Ideal for web<br />
        <strong>30-50:</strong> Difficult (College level)<br />
        <strong>0-30:</strong> Very difficult (Graduate level)
      </div>
    `;
  }

  // Helper methods
  private formatCategoryName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  private formatJson(obj: Record<string, unknown>): string {
    return JSON.stringify(obj, null, 2);
  }

  private getReadabilityColor(score: number): string {
    if (score >= 60) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#ef4444';
  }

  private analyzeKeyword() {
    if (!this.content || !this.targetKeyword) return;
    const fullText = `${this.content.title} ${this.content.subtitle || ''} ${this.content.description}`;
    this.keywordAnalysis = analyzeKeyword(fullText, this.targetKeyword);
    this.seoScore = analyzeContent(this.content, this.targetKeyword);
  }

  private async copyMetaTags() {
    if (!this.metaTags) return;

    const tags = `<title>${this.metaTags.title}</title>
<meta name="description" content="${this.metaTags.description}">
<meta name="keywords" content="${this.metaTags.keywords.join(', ')}">
<meta property="og:title" content="${this.metaTags.ogTitle}">
<meta property="og:description" content="${this.metaTags.ogDescription}">
<meta property="og:image" content="${this.metaTags.ogImage}">
<meta property="og:type" content="${this.metaTags.ogType}">
<meta name="twitter:card" content="${this.metaTags.twitterCard}">
<meta name="twitter:title" content="${this.metaTags.twitterTitle}">
<meta name="twitter:description" content="${this.metaTags.twitterDescription}">
<link rel="canonical" href="${this.metaTags.canonical}">`;

    await navigator.clipboard.writeText(tags);
    logger.info('Meta tags copied to clipboard', 'SEO');
  }

  private downloadMetaTags() {
    if (!this.metaTags) return;
    const content = JSON.stringify(this.metaTags, null, 2);
    this.downloadFile(content, 'meta-tags.json');
  }

  private async copySchema(schema: Record<string, unknown>, withScriptTag = false) {
    const content = withScriptTag ? generateJsonLdScript(schema) : JSON.stringify(schema, null, 2);
    await navigator.clipboard.writeText(content);
    logger.info('Schema copied to clipboard', 'SEO');
  }

  private downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'seo-toolkit': SeoToolkit;
  }
}
