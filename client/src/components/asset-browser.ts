import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../spectrum-imports.js';
import { ImageAsset, AssetCategory, AssetFilter } from '../lib/types.js';
import brandConfig from '../data/brand-config.json';

// Sample DAM assets - in production, this would come from AEM DAM API
const SAMPLE_ASSETS: ImageAsset[] = [
  // Hero images
  {
    id: 'asset-1',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    name: 'Modern Office Space',
    tags: ['office', 'tech', 'clean', 'professional', 'minimalist'],
    category: 'office',
    dimensions: { width: 1200, height: 800 },
    format: 'jpg',
    brandAligned: true,
    description: 'Clean modern office workspace with natural lighting',
  },
  {
    id: 'asset-2',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400',
    name: 'Abstract Gradient',
    tags: ['abstract', 'gradient', 'dynamic', 'modern', 'colorful'],
    category: 'abstract',
    dimensions: { width: 1200, height: 800 },
    format: 'jpg',
    brandAligned: true,
    description: 'Dynamic abstract gradient background',
  },
  {
    id: 'asset-3',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400',
    name: 'Team Meeting',
    tags: ['meeting', 'collaboration', 'people', 'diverse', 'professional'],
    category: 'team',
    dimensions: { width: 1200, height: 800 },
    format: 'jpg',
    brandAligned: true,
    description: 'Diverse team collaborating in modern meeting room',
  },
  {
    id: 'asset-4',
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
    name: 'Developer Workspace',
    tags: ['coding', 'development', 'software', 'screen', 'focused'],
    category: 'technology',
    dimensions: { width: 1200, height: 800 },
    format: 'jpg',
    brandAligned: true,
    description: 'Software developer working at multiple monitors',
  },
  {
    id: 'asset-5',
    url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    name: 'Minimal Desk Setup',
    tags: ['laptop', 'desk', 'workspace', 'home office', 'minimalist'],
    category: 'office',
    dimensions: { width: 1200, height: 800 },
    format: 'jpg',
    brandAligned: true,
    description: 'Clean minimal home office desk setup',
  },
  {
    id: 'asset-6',
    url: 'https://images.unsplash.com/photo-1522204523234-87295a3ad7f0?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522204523234-87295a3ad7f0?w=400',
    name: 'Startup Team',
    tags: ['team', 'discussion', 'startup', 'innovation', 'casual'],
    category: 'team',
    dimensions: { width: 1200, height: 800 },
    format: 'jpg',
    brandAligned: true,
    description: 'Young startup team brainstorming session',
  },
  {
    id: 'asset-7',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    name: 'Product Watch',
    tags: ['product', 'ecommerce', 'watch', 'luxury', 'clean'],
    category: 'product',
    dimensions: { width: 800, height: 800 },
    format: 'jpg',
    brandAligned: false,
    description: 'Luxury watch product photography',
  },
  {
    id: 'asset-8',
    url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400',
    name: 'Video Production',
    tags: ['video', 'media', 'creative', 'studio', 'production'],
    category: 'technology',
    dimensions: { width: 800, height: 533 },
    format: 'jpg',
    brandAligned: true,
    description: 'Professional video production studio',
  },
  {
    id: 'asset-9',
    url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    thumbnailUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400',
    name: 'Business Analytics',
    tags: ['analytics', 'data', 'charts', 'business', 'strategy'],
    category: 'office',
    dimensions: { width: 800, height: 533 },
    format: 'jpg',
    brandAligned: true,
    description: 'Business professionals analyzing data charts',
  },
  {
    id: 'asset-10',
    url: 'https://images.unsplash.com/photo-1488590528505-98d2f092d077?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1488590528505-98d2f092d077?w=400',
    name: 'Server Infrastructure',
    tags: ['server', 'datacenter', 'cloud', 'security', 'it infrastructure'],
    category: 'technology',
    dimensions: { width: 1200, height: 800 },
    format: 'jpg',
    brandAligned: true,
    description: 'Modern data center server room',
  },
  // Additional lifestyle images
  {
    id: 'asset-11',
    url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400',
    name: 'Coffee Break',
    tags: ['lifestyle', 'coffee', 'relaxed', 'break', 'casual'],
    category: 'lifestyle',
    dimensions: { width: 1200, height: 800 },
    format: 'jpg',
    brandAligned: false,
    description: 'Person enjoying coffee in a cozy setting',
  },
  {
    id: 'asset-12',
    url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400',
    name: 'Team Celebration',
    tags: ['team', 'celebration', 'success', 'happy', 'achievement'],
    category: 'team',
    dimensions: { width: 1200, height: 800 },
    format: 'jpg',
    brandAligned: true,
    description: 'Team celebrating a successful project',
  },
  // Hero banners
  {
    id: 'asset-13',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
    name: 'Digital Globe',
    tags: ['technology', 'global', 'digital', 'network', 'innovation'],
    category: 'hero',
    dimensions: { width: 1200, height: 800 },
    format: 'jpg',
    brandAligned: true,
    description: 'Digital globe with network connections',
  },
  {
    id: 'asset-14',
    url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400',
    name: 'Co-working Space',
    tags: ['office', 'coworking', 'modern', 'open', 'collaborative'],
    category: 'office',
    dimensions: { width: 1200, height: 800 },
    format: 'jpg',
    brandAligned: true,
    description: 'Modern co-working space with open layout',
  },
  // Nature images
  {
    id: 'asset-15',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    name: 'Forest Sunlight',
    tags: ['nature', 'forest', 'green', 'peaceful', 'environment'],
    category: 'nature',
    dimensions: { width: 1200, height: 800 },
    format: 'jpg',
    brandAligned: false,
    description: 'Sunlight streaming through forest trees',
  },
  {
    id: 'asset-16',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    name: 'Mountain Peak',
    tags: ['nature', 'mountain', 'adventure', 'achievement', 'peak'],
    category: 'nature',
    dimensions: { width: 1200, height: 800 },
    format: 'jpg',
    brandAligned: false,
    description: 'Majestic mountain peaks at sunrise',
  },
];

const CATEGORIES: { id: AssetCategory | 'all'; name: string; icon: string }[] = [
  { id: 'all', name: 'All Assets', icon: '\u{1F5BC}' },
  { id: 'hero', name: 'Hero Banners', icon: '\u{1F3AF}' },
  { id: 'product', name: 'Products', icon: '\u{1F6D2}' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '\u{2615}' },
  { id: 'abstract', name: 'Abstract', icon: '\u{1F537}' },
  { id: 'team', name: 'Team/People', icon: '\u{1F465}' },
  { id: 'office', name: 'Office', icon: '\u{1F3E2}' },
  { id: 'technology', name: 'Technology', icon: '\u{1F4BB}' },
  { id: 'nature', name: 'Nature', icon: '\u{1F333}' },
];

@customElement('asset-browser')
export class AssetBrowser extends LitElement {
  @property({ type: Boolean }) open = false;
  @property({ type: String }) selectedAssetId: string | null = null;

  @state() private filter: AssetFilter = { category: 'all', search: '' };
  @state() private hoveredAssetId: string | null = null;
  @state() private previewAsset: ImageAsset | null = null;

  static styles = css`
    :host {
      display: block;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition:
        opacity 0.3s,
        visibility 0.3s;
    }

    .overlay.open {
      opacity: 1;
      visibility: visible;
    }

    .browser-panel {
      background: var(--spectrum-gray-50, white);
      border-radius: 12px;
      width: 90vw;
      max-width: 1200px;
      height: 80vh;
      max-height: 800px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      transform: scale(0.95);
      transition: transform 0.3s;
    }

    .overlay.open .browser-panel {
      transform: scale(1);
    }

    /* Header */
    .browser-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-bottom: 1px solid var(--spectrum-gray-300, #e0e0e0);
      background: var(--spectrum-gray-100, #f5f5f5);
    }

    .browser-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .browser-title h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: var(--spectrum-gray-900, #1a1a1a);
    }

    .dam-badge {
      background: var(--spectrum-accent-background-color-default, #1473e6);
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .close-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--spectrum-gray-700, #666);
      transition: background 0.2s;
    }

    .close-button:hover {
      background: var(--spectrum-gray-200, #f0f0f0);
    }

    /* Search and Filters */
    .filter-bar {
      display: flex;
      gap: 16px;
      padding: 16px 24px;
      border-bottom: 1px solid var(--spectrum-gray-200, #f0f0f0);
      align-items: center;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 200px;
    }

    .search-box sp-textfield {
      width: 100%;
    }

    .filter-toggles {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .brand-filter {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--spectrum-gray-200, #f0f0f0);
      font-size: 13px;
      color: var(--spectrum-gray-700, #666);
    }

    .brand-filter:hover {
      background: var(--spectrum-gray-300, #e0e0e0);
    }

    .brand-filter.active {
      background: var(--spectrum-positive-background-color-default, #2d9d78);
      color: white;
    }

    .brand-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--spectrum-positive-color-default, #2d9d78);
    }

    .brand-filter.active .brand-indicator {
      background: white;
    }

    /* Main Content */
    .browser-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    /* Sidebar Categories */
    .category-sidebar {
      width: 180px;
      border-right: 1px solid var(--spectrum-gray-200, #f0f0f0);
      padding: 16px 0;
      overflow-y: auto;
      flex-shrink: 0;
    }

    .category-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 20px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
      color: var(--spectrum-gray-700, #666);
    }

    .category-item:hover {
      background: var(--spectrum-gray-100, #f5f5f5);
      color: var(--spectrum-gray-900, #1a1a1a);
    }

    .category-item.selected {
      background: var(--spectrum-accent-background-color-hover, #e5f0ff);
      color: var(--spectrum-accent-color-default, #1473e6);
      font-weight: 600;
    }

    .category-icon {
      font-size: 18px;
    }

    .category-count {
      margin-left: auto;
      background: var(--spectrum-gray-200, #f0f0f0);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      color: var(--spectrum-gray-600, #999);
    }

    .category-item.selected .category-count {
      background: var(--spectrum-accent-color-default, #1473e6);
      color: white;
    }

    /* Asset Grid */
    .asset-grid-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .asset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .asset-card {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
      background: var(--spectrum-gray-100, #f5f5f5);
    }

    .asset-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .asset-card.selected {
      border-color: var(--spectrum-accent-color-default, #1473e6);
      box-shadow: 0 0 0 3px rgba(20, 115, 230, 0.2);
    }

    .asset-thumbnail {
      width: 100%;
      aspect-ratio: 16/10;
      object-fit: cover;
      display: block;
    }

    .asset-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 50%);
      opacity: 0;
      transition: opacity 0.2s;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 12px;
    }

    .asset-card:hover .asset-overlay {
      opacity: 1;
    }

    .asset-name {
      color: white;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    .asset-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .asset-tag {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
    }

    .asset-badges {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 4px;
    }

    .brand-badge {
      background: var(--spectrum-positive-background-color-default, #2d9d78);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
    }

    .selected-badge {
      background: var(--spectrum-accent-background-color-default, #1473e6);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .preview-button {
      position: absolute;
      top: 8px;
      left: 8px;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border: none;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
    }

    .asset-card:hover .preview-button {
      opacity: 1;
    }

    .preview-button:hover {
      background: rgba(0, 0, 0, 0.7);
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .empty-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--spectrum-gray-800, #4b4b4b);
      margin-bottom: 8px;
    }

    .empty-description {
      font-size: 14px;
      color: var(--spectrum-gray-600, #999);
    }

    /* Footer */
    .browser-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-top: 1px solid var(--spectrum-gray-300, #e0e0e0);
      background: var(--spectrum-gray-100, #f5f5f5);
    }

    .footer-info {
      font-size: 13px;
      color: var(--spectrum-gray-600, #999);
    }

    .footer-actions {
      display: flex;
      gap: 12px;
    }

    /* Preview Modal */
    .preview-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }

    .preview-content {
      max-width: 90vw;
      max-height: 90vh;
      position: relative;
    }

    .preview-image {
      max-width: 100%;
      max-height: 70vh;
      object-fit: contain;
      border-radius: 8px;
    }

    .preview-info {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-top: 16px;
      max-width: 600px;
    }

    .preview-name {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .preview-description {
      color: var(--spectrum-gray-700, #666);
      margin-bottom: 12px;
    }

    .preview-meta {
      display: flex;
      gap: 16px;
      font-size: 13px;
      color: var(--spectrum-gray-600, #999);
    }

    .preview-close {
      position: absolute;
      top: -40px;
      right: 0;
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 8px;
    }

    @media (max-width: 768px) {
      .browser-panel {
        width: 100vw;
        height: 100vh;
        max-height: none;
        border-radius: 0;
      }

      .category-sidebar {
        display: none;
      }

      .filter-bar {
        flex-direction: column;
        gap: 12px;
      }

      .search-box {
        width: 100%;
      }

      .asset-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
    }
  `;

  private getFilteredAssets(): ImageAsset[] {
    let assets = [...SAMPLE_ASSETS];

    // Filter by category
    if (this.filter.category && this.filter.category !== 'all') {
      assets = assets.filter((a) => a.category === this.filter.category);
    }

    // Filter by brand alignment
    if (this.filter.brandAligned) {
      assets = assets.filter((a) => a.brandAligned);
    }

    // Filter by search
    if (this.filter.search) {
      const searchLower = this.filter.search.toLowerCase();
      assets = assets.filter(
        (a) =>
          a.name.toLowerCase().includes(searchLower) ||
          a.tags.some((t) => t.toLowerCase().includes(searchLower)) ||
          (a.description && a.description.toLowerCase().includes(searchLower)),
      );
    }

    return assets;
  }

  private getCategoryCount(categoryId: AssetCategory | 'all'): number {
    if (categoryId === 'all') {
      return this.filter.brandAligned ? SAMPLE_ASSETS.filter((a) => a.brandAligned).length : SAMPLE_ASSETS.length;
    }
    return SAMPLE_ASSETS.filter((a) => a.category === categoryId && (!this.filter.brandAligned || a.brandAligned))
      .length;
  }

  render() {
    const filteredAssets = this.getFilteredAssets();
    const selectedAsset = this.selectedAssetId
      ? SAMPLE_ASSETS.find((a) => a.id === this.selectedAssetId) || null
      : null;

    return html`
      <div class="overlay ${this.open ? 'open' : ''}" @click=${this.handleOverlayClick}>
        <div class="browser-panel" @click=${(e: Event) => e.stopPropagation()}>
          ${this.renderHeader()} ${this.renderFilterBar()}

          <div class="browser-content">${this.renderCategorySidebar()} ${this.renderAssetGrid(filteredAssets)}</div>

          ${this.renderFooter(filteredAssets.length, selectedAsset)}
        </div>
      </div>

      ${this.previewAsset ? this.renderPreviewModal() : ''}
    `;
  }

  private renderHeader() {
    return html`
      <div class="browser-header">
        <div class="browser-title">
          <h2>Asset Library</h2>
          <span class="dam-badge">DAM</span>
        </div>
        <button class="close-button" @click=${this.close}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    `;
  }

  private renderFilterBar() {
    return html`
      <div class="filter-bar">
        <div class="search-box">
          <sp-textfield
            placeholder="Search assets by name, tags, or description..."
            .value=${this.filter.search || ''}
            @input=${this.handleSearchInput}
          >
            <sp-icon-magnify slot="icon"></sp-icon-magnify>
          </sp-textfield>
        </div>
        <div class="filter-toggles">
          <div class="brand-filter ${this.filter.brandAligned ? 'active' : ''}" @click=${this.toggleBrandFilter}>
            <span class="brand-indicator"></span>
            Brand Aligned Only
          </div>
        </div>
      </div>
    `;
  }

  private renderCategorySidebar() {
    return html`
      <div class="category-sidebar">
        ${CATEGORIES.map(
          (category) => html`
            <div
              class="category-item ${this.filter.category === category.id ? 'selected' : ''}"
              @click=${() => this.selectCategory(category.id)}
            >
              <span class="category-icon">${category.icon}</span>
              <span>${category.name}</span>
              <span class="category-count">${this.getCategoryCount(category.id)}</span>
            </div>
          `,
        )}
      </div>
    `;
  }

  private renderAssetGrid(assets: ImageAsset[]) {
    if (assets.length === 0) {
      return html`
        <div class="asset-grid-container">
          <div class="empty-state">
            <div class="empty-icon">🔍</div>
            <div class="empty-title">No assets found</div>
            <div class="empty-description">Try adjusting your search or filters to find what you're looking for.</div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="asset-grid-container">
        <div class="asset-grid">${assets.map((asset) => this.renderAssetCard(asset))}</div>
      </div>
    `;
  }

  private renderAssetCard(asset: ImageAsset) {
    const isSelected = this.selectedAssetId === asset.id;

    return html`
      <div
        class="asset-card ${isSelected ? 'selected' : ''}"
        @click=${() => this.selectAsset(asset)}
        @mouseenter=${() => (this.hoveredAssetId = asset.id)}
        @mouseleave=${() => (this.hoveredAssetId = null)}
      >
        <img class="asset-thumbnail" src="${asset.thumbnailUrl || asset.url}" alt="${asset.name}" loading="lazy" />

        <div class="asset-badges">
          ${isSelected ? html` <span class="selected-badge">✓ Selected</span> ` : ''}
          ${asset.brandAligned ? html` <span class="brand-badge">Brand Aligned</span> ` : ''}
        </div>

        <button class="preview-button" @click=${(e: Event) => this.openPreview(e, asset)}>🔍 Preview</button>

        <div class="asset-overlay">
          <div class="asset-name">${asset.name}</div>
          <div class="asset-tags">
            ${asset.tags.slice(0, 3).map((tag) => html` <span class="asset-tag">${tag}</span> `)}
          </div>
        </div>
      </div>
    `;
  }

  private renderFooter(count: number, selectedAsset: ImageAsset | null) {
    return html`
      <div class="browser-footer">
        <div class="footer-info">
          ${count} asset${count !== 1 ? 's' : ''} found
          ${selectedAsset ? html` <span> | Selected: <strong>${selectedAsset.name}</strong></span> ` : ''}
        </div>
        <div class="footer-actions">
          <sp-button variant="secondary" @click=${this.close}>Cancel</sp-button>
          <sp-button variant="accent" ?disabled=${!this.selectedAssetId} @click=${this.confirmSelection}>
            Use Selected Asset
          </sp-button>
        </div>
      </div>
    `;
  }

  private renderPreviewModal() {
    const asset = this.previewAsset!;
    return html`
      <div class="preview-modal" @click=${this.closePreview}>
        <div class="preview-content" @click=${(e: Event) => e.stopPropagation()}>
          <button class="preview-close" @click=${this.closePreview}>✕</button>
          <img class="preview-image" src="${asset.url}" alt="${asset.name}" />
          <div class="preview-info">
            <div class="preview-name">${asset.name}</div>
            ${asset.description ? html` <div class="preview-description">${asset.description}</div> ` : ''}
            <div class="preview-meta">
              ${asset.dimensions ? html` <span>${asset.dimensions.width} x ${asset.dimensions.height}</span> ` : ''}
              ${asset.format ? html`<span>${asset.format.toUpperCase()}</span>` : ''}
              <span>Category: ${asset.category}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private handleOverlayClick(e: Event) {
    if ((e.target as HTMLElement).classList.contains('overlay')) {
      this.close();
    }
  }

  private handleSearchInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    this.filter = { ...this.filter, search: value };
  }

  private toggleBrandFilter() {
    this.filter = { ...this.filter, brandAligned: !this.filter.brandAligned };
  }

  private selectCategory(categoryId: AssetCategory | 'all') {
    this.filter = { ...this.filter, category: categoryId };
  }

  private selectAsset(asset: ImageAsset) {
    this.selectedAssetId = asset.id;
  }

  private openPreview(e: Event, asset: ImageAsset) {
    e.stopPropagation();
    this.previewAsset = asset;
  }

  private closePreview() {
    this.previewAsset = null;
  }

  private close() {
    this.dispatchEvent(new CustomEvent('close'));
  }

  private confirmSelection() {
    if (this.selectedAssetId) {
      const asset = SAMPLE_ASSETS.find((a) => a.id === this.selectedAssetId);
      if (asset) {
        this.dispatchEvent(
          new CustomEvent('asset-selected', {
            detail: { asset },
            bubbles: true,
            composed: true,
          }),
        );
      }
    }
    this.close();
  }

  // Public method to get asset by ID
  public static getAssetById(id: string): ImageAsset | undefined {
    return SAMPLE_ASSETS.find((a) => a.id === id);
  }

  // Public method to get all assets
  public static getAllAssets(): ImageAsset[] {
    return [...SAMPLE_ASSETS];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'asset-browser': AssetBrowser;
  }
}
