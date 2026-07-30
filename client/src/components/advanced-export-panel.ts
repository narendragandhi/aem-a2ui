/**
 * Advanced Export Panel
 * Unified panel for all AEM export options
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ContentSuggestion } from '../lib/types.js';
import { createContentPackage, createPagePackage, downloadPackage } from '../lib/aem-content-package.js';
import {
  XF_TEMPLATES,
  contentToExperienceFragment,
  experienceFragmentToJcr,
  experienceFragmentToHtml,
} from '../lib/aem-experience-fragments.js';
import { STYLE_GROUPS, generateStylePolicy, generateStyleSystemCss } from '../lib/aem-style-system.js';
import {
  generateComponentDialog,
  dialogToXml,
  dialogToJson,
  generateDesignDialog,
} from '../lib/aem-component-dialogs.js';
import {
  generateComponentClientLib,
  generateClientLibContentXml,
  generateBaseClientLib,
} from '../lib/aem-clientlibs.js';
import { createDeployService, AemDeployService } from '../services/aem-deploy.js';
import { logger } from '../services/logger.js';

type ExportTab = 'package' | 'xf' | 'styles' | 'dialog' | 'clientlib' | 'deploy';

@customElement('advanced-export-panel')
export class AdvancedExportPanel extends LitElement {
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
      background: linear-gradient(135deg, #6b46c1 0%, #805ad5 100%);
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

    .expand-icon {
      transition: transform 0.2s;
    }

    .expand-icon.expanded {
      transform: rotate(180deg);
    }

    .panel-body {
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition:
        max-height 0.3s ease,
        padding 0.3s ease;
    }

    .panel-body.expanded {
      max-height: 2000px;
      padding: 16px;
    }

    .tabs {
      display: flex;
      border-bottom: 1px solid var(--spectrum-gray-300);
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .tab {
      padding: 10px 16px;
      border: none;
      background: transparent;
      font-size: 13px;
      font-weight: 500;
      color: var(--spectrum-gray-700);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      transition: all 0.15s;
    }

    .tab:hover {
      color: var(--spectrum-purple-600);
      background: var(--spectrum-purple-50);
    }

    .tab.active {
      color: var(--spectrum-purple-600);
      border-bottom-color: var(--spectrum-purple-600);
    }

    .section {
      margin-bottom: 20px;
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

    .form-group {
      margin-bottom: 12px;
    }

    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 500;
      color: var(--spectrum-gray-700);
      margin-bottom: 4px;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--spectrum-gray-400);
      border-radius: 4px;
      font-size: 13px;
    }

    .checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: var(--spectrum-gray-100);
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
    }

    .checkbox-item:hover {
      background: var(--spectrum-gray-200);
    }

    .checkbox-item.selected {
      background: var(--spectrum-purple-100);
      color: var(--spectrum-purple-700);
    }

    .code-preview {
      background: var(--spectrum-gray-800);
      border-radius: 6px;
      padding: 12px;
      max-height: 200px;
      overflow: auto;
    }

    .code-preview pre {
      margin: 0;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 11px;
      line-height: 1.4;
      color: var(--spectrum-gray-100);
      white-space: pre-wrap;
      word-break: break-word;
    }

    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
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
      transition: all 0.15s;
    }

    .btn-primary {
      background: var(--spectrum-purple-500);
      color: white;
    }

    .btn-primary:hover {
      background: var(--spectrum-purple-600);
    }

    .btn-secondary {
      background: var(--spectrum-gray-200);
      color: var(--spectrum-gray-800);
    }

    .btn-secondary:hover {
      background: var(--spectrum-gray-300);
    }

    .btn-success {
      background: var(--spectrum-green-500);
      color: white;
    }

    .btn-success:hover {
      background: var(--spectrum-green-600);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .status {
      padding: 10px;
      border-radius: 6px;
      font-size: 13px;
      margin-top: 12px;
    }

    .status.success {
      background: var(--spectrum-green-100);
      color: var(--spectrum-green-700);
    }

    .status.error {
      background: var(--spectrum-red-100);
      color: var(--spectrum-red-700);
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .card {
      padding: 12px;
      background: var(--spectrum-gray-100);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
      border: 2px solid transparent;
    }

    .card:hover {
      background: var(--spectrum-gray-200);
    }

    .card.selected {
      border-color: var(--spectrum-purple-500);
      background: var(--spectrum-purple-50);
    }

    .card-title {
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 4px;
    }

    .card-desc {
      font-size: 11px;
      color: var(--spectrum-gray-600);
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: var(--spectrum-gray-600);
    }
  `;

  @property({ type: Object }) content: ContentSuggestion | null = null;
  @property({ type: Array }) contents: ContentSuggestion[] = [];
  @property({ type: String }) aemUrl = 'http://localhost:4502';
  @property({ type: Boolean }) aemConnected = false;

  @state() private expanded = false;
  @state() private activeTab: ExportTab = 'package';
  @state() private status: { type: 'success' | 'error'; message: string } | null = null;
  @state() private loading = false;

  // Package options
  @state() private packageName = 'aem-component-factory-content';
  @state() private packageGroup = 'aem-component-factory';
  @state() private packageVersion = '1.0.0';

  // XF options
  @state() private selectedXfTemplate = 'hero-xf';
  @state() private selectedXfVariations: string[] = ['web'];

  // Dialog options
  @state() private dialogFormat: 'xml' | 'json' = 'xml';

  // Deploy options
  @state() private deployPath = '/content/aem-component-factory/components';
  @state() private deployUsername = 'admin';
  @state() private deployPassword = 'admin';

  private deployService: AemDeployService | null = null;

  render() {
    return html`
      <div class="panel">
        <div class="panel-header" @click=${() => (this.expanded = !this.expanded)}>
          <span class="panel-title">
            <span>🚀</span>
            Advanced Export Options
          </span>
          <span class="expand-icon ${this.expanded ? 'expanded' : ''}">▼</span>
        </div>

        <div class="panel-body ${this.expanded ? 'expanded' : ''}">
          ${
            this.content || this.contents.length > 0
              ? html`
                  <div class="tabs">
                    <button
                      class="tab ${this.activeTab === 'package' ? 'active' : ''}"
                      @click=${() => (this.activeTab = 'package')}
                    >
                      📦 Package
                    </button>
                    <button
                      class="tab ${this.activeTab === 'xf' ? 'active' : ''}"
                      @click=${() => (this.activeTab = 'xf')}
                    >
                      🧩 Experience Fragment
                    </button>
                    <button
                      class="tab ${this.activeTab === 'styles' ? 'active' : ''}"
                      @click=${() => (this.activeTab = 'styles')}
                    >
                      🎨 Style System
                    </button>
                    <button
                      class="tab ${this.activeTab === 'dialog' ? 'active' : ''}"
                      @click=${() => (this.activeTab = 'dialog')}
                    >
                      ⚙️ Component Dialog
                    </button>
                    <button
                      class="tab ${this.activeTab === 'clientlib' ? 'active' : ''}"
                      @click=${() => (this.activeTab = 'clientlib')}
                    >
                      📁 ClientLib
                    </button>
                    <button
                      class="tab ${this.activeTab === 'deploy' ? 'active' : ''}"
                      @click=${() => (this.activeTab = 'deploy')}
                    >
                      🚀 Deploy to AEM
                    </button>
                  </div>

                  ${this.renderActiveTab()}
                  ${this.status ? html` <div class="status ${this.status.type}">${this.status.message}</div> ` : ''}
                `
              : html` <div class="empty-state">Select content to access export options</div> `
          }
        </div>
      </div>
    `;
  }

  private renderActiveTab() {
    switch (this.activeTab) {
      case 'package':
        return this.renderPackageTab();
      case 'xf':
        return this.renderXfTab();
      case 'styles':
        return this.renderStylesTab();
      case 'dialog':
        return this.renderDialogTab();
      case 'clientlib':
        return this.renderClientLibTab();
      case 'deploy':
        return this.renderDeployTab();
      default:
        return html``;
    }
  }

  private renderPackageTab() {
    return html`
      <div class="section">
        <div class="section-title">📦 Content Package Settings</div>
        <div class="grid-2">
          <div class="form-group">
            <label>Package Name</label>
            <input
              type="text"
              .value=${this.packageName}
              @input=${(e: Event) => (this.packageName = (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="form-group">
            <label>Group</label>
            <input
              type="text"
              .value=${this.packageGroup}
              @input=${(e: Event) => (this.packageGroup = (e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
        <div class="form-group">
          <label>Version</label>
          <input
            type="text"
            .value=${this.packageVersion}
            @input=${(e: Event) => (this.packageVersion = (e.target as HTMLInputElement).value)}
          />
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" @click=${this.downloadContentPackage} ?disabled=${this.loading}>
          ${this.loading ? '⏳' : '⬇️'} Download .zip Package
        </button>
        <button class="btn btn-secondary" @click=${this.downloadPagePackage} ?disabled=${this.loading}>
          📄 Download as Page Package
        </button>
      </div>
    `;
  }

  private renderXfTab() {
    const template = XF_TEMPLATES.find((t) => t.id === this.selectedXfTemplate);

    return html`
      <div class="section">
        <div class="section-title">🧩 Experience Fragment Template</div>
        <div class="grid-2">
          ${XF_TEMPLATES.map(
            (t) => html`
              <div
                class="card ${this.selectedXfTemplate === t.id ? 'selected' : ''}"
                @click=${() => (this.selectedXfTemplate = t.id)}
              >
                <div class="card-title">${t.name}</div>
                <div class="card-desc">${t.description}</div>
              </div>
            `,
          )}
        </div>
      </div>

      ${
        template
          ? html`
              <div class="section">
                <div class="section-title">📱 Variations</div>
                <div class="checkbox-group">
                  ${template.variations.map(
              (v) => html`
                <div
                  class="checkbox-item ${this.selectedXfVariations.includes(v.id) ? 'selected' : ''}"
                  @click=${() => this.toggleXfVariation(v.id)}
                >
                  ${this.getVariationIcon(v.type)} ${v.name}
                </div>
              `,
            )}
                </div>
              </div>

              <div class="section">
                <div class="section-title">Preview</div>
                <div class="code-preview">
                  <pre>${this.getXfPreview()}</pre>
                </div>
              </div>
            `
          : ''
      }

      <div class="actions">
        <button class="btn btn-primary" @click=${this.downloadXfJcr}>⬇️ Download JCR JSON</button>
        <button class="btn btn-secondary" @click=${this.downloadXfHtml}>📄 Download HTML</button>
      </div>
    `;
  }

  private renderStylesTab() {
    const componentType = this.content?.componentType || 'teaser';
    const styleGroups = STYLE_GROUPS[componentType] || [];

    return html`
      <div class="section">
        <div class="section-title">🎨 Style System for ${componentType}</div>
        ${
          styleGroups.length > 0
            ? html`
                ${styleGroups.map(
            (group) => html`
              <div class="form-group">
                <label>${group.name}</label>
                <div class="checkbox-group">
                  ${group.styles.map(
                  (style) => html`
                    <div class="checkbox-item"><code>${style.cssClasses || 'default'}</code> ${style.name}</div>
                  `,
                )}
                </div>
              </div>
            `,
          )}
              `
            : html` <p>No style groups defined for ${componentType}</p> `
        }
      </div>

      <div class="section">
        <div class="section-title">CSS Preview</div>
        <div class="code-preview">
          <pre>${generateStyleSystemCss(componentType)}</pre>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" @click=${() => this.downloadStylePolicy(componentType)}>
          ⬇️ Download Style Policy
        </button>
        <button class="btn btn-secondary" @click=${() => this.downloadStyleCss(componentType)}>🎨 Download CSS</button>
      </div>
    `;
  }

  private renderDialogTab() {
    const componentType = this.content?.componentType || 'teaser';
    const dialog = generateComponentDialog(componentType);

    return html`
      <div class="section">
        <div class="section-title">⚙️ Component Dialog for ${componentType}</div>
        <div class="form-group">
          <label>Output Format</label>
          <div class="checkbox-group">
            <div
              class="checkbox-item ${this.dialogFormat === 'xml' ? 'selected' : ''}"
              @click=${() => (this.dialogFormat = 'xml')}
            >
              XML (_cq_dialog.xml)
            </div>
            <div
              class="checkbox-item ${this.dialogFormat === 'json' ? 'selected' : ''}"
              @click=${() => (this.dialogFormat = 'json')}
            >
              JSON (API)
            </div>
          </div>
        </div>
      </div>

      ${
        dialog
          ? html`
              <div class="section">
                <div class="section-title">Tabs: ${dialog.tabs.map((t) => t.title).join(', ')}</div>
                <div class="code-preview">
                  <pre>
${this.dialogFormat === 'xml' ? dialogToXml(dialog) : JSON.stringify(dialogToJson(dialog), null, 2)}</pre>
                </div>
              </div>
            `
          : ''
      }

      <div class="actions">
        <button class="btn btn-primary" @click=${() => this.downloadDialog(componentType)}>⬇️ Download Dialog</button>
        <button class="btn btn-secondary" @click=${() => this.downloadDesignDialog(componentType)}>
          🎨 Download Design Dialog
        </button>
      </div>
    `;
  }

  private renderClientLibTab() {
    const componentType = this.content?.componentType || 'teaser';
    const clientLib = generateComponentClientLib(componentType);

    return html`
      <div class="section">
        <div class="section-title">📁 ClientLib for ${componentType}</div>
        <div class="form-group">
          <label>Categories</label>
          <code>${clientLib.config.categories.join(', ')}</code>
        </div>
        <div class="form-group">
          <label>Files</label>
          <div class="checkbox-group">
            ${clientLib.files.map(
              (f) => html`
                <div class="checkbox-item">${f.type === 'css' ? '🎨' : f.type === 'js' ? '📜' : '📄'} ${f.path}</div>
              `,
            )}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">.content.xml</div>
        <div class="code-preview">
          <pre>${generateClientLibContentXml(clientLib.config)}</pre>
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-primary" @click=${() => this.downloadClientLib(componentType)}>
          ⬇️ Download ClientLib
        </button>
        <button class="btn btn-secondary" @click=${this.downloadBaseClientLib}>📦 Download Base ClientLib</button>
      </div>
    `;
  }

  private renderDeployTab() {
    return html`
      <div class="section">
        <div class="section-title">🚀 Deploy to AEM</div>
        <div class="form-group">
          <label>AEM Author URL</label>
          <input
            type="text"
            .value=${this.aemUrl}
            @input=${(e: Event) => (this.aemUrl = (e.target as HTMLInputElement).value)}
          />
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label>Username</label>
            <input
              type="text"
              .value=${this.deployUsername}
              @input=${(e: Event) => (this.deployUsername = (e.target as HTMLInputElement).value)}
            />
          </div>
          <div class="form-group">
            <label>Password</label>
            <input
              type="password"
              .value=${this.deployPassword}
              @input=${(e: Event) => (this.deployPassword = (e.target as HTMLInputElement).value)}
            />
          </div>
        </div>
        <div class="form-group">
          <label>Deploy Path</label>
          <input
            type="text"
            .value=${this.deployPath}
            @input=${(e: Event) => (this.deployPath = (e.target as HTMLInputElement).value)}
          />
        </div>
      </div>

      <div class="actions">
        <button class="btn btn-success" @click=${this.deployToAem} ?disabled=${this.loading}>
          ${this.loading ? '⏳ Deploying...' : '🚀 Deploy Content'}
        </button>
        <button class="btn btn-secondary" @click=${this.testConnection} ?disabled=${this.loading}>
          🔗 Test Connection
        </button>
      </div>
    `;
  }

  // Helper methods
  private getVariationIcon(type: string): string {
    const icons: Record<string, string> = {
      web: '🌐',
      email: '📧',
      social: '📱',
      mobile: '📲',
      print: '🖨️',
    };
    return icons[type] || '📄';
  }

  private toggleXfVariation(id: string) {
    if (this.selectedXfVariations.includes(id)) {
      this.selectedXfVariations = this.selectedXfVariations.filter((v) => v !== id);
    } else {
      this.selectedXfVariations = [...this.selectedXfVariations, id];
    }
  }

  private getXfPreview(): string {
    if (!this.content) return '';
    const xf = contentToExperienceFragment(this.content, this.selectedXfTemplate, {
      variations: this.selectedXfVariations,
    });
    return JSON.stringify(experienceFragmentToJcr(xf), null, 2);
  }

  // Download methods
  private async downloadContentPackage() {
    if (!this.content && this.contents.length === 0) return;
    this.loading = true;

    try {
      const items = this.contents.length > 0 ? this.contents : [this.content!];
      const blob = await createContentPackage(items, {
        name: this.packageName,
        group: this.packageGroup,
        version: this.packageVersion,
        contentPath: '/content/aem-component-factory/content',
      });
      downloadPackage(blob, `${this.packageName}-${this.packageVersion}.zip`);
      this.setStatus('success', 'Package downloaded successfully');
    } catch (error) {
      this.setStatus('error', 'Failed to create package');
    } finally {
      this.loading = false;
    }
  }

  private async downloadPagePackage() {
    if (!this.content && this.contents.length === 0) return;
    this.loading = true;

    try {
      const items = this.contents.length > 0 ? this.contents : [this.content!];
      const blob = await createPagePackage(
        items,
        {
          pagePath: '/content/aem-component-factory/pages/generated-page',
          pageTitle: items[0].title,
          template: 'aem-component-factory/components/page',
        },
        {
          name: `${this.packageName}-page`,
          group: this.packageGroup,
          version: this.packageVersion,
          contentPath: '/content/aem-component-factory/pages',
        },
      );
      downloadPackage(blob, `${this.packageName}-page-${this.packageVersion}.zip`);
      this.setStatus('success', 'Page package downloaded');
    } catch (error) {
      this.setStatus('error', 'Failed to create page package');
    } finally {
      this.loading = false;
    }
  }

  private downloadXfJcr() {
    if (!this.content) return;
    const xf = contentToExperienceFragment(this.content, this.selectedXfTemplate, {
      variations: this.selectedXfVariations,
    });
    this.downloadJson(experienceFragmentToJcr(xf), 'experience-fragment.json');
  }

  private downloadXfHtml() {
    if (!this.content) return;
    const xf = contentToExperienceFragment(this.content, this.selectedXfTemplate, {
      variations: this.selectedXfVariations,
    });
    const variation = this.selectedXfVariations[0] || 'web';
    const html = experienceFragmentToHtml(xf, variation);
    this.downloadText(html, `xf-${variation}.html`);
  }

  private downloadStylePolicy(componentType: string) {
    const policy = generateStylePolicy(
      componentType,
      `/conf/aem-component-factory/settings/wcm/policies/${componentType}`,
    );
    this.downloadJson(policy, `${componentType}-style-policy.json`);
  }

  private downloadStyleCss(componentType: string) {
    const css = generateStyleSystemCss(componentType);
    this.downloadText(css, `${componentType}.styles.css`);
  }

  private downloadDialog(componentType: string) {
    const dialog = generateComponentDialog(componentType);
    if (!dialog) return;

    if (this.dialogFormat === 'xml') {
      this.downloadText(dialogToXml(dialog), '_cq_dialog.xml');
    } else {
      this.downloadJson(dialogToJson(dialog), '_cq_dialog.json');
    }
  }

  private downloadDesignDialog(componentType: string) {
    const xml = generateDesignDialog(componentType);
    this.downloadText(xml, '_cq_design_dialog.xml');
  }

  private downloadClientLib(componentType: string) {
    const clientLib = generateComponentClientLib(componentType);
    // For simplicity, download as JSON (in real scenario would be a zip)
    const files: Record<string, string> = {
      '.content.xml': generateClientLibContentXml(clientLib.config),
    };
    clientLib.files.forEach((f) => (files[f.path] = f.content));
    this.downloadJson(files, `${componentType}-clientlib.json`);
  }

  private downloadBaseClientLib() {
    const baseLib = generateBaseClientLib();
    const files: Record<string, string> = {
      '.content.xml': generateClientLibContentXml(baseLib.config),
    };
    baseLib.files.forEach((f) => (files[f.path] = f.content));
    this.downloadJson(files, 'base-clientlib.json');
  }

  // Deploy methods
  private async testConnection() {
    this.loading = true;
    this.deployService = createDeployService(this.aemUrl, this.deployUsername, this.deployPassword);

    try {
      const connected = await this.deployService.checkConnection();
      this.setStatus(connected ? 'success' : 'error', connected ? 'Connected to AEM!' : 'Connection failed');
    } catch (error) {
      this.setStatus('error', 'Connection test failed');
    } finally {
      this.loading = false;
    }
  }

  private async deployToAem() {
    if (!this.content) return;
    this.loading = true;
    this.deployService = createDeployService(this.aemUrl, this.deployUsername, this.deployPassword);

    try {
      const result = await this.deployService.deployContent(this.content, {
        path: `${this.deployPath}/${this.content.id || 'component-' + Date.now()}`,
      });
      this.setStatus(result.success ? 'success' : 'error', result.message);
      logger.info('Deploy result', 'AdvancedExport', result);
    } catch (error) {
      this.setStatus('error', 'Deployment failed');
    } finally {
      this.loading = false;
    }
  }

  // Utility methods
  private downloadJson(data: Record<string, unknown>, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private downloadText(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private setStatus(type: 'success' | 'error', message: string) {
    this.status = { type, message };
    setTimeout(() => (this.status = null), 5000);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'advanced-export-panel': AdvancedExportPanel;
  }
}
