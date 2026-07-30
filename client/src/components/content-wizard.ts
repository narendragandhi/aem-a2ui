import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '../spectrum-imports.js';
import './asset-browser.js';
import { ImageAsset } from '../lib/types.js';
import { AssetBrowser } from './asset-browser.js';

// Component types with icons and descriptions
const COMPONENT_TYPES = [
  // Marketing & Promotional
  {
    id: 'hero',
    name: 'Hero Banner',
    icon: 'Image',
    description: 'Full-width banner with headline and CTA',
    example: 'Landing pages, campaigns',
    category: 'Marketing',
  },
  {
    id: 'banner',
    name: 'Promo Banner',
    icon: 'Campaign',
    description: 'Attention-grabbing announcement',
    example: 'Sales, alerts, CTAs',
    category: 'Marketing',
  },
  {
    id: 'carousel',
    name: 'Carousel',
    icon: 'Slides',
    description: 'Rotating slides with images and text',
    example: 'Featured content, galleries',
    category: 'Marketing',
  },
  // Content & Editorial
  {
    id: 'teaser',
    name: 'Teaser',
    icon: 'FileTemplate',
    description: 'Content preview with image and text',
    example: 'Blog posts, articles',
    category: 'Content',
  },
  {
    id: 'quote',
    name: 'Quote/Testimonial',
    icon: 'Quote',
    description: 'Customer testimonial or pull quote',
    example: 'Reviews, endorsements',
    category: 'Content',
  },
  {
    id: 'accordion',
    name: 'Accordion',
    icon: 'Accordion',
    description: 'Expandable content sections',
    example: 'FAQs, details',
    category: 'Content',
  },
  {
    id: 'tabs',
    name: 'Tabs',
    icon: 'Tabs',
    description: 'Tabbed content organization',
    example: 'Product specs, categories',
    category: 'Content',
  },
  // E-Commerce
  {
    id: 'product',
    name: 'Product Card',
    icon: 'ShoppingCart',
    description: 'Product showcase with image and price',
    example: 'E-commerce, catalogs',
    category: 'Commerce',
  },
  {
    id: 'productList',
    name: 'Product List',
    icon: 'List',
    description: 'Grid or list of multiple products',
    example: 'Category pages, collections',
    category: 'Commerce',
  },
  {
    id: 'pricing',
    name: 'Pricing Table',
    icon: 'Table',
    description: 'Comparison pricing tiers',
    example: 'SaaS, subscriptions',
    category: 'Commerce',
  },
  // Media
  {
    id: 'video',
    name: 'Video Player',
    icon: 'Video',
    description: 'Embedded video with controls',
    example: 'Tutorials, promos',
    category: 'Media',
  },
  {
    id: 'gallery',
    name: 'Image Gallery',
    icon: 'Gallery',
    description: 'Grid of images with lightbox',
    example: 'Portfolios, lookbooks',
    category: 'Media',
  },
  // Navigation & Structure
  {
    id: 'navigation',
    name: 'Navigation Menu',
    icon: 'Menu',
    description: 'Site navigation with dropdowns',
    example: 'Headers, menus',
    category: 'Navigation',
  },
  {
    id: 'footer',
    name: 'Footer',
    icon: 'Footer',
    description: 'Site footer with links and info',
    example: 'Contact, sitemap',
    category: 'Navigation',
  },
  {
    id: 'breadcrumb',
    name: 'Breadcrumb',
    icon: 'Path',
    description: 'Navigation path indicator',
    example: 'Deep pages, hierarchy',
    category: 'Navigation',
  },
  // Interactive
  {
    id: 'form',
    name: 'Form',
    icon: 'Form',
    description: 'Input form with validation',
    example: 'Contact, signup',
    category: 'Interactive',
  },
  {
    id: 'search',
    name: 'Search',
    icon: 'Search',
    description: 'Search input with suggestions',
    example: 'Site search, filtering',
    category: 'Interactive',
  },
  {
    id: 'cta',
    name: 'Call to Action',
    icon: 'Button',
    description: 'Prominent action button section',
    example: 'Signups, downloads',
    category: 'Interactive',
  },
  // Social & Trust
  {
    id: 'socialShare',
    name: 'Social Share',
    icon: 'Share',
    description: 'Social media sharing buttons',
    example: 'Articles, products',
    category: 'Social',
  },
  {
    id: 'team',
    name: 'Team Grid',
    icon: 'Users',
    description: 'Team member profiles',
    example: 'About us, leadership',
    category: 'Social',
  },
];

// Tone options
const TONES = [
  { id: 'professional', name: 'Professional', icon: 'Briefcase', description: 'Corporate, trustworthy' },
  { id: 'playful', name: 'Playful', icon: 'Heart', description: 'Fun, engaging' },
  { id: 'urgent', name: 'Urgent', icon: 'Alert', description: 'Time-sensitive, action-driven' },
  { id: 'elegant', name: 'Elegant', icon: 'Star', description: 'Premium, sophisticated' },
];

// Image styles
const IMAGE_STYLES = [
  { id: 'photo', name: 'Photography', icon: 'Camera' },
  { id: 'illustration', name: 'Illustration', icon: 'Draw' },
  { id: 'abstract', name: 'Abstract', icon: 'GraphPathing' },
  { id: 'minimal', name: 'Minimal', icon: 'ViewGrid' },
];

// Category labels
const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'Marketing', name: 'Marketing' },
  { id: 'Content', name: 'Content' },
  { id: 'Commerce', name: 'Commerce' },
  { id: 'Media', name: 'Media' },
  { id: 'Navigation', name: 'Navigation' },
  { id: 'Interactive', name: 'Interactive' },
  { id: 'Social', name: 'Social' },
];

@customElement('content-wizard')
export class ContentWizard extends LitElement {
  @state() private currentStep = 1;
  @state() private selectedType = '';
  @state() private selectedTone = 'professional';
  @state() private selectedImageStyle = 'photo';
  @state() private description = '';
  @state() private loading = false;
  @state() private selectedCategory = 'all';
  @state() private showAssetBrowser = false;
  @state() private selectedAsset: ImageAsset | null = null;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
      max-width: 800px;
      margin: 0 auto;
      --spectrum-alias-background-color-default: var(--spectrum-gray-100);
    }

    /* Step Indicator */
    .step-indicator {
      display: flex;
      justify-content: center;
      margin-bottom: 32px;
      gap: 8px;
    }

    .step {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .step-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s;
    }

    .step-number.active {
      background: var(--spectrum-accent-background-color-default, #1473e6);
      color: white;
    }

    .step-number.completed {
      background: var(--spectrum-positive-background-color-default, #2d9d78);
      color: white;
    }

    .step-number.inactive {
      background: var(--spectrum-gray-300, #e0e0e0);
      color: var(--spectrum-gray-700, #666);
    }

    .step-label {
      font-size: 13px;
      color: var(--spectrum-gray-700, #666);
    }

    .step-label.active {
      color: var(--spectrum-accent-color-default, #1473e6);
      font-weight: 600;
    }

    .step-connector {
      width: 40px;
      height: 2px;
      background: var(--spectrum-gray-300, #e0e0e0);
      margin: 0 8px;
    }

    .step-connector.completed {
      background: var(--spectrum-positive-background-color-default, #2d9d78);
    }

    .step-content {
      background: var(--spectrum-gray-50, white);
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
      position: relative;
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    }

    .step-title {
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: var(--spectrum-gray-900, #1a1a1a);
    }

    .step-subtitle {
      font-size: 14px;
      color: var(--spectrum-gray-700, #666);
      margin: 0 0 24px 0;
    }

    /* Category Filter */
    .category-filter {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .category-chip {
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--spectrum-gray-200, #f0f0f0);
      color: var(--spectrum-gray-700, #666);
      border: 1px solid transparent;
    }

    .category-chip:hover {
      background: var(--spectrum-gray-300, #e0e0e0);
    }

    .category-chip.selected {
      background: var(--spectrum-accent-background-color-default, #1473e6);
      color: white;
    }

    /* Component Type Grid */
    .type-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      padding-right: 8px;
      box-sizing: border-box;
      overflow-y: auto;
      flex: 1;
    }

    .type-grid::-webkit-scrollbar {
      width: 6px;
    }

    .type-grid::-webkit-scrollbar-track {
      background: var(--spectrum-gray-200, #f0f0f0);
      border-radius: 3px;
    }

    .type-grid::-webkit-scrollbar-thumb {
      background: var(--spectrum-gray-400, #ccc);
      border-radius: 3px;
    }

    .type-card {
      border: 2px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 8px;
      padding: 14px;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--spectrum-gray-50, white);
    }

    .type-card:hover {
      border-color: var(--spectrum-accent-color-default, #1473e6);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(20, 115, 230, 0.15);
    }

    .type-card.selected {
      border-color: var(--spectrum-accent-color-default, #1473e6);
      background: var(--spectrum-accent-background-color-hover, #e5f0ff);
    }

    .type-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }

    .type-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--spectrum-accent-background-color-default, #1473e6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .type-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--spectrum-gray-900, #1a1a1a);
    }

    .type-description {
      font-size: 13px;
      color: var(--spectrum-gray-700, #666);
      margin-bottom: 4px;
    }

    .type-example {
      font-size: 11px;
      color: var(--spectrum-gray-600, #999);
    }

    /* Tone Selector */
    .tone-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }

    .tone-card {
      border: 2px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--spectrum-gray-50, white);
    }

    .tone-card:hover {
      border-color: var(--spectrum-accent-color-default, #1473e6);
    }

    .tone-card.selected {
      border-color: var(--spectrum-accent-color-default, #1473e6);
      background: var(--spectrum-accent-background-color-hover, #e5f0ff);
    }

    .tone-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--spectrum-gray-200, #f0f0f0);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 8px auto;
      font-size: 16px;
    }

    .tone-card.selected .tone-icon {
      background: var(--spectrum-accent-background-color-default, #1473e6);
      color: white;
    }

    .tone-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--spectrum-gray-900, #1a1a1a);
    }

    .tone-description {
      font-size: 11px;
      color: var(--spectrum-gray-600, #999);
      margin-top: 4px;
    }

    /* Image Style Selector */
    .section-label {
      font-size: 14px;
      font-weight: 600;
      color: var(--spectrum-gray-800, #4b4b4b);
      margin-bottom: 12px;
      display: block;
    }

    /* Asset Selection */
    .asset-selection {
      margin-bottom: 24px;
    }

    .asset-preview-container {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .selected-asset-card {
      flex: 1;
      display: flex;
      gap: 16px;
      padding: 16px;
      background: var(--spectrum-gray-100, #f5f5f5);
      border-radius: 8px;
      border: 2px solid var(--spectrum-accent-color-default, #1473e6);
    }

    .selected-asset-thumbnail {
      width: 120px;
      height: 80px;
      object-fit: cover;
      border-radius: 6px;
    }

    .selected-asset-info {
      flex: 1;
    }

    .selected-asset-name {
      font-size: 14px;
      font-weight: 600;
      color: var(--spectrum-gray-900, #1a1a1a);
      margin-bottom: 4px;
    }

    .selected-asset-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
      margin-bottom: 8px;
    }

    .selected-asset-tag {
      background: var(--spectrum-gray-200, #f0f0f0);
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      color: var(--spectrum-gray-700, #666);
    }

    .selected-asset-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      background: var(--spectrum-positive-background-color-default, #2d9d78);
      color: white;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
    }

    .no-asset-selected {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: var(--spectrum-gray-100, #f5f5f5);
      border-radius: 8px;
      border: 2px dashed var(--spectrum-gray-400, #ccc);
      text-align: center;
    }

    .no-asset-icon {
      font-size: 32px;
      margin-bottom: 8px;
      opacity: 0.5;
    }

    .no-asset-text {
      font-size: 13px;
      color: var(--spectrum-gray-600, #999);
      margin-bottom: 12px;
    }

    .asset-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .image-style-grid {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
    }

    .image-style-card {
      flex: 1;
      border: 2px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 8px;
      padding: 12px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: var(--spectrum-gray-50, white);
    }

    .image-style-card:hover {
      border-color: var(--spectrum-accent-color-default, #1473e6);
    }

    .image-style-card.selected {
      border-color: var(--spectrum-accent-color-default, #1473e6);
      background: var(--spectrum-accent-background-color-hover, #e5f0ff);
    }

    .image-style-icon {
      font-size: 20px;
      margin-bottom: 4px;
    }

    .image-style-name {
      font-size: 12px;
      color: var(--spectrum-gray-800, #4b4b4b);
    }

    /* Description Input */
    .description-container {
      margin-bottom: 16px;
    }

    sp-textfield {
      width: 100%;
    }

    .description-hint {
      font-size: 12px;
      color: var(--spectrum-gray-600, #999);
      margin-top: 8px;
    }

    /* Quick Examples */
    .quick-examples {
      margin-top: 16px;
    }

    .quick-examples-label {
      font-size: 12px;
      color: var(--spectrum-gray-600, #999);
      margin-bottom: 8px;
    }

    .example-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .example-chip {
      padding: 6px 12px;
      background: var(--spectrum-gray-200, #f5f5f5);
      border: 1px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 16px;
      font-size: 12px;
      color: var(--spectrum-gray-700, #666);
      cursor: pointer;
      transition: all 0.2s;
    }

    .example-chip:hover {
      background: var(--spectrum-accent-background-color-hover, #e5f0ff);
      border-color: var(--spectrum-accent-color-default, #1473e6);
      color: var(--spectrum-accent-color-default, #1473e6);
    }

    /* Navigation */
    .step-navigation {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid var(--spectrum-gray-300, #e0e0e0);
    }

    /* Summary */
    .summary {
      background: var(--spectrum-gray-100, #f8f9fa);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .summary-title {
      font-size: 12px;
      font-weight: 600;
      color: var(--spectrum-gray-600, #999);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .summary-items {
      display: flex;
      gap: 24px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .summary-item-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: var(--spectrum-accent-background-color-default, #1473e6);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .summary-item-label {
      font-size: 11px;
      color: var(--spectrum-gray-600, #999);
      text-transform: uppercase;
    }

    .summary-item-value {
      font-size: 14px;
      font-weight: 600;
      color: var(--spectrum-gray-900, #1a1a1a);
    }

    .description-preview {
      background: var(--spectrum-gray-200, #f0f0f0);
      padding: 16px;
      border-radius: 8px;
      font-size: 14px;
      color: var(--spectrum-gray-800, #4b4b4b);
      line-height: 1.5;
    }

    /* Loading state */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      z-index: 10;
    }

    .loading-text {
      margin-top: 16px;
      font-size: 14px;
      color: var(--spectrum-gray-700, #666);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      :host {
        padding: 16px;
      }

      .step-content {
        padding: 20px;
      }

      .step-title {
        font-size: 18px;
      }

      .type-grid {
        gap: 10px;
        max-height: 350px;
      }

      .tone-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .image-style-grid {
        flex-wrap: wrap;
      }

      .image-style-card {
        flex: 1 1 45%;
      }

      .summary-items {
        flex-direction: column;
        gap: 12px;
      }

      .step-navigation {
        flex-direction: column;
        gap: 12px;
      }

      .step-navigation sp-button {
        width: 100%;
      }

      .category-filter {
        justify-content: flex-start;
        overflow-x: auto;
        padding-bottom: 8px;
      }
    }

    @media (max-width: 480px) {
      :host {
        padding: 12px;
      }

      .step-content {
        padding: 16px;
      }

      .tone-grid {
        grid-template-columns: 1fr;
      }

      .type-card {
        padding: 12px;
      }

      .type-icon {
        width: 32px;
        height: 32px;
        font-size: 14px;
      }

      .step-indicator {
        flex-wrap: wrap;
        gap: 4px;
      }

      .step-connector {
        display: none;
      }

      .example-chips {
        flex-direction: column;
      }

      .example-chip {
        text-align: center;
      }
    }
  `;

  render() {
    return html`
      ${this.renderStepIndicator()}

      <div class="step-content">
        ${this.currentStep === 1 ? this.renderStep1() : ''} ${this.currentStep === 2 ? this.renderStep2() : ''}
        ${this.currentStep === 3 ? this.renderStep3() : ''}
        ${
          this.loading
            ? html`
                <div class="loading-overlay">
                  <sp-progress-circle indeterminate size="l"></sp-progress-circle>
                  <div class="loading-text">Generating your content...</div>
                </div>
              `
            : ''
        }
      </div>

      <asset-browser
        .open=${this.showAssetBrowser}
        .selectedAssetId=${this.selectedAsset?.id || null}
        @close=${() => (this.showAssetBrowser = false)}
        @asset-selected=${this.handleAssetSelected}
      ></asset-browser>
    `;
  }

  private renderStepIndicator() {
    const steps = [
      { num: 1, label: 'Choose Type' },
      { num: 2, label: 'Customize' },
      { num: 3, label: 'Generate' },
    ];

    return html`
      <div class="step-indicator">
        ${steps.map(
          (step, index) => html`
            <div class="step">
              <div class="step-number ${this.getStepClass(step.num)}">
                ${this.currentStep > step.num ? '\u2713' : step.num}
              </div>
              <span class="step-label ${this.currentStep === step.num ? 'active' : ''}">${step.label}</span>
            </div>
            ${
            index < steps.length - 1
              ? html` <div class="step-connector ${this.currentStep > step.num ? 'completed' : ''}"></div> `
              : ''
          }
          `,
        )}
      </div>
    `;
  }

  private getStepClass(stepNum: number): string {
    if (this.currentStep > stepNum) return 'completed';
    if (this.currentStep === stepNum) return 'active';
    return 'inactive';
  }

  private getTypeIcon(id: string): string {
    const icons: Record<string, string> = {
      // Marketing
      hero: '\u{1F5BC}',
      banner: '\u{1F3AF}',
      carousel: '\u{1F3A0}',
      // Content
      teaser: '\u{1F4F0}',
      quote: '\u{1F4AC}',
      accordion: '\u{1F4C2}',
      tabs: '\u{1F4CB}',
      // Commerce
      product: '\u{1F6D2}',
      productList: '\u{1F4E6}',
      pricing: '\u{1F4B0}',
      // Media
      video: '\u{1F3AC}',
      gallery: '\u{1F5BC}',
      // Navigation
      navigation: '\u{2630}',
      footer: '\u{1F4C4}',
      breadcrumb: '\u{27A1}',
      // Interactive
      form: '\u{1F4DD}',
      search: '\u{1F50D}',
      cta: '\u{1F4E2}',
      // Social
      socialShare: '\u{1F517}',
      team: '\u{1F465}',
    };
    return icons[id] || '\u{2728}';
  }

  private getToneIcon(id: string): string {
    const icons: Record<string, string> = {
      professional: '\u{1F4BC}',
      playful: '\u{1F389}',
      urgent: '\u{26A1}',
      elegant: '\u{2728}',
    };
    return icons[id] || '\u{2728}';
  }

  private getStyleIcon(id: string): string {
    const icons: Record<string, string> = {
      photo: '\u{1F4F7}',
      illustration: '\u{1F3A8}',
      abstract: '\u{1F537}',
      minimal: '\u{2B1C}',
    };
    return icons[id] || '\u{2728}';
  }

  private getFilteredComponents() {
    if (this.selectedCategory === 'all') {
      return COMPONENT_TYPES;
    }
    return COMPONENT_TYPES.filter((type) => type.category === this.selectedCategory);
  }

  private renderStep1() {
    const filteredComponents = this.getFilteredComponents();

    return html`
      <h2 class="step-title">What would you like to create?</h2>
      <p class="step-subtitle">Choose a component type to get started</p>

      <div class="category-filter">
        ${CATEGORIES.map(
          (cat) => html`
            <span
              class="category-chip ${this.selectedCategory === cat.id ? 'selected' : ''}"
              @click=${() => (this.selectedCategory = cat.id)}
            >
              ${cat.name}
            </span>
          `,
        )}
      </div>

      <div class="type-grid">
        ${filteredComponents.map(
          (type) => html`
            <div
              class="type-card ${this.selectedType === type.id ? 'selected' : ''}"
              @click=${() => this.selectType(type.id)}
            >
              <div class="type-card-header">
                <span class="type-icon">${this.getTypeIcon(type.id)}</span>
                <span class="type-name">${type.name}</span>
              </div>
              <p class="type-description">${type.description}</p>
              <p class="type-example">Best for: ${type.example}</p>
            </div>
          `,
        )}
      </div>

      <div class="step-navigation">
        <div></div>
        <sp-button variant="accent" @click=${() => this.nextStep()} ?disabled=${!this.selectedType}>
          Next: Customize
        </sp-button>
      </div>
    `;
  }

  private renderStep2() {
    const selectedTypeInfo = COMPONENT_TYPES.find((t) => t.id === this.selectedType);

    return html`
      <h2 class="step-title">Customize your ${selectedTypeInfo?.name}</h2>
      <p class="step-subtitle">Set the tone, select an image, and describe what you need</p>

      <label class="section-label">Tone & Voice</label>
      <div class="tone-grid">
        ${TONES.map(
          (tone) => html`
            <div
              class="tone-card ${this.selectedTone === tone.id ? 'selected' : ''}"
              @click=${() => (this.selectedTone = tone.id)}
            >
              <div class="tone-icon">${this.getToneIcon(tone.id)}</div>
              <div class="tone-name">${tone.name}</div>
              <div class="tone-description">${tone.description}</div>
            </div>
          `,
        )}
      </div>

      <label class="section-label">Image Style</label>
      <div class="image-style-grid">
        ${IMAGE_STYLES.map(
          (style) => html`
            <div
              class="image-style-card ${this.selectedImageStyle === style.id ? 'selected' : ''}"
              @click=${() => (this.selectedImageStyle = style.id)}
            >
              <div class="image-style-icon">${this.getStyleIcon(style.id)}</div>
              <div class="image-style-name">${style.name}</div>
            </div>
          `,
        )}
      </div>

      <div class="asset-selection">
        <label class="section-label">Select Image from Library (Optional)</label>
        <div class="asset-preview-container">
          ${
            this.selectedAsset
              ? html`
                  <div class="selected-asset-card">
                    <img
                      class="selected-asset-thumbnail"
                      src="${this.selectedAsset.thumbnailUrl || this.selectedAsset.url}"
                      alt="${this.selectedAsset.name}"
                    />
                    <div class="selected-asset-info">
                      <div class="selected-asset-name">${this.selectedAsset.name}</div>
                      <div class="selected-asset-tags">
                        ${this.selectedAsset.tags
                    .slice(0, 4)
                    .map((tag) => html` <span class="selected-asset-tag">${tag}</span> `)}
                      </div>
                      ${
                  this.selectedAsset.brandAligned
                    ? html` <span class="selected-asset-badge">✓ Brand Aligned</span> `
                    : ''
                }
                    </div>
                  </div>
                  <div class="asset-actions">
                    <sp-button variant="secondary" @click=${() => (this.showAssetBrowser = true)}> Change </sp-button>
                    <sp-button variant="secondary" @click=${() => (this.selectedAsset = null)}> Remove </sp-button>
                  </div>
                `
              : html`
                  <div class="no-asset-selected">
                    <div class="no-asset-icon">🖼</div>
                    <div class="no-asset-text">No image selected. Browse the asset library to choose one.</div>
                    <sp-button variant="accent" @click=${() => (this.showAssetBrowser = true)}>
                      Browse Asset Library
                    </sp-button>
                  </div>
                `
          }
        </div>
      </div>

      <div class="description-container">
        <label class="section-label">Describe your content</label>
        <sp-textfield
          multiline
          rows="3"
          placeholder="e.g., Summer sale promotion for outdoor furniture with 30% discount..."
          .value=${this.description}
          @input=${(e: Event) => (this.description = (e.target as HTMLInputElement).value)}
        ></sp-textfield>
        <p class="description-hint">Be specific about the topic, audience, and key message</p>
      </div>

      <div class="quick-examples">
        <p class="quick-examples-label">Quick examples:</p>
        <div class="example-chips">
          ${this.getExamplesForType().map(
            (example) => html`
              <span class="example-chip" @click=${() => (this.description = example)}>${example}</span>
            `,
          )}
        </div>
      </div>

      <div class="step-navigation">
        <sp-button variant="secondary" @click=${() => this.prevStep()}>Back</sp-button>
        <sp-button variant="accent" @click=${() => this.nextStep()} ?disabled=${!this.description.trim()}>
          Next: Review
        </sp-button>
      </div>
    `;
  }

  private renderStep3() {
    const selectedTypeInfo = COMPONENT_TYPES.find((t) => t.id === this.selectedType);
    const selectedToneInfo = TONES.find((t) => t.id === this.selectedTone);
    const selectedStyleInfo = IMAGE_STYLES.find((s) => s.id === this.selectedImageStyle);

    return html`
      <h2 class="step-title">Ready to generate!</h2>
      <p class="step-subtitle">Review your choices and generate content</p>

      <div class="summary">
        <div class="summary-title">Your selections</div>
        <div class="summary-items">
          <div class="summary-item">
            <span class="summary-item-icon">${this.getTypeIcon(this.selectedType)}</span>
            <div>
              <div class="summary-item-label">Component</div>
              <div class="summary-item-value">${selectedTypeInfo?.name}</div>
            </div>
          </div>
          <div class="summary-item">
            <span class="summary-item-icon">${this.getToneIcon(this.selectedTone)}</span>
            <div>
              <div class="summary-item-label">Tone</div>
              <div class="summary-item-value">${selectedToneInfo?.name}</div>
            </div>
          </div>
          <div class="summary-item">
            <span class="summary-item-icon">${this.getStyleIcon(this.selectedImageStyle)}</span>
            <div>
              <div class="summary-item-label">Image Style</div>
              <div class="summary-item-value">${selectedStyleInfo?.name}</div>
            </div>
          </div>
        </div>
      </div>

      ${
        this.selectedAsset
          ? html`
              <div class="summary" style="margin-top: 16px;">
                <div class="summary-title">Selected Image</div>
                <div class="asset-preview-container">
                  <div class="selected-asset-card">
                    <img
                      class="selected-asset-thumbnail"
                      src="${this.selectedAsset.thumbnailUrl || this.selectedAsset.url}"
                      alt="${this.selectedAsset.name}"
                    />
                    <div class="selected-asset-info">
                      <div class="selected-asset-name">${this.selectedAsset.name}</div>
                      <div class="selected-asset-tags">
                        ${this.selectedAsset.tags
                    .slice(0, 4)
                    .map((tag) => html` <span class="selected-asset-tag">${tag}</span> `)}
                      </div>
                      ${
                  this.selectedAsset.brandAligned
                    ? html` <span class="selected-asset-badge">✓ Brand Aligned</span> `
                    : ''
                }
                    </div>
                  </div>
                </div>
              </div>
            `
          : ''
      }

      <label class="section-label">Content Description</label>
      <div class="description-preview">${this.description}</div>

      <div class="step-navigation">
        <sp-button variant="secondary" @click=${() => this.prevStep()}>Back</sp-button>
        <sp-button variant="accent" @click=${() => this.generate()}> Generate Content </sp-button>
      </div>
    `;
  }

  private getExamplesForType(): string[] {
    switch (this.selectedType) {
      // Marketing
      case 'hero':
        return [
          'Summer sale with 50% off outdoor furniture',
          'New product launch for tech gadgets',
          'Company anniversary celebration',
        ];
      case 'banner':
        return ['Flash sale ending in 24 hours', 'Free shipping on orders over $50', 'New feature announcement'];
      case 'carousel':
        return [
          'Featured products of the month',
          'Customer success stories slideshow',
          'New arrivals collection showcase',
        ];
      // Content
      case 'teaser':
        return [
          'Blog post about sustainable living tips',
          'Case study featuring customer success',
          'Upcoming webinar on digital marketing',
        ];
      case 'quote':
        return [
          'Customer testimonial for software product',
          'CEO quote about company vision',
          'Industry expert endorsement',
        ];
      case 'accordion':
        return [
          'Frequently asked questions about shipping',
          'Product specifications and details',
          'Service tier comparison breakdown',
        ];
      case 'tabs':
        return ['Product features, specs, and reviews', 'Different plan comparisons', 'Content organized by category'];
      // Commerce
      case 'product':
        return [
          'Wireless headphones with noise cancellation',
          'Organic skincare product line',
          'Smart home security camera',
        ];
      case 'productList':
        return [
          'Summer collection clothing items',
          'Best-selling electronics this month',
          'New arrivals in home decor',
        ];
      case 'pricing':
        return [
          'SaaS subscription tiers comparison',
          'Service packages for agencies',
          'Membership levels and benefits',
        ];
      // Media
      case 'video':
        return ['Product demo and tutorial video', 'Brand story promotional video', 'Customer testimonial video'];
      case 'gallery':
        return [
          'Product photos from multiple angles',
          'Event highlights photo collection',
          'Portfolio of completed projects',
        ];
      // Navigation
      case 'navigation':
        return ['E-commerce site main navigation', 'Corporate website mega menu', 'Mobile-friendly navigation menu'];
      case 'footer':
        return [
          'Corporate footer with social links',
          'E-commerce footer with support info',
          'Newsletter signup and contact info',
        ];
      case 'breadcrumb':
        return ['Product category navigation path', 'Documentation section hierarchy', 'Multi-level page structure'];
      // Interactive
      case 'form':
        return ['Contact us inquiry form', 'Newsletter signup form', 'Event registration form'];
      case 'search':
        return ['Site-wide search with filters', 'Product search with autocomplete', 'Knowledge base search'];
      case 'cta':
        return ['Get started free trial signup', 'Download our mobile app', 'Schedule a demo consultation'];
      // Social
      case 'socialShare':
        return ['Article sharing buttons', 'Product page social share', 'Event invite sharing'];
      case 'team':
        return ['Leadership team profiles', 'Department team showcase', 'Advisory board members'];
      default:
        return ['Describe your content needs...'];
    }
  }

  private selectType(typeId: string) {
    this.selectedType = typeId;
  }

  private nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  private prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  private handleAssetSelected(e: CustomEvent) {
    this.selectedAsset = e.detail.asset;
    this.showAssetBrowser = false;
  }

  private generate() {
    this.loading = true;

    // Build the prompt from selections
    const selectedToneInfo = TONES.find((t) => t.id === this.selectedTone);
    const prompt = `${this.selectedType} for: ${this.description}. Tone: ${selectedToneInfo?.name}. Style: ${this.selectedImageStyle}`;

    // Dispatch event to parent
    this.dispatchEvent(
      new CustomEvent('generate', {
        detail: {
          componentType: this.selectedType,
          tone: this.selectedTone,
          imageStyle: this.selectedImageStyle,
          description: this.description,
          prompt: prompt,
          selectedAsset: this.selectedAsset,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // Public method to reset loading state
  public setLoading(loading: boolean) {
    this.loading = loading;
  }

  // Public method to reset wizard
  public reset() {
    this.currentStep = 1;
    this.selectedType = '';
    this.description = '';
    this.loading = false;
    this.selectedAsset = null;
    this.showAssetBrowser = false;
  }

  // Public getter for selected asset
  public getSelectedAsset(): ImageAsset | null {
    return this.selectedAsset;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'content-wizard': ContentWizard;
  }
}
