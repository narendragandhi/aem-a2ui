import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { DamAsset } from '../lib/types.js';

import '@spectrum-web-components/button/sp-button.js';
import '@spectrum-web-components/action-button/sp-action-button.js';
import '@spectrum-web-components/textfield/sp-textfield.js';
import '@spectrum-web-components/progress-circle/sp-progress-circle.js';

const API_BASE = 'http://localhost:10003';

/**
 * DAM Browser component for browsing and selecting AEM assets.
 */
@customElement('dam-browser')
export class DamBrowser extends LitElement {
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
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      width: 900px;
      max-width: 95vw;
      max-height: 85vh;
      background: white;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--spectrum-gray-300);
      background: var(--spectrum-gray-50);
      border-radius: 8px 8px 0 0;
    }

    .modal-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--spectrum-gray-800);
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: var(--spectrum-gray-600);
      padding: 4px 8px;
    }

    .close-btn:hover {
      color: var(--spectrum-gray-800);
    }

    .toolbar {
      display: flex;
      gap: 12px;
      padding: 12px 20px;
      border-bottom: 1px solid var(--spectrum-gray-200);
      background: var(--spectrum-gray-50);
    }

    .search-box {
      flex: 1;
    }

    .filter-chips {
      display: flex;
      gap: 8px;
    }

    .filter-chip {
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      border: 1px solid var(--spectrum-gray-300);
      background: white;
      cursor: pointer;
    }

    .filter-chip:hover {
      background: var(--spectrum-gray-100);
    }

    .filter-chip.active {
      background: var(--spectrum-blue-400);
      color: white;
      border-color: var(--spectrum-blue-400);
    }

    .content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .sidebar {
      width: 220px;
      border-right: 1px solid var(--spectrum-gray-200);
      overflow-y: auto;
      background: var(--spectrum-gray-50);
    }

    .folder-tree {
      padding: 12px;
    }

    .folder-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      color: var(--spectrum-gray-800);
    }

    .folder-item:hover {
      background: var(--spectrum-gray-200);
    }

    .folder-item.active {
      background: var(--spectrum-blue-100);
      color: var(--spectrum-blue-700);
    }

    .folder-icon {
      font-size: 16px;
    }

    .asset-grid {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
      gap: 16px;
      align-content: start;
    }

    .asset-card {
      border: 2px solid var(--spectrum-gray-200);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
      background: white;
    }

    .asset-card:hover {
      border-color: var(--spectrum-blue-400);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .asset-card.selected {
      border-color: var(--spectrum-blue-500);
      background: var(--spectrum-blue-50);
    }

    .asset-thumbnail {
      width: 100%;
      height: 120px;
      object-fit: cover;
      background: var(--spectrum-gray-100);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .asset-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .asset-placeholder {
      font-size: 48px;
      color: var(--spectrum-gray-400);
    }

    .asset-info {
      padding: 10px;
    }

    .asset-name {
      font-size: 12px;
      font-weight: 500;
      color: var(--spectrum-gray-800);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .asset-type {
      font-size: 10px;
      color: var(--spectrum-gray-500);
      margin-top: 4px;
    }

    .modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-top: 1px solid var(--spectrum-gray-300);
      background: var(--spectrum-gray-50);
      border-radius: 0 0 8px 8px;
    }

    .selection-info {
      font-size: 13px;
      color: var(--spectrum-gray-600);
    }

    .footer-actions {
      display: flex;
      gap: 8px;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 20px;
      font-size: 12px;
      color: var(--spectrum-gray-600);
      background: var(--spectrum-gray-100);
    }

    .breadcrumb-item {
      cursor: pointer;
    }

    .breadcrumb-item:hover {
      color: var(--spectrum-blue-600);
    }

    .breadcrumb-separator {
      color: var(--spectrum-gray-400);
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      flex: 1;
    }

    .empty-state {
      text-align: center;
      padding: 48px;
      color: var(--spectrum-gray-600);
    }

    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    .disconnected-message {
      text-align: center;
      padding: 48px;
      color: var(--spectrum-gray-600);
    }
  `;

  @property({ type: Boolean }) open = false;
  @property({ type: String }) mimeTypeFilter: string = '';

  @state() private assets: DamAsset[] = [];
  @state() private folders: DamAsset[] = [];
  @state() private currentPath: string = '';
  @state() private selectedAsset: DamAsset | null = null;
  @state() private loading = false;
  @state() private connected = false;
  @state() private searchQuery = '';
  @state() private typeFilter: string = 'all';

  private damRoot = '/content/dam/aem-demo';

  connectedCallback() {
    super.connectedCallback();
    this.checkConnection();
  }

  updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('open') && this.open) {
      this.checkConnection();
    }
  }

  private async checkConnection() {
    try {
      const response = await fetch(`${API_BASE}/dam/config`);
      if (response.ok) {
        const config = await response.json();
        this.connected = config.connected;
        this.damRoot = config.damRoot || '/content/dam/aem-demo';
        if (this.connected) {
          this.loadAssets(this.damRoot);
        }
      }
    } catch (error) {
      console.error('Failed to check DAM connection:', error);
      this.connected = false;
    }
  }

  private async loadAssets(path: string) {
    this.loading = true;
    this.currentPath = path;

    try {
      const response = await fetch(`${API_BASE}/dam/browse?path=${encodeURIComponent(path)}`);
      if (response.ok) {
        const result = await response.json();
        const allAssets = result.assets || [];

        this.folders = allAssets.filter((a: DamAsset) => a.folder);
        this.assets = allAssets.filter((a: DamAsset) => !a.folder);

        // Apply type filter
        if (this.typeFilter !== 'all') {
          this.assets = this.assets.filter((a) => a.type === this.typeFilter);
        }
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      this.loading = false;
    }
  }

  private async searchAssets() {
    if (!this.searchQuery.trim()) {
      this.loadAssets(this.currentPath || this.damRoot);
      return;
    }

    this.loading = true;
    try {
      let url = `${API_BASE}/dam/search?q=${encodeURIComponent(this.searchQuery)}`;
      if (this.typeFilter !== 'all') {
        url += `&type=${this.typeFilter}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        this.assets = result.assets || [];
        this.folders = [];
      }
    } catch (error) {
      console.error('Failed to search assets:', error);
    } finally {
      this.loading = false;
    }
  }

  private setTypeFilter(type: string) {
    this.typeFilter = type;
    if (this.searchQuery) {
      this.searchAssets();
    } else {
      this.loadAssets(this.currentPath || this.damRoot);
    }
  }

  private selectAsset(asset: DamAsset) {
    if (asset.folder) {
      this.loadAssets(asset.path);
      this.selectedAsset = null;
    } else {
      this.selectedAsset = asset;
    }
  }

  private confirm() {
    if (this.selectedAsset) {
      // Create a copy with proxied URLs for use in components
      const assetWithProxiedUrls = {
        ...this.selectedAsset,
        thumbnailUrl: this.getProxiedUrl(this.selectedAsset.thumbnailUrl),
        originalUrl: this.getProxiedUrl(this.selectedAsset.originalUrl),
      };
      this.dispatchEvent(
        new CustomEvent('asset-selected', {
          detail: { asset: assetWithProxiedUrls },
          bubbles: true,
          composed: true,
        }),
      );
      this.close();
    }
  }

  private close() {
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  private getBreadcrumbs(): { name: string; path: string }[] {
    if (!this.currentPath) return [];

    const parts = this.currentPath.split('/').filter((p) => p);
    const crumbs: { name: string; path: string }[] = [];
    let path = '';

    for (const part of parts) {
      path += '/' + part;
      crumbs.push({ name: part, path });
    }

    return crumbs;
  }

  private getAssetIcon(asset: DamAsset): string {
    if (asset.folder) return '📁';
    switch (asset.type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎬';
      case 'document':
        return '📄';
      case 'audio':
        return '🎵';
      default:
        return '📎';
    }
  }

  /**
   * Convert relative proxy URL to full URL with API_BASE.
   * Handles both relative paths (from proxy) and absolute URLs.
   */
  private getProxiedUrl(url: string | undefined): string {
    if (!url) return '';
    // If it's already an absolute URL (http/https), return as-is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Otherwise, prepend API_BASE for proxy URLs
    return `${API_BASE}${url}`;
  }

  /**
   * Handle image load error - show placeholder icon
   */
  private handleImageError(e: Event, asset: DamAsset) {
    const img = e.target as HTMLImageElement;
    // Hide the broken image and show placeholder
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent && !parent.querySelector('.asset-placeholder')) {
      const placeholder = document.createElement('span');
      placeholder.className = 'asset-placeholder';
      placeholder.textContent = this.getAssetIcon(asset);
      parent.appendChild(placeholder);
    }
  }

  render() {
    if (!this.open) return null;

    return html`
      <div
        class="overlay"
        @click=${(e: Event) => {
        if (e.target === e.currentTarget) this.close();
      }}
      >
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <span class="modal-title">Select Asset from DAM</span>
            <button class="close-btn" @click=${this.close}>×</button>
          </div>

          ${
            !this.connected
              ? this.renderDisconnected()
              : html`
                  <div class="toolbar">
                    <sp-textfield
                      class="search-box"
                      placeholder="Search assets..."
                      .value=${this.searchQuery}
                      @input=${(e: Event) => (this.searchQuery = (e.target as HTMLInputElement).value)}
                      @keyup=${(e: KeyboardEvent) => e.key === 'Enter' && this.searchAssets()}
                    ></sp-textfield>
                    <div class="filter-chips">
                      ${['all', 'image', 'video', 'document'].map(
                  (type) => html`
                    <button
                      class="filter-chip ${this.typeFilter === type ? 'active' : ''}"
                      @click=${() => this.setTypeFilter(type)}
                    >
                      ${type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}s
                    </button>
                  `,
                )}
                    </div>
                  </div>

                  <div class="breadcrumb">
                    <span class="breadcrumb-item" @click=${() => this.loadAssets(this.damRoot)}> DAM </span>
                    ${this.getBreadcrumbs()
                .slice(3)
                .map(
                  (crumb, i, arr) => html`
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-item" @click=${() => this.loadAssets(crumb.path)}> ${crumb.name} </span>
                  `,
                )}
                  </div>

                  <div class="content">
                    ${
                this.loading
                  ? html`
                      <div class="loading">
                        <sp-progress-circle indeterminate size="l"></sp-progress-circle>
                      </div>
                    `
                  : html`
                      ${
                  this.folders.length > 0
                    ? html`
                        <div class="sidebar">
                          <div class="folder-tree">
                            ${this.folders.map(
                        (folder) => html`
                          <div class="folder-item" @click=${() => this.selectAsset(folder)}>
                            <span class="folder-icon">📁</span>
                            <span>${folder.name}</span>
                          </div>
                        `,
                      )}
                          </div>
                        </div>
                      `
                    : ''
                }

                      <div class="asset-grid">
                        ${
                    this.assets.length === 0
                      ? html`
                          <div class="empty-state">
                            <div class="empty-icon">📂</div>
                            <div>No assets found</div>
                          </div>
                        `
                      : this.assets.map(
                          (asset) => html`
                            <div
                              class="asset-card ${this.selectedAsset?.path === asset.path ? 'selected' : ''}"
                              @click=${() => this.selectAsset(asset)}
                            >
                              <div class="asset-thumbnail">
                                ${
                          asset.thumbnailUrl
                            ? html`
                                <img
                                  src="${this.getProxiedUrl(asset.thumbnailUrl)}"
                                  alt="${asset.name}"
                                  @error=${(e: Event) => this.handleImageError(e, asset)}
                                />
                              `
                            : html` <span class="asset-placeholder">${this.getAssetIcon(asset)}</span> `
                        }
                              </div>
                              <div class="asset-info">
                                <div class="asset-name">${asset.title || asset.name}</div>
                                <div class="asset-type">
                                  ${asset.type} ${asset.mimeType ? `• ${asset.mimeType}` : ''}
                                </div>
                              </div>
                            </div>
                          `,
                        )
                  }
                      </div>
                    `
              }
                  </div>

                  <div class="modal-footer">
                    <span class="selection-info">
                      ${this.selectedAsset ? `Selected: ${this.selectedAsset.name}` : 'No asset selected'}
                    </span>
                    <div class="footer-actions">
                      <sp-button variant="secondary" @click=${this.close}>Cancel</sp-button>
                      <sp-button variant="primary" ?disabled=${!this.selectedAsset} @click=${this.confirm}>
                        Select Asset
                      </sp-button>
                    </div>
                  </div>
                `
          }
        </div>
      </div>
    `;
  }

  private renderDisconnected() {
    return html`
      <div class="disconnected-message">
        <div class="empty-icon">🔌</div>
        <h3>AEM Not Connected</h3>
        <p>Cannot browse DAM assets while AEM is disconnected.</p>
        <p>Please ensure AEM SDK is running at http://localhost:4502</p>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dam-browser': DamBrowser;
  }
}
