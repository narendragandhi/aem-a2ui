import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ContentSuggestion } from '../lib/types.js';
import {
  initUniversalEditor,
  getEditableAttributes,
  getFieldAttributes,
  getContainerAttributes,
  isUEEnabled,
  type UEConfig,
} from '../aue/index.js';

interface PageSection {
  id: string;
  type: string;
  content: ContentSuggestion | null;
  status: 'empty' | 'generating' | 'ready';
}

@customElement('aem-preview')
export class AemPreview extends LitElement {
  @property({ type: Array }) sections: PageSection[] = [];
  @property({ type: String }) viewMode: 'preview' | 'edit' | 'structure' = 'preview';
  @property({ type: Object }) ueConfig: Partial<UEConfig> = {};
  @state() private selectedComponent: string | null = null;
  @state() private deviceMode: 'desktop' | 'tablet' | 'mobile' = 'desktop';

  connectedCallback() {
    super.connectedCallback();
    // Initialize Universal Editor if config is provided
    if (this.ueConfig.enabled) {
      initUniversalEditor(this.ueConfig);
    }
  }

  /**
   * Get Universal Editor attributes for a content section
   */
  private getUEAttributes(section: PageSection): string {
    if (!isUEEnabled() || !section.content) {
      return '';
    }
    const attrs = getEditableAttributes(section.content, section.type);
    return Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  }

  /**
   * Get Universal Editor attributes for an editable field
   */
  private getUEFieldAttrs(fieldName: string): string {
    if (!isUEEnabled()) {
      return '';
    }
    const attrs = getFieldAttributes(fieldName);
    return Object.entries(attrs)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
  }

  static styles = css`
    :host {
      display: block;
      height: 100%;
    }

    .aem-preview {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--spectrum-gray-200, #e8e8e8);
    }

    /* AEM-style toolbar */
    .aem-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background: linear-gradient(180deg, #505050 0%, #3a3a3a 100%);
      border-bottom: 1px solid #2a2a2a;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .aem-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      font-size: 12px;
      font-weight: 600;
    }

    .aem-logo-icon {
      width: 24px;
      height: 24px;
      background: #ff0000;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 10px;
    }

    .view-modes {
      display: flex;
      gap: 2px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 4px;
      padding: 2px;
    }

    .view-mode-btn {
      padding: 6px 12px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.7);
      font-size: 11px;
      cursor: pointer;
      border-radius: 3px;
      transition: all 0.2s;
    }

    .view-mode-btn:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
    }

    .view-mode-btn.active {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .device-toggle {
      display: flex;
      gap: 4px;
    }

    .device-btn {
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      color: rgba(255, 255, 255, 0.7);
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .device-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      color: white;
    }

    .device-btn.active {
      background: var(--spectrum-accent-color-default, #1473e6);
      color: white;
    }

    .publish-btn {
      padding: 6px 16px;
      background: var(--spectrum-positive-color-default, #2d9d78);
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .publish-btn:hover {
      background: #259268;
    }

    /* Preview Container */
    .preview-container {
      flex: 1;
      overflow: auto;
      display: flex;
      justify-content: center;
      padding: 24px;
    }

    .preview-frame {
      background: white;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      transition: all 0.3s;
      overflow: hidden;
    }

    .preview-frame.desktop {
      width: 100%;
      max-width: 1200px;
    }

    .preview-frame.tablet {
      width: 768px;
      border-radius: 12px;
    }

    .preview-frame.mobile {
      width: 375px;
      border-radius: 24px;
      border: 8px solid #333;
    }

    /* Page Content */
    .page-content {
      min-height: 100%;
    }

    /* Component Wrapper - Edit Mode */
    .component-wrapper {
      position: relative;
      transition: all 0.2s;
    }

    .component-wrapper.edit-mode {
      outline: 2px dashed transparent;
      outline-offset: -2px;
    }

    .component-wrapper.edit-mode:hover {
      outline-color: var(--spectrum-accent-color-default, #1473e6);
    }

    .component-wrapper.edit-mode.selected {
      outline-color: var(--spectrum-accent-color-default, #1473e6);
      outline-style: solid;
    }

    /* AEM Component Chrome */
    .component-chrome {
      display: none;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background: var(--spectrum-accent-color-default, #1473e6);
      color: white;
      padding: 4px 8px;
      font-size: 11px;
      z-index: 10;
      justify-content: space-between;
      align-items: center;
    }

    .component-wrapper.edit-mode:hover .component-chrome,
    .component-wrapper.edit-mode.selected .component-chrome {
      display: flex;
    }

    .chrome-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .chrome-icon {
      width: 16px;
      height: 16px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
    }

    .chrome-name {
      font-weight: 600;
    }

    .chrome-path {
      opacity: 0.7;
      font-size: 10px;
    }

    .chrome-actions {
      display: flex;
      gap: 4px;
    }

    .chrome-btn {
      width: 20px;
      height: 20px;
      border: none;
      background: rgba(255, 255, 255, 0.2);
      color: white;
      border-radius: 3px;
      cursor: pointer;
      font-size: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chrome-btn:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Structure View */
    .structure-view {
      padding: 24px;
    }

    .structure-tree {
      background: white;
      border-radius: 8px;
      padding: 16px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
    }

    .tree-node {
      padding: 4px 0;
    }

    .tree-node-content {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      cursor: pointer;
    }

    .tree-node-content:hover {
      background: var(--spectrum-gray-100, #f5f5f5);
    }

    .tree-icon {
      color: var(--spectrum-accent-color-default, #1473e6);
    }

    .tree-tag {
      color: #881280;
    }

    .tree-attr {
      color: #994500;
    }

    .tree-value {
      color: #1a1aa6;
    }

    .tree-children {
      margin-left: 20px;
      border-left: 1px solid var(--spectrum-gray-300, #e0e0e0);
      padding-left: 12px;
    }

    /* Component Renderings */
    .hero-component {
      position: relative;
      height: 400px;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-align: center;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.3) 100%);
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 600px;
      padding: 24px;
    }

    .hero-title {
      font-size: 42px;
      font-weight: 700;
      margin-bottom: 16px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .hero-subtitle {
      font-size: 20px;
      opacity: 0.9;
      margin-bottom: 24px;
    }

    .hero-cta {
      display: inline-block;
      padding: 14px 32px;
      background: var(--spectrum-accent-color-default, #1473e6);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      transition: all 0.2s;
    }

    .teaser-component {
      display: flex;
      gap: 24px;
      padding: 40px;
      align-items: center;
    }

    .teaser-image {
      flex: 1;
      border-radius: 8px;
      overflow: hidden;
    }

    .image-placeholder {
      flex: 1;
      border-radius: 8px;
      background: var(--spectrum-gray-200, #e8e8e8);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--spectrum-gray-500, #999);
      font-size: 32px;
      min-height: 200px;
    }

    .teaser-image img {
      width: 100%;
      height: 250px;
      object-fit: cover;
    }

    .teaser-content {
      flex: 1;
    }

    .teaser-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 12px;
      color: var(--spectrum-gray-900, #1a1a1a);
    }

    .teaser-description {
      font-size: 16px;
      color: var(--spectrum-gray-700, #666);
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .teaser-cta {
      display: inline-block;
      padding: 12px 24px;
      background: var(--spectrum-accent-color-default, #1473e6);
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
    }

    .nav-component {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 40px;
      background: white;
      border-bottom: 1px solid var(--spectrum-gray-200, #e8e8e8);
    }

    .nav-logo {
      font-size: 20px;
      font-weight: 700;
      color: var(--spectrum-gray-900, #1a1a1a);
    }

    .nav-links {
      display: flex;
      gap: 32px;
    }

    .nav-link {
      color: var(--spectrum-gray-700, #666);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }

    .nav-link:hover {
      color: var(--spectrum-accent-color-default, #1473e6);
    }

    .footer-component {
      background: var(--spectrum-gray-900, #1a1a1a);
      color: white;
      padding: 40px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 32px;
    }

    .footer-section h4 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      opacity: 0.7;
    }

    .footer-link {
      display: block;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-size: 13px;
      margin-bottom: 8px;
    }

    .cta-component {
      background: linear-gradient(135deg, var(--spectrum-accent-color-default, #1473e6) 0%, #0d66d0 100%);
      color: white;
      padding: 60px 40px;
      text-align: center;
    }

    .cta-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .cta-description {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 24px;
    }

    .cta-button {
      display: inline-block;
      padding: 12px 24px;
      background: white;
      color: var(--spectrum-accent-color-default, #1473e6);
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
    }

    /* Accordion component styles */
    .accordion-component {
      padding: 40px;
    }
    .accordion-item {
      border-bottom: 1px solid var(--spectrum-gray-200, #e8e8e8);
    }
    .accordion-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      cursor: pointer;
      font-size: 18px;
      font-weight: 600;
    }
    .accordion-content {
      padding-bottom: 16px;
      font-size: 15px;
      line-height: 1.6;
      color: var(--spectrum-gray-700, #666);
    }

    /* Social Share component */
    .social-share-component {
      padding: 40px;
      text-align: center;
    }
    .social-share-buttons {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 16px;
    }
    .social-share-button {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      text-decoration: none;
      color: white;
      transition: opacity 0.2s;
    }
    .social-share-button:hover {
      opacity: 0.9;
    }
    .social-share-button.facebook {
      background-color: #1877f2;
    }
    .social-share-button.twitter {
      background-color: #1da1f2;
    }
    .social-share-button.linkedin {
      background-color: #0a66c2;
    }

    /* Pricing component */
    .pricing-component {
      padding: 40px;
      display: flex;
      gap: 24px;
      justify-content: center;
    }
    .pricing-tier {
      border: 1px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 8px;
      padding: 24px;
      flex: 1;
      max-width: 300px;
    }
    .pricing-tier h3 {
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .pricing-tier .price {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    /* Form component */
    .form-component {
      padding: 40px;
      max-width: 600px;
      margin: auto;
    }
    .form-field {
      margin-bottom: 16px;
    }
    .form-field label {
      display: block;
      margin-bottom: 8px;
    }
    .form-field input {
      width: 100%;
      padding: 8px;
      border: 1px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 4px;
    }

    /* Quote/Testimonial component */
    .quote-component {
      padding: 40px;
      text-align: center;
      background: var(--spectrum-gray-100, #f5f5f5);
    }
    .quote-text {
      font-size: 24px;
      font-style: italic;
      color: var(--spectrum-gray-800, #4b4b4b);
      margin-bottom: 16px;
    }
    .quote-author {
      font-weight: 600;
      color: var(--spectrum-gray-900, #1a1a1a);
    }

    /* Gallery & Video components */
    .media-component {
      padding: 40px;
      text-align: center;
    }
    .media-placeholder {
      width: 100%;
      height: 300px;
      background: var(--spectrum-gray-200, #e8e8e8);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--spectrum-gray-500, #999);
      font-size: 24px;
      border-radius: 8px;
      margin-top: 16px;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-top: 16px;
    }
    .gallery-image-placeholder {
      width: 100%;
      height: 150px;
      background: var(--spectrum-gray-200, #e8e8e8);
      border-radius: 8px;
    }

    .empty-component {
      padding: 40px;
      text-align: center;
      color: var(--spectrum-gray-500, #999);
      border: 2px dashed var(--spectrum-gray-300, #e0e0e0);
      margin: 16px;
      border-radius: 8px;
    }

    .generating-component {
      padding: 60px 40px;
      text-align: center;
      background: var(--spectrum-gray-100, #f5f5f5);
    }

    .generating-spinner {
      margin-bottom: 16px;
    }

    /* Responsive Styles */
    @media (max-width: 1024px) {
      .footer-component {
        grid-template-columns: repeat(2, 1fr);
      }

      .preview-frame.tablet {
        width: 100%;
        max-width: 768px;
      }
    }

    @media (max-width: 768px) {
      .aem-toolbar {
        flex-direction: column;
        gap: 8px;
        padding: 8px 12px;
      }

      .toolbar-left {
        flex-wrap: wrap;
        justify-content: center;
        gap: 8px;
      }

      .aem-logo {
        font-size: 11px;
      }

      .aem-logo-icon {
        width: 20px;
        height: 20px;
        font-size: 9px;
      }

      .view-mode-btn {
        padding: 5px 8px;
        font-size: 10px;
      }

      .toolbar-right {
        width: 100%;
        justify-content: center;
      }

      .device-btn {
        width: 28px;
        height: 28px;
        font-size: 12px;
      }

      .publish-btn {
        padding: 5px 12px;
        font-size: 11px;
      }

      .preview-container {
        padding: 12px;
      }

      .preview-frame.desktop,
      .preview-frame.tablet,
      .preview-frame.mobile {
        width: 100%;
        max-width: 100%;
        border-radius: 0;
        border: none;
      }

      .hero-component {
        height: 300px;
      }

      .hero-title {
        font-size: 28px;
      }

      .hero-subtitle {
        font-size: 16px;
      }

      .hero-cta {
        padding: 10px 24px;
        font-size: 14px;
      }

      .teaser-component {
        flex-direction: column;
        padding: 24px;
      }

      .teaser-title {
        font-size: 22px;
      }

      .teaser-description {
        font-size: 14px;
      }

      .nav-component {
        flex-direction: column;
        gap: 12px;
        padding: 12px 16px;
      }

      .nav-links {
        flex-wrap: wrap;
        justify-content: center;
        gap: 16px;
      }

      .footer-component {
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        padding: 24px;
      }

      .cta-component {
        padding: 40px 24px;
      }

      .cta-title {
        font-size: 24px;
      }

      .cta-description {
        font-size: 15px;
      }

      .structure-view {
        padding: 12px;
      }

      .structure-tree {
        padding: 12px;
        font-size: 11px;
        overflow-x: auto;
      }

      .tree-children {
        margin-left: 12px;
        padding-left: 8px;
      }

      .component-chrome {
        flex-direction: column;
        gap: 4px;
        padding: 6px 8px;
      }

      .chrome-path {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .aem-toolbar {
        padding: 6px 8px;
      }

      .aem-logo {
        font-size: 10px;
      }

      .view-modes {
        width: 100%;
        justify-content: center;
      }

      .view-mode-btn {
        flex: 1;
        text-align: center;
      }

      .device-toggle {
        display: none;
      }

      .hero-component {
        height: 250px;
      }

      .hero-title {
        font-size: 22px;
      }

      .hero-subtitle {
        font-size: 14px;
        margin-bottom: 16px;
      }

      .hero-content {
        padding: 16px;
      }

      .teaser-component {
        padding: 16px;
        gap: 16px;
      }

      .teaser-image img {
        height: 180px;
      }

      .teaser-title {
        font-size: 18px;
      }

      .teaser-cta {
        padding: 10px 20px;
        font-size: 13px;
      }

      .nav-links {
        gap: 12px;
      }

      .nav-link {
        font-size: 12px;
      }

      .footer-component {
        grid-template-columns: 1fr;
        gap: 20px;
        padding: 20px;
      }

      .footer-section h4 {
        margin-bottom: 10px;
      }

      .cta-component {
        padding: 32px 16px;
      }

      .cta-title {
        font-size: 20px;
      }

      .cta-button {
        padding: 12px 24px;
        font-size: 14px;
      }

      .empty-component {
        padding: 24px;
        margin: 8px;
        font-size: 13px;
      }

      .generating-component {
        padding: 40px 20px;
      }
    }

    .visual-alignment-badge {
      position: absolute;
      top: 10px;
      left: 10px;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      color: white;
      z-index: 10;
      background-color: var(--spectrum-positive-color-default, #2d9d78); /* Default to positive */
    }

    .visual-alignment-badge.warning {
      background-color: var(--spectrum-orange-600, #ff8f00);
    }
  `;

  render() {
    return html`
      <div class="aem-preview">
        ${this.renderToolbar()}
        <div class="preview-container">
          ${this.viewMode === 'structure' ? this.renderStructureView() : this.renderPreviewFrame()}
        </div>
      </div>
    `;
  }

  private renderToolbar() {
    return html`
      <div class="aem-toolbar">
        <div class="toolbar-left">
          <div class="aem-logo">
            <span class="aem-logo-icon">A</span>
            Adobe Experience Manager
          </div>
          <div class="view-modes">
            <button
              class="view-mode-btn ${this.viewMode === 'preview' ? 'active' : ''}"
              @click=${() => (this.viewMode = 'preview')}
            >
              Preview
            </button>
            <button
              class="view-mode-btn ${this.viewMode === 'edit' ? 'active' : ''}"
              @click=${() => (this.viewMode = 'edit')}
            >
              Edit
            </button>
            <button
              class="view-mode-btn ${this.viewMode === 'structure' ? 'active' : ''}"
              @click=${() => (this.viewMode = 'structure')}
            >
              Structure
            </button>
          </div>
        </div>
        <div class="toolbar-right">
          <div class="device-toggle">
            <button
              class="device-btn ${this.deviceMode === 'desktop' ? 'active' : ''}"
              @click=${() => (this.deviceMode = 'desktop')}
              title="Desktop"
            >
              🖥️
            </button>
            <button
              class="device-btn ${this.deviceMode === 'tablet' ? 'active' : ''}"
              @click=${() => (this.deviceMode = 'tablet')}
              title="Tablet"
            >
              📱
            </button>
            <button
              class="device-btn ${this.deviceMode === 'mobile' ? 'active' : ''}"
              @click=${() => (this.deviceMode = 'mobile')}
              title="Mobile"
            >
              📲
            </button>
          </div>
          <button class="publish-btn">Publish Page</button>
        </div>
      </div>
    `;
  }

  private renderPreviewFrame() {
    return html`
      <div class="preview-frame ${this.deviceMode}">
        <div class="page-content">
          ${
            this.sections.length === 0
              ? html`<div class="empty-component">No components on this page yet</div>`
              : this.sections.map((section) => this.renderComponent(section))
          }
        </div>
      </div>
    `;
  }

  private renderComponent(section: PageSection) {
    const isEditMode = this.viewMode === 'edit';
    const isSelected = this.selectedComponent === section.id;

    return html`
      <div
        class="component-wrapper ${isEditMode ? 'edit-mode' : ''} ${isSelected ? 'selected' : ''}"
        @click=${() => isEditMode && (this.selectedComponent = section.id)}
      >
        ${
          isEditMode
            ? html`
                <div class="component-chrome">
                  <div class="chrome-info">
                    <span class="chrome-icon">📦</span>
                    <span class="chrome-name">${this.getComponentName(section.type)}</span>
                    <span class="chrome-path">/content/site/page/jcr:content/${section.type}</span>
                  </div>
                  <div class="chrome-actions">
                    <button class="chrome-btn" title="Edit">✏️</button>
                    <button class="chrome-btn" title="Configure">⚙️</button>
                    <button class="chrome-btn" title="Delete">🗑️</button>
                  </div>
                </div>
              `
            : ''
        }
        ${this.renderComponentContent(section)}
      </div>
    `;
  }

  private renderComponentContent(section: PageSection) {
    if (section.status === 'generating') {
      return html`
        <div class="generating-component">
          <div class="generating-spinner">
            <sp-progress-circle indeterminate size="l"></sp-progress-circle>
          </div>
          <div>Generating ${this.getComponentName(section.type)}...</div>
        </div>
      `;
    }

    if (section.status === 'empty' || !section.content) {
      return html`
        <div class="empty-component">
          <div style="font-size: 24px; margin-bottom: 8px;">📦</div>
          ${this.getComponentName(section.type)} - Click "Generate All" to create content
        </div>
      `;
    }

    const content = section.content;

    switch (section.type) {
      case 'navigation':
        return html`
          <div class="nav-component">
            <div class="nav-logo">Acme Corp</div>
            <nav class="nav-links">
              <a href="#" class="nav-link">Products</a>
              <a href="#" class="nav-link">Solutions</a>
              <a href="#" class="nav-link">Pricing</a>
              <a href="#" class="nav-link">About</a>
              <a href="#" class="nav-link">Contact</a>
            </nav>
          </div>
        `;

      case 'hero':
        return html`
          <div
            class="hero-component"
            style="background-image: ${content.imageUrl ? `url('${content.imageUrl}')` : 'linear-gradient(135deg, #4a4a4a 0%, #303030 100%)'}"
          >
            ${
              content.visualScore !== undefined
                ? html`
                    <span class="visual-alignment-badge ${content.visualScore > 0 ? '' : 'warning'}">
                      ${content.visualScore > 0 ? 'Brand Aligned' : 'Review Visual'}
                    </span>
                  `
                : ''
            }
            <div class="hero-overlay"></div>
            <div class="hero-content">
              <h1 class="hero-title">${content.title}</h1>
              <p class="hero-subtitle">${content.subtitle || content.description}</p>
              <a href="${content.ctaUrl || '#'}" class="hero-cta">${content.cta || content.ctaText || 'Learn More'}</a>
            </div>
          </div>
        `;

      case 'teaser':
        return html`
          <div class="teaser-component">
            <div class="teaser-image">
              <img src="${content.imageUrl}" alt="${content.imageAlt || content.title}" />
              ${
                content.visualScore !== undefined
                  ? html`
                      <span class="visual-alignment-badge ${content.visualScore > 0 ? '' : 'warning'}">
                        ${content.visualScore > 0 ? 'Brand Aligned' : 'Review Visual'}
                      </span>
                    `
                  : ''
              }
            </div>
            <div class="teaser-content">
              <h2 class="teaser-title">${content.title}</h2>
              <p class="teaser-description">${content.description}</p>
              <a href="${content.ctaUrl || '#'}" class="teaser-cta">${content.cta || content.ctaText || 'Read More'}</a>
            </div>
          </div>
        `;

      case 'cta':
        return html`
          <div class="cta-component">
            <h2 class="cta-title">${content.title}</h2>
            <p class="cta-description">${content.description}</p>
            <a href="${content.ctaUrl || '#'}" class="cta-button">${content.cta || content.ctaText || 'Get Started'}</a>
          </div>
        `;

      case 'footer':
        return html`
          <div class="footer-component">
            <div class="footer-section">
              <h4>PRODUCTS</h4>
              <a href="#" class="footer-link">Enterprise</a>
              <a href="#" class="footer-link">Small Business</a>
              <a href="#" class="footer-link">Developers</a>
            </div>
            <div class="footer-section">
              <h4>COMPANY</h4>
              <a href="#" class="footer-link">About Us</a>
              <a href="#" class="footer-link">Careers</a>
              <a href="#" class="footer-link">Press</a>
            </div>
            <div class="footer-section">
              <h4>RESOURCES</h4>
              <a href="#" class="footer-link">Documentation</a>
              <a href="#" class="footer-link">Blog</a>
              <a href="#" class="footer-link">Support</a>
            </div>
            <div class="footer-section">
              <h4>LEGAL</h4>
              <a href="#" class="footer-link">Privacy Policy</a>
              <a href="#" class="footer-link">Terms of Service</a>
              <a href="#" class="footer-link">Cookie Policy</a>
            </div>
          </div>
        `;

      case 'accordion':
      case 'tabs':
        return html`
          <div class="accordion-component">
            <h2 class="teaser-title">${content.title || 'Titled Component'}</h2>
            <p class="teaser-description">${content.description || ''}</p>
            ${
                Array.isArray(content.items)
                  ? content.items.map(
                      (item) => html`
                        <div class="accordion-item">
                          <div class="accordion-header">${item.title || 'Item Title'}</div>
                          <div class="accordion-content">${item.description || 'Item description.'}</div>
                        </div>
                      `,
                    )
                  : html`<p>No items found for this component.</p>`
              }
          </div>
        `;

      case 'product':
      case 'banner':
      case 'team':
        return html`
          <div class="teaser-component">
            <div class="teaser-content" style="flex: 1;">
              <h2 class="teaser-title">${content.title || 'Title'}</h2>
              <p class="teaser-description">${content.description || 'Description'}</p>
              ${
                  content.cta || content.ctaText
                    ? html`
                        <a href="${content.ctaUrl || '#'}" class="teaser-cta">${content.cta || content.ctaText}</a>
                      `
                    : ''
                }
            </div>
            ${
                content.imageUrl
                  ? html`
                      <div class="teaser-image">
                        <img src="${content.imageUrl}" alt="${content.imageAlt || content.title}" />
                      </div>
                    `
                  : html` <div class="image-placeholder">🖼️</div> `
              }
          </div>
        `;

      case 'quote':
        return html`
          <div class="quote-component">
            <p class="quote-text">"${content.description || content.quote || 'Quote text goes here.'}"</p>
            <div class="quote-author">- ${content.author || content.title || 'Author'}</div>
          </div>
        `;

      case 'video':
        return html`
          <div class="media-component">
            <h2 class="teaser-title">${content.title || 'Video Title'}</h2>
            <p class="teaser-description">${content.description || ''}</p>
            <div class="media-placeholder">▶️</div>
          </div>
        `;

      case 'gallery':
        return html`
          <div class="media-component">
            <h2 class="teaser-title">${content.title || 'Gallery'}</h2>
            <p class="teaser-description">${content.description || ''}</p>
            <div class="gallery-grid">
              ${(Array.isArray(content.images) ? content.images : [1, 2, 3]).map(
                () => html` <div class="gallery-image-placeholder"></div> `,
              )}
            </div>
          </div>
        `;

      case 'socialShare':
        return html`
          <div class="social-share-component">
            <h2 class="teaser-title">${content.title || 'Share this page'}</h2>
            <p class="teaser-description">${content.description || ''}</p>
            <div class="social-share-buttons">
              <a href="#" class="social-share-button facebook">Facebook</a>
              <a href="#" class="social-share-button twitter">Twitter</a>
              <a href="#" class="social-share-button linkedin">LinkedIn</a>
            </div>
          </div>
        `;

      case 'pricing':
        return html`
          <div class="pricing-component">
            ${
              Array.isArray(content.items)
                ? content.items.map(
                    (item) => html`
                      <div class="pricing-tier">
                        <h3>${item.title || 'Tier'}</h3>
                        <div class="price">${item.price || '$0'}</div>
                        <p>${item.description || 'Tier description.'}</p>
                      </div>
                    `,
                  )
                : html`<p>No pricing tiers found.</p>`
            }
          </div>
        `;

      case 'form':
        return html`
          <div class="form-component">
            <h2 class="teaser-title">${content.title || 'Form'}</h2>
            <p class="teaser-description">${content.description || ''}</p>
            ${
              Array.isArray(content.items)
                ? content.items.map(
                    (item) => html`
                      <div class="form-field">
                        <label>${item.title || 'Field'}</label>
                        <input type="${item.type || 'text'}" placeholder="${item.placeholder || ''}" />
                      </div>
                    `,
                  )
                : html`<p>No form fields found.</p>`
            }
          </div>
        `;

      case 'carousel':
        return html`
          <div class="teaser-component">
            <h2 class="teaser-title">${content.title || 'Carousel'}</h2>
            <p class="teaser-description">${content.description || 'Carousel content goes here.'}</p>
          </div>
        `;

      default:
        return html`
          <div class="teaser-component">
            <div class="teaser-content" style="flex: 1;">
              <h2 class="teaser-title">${content.title}</h2>
              <p class="teaser-description">${content.description}</p>
              ${
                content.cta || content.ctaText
                  ? html` <a href="${content.ctaUrl || '#'}" class="teaser-cta">${content.cta || content.ctaText}</a> `
                  : ''
              }
            </div>
            ${
              content.imageUrl
                ? html`
                    <div class="teaser-image">
                      <img src="${content.imageUrl}" alt="${content.imageAlt || content.title}" />
                    </div>
                  `
                : ''
            }
          </div>
        `;
    }
  }

  private renderStructureView() {
    return html`
      <div class="structure-view">
        <div class="structure-tree">
          <div class="tree-node">
            <div class="tree-node-content">
              <span class="tree-icon">📁</span>
              <span class="tree-tag">&lt;jcr:root&gt;</span>
            </div>
            <div class="tree-children">
              <div class="tree-node">
                <div class="tree-node-content">
                  <span class="tree-icon">📁</span>
                  <span class="tree-tag">&lt;jcr:content&gt;</span>
                  <span class="tree-attr">sling:resourceType=</span>
                  <span class="tree-value">"acme/components/page"</span>
                </div>
                <div class="tree-children">
                  <div class="tree-node">
                    <div class="tree-node-content">
                      <span class="tree-icon">📁</span>
                      <span class="tree-tag">&lt;root&gt;</span>
                      <span class="tree-attr">sling:resourceType=</span>
                      <span class="tree-value">"acme/components/container"</span>
                    </div>
                    <div class="tree-children">
                      ${this.sections.map(
                        (section, index) => html`
                          <div class="tree-node">
                            <div class="tree-node-content">
                              <span class="tree-icon">📦</span>
                              <span class="tree-tag">&lt;${section.type}_${index}&gt;</span>
                              <span class="tree-attr">sling:resourceType=</span>
                              <span class="tree-value">"acme/components/${section.type}"</span>
                            </div>
                            ${
                            section.content
                              ? html`
                                  <div class="tree-children">
                                    <div class="tree-node">
                                      <div class="tree-node-content">
                                        <span class="tree-attr">jcr:title=</span>
                                        <span class="tree-value">"${section.content.title}"</span>
                                      </div>
                                    </div>
                                    ${
                                section.content.description
                                  ? html`
                                      <div class="tree-node">
                                        <div class="tree-node-content">
                                          <span class="tree-attr">description=</span>
                                          <span class="tree-value"
                                            >"${section.content.description.substring(0, 50)}..."</span
                                          >
                                        </div>
                                      </div>
                                    `
                                  : ''
                              }
                                  </div>
                                `
                              : ''
                          }
                          </div>
                        `,
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getComponentName(type: string): string {
    const names: Record<string, string> = {
      navigation: 'Navigation',
      hero: 'Hero Banner',
      teaser: 'Teaser',
      product: 'Product Card',
      banner: 'Promo Banner',
      carousel: 'Carousel',
      quote: 'Testimonial',
      accordion: 'Accordion',
      tabs: 'Tabs',
      video: 'Video',
      gallery: 'Gallery',
      form: 'Form',
      cta: 'Call to Action',
      team: 'Team Grid',
      pricing: 'Pricing Table',
      socialShare: 'Social Share',
      footer: 'Footer',
    };
    return names[type] || type;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aem-preview': AemPreview;
  }
}
