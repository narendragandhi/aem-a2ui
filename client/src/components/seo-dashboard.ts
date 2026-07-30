/**
 * SEO Dashboard Component
 * Comprehensive SEO analysis with SERP, backlinks, PageSpeed, and Rich Results
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ContentSuggestion } from '../lib/types.js';
import { SerpAnalyzerService, SerpAnalysis } from '../lib/seo-serp-analyzer.js';
import { BacklinkAnalyzerService, BacklinkProfile } from '../lib/seo-backlinks.js';
import {
  PageSpeedService,
  PageSpeedAnalysis,
  formatMetricValue,
  getCoreWebVitalsStatus,
} from '../lib/seo-pagespeed.js';
import { RichResultsValidator, ValidationResult } from '../lib/seo-rich-results.js';
import { autoGenerateSchema } from '../lib/seo-schema.js';

type DashboardTab = 'overview' | 'serp' | 'backlinks' | 'pagespeed' | 'rich-results';

@customElement('seo-dashboard')
export class SeoDashboard extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family, 'Adobe Clean', sans-serif);
    }

    .dashboard {
      background: var(--spectrum-gray-100, #f5f5f5);
      border-radius: 8px;
      overflow: hidden;
    }

    .dashboard-header {
      background: linear-gradient(135deg, #2c3e50, #3498db);
      color: white;
      padding: 20px;
    }

    .dashboard-title {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .dashboard-subtitle {
      margin: 0;
      font-size: 13px;
      opacity: 0.9;
    }

    .tabs {
      display: flex;
      background: var(--spectrum-gray-200, #e5e5e5);
      border-bottom: 1px solid var(--spectrum-gray-300, #d5d5d5);
      overflow-x: auto;
    }

    .tab {
      padding: 12px 16px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 13px;
      color: var(--spectrum-gray-700, #505050);
      border-bottom: 2px solid transparent;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .tab:hover {
      background: var(--spectrum-gray-300, #d5d5d5);
    }

    .tab.active {
      color: var(--spectrum-blue-600, #1473e6);
      border-bottom-color: var(--spectrum-blue-600, #1473e6);
      background: white;
    }

    .tab-content {
      padding: 20px;
      background: white;
      min-height: 400px;
    }

    /* Overview Tab */
    .overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .score-card {
      background: var(--spectrum-gray-50, #fafafa);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      border: 1px solid var(--spectrum-gray-200, #e5e5e5);
    }

    .score-card-label {
      font-size: 12px;
      color: var(--spectrum-gray-600, #6e6e6e);
      margin-bottom: 8px;
    }

    .score-card-value {
      font-size: 32px;
      font-weight: 700;
    }

    .score-card-value.good {
      color: #2ecc71;
    }
    .score-card-value.warning {
      color: #f39c12;
    }
    .score-card-value.poor {
      color: #e74c3c;
    }

    .score-card-detail {
      font-size: 11px;
      color: var(--spectrum-gray-500, #7e7e7e);
      margin-top: 4px;
    }

    /* SERP Tab */
    .serp-header {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    .serp-input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid var(--spectrum-gray-300, #d5d5d5);
      border-radius: 4px;
      font-size: 14px;
    }

    .serp-button {
      padding: 10px 20px;
      background: var(--spectrum-blue-600, #1473e6);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    .serp-button:hover {
      background: var(--spectrum-blue-700, #0d66d0);
    }

    .serp-button:disabled {
      background: var(--spectrum-gray-400, #b3b3b3);
      cursor: not-allowed;
    }

    .serp-results {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .serp-result {
      padding: 16px;
      border: 1px solid var(--spectrum-gray-200, #e5e5e5);
      border-radius: 6px;
    }

    .serp-position {
      display: inline-block;
      width: 28px;
      height: 28px;
      line-height: 28px;
      text-align: center;
      background: var(--spectrum-blue-600, #1473e6);
      color: white;
      border-radius: 50%;
      font-size: 12px;
      font-weight: 600;
      margin-right: 12px;
    }

    .serp-result-title {
      color: var(--spectrum-blue-600, #1473e6);
      font-size: 16px;
      margin-bottom: 4px;
      cursor: pointer;
    }

    .serp-result-url {
      color: var(--spectrum-green-600, #268e6c);
      font-size: 12px;
      margin-bottom: 4px;
    }

    .serp-result-description {
      color: var(--spectrum-gray-700, #505050);
      font-size: 13px;
      line-height: 1.4;
    }

    .opportunity-list {
      margin-top: 20px;
    }

    .opportunity-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: var(--spectrum-gray-50, #fafafa);
      border-radius: 6px;
      margin-bottom: 8px;
    }

    .opportunity-type {
      padding: 4px 8px;
      background: var(--spectrum-blue-100, #e0f0ff);
      color: var(--spectrum-blue-700, #0d66d0);
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .opportunity-content {
      flex: 1;
    }

    .opportunity-title {
      font-weight: 500;
      margin-bottom: 4px;
    }

    .opportunity-description {
      font-size: 12px;
      color: var(--spectrum-gray-600, #6e6e6e);
    }

    /* Backlinks Tab */
    .backlink-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }

    .backlink-stat {
      background: var(--spectrum-gray-50, #fafafa);
      padding: 16px;
      border-radius: 6px;
      text-align: center;
    }

    .backlink-stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--spectrum-blue-600, #1473e6);
    }

    .backlink-stat-label {
      font-size: 11px;
      color: var(--spectrum-gray-600, #6e6e6e);
      margin-top: 4px;
    }

    .backlink-list {
      border: 1px solid var(--spectrum-gray-200, #e5e5e5);
      border-radius: 6px;
      overflow: hidden;
    }

    .backlink-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--spectrum-gray-200, #e5e5e5);
    }

    .backlink-item:last-child {
      border-bottom: none;
    }

    .backlink-domain {
      flex: 1;
      font-weight: 500;
    }

    .backlink-da {
      padding: 4px 8px;
      background: var(--spectrum-gray-100, #f5f5f5);
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
    }

    .backlink-da.high {
      background: #d4edda;
      color: #155724;
    }
    .backlink-da.medium {
      background: #fff3cd;
      color: #856404;
    }
    .backlink-da.low {
      background: #f8d7da;
      color: #721c24;
    }

    /* PageSpeed Tab */
    .pagespeed-url-input {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .cwv-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .cwv-card {
      background: var(--spectrum-gray-50, #fafafa);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      border: 2px solid transparent;
    }

    .cwv-card.good {
      border-color: #2ecc71;
    }
    .cwv-card.needs-improvement {
      border-color: #f39c12;
    }
    .cwv-card.poor {
      border-color: #e74c3c;
    }

    .cwv-label {
      font-size: 11px;
      color: var(--spectrum-gray-600, #6e6e6e);
      margin-bottom: 4px;
    }

    .cwv-value {
      font-size: 24px;
      font-weight: 700;
    }

    .cwv-rating {
      font-size: 11px;
      margin-top: 4px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .cwv-rating.good {
      color: #2ecc71;
    }
    .cwv-rating.needs-improvement {
      color: #f39c12;
    }
    .cwv-rating.poor {
      color: #e74c3c;
    }

    .opportunities-list {
      margin-top: 24px;
    }

    .opportunity-header {
      font-weight: 600;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--spectrum-gray-200, #e5e5e5);
    }

    .pagespeed-opportunity {
      display: flex;
      align-items: center;
      padding: 12px;
      background: var(--spectrum-gray-50, #fafafa);
      border-radius: 6px;
      margin-bottom: 8px;
    }

    .pagespeed-opportunity-priority {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 12px;
    }

    .pagespeed-opportunity-priority.high {
      background: #e74c3c;
    }
    .pagespeed-opportunity-priority.medium {
      background: #f39c12;
    }
    .pagespeed-opportunity-priority.low {
      background: #2ecc71;
    }

    .pagespeed-opportunity-content {
      flex: 1;
    }

    .pagespeed-opportunity-title {
      font-weight: 500;
      margin-bottom: 2px;
    }

    .pagespeed-opportunity-savings {
      font-size: 12px;
      color: var(--spectrum-gray-600, #6e6e6e);
    }

    /* Rich Results Tab */
    .validation-status {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .validation-status.valid {
      background: #d4edda;
      border: 1px solid #c3e6cb;
    }

    .validation-status.invalid {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
    }

    .validation-icon {
      font-size: 24px;
    }

    .validation-text {
      flex: 1;
    }

    .validation-title {
      font-weight: 600;
      margin-bottom: 4px;
    }

    .validation-subtitle {
      font-size: 12px;
      opacity: 0.8;
    }

    .eligible-features {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 20px;
    }

    .feature-badge {
      padding: 6px 12px;
      background: var(--spectrum-green-100, #e0f8e9);
      color: var(--spectrum-green-700, #107c41);
      border-radius: 16px;
      font-size: 12px;
      font-weight: 500;
    }

    .validation-errors {
      margin-bottom: 16px;
    }

    .error-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 10px 12px;
      background: #f8d7da;
      border-radius: 4px;
      margin-bottom: 6px;
      font-size: 13px;
    }

    .error-icon {
      color: #e74c3c;
    }

    .warning-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 10px 12px;
      background: #fff3cd;
      border-radius: 4px;
      margin-bottom: 6px;
      font-size: 13px;
    }

    .warning-icon {
      color: #f39c12;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: var(--spectrum-gray-600, #6e6e6e);
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid var(--spectrum-gray-300, #d5d5d5);
      border-top-color: var(--spectrum-blue-600, #1473e6);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 12px;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      color: var(--spectrum-gray-800, #323232);
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: var(--spectrum-gray-600, #6e6e6e);
    }

    .empty-state-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .anchor-chart {
      display: flex;
      height: 20px;
      border-radius: 10px;
      overflow: hidden;
      margin-top: 12px;
    }

    .anchor-segment {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: white;
      font-weight: 500;
    }

    .anchor-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 8px;
      font-size: 11px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
    }
  `;

  @property({ type: Object }) content: ContentSuggestion | null = null;
  @property({ type: String }) targetUrl = '';

  @state() private activeTab: DashboardTab = 'overview';
  @state() private targetKeyword = '';
  @state() private serpAnalysis: SerpAnalysis | null = null;
  @state() private backlinkProfile: BacklinkProfile | null = null;
  @state() private pageSpeedAnalysis: PageSpeedAnalysis | null = null;
  @state() private richResultsValidation: ValidationResult | null = null;
  @state() private loading: Record<string, boolean> = {};

  private serpService = new SerpAnalyzerService();
  private backlinkService = new BacklinkAnalyzerService();
  private pageSpeedService = new PageSpeedService();
  private richResultsValidator = new RichResultsValidator();

  override connectedCallback() {
    super.connectedCallback();
    this.initializeAnalysis();
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('content') && this.content) {
      this.initializeAnalysis();
    }
  }

  private async initializeAnalysis() {
    if (!this.content) return;

    // Auto-validate rich results
    const schema = autoGenerateSchema(this.content);
    this.richResultsValidation = this.richResultsValidator.validate(schema);

    // Extract keyword from content
    this.targetKeyword = this.extractKeyword(this.content);
  }

  private extractKeyword(content: ContentSuggestion): string {
    // Extract main keyword from title
    const title = content.title || '';
    const words = title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    return words.slice(0, 3).join(' ');
  }

  private async analyzeSERP() {
    if (!this.targetKeyword) return;

    this.loading = { ...this.loading, serp: true };
    try {
      this.serpAnalysis = await this.serpService.analyzeSerpForKeyword(this.targetKeyword);
    } finally {
      this.loading = { ...this.loading, serp: false };
    }
  }

  private async analyzeBacklinks() {
    const domain = this.targetUrl ? new URL(this.targetUrl).hostname : 'example.com';

    this.loading = { ...this.loading, backlinks: true };
    try {
      this.backlinkProfile = await this.backlinkService.getBacklinkProfile(domain);
    } finally {
      this.loading = { ...this.loading, backlinks: false };
    }
  }

  private async analyzePageSpeed() {
    const url = this.targetUrl || 'https://example.com';

    this.loading = { ...this.loading, pagespeed: true };
    try {
      this.pageSpeedAnalysis = await this.pageSpeedService.analyzeUrl(url);
    } finally {
      this.loading = { ...this.loading, pagespeed: false };
    }
  }

  override render() {
    return html`
      <div class="dashboard">
        <div class="dashboard-header">
          <h3 class="dashboard-title">SEO Command Center</h3>
          <p class="dashboard-subtitle">Comprehensive analysis: SERP, Backlinks, PageSpeed & Rich Results</p>
        </div>

        <div class="tabs">
          ${(['overview', 'serp', 'backlinks', 'pagespeed', 'rich-results'] as DashboardTab[]).map(
            (tab) => html`
              <button class="tab ${this.activeTab === tab ? 'active' : ''}" @click=${() => (this.activeTab = tab)}>
                ${this.getTabLabel(tab)}
              </button>
            `,
          )}
        </div>

        <div class="tab-content">${this.renderTabContent()}</div>
      </div>
    `;
  }

  private getTabLabel(tab: DashboardTab): string {
    const labels: Record<DashboardTab, string> = {
      overview: 'Overview',
      serp: 'SERP Analysis',
      backlinks: 'Backlinks',
      pagespeed: 'PageSpeed',
      'rich-results': 'Rich Results',
    };
    return labels[tab];
  }

  private renderTabContent() {
    switch (this.activeTab) {
      case 'overview':
        return this.renderOverview();
      case 'serp':
        return this.renderSerpTab();
      case 'backlinks':
        return this.renderBacklinksTab();
      case 'pagespeed':
        return this.renderPageSpeedTab();
      case 'rich-results':
        return this.renderRichResultsTab();
    }
  }

  private renderOverview() {
    return html`
      <div class="overview-grid">
        <div class="score-card">
          <div class="score-card-label">Rich Results</div>
          <div class="score-card-value ${this.richResultsValidation?.valid ? 'good' : 'poor'}">
            ${this.richResultsValidation?.valid ? 'Valid' : 'Issues'}
          </div>
          <div class="score-card-detail">
            ${this.richResultsValidation?.eligibleFeatures.length || 0} features eligible
          </div>
        </div>

        <div class="score-card">
          <div class="score-card-label">PageSpeed</div>
          <div class="score-card-value ${this.getScoreClass(this.pageSpeedAnalysis?.scores.performance || 0)}">
            ${this.pageSpeedAnalysis?.scores.performance || '--'}
          </div>
          <div class="score-card-detail">Performance score</div>
        </div>

        <div class="score-card">
          <div class="score-card-label">Backlinks</div>
          <div class="score-card-value good">${this.backlinkProfile?.totalBacklinks?.toLocaleString() || '--'}</div>
          <div class="score-card-detail">Total backlinks</div>
        </div>

        <div class="score-card">
          <div class="score-card-label">Domain Authority</div>
          <div class="score-card-value ${this.getScoreClass(this.backlinkProfile?.domainAuthority || 0)}">
            ${this.backlinkProfile?.domainAuthority || '--'}
          </div>
          <div class="score-card-detail">DA score</div>
        </div>
      </div>

      <div class="section-title">Quick Actions</div>
      <div style="display: flex; gap: 12px; flex-wrap: wrap;">
        <button class="serp-button" @click=${this.analyzeSERP} ?disabled=${this.loading.serp}>
          ${this.loading.serp ? 'Analyzing...' : 'Analyze SERP'}
        </button>
        <button class="serp-button" @click=${this.analyzeBacklinks} ?disabled=${this.loading.backlinks}>
          ${this.loading.backlinks ? 'Analyzing...' : 'Check Backlinks'}
        </button>
        <button class="serp-button" @click=${this.analyzePageSpeed} ?disabled=${this.loading.pagespeed}>
          ${this.loading.pagespeed ? 'Analyzing...' : 'Test PageSpeed'}
        </button>
      </div>
    `;
  }

  private renderSerpTab() {
    return html`
      <div class="serp-header">
        <input
          type="text"
          class="serp-input"
          placeholder="Enter target keyword..."
          .value=${this.targetKeyword}
          @input=${(e: Event) => (this.targetKeyword = (e.target as HTMLInputElement).value)}
        />
        <button class="serp-button" @click=${this.analyzeSERP} ?disabled=${this.loading.serp || !this.targetKeyword}>
          ${this.loading.serp ? 'Analyzing...' : 'Analyze SERP'}
        </button>
      </div>

      ${
        this.loading.serp
          ? html`
              <div class="loading">
                <div class="spinner"></div>
                Analyzing search results...
              </div>
            `
          : this.serpAnalysis
            ? html`
                <div class="overview-grid" style="margin-bottom: 24px;">
                  <div class="score-card">
                    <div class="score-card-label">Search Volume</div>
                    <div class="score-card-value good">${this.serpAnalysis.searchVolume?.toLocaleString()}</div>
                    <div class="score-card-detail">monthly searches</div>
                  </div>
                  <div class="score-card">
                    <div class="score-card-label">Difficulty</div>
                    <div class="score-card-value ${this.getScoreClass(100 - (this.serpAnalysis.difficulty || 0))}">
                      ${this.serpAnalysis.difficulty}
                    </div>
                    <div class="score-card-detail">keyword difficulty</div>
                  </div>
                  <div class="score-card">
                    <div class="score-card-label">CPC</div>
                    <div class="score-card-value good">$${this.serpAnalysis.cpc?.toFixed(2)}</div>
                    <div class="score-card-detail">cost per click</div>
                  </div>
                </div>

                <div class="section-title">Top 5 Results</div>
                <div class="serp-results">
                  ${this.serpAnalysis.results.slice(0, 5).map(
            (result) => html`
              <div class="serp-result">
                <span class="serp-position">${result.position}</span>
                <div style="display: inline-block; vertical-align: top;">
                  <div class="serp-result-title">${result.title}</div>
                  <div class="serp-result-url">${result.url}</div>
                  <div class="serp-result-description">${result.description}</div>
                </div>
              </div>
            `,
          )}
                </div>

                ${
          this.serpAnalysis.opportunities.length > 0
            ? html`
                <div class="opportunity-list">
                  <div class="section-title">SERP Opportunities</div>
                  ${this.serpAnalysis.opportunities.map(
              (opp) => html`
                <div class="opportunity-item">
                  <span class="opportunity-type">${opp.type.replace('_', ' ')}</span>
                  <div class="opportunity-content">
                    <div class="opportunity-title">${opp.description}</div>
                    <div class="opportunity-description">${opp.recommendation}</div>
                  </div>
                </div>
              `,
            )}
                </div>
              `
            : ''
        }
              `
            : html`
                <div class="empty-state">
                  <div class="empty-state-icon">🔍</div>
                  <p>Enter a keyword to analyze the search results</p>
                </div>
              `
      }
    `;
  }

  private renderBacklinksTab() {
    return html`
      <div class="serp-header">
        <input
          type="text"
          class="serp-input"
          placeholder="Enter domain (e.g., example.com)..."
          .value=${this.targetUrl}
          @input=${(e: Event) => (this.targetUrl = (e.target as HTMLInputElement).value)}
        />
        <button class="serp-button" @click=${this.analyzeBacklinks} ?disabled=${this.loading.backlinks}>
          ${this.loading.backlinks ? 'Analyzing...' : 'Analyze Backlinks'}
        </button>
      </div>

      ${
        this.loading.backlinks
          ? html`
              <div class="loading">
                <div class="spinner"></div>
                Analyzing backlink profile...
              </div>
            `
          : this.backlinkProfile
            ? html`
                <div class="backlink-stats">
                  <div class="backlink-stat">
                    <div class="backlink-stat-value">${this.backlinkProfile.totalBacklinks.toLocaleString()}</div>
                    <div class="backlink-stat-label">Total Backlinks</div>
                  </div>
                  <div class="backlink-stat">
                    <div class="backlink-stat-value">${this.backlinkProfile.uniqueDomains.toLocaleString()}</div>
                    <div class="backlink-stat-label">Referring Domains</div>
                  </div>
                  <div class="backlink-stat">
                    <div class="backlink-stat-value">${this.backlinkProfile.domainAuthority}</div>
                    <div class="backlink-stat-label">Domain Authority</div>
                  </div>
                  <div class="backlink-stat">
                    <div class="backlink-stat-value">${this.backlinkProfile.spamScore}%</div>
                    <div class="backlink-stat-label">Spam Score</div>
                  </div>
                  <div class="backlink-stat">
                    <div class="backlink-stat-value">+${this.backlinkProfile.newLinks30Days}</div>
                    <div class="backlink-stat-label">New (30 days)</div>
                  </div>
                  <div class="backlink-stat">
                    <div class="backlink-stat-value">-${this.backlinkProfile.lostLinks30Days}</div>
                    <div class="backlink-stat-label">Lost (30 days)</div>
                  </div>
                </div>

                <div class="section-title">Anchor Text Distribution</div>
                <div class="anchor-chart">
                  <div
                    class="anchor-segment"
                    style="width: ${this.backlinkProfile.anchorTextDistribution.branded}%; background: #3498db;"
                  >
                    ${this.backlinkProfile.anchorTextDistribution.branded}%
                  </div>
                  <div
                    class="anchor-segment"
                    style="width: ${this.backlinkProfile.anchorTextDistribution.exact}%; background: #2ecc71;"
                  >
                    ${this.backlinkProfile.anchorTextDistribution.exact}%
                  </div>
                  <div
                    class="anchor-segment"
                    style="width: ${this.backlinkProfile.anchorTextDistribution.partial}%; background: #f39c12;"
                  >
                    ${this.backlinkProfile.anchorTextDistribution.partial}%
                  </div>
                  <div
                    class="anchor-segment"
                    style="width: ${this.backlinkProfile.anchorTextDistribution.naked}%; background: #9b59b6;"
                  >
                    ${this.backlinkProfile.anchorTextDistribution.naked}%
                  </div>
                  <div
                    class="anchor-segment"
                    style="width: ${this.backlinkProfile.anchorTextDistribution.generic}%; background: #e74c3c;"
                  >
                    ${this.backlinkProfile.anchorTextDistribution.generic}%
                  </div>
                </div>
                <div class="anchor-legend">
                  <div class="legend-item"><span class="legend-color" style="background: #3498db;"></span> Branded</div>
                  <div class="legend-item">
                    <span class="legend-color" style="background: #2ecc71;"></span> Exact Match
                  </div>
                  <div class="legend-item"><span class="legend-color" style="background: #f39c12;"></span> Partial</div>
                  <div class="legend-item">
                    <span class="legend-color" style="background: #9b59b6;"></span> Naked URL
                  </div>
                  <div class="legend-item"><span class="legend-color" style="background: #e74c3c;"></span> Generic</div>
                </div>

                <div class="section-title" style="margin-top: 24px;">Top Linking Domains</div>
                <div class="backlink-list">
                  ${this.backlinkProfile.topLinkingDomains.slice(0, 10).map(
            (domain) => html`
              <div class="backlink-item">
                <span class="backlink-domain">${domain.domain}</span>
                <span class="backlink-da ${this.getDaClass(domain.domainAuthority)}">
                  DA ${domain.domainAuthority}
                </span>
              </div>
            `,
          )}
                </div>
              `
            : html`
                <div class="empty-state">
                  <div class="empty-state-icon">🔗</div>
                  <p>Enter a domain to analyze its backlink profile</p>
                </div>
              `
      }
    `;
  }

  private renderPageSpeedTab() {
    return html`
      <div class="pagespeed-url-input">
        <input
          type="text"
          class="serp-input"
          placeholder="Enter URL to test (e.g., https://example.com)..."
          .value=${this.targetUrl}
          @input=${(e: Event) => (this.targetUrl = (e.target as HTMLInputElement).value)}
        />
        <button class="serp-button" @click=${this.analyzePageSpeed} ?disabled=${this.loading.pagespeed}>
          ${this.loading.pagespeed ? 'Testing...' : 'Run Test'}
        </button>
      </div>

      ${
        this.loading.pagespeed
          ? html`
              <div class="loading">
                <div class="spinner"></div>
                Running PageSpeed analysis...
              </div>
            `
          : this.pageSpeedAnalysis
            ? html`
                <div class="overview-grid">
                  <div class="score-card">
                    <div class="score-card-label">Performance</div>
                    <div class="score-card-value ${this.getScoreClass(this.pageSpeedAnalysis.scores.performance)}">
                      ${this.pageSpeedAnalysis.scores.performance}
                    </div>
                  </div>
                  <div class="score-card">
                    <div class="score-card-label">Accessibility</div>
                    <div class="score-card-value ${this.getScoreClass(this.pageSpeedAnalysis.scores.accessibility)}">
                      ${this.pageSpeedAnalysis.scores.accessibility}
                    </div>
                  </div>
                  <div class="score-card">
                    <div class="score-card-label">Best Practices</div>
                    <div class="score-card-value ${this.getScoreClass(this.pageSpeedAnalysis.scores.bestPractices)}">
                      ${this.pageSpeedAnalysis.scores.bestPractices}
                    </div>
                  </div>
                  <div class="score-card">
                    <div class="score-card-label">SEO</div>
                    <div class="score-card-value ${this.getScoreClass(this.pageSpeedAnalysis.scores.seo)}">
                      ${this.pageSpeedAnalysis.scores.seo}
                    </div>
                  </div>
                </div>

                <div class="section-title">Core Web Vitals</div>
                <div class="cwv-grid">
                  ${Object.entries(this.pageSpeedAnalysis.coreWebVitals).map(
            ([key, metric]) => html`
              <div class="cwv-card ${metric.rating}">
                <div class="cwv-label">${this.getCwvLabel(key)}</div>
                <div class="cwv-value">${formatMetricValue(metric)}</div>
                <div class="cwv-rating ${metric.rating}">${metric.rating.replace('-', ' ')}</div>
              </div>
            `,
          )}
                </div>

                ${
          this.pageSpeedAnalysis.opportunities.length > 0
            ? html`
                <div class="opportunities-list">
                  <div class="opportunity-header">Optimization Opportunities</div>
                  ${this.pageSpeedAnalysis.opportunities.map(
              (opp) => html`
                <div class="pagespeed-opportunity">
                  <div
                    class="pagespeed-opportunity-priority ${opp.priority >= 7 ? 'high' : opp.priority >= 4 ? 'medium' : 'low'}"
                  ></div>
                  <div class="pagespeed-opportunity-content">
                    <div class="pagespeed-opportunity-title">${opp.title}</div>
                    <div class="pagespeed-opportunity-savings">
                      ${opp.savings.ms ? `Save ${opp.savings.ms}ms` : ''}
                      ${opp.savings.bytes ? `Save ${this.formatBytes(opp.savings.bytes)}` : ''}
                    </div>
                  </div>
                </div>
              `,
            )}
                </div>
              `
            : ''
        }
              `
            : html`
                <div class="empty-state">
                  <div class="empty-state-icon">⚡</div>
                  <p>Enter a URL to test its PageSpeed and Core Web Vitals</p>
                </div>
              `
      }
    `;
  }

  private renderRichResultsTab() {
    if (!this.richResultsValidation) {
      return html`
        <div class="empty-state">
          <div class="empty-state-icon">📊</div>
          <p>No content to validate</p>
        </div>
      `;
    }

    const validation = this.richResultsValidation;

    return html`
      <div class="validation-status ${validation.valid && validation.richResultsEligible ? 'valid' : 'invalid'}">
        <span class="validation-icon">${validation.valid && validation.richResultsEligible ? '✅' : '⚠️'}</span>
        <div class="validation-text">
          <div class="validation-title">
            ${
              validation.valid && validation.richResultsEligible
                ? 'Schema Valid - Rich Results Eligible'
                : 'Schema Issues Detected'
            }
          </div>
          <div class="validation-subtitle">Schema Type: ${validation.schemaType}</div>
        </div>
      </div>

      ${
        validation.eligibleFeatures.length > 0
          ? html`
              <div class="section-title">Eligible Rich Result Features</div>
              <div class="eligible-features">
                ${validation.eligibleFeatures.map(
            (feature) => html` <span class="feature-badge">${feature.replace('_', ' ')}</span> `,
          )}
              </div>
            `
          : ''
      }
      ${
        validation.errors.length > 0
          ? html`
              <div class="section-title">Errors</div>
              <div class="validation-errors">
                ${validation.errors.map(
            (error) => html`
              <div class="error-item">
                <span class="error-icon">✕</span>
                <div><strong>${error.property}:</strong> ${error.message}</div>
              </div>
            `,
          )}
              </div>
            `
          : ''
      }
      ${
        validation.warnings.length > 0
          ? html`
              <div class="section-title">Warnings</div>
              <div class="validation-errors">
                ${validation.warnings.map(
            (warning) => html`
              <div class="warning-item">
                <span class="warning-icon">!</span>
                <div>
                  <strong>${warning.property}:</strong> ${warning.message} <br /><em>${warning.recommendation}</em>
                </div>
              </div>
            `,
          )}
              </div>
            `
          : ''
      }
      ${
        validation.recommendations.length > 0
          ? html`
              <div class="section-title">Recommendations</div>
              <ul style="margin: 0; padding-left: 20px;">
                ${validation.recommendations.map(
            (rec) => html` <li style="margin-bottom: 8px; color: var(--spectrum-gray-700);">${rec}</li> `,
          )}
              </ul>
            `
          : ''
      }
    `;
  }

  private getScoreClass(score: number): string {
    if (score >= 90) return 'good';
    if (score >= 50) return 'warning';
    return 'poor';
  }

  private getDaClass(da: number): string {
    if (da >= 50) return 'high';
    if (da >= 30) return 'medium';
    return 'low';
  }

  private getCwvLabel(key: string): string {
    const labels: Record<string, string> = {
      lcp: 'LCP (Largest Contentful Paint)',
      fid: 'FID (First Input Delay)',
      cls: 'CLS (Cumulative Layout Shift)',
      fcp: 'FCP (First Contentful Paint)',
      ttfb: 'TTFB (Time to First Byte)',
      inp: 'INP (Interaction to Next Paint)',
    };
    return labels[key] || key.toUpperCase();
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'seo-dashboard': SeoDashboard;
  }
}
