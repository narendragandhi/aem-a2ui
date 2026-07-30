import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ContentSuggestion } from '../lib/types';
import './brand-score.js';
import { BrandScore } from './brand-score.js';

@customElement('assistant-preview')
export class AssistantPreview extends LitElement {
  @property({ type: Object }) appliedContent: ContentSuggestion | null = null;
  @state() private editingField: string | null = null;
  @state() private editMode = false;

  static styles = css`
    .right-panel {
      background: #fff;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .preview-header {
      padding: 16px 20px;
      background: #f8f9fa;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .preview-header h2 {
      margin: 0;
      font-size: 14px;
      color: #666;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .preview-actions {
      display: flex;
      gap: 8px;
    }

    .preview-action-btn {
      padding: 6px 12px;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .preview-action-btn:hover {
      border-color: #1473e6;
      color: #1473e6;
    }

    .preview-container {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f0f0f0;
    }

    .preview-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #999;
      text-align: center;
      padding: 40px;
    }

    .preview-placeholder-icon {
      font-size: 80px;
      margin-bottom: 24px;
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%,
      100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-10px);
      }
    }

    .preview-placeholder h3 {
      margin: 0 0 12px 0;
      font-size: 24px;
      color: #333;
      font-weight: 600;
    }

    .preview-placeholder p {
      margin: 0 0 24px 0;
      font-size: 15px;
      max-width: 400px;
      color: #666;
      line-height: 1.6;
    }

    .preview-placeholder-steps {
      display: flex;
      gap: 16px;
      margin-top: 24px;
      padding: 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }

    .step-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
    }

    .step-item-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #1473e6;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 14px;
    }

    .step-item-label {
      font-size: 12px;
      color: #666;
      text-align: center;
    }

    .step-arrow {
      display: flex;
      align-items: center;
      color: #ccc;
      font-size: 20px;
    }

    /* Component Previews */
    .component-preview {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    /* Hero Component */
    .hero-preview {
      position: relative;
      min-height: 400px;
    }

    .hero-preview .hero-image {
      width: 100%;
      height: 400px;
      object-fit: cover;
    }

    .hero-preview .hero-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 40px;
      color: white;
    }

    .hero-preview h2 {
      margin: 0 0 8px 0;
      font-size: 36px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .hero-preview .subtitle {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 16px;
    }

    .hero-preview .description {
      font-size: 16px;
      opacity: 0.85;
      max-width: 500px;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .hero-preview .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background: #1473e6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      transition: background 0.2s;
    }

    /* Product Component */
    .product-preview {
      display: flex;
      flex-direction: column;
    }

    .product-preview .product-image {
      width: 100%;
      height: 300px;
      object-fit: cover;
    }

    .product-preview .product-content {
      padding: 24px;
    }

    .product-preview h3 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #333;
    }

    .product-preview .price {
      font-size: 28px;
      font-weight: 700;
      color: #1473e6;
      margin-bottom: 12px;
    }

    .product-preview .description {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .product-preview .cta-button {
      display: inline-block;
      padding: 12px 24px;
      background: #1473e6;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      text-align: center;
    }

    /* Teaser Component */
    .teaser-preview {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .teaser-preview .teaser-image {
      width: 100%;
      height: 250px;
      object-fit: cover;
    }

    .teaser-preview .teaser-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .teaser-preview h3 {
      margin: 0 0 8px 0;
      font-size: 22px;
      color: #333;
    }

    .teaser-preview .subtitle {
      font-size: 14px;
      color: #1473e6;
      margin-bottom: 12px;
      font-weight: 500;
    }

    .teaser-preview .description {
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    .teaser-preview .cta-link {
      color: #1473e6;
      text-decoration: none;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Banner Component */
    .banner-preview {
      background: linear-gradient(135deg, #1473e6 0%, #6929c4 100%);
      padding: 32px;
      color: white;
      text-align: center;
    }

    .banner-preview h3 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 700;
    }

    .banner-preview .subtitle {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 12px;
    }

    .banner-preview .description {
      font-size: 14px;
      opacity: 0.85;
      max-width: 500px;
      margin: 0 auto 20px auto;
      line-height: 1.6;
    }

    .banner-preview .cta-button {
      display: inline-block;
      padding: 12px 28px;
      background: white;
      color: #1473e6;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
    }

    /* Accordion Component */
    .accordion-preview {
      padding: 24px;
    }

    .accordion-preview h3 {
      margin: 0 0 16px 0;
      font-size: 24px;
      color: #333;
    }

    .accordion-item {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 8px;
      overflow: hidden;
    }

    .accordion-header {
      padding: 16px 20px;
      background: #f8f9fa;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      font-weight: 600;
      color: #333;
    }

    .accordion-header:hover {
      background: #e9ecef;
    }

    .accordion-content {
      padding: 16px 20px;
      color: #666;
      line-height: 1.6;
      border-top: 1px solid #e0e0e0;
    }

    /* Breadcrumb Component */
    .breadcrumb-preview {
      padding: 24px;
    }

    .breadcrumb-preview h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      color: #333;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .breadcrumb-item {
      color: #1473e6;
      text-decoration: none;
      font-size: 14px;
    }

    .breadcrumb-item.current {
      color: #666;
    }

    .breadcrumb-separator {
      color: #999;
    }

    /* Quote/Testimonial Component */
    .quote-preview {
      padding: 40px;
      text-align: center;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    }

    .quote-icon {
      font-size: 48px;
      color: #1473e6;
      margin-bottom: 16px;
    }

    .quote-preview blockquote {
      margin: 0 auto 24px auto;
      font-size: 22px;
      font-style: italic;
      color: #333;
      max-width: 600px;
      line-height: 1.6;
    }

    .quote-author {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .quote-role {
      font-size: 14px;
      color: #666;
    }

    /* Tabs Component */
    .tabs-preview {
      padding: 24px;
    }

    .tabs-preview h3 {
      margin: 0 0 16px 0;
      font-size: 24px;
      color: #333;
    }

    .tab-headers {
      display: flex;
      border-bottom: 2px solid #e0e0e0;
      margin-bottom: 16px;
    }

    .tab-header {
      padding: 12px 24px;
      cursor: pointer;
      font-weight: 500;
      color: #666;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
    }

    .tab-header.active {
      color: #1473e6;
      border-bottom-color: #1473e6;
    }

    .tab-content {
      padding: 16px 0;
      color: #666;
      line-height: 1.6;
    }

    /* Carousel Component */
    .carousel-preview {
      padding: 24px;
    }

    .carousel-preview h3 {
      margin: 0 0 16px 0;
      font-size: 24px;
      color: #333;
    }

    .carousel-container {
      position: relative;
      overflow: hidden;
      border-radius: 12px;
    }

    .carousel-slide {
      position: relative;
    }

    .carousel-slide img {
      width: 100%;
      height: 300px;
      object-fit: cover;
    }

    .carousel-caption {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 20px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
      color: white;
    }

    .carousel-dots {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 16px;
    }

    .carousel-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ccc;
    }

    .carousel-dot.active {
      background: #1473e6;
    }

    /* Navigation Component */
    .navigation-preview {
      background: white;
      border-bottom: 1px solid #e0e0e0;
    }

    .nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
    }

    .nav-logo {
      font-size: 20px;
      font-weight: 700;
      color: #333;
    }

    .nav-links {
      display: flex;
      gap: 32px;
    }

    .nav-link {
      color: #666;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }

    .nav-link:hover {
      color: #1473e6;
    }

    /* Footer Component */
    .footer-preview {
      background: #1a1a1a;
      color: white;
      padding: 40px 24px;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 32px;
    }

    .footer-section h4 {
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
      opacity: 0.7;
    }

    .footer-link {
      display: block;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-size: 14px;
      margin-bottom: 8px;
    }

    /* Form Component */
    .form-preview {
      padding: 24px;
    }

    .form-preview h3 {
      margin: 0 0 16px 0;
      font-size: 24px;
      color: #333;
    }

    .form-field {
      margin-bottom: 16px;
    }

    .form-field label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 6px;
    }

    .form-field input,
    .form-field textarea {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .form-submit {
      padding: 12px 24px;
      background: #1473e6;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }

    /* CTA Component */
    .cta-preview {
      background: linear-gradient(135deg, #1473e6 0%, #0d66d0 100%);
      padding: 60px 40px;
      text-align: center;
      color: white;
    }

    .cta-preview h3 {
      margin: 0 0 12px 0;
      font-size: 32px;
      font-weight: 700;
    }

    .cta-preview .description {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 24px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-preview .cta-button {
      display: inline-block;
      padding: 14px 32px;
      background: white;
      color: #1473e6;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
    }

    /* Team Component */
    .team-preview {
      padding: 24px;
    }

    .team-preview h3 {
      margin: 0 0 24px 0;
      font-size: 24px;
      color: #333;
      text-align: center;
    }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .team-member {
      text-align: center;
    }

    .team-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: #e0e0e0;
      margin: 0 auto 12px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      color: #999;
    }

    .team-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .team-role {
      font-size: 14px;
      color: #666;
    }

    /* Pricing Component */
    .pricing-preview {
      padding: 24px;
    }

    .pricing-preview h3 {
      margin: 0 0 24px 0;
      font-size: 24px;
      color: #333;
      text-align: center;
    }

    .pricing-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .pricing-card {
      border: 2px solid #e0e0e0;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
    }

    .pricing-card.featured {
      border-color: #1473e6;
      position: relative;
    }

    .pricing-card.featured::before {
      content: 'Popular';
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #1473e6;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .pricing-tier {
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
    }

    .pricing-price {
      font-size: 36px;
      font-weight: 700;
      color: #1473e6;
      margin-bottom: 16px;
    }

    .pricing-price span {
      font-size: 14px;
      font-weight: normal;
      color: #666;
    }

    /* Social Share Component */
    .social-preview {
      padding: 24px;
      text-align: center;
    }

    .social-preview h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      color: #333;
    }

    .social-buttons {
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .social-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      color: white;
      text-decoration: none;
    }

    .social-btn.facebook {
      background: #1877f2;
    }
    .social-btn.twitter {
      background: #1da1f2;
    }
    .social-btn.linkedin {
      background: #0077b5;
    }
    .social-btn.instagram {
      background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
    }

    /* Video Component */
    .video-preview {
      padding: 24px;
    }

    .video-preview h3 {
      margin: 0 0 16px 0;
      font-size: 24px;
      color: #333;
    }

    .video-container {
      position: relative;
      background: #000;
      border-radius: 12px;
      overflow: hidden;
      aspect-ratio: 16/9;
    }

    .video-placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .play-button {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      color: #1473e6;
      margin-bottom: 16px;
      cursor: pointer;
    }

    /* Gallery Component */
    .gallery-preview {
      padding: 24px;
    }

    .gallery-preview h3 {
      margin: 0 0 16px 0;
      font-size: 24px;
      color: #333;
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .gallery-item {
      aspect-ratio: 1;
      background: #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }

    .gallery-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Product List Preview */
    .product-list-preview {
      padding: 20px;
    }

    .product-list-preview h2 {
      margin: 0 0 16px 0;
      color: #1a1a1a;
    }

    .product-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }

    .product-card-mini {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .product-card-mini img {
      width: 100%;
      height: 120px;
      object-fit: cover;
    }

    .product-info {
      padding: 12px;
    }

    .product-name {
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    .product-price {
      color: #1473e6;
      font-weight: 700;
    }

    /* Search Preview */
    .search-preview {
      padding: 40px 20px;
      text-align: center;
    }

    .search-preview h3 {
      margin: 0 0 20px 0;
      color: #1a1a1a;
    }

    .search-box {
      display: flex;
      max-width: 500px;
      margin: 0 auto 16px auto;
    }

    .search-input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid #e0e0e0;
      border-right: none;
      border-radius: 24px 0 0 24px;
      font-size: 16px;
    }

    .search-button {
      padding: 12px 20px;
      background: #1473e6;
      color: white;
      border: none;
      border-radius: 0 24px 24px 0;
      cursor: pointer;
      font-size: 16px;
    }

    .search-suggestions {
      display: flex;
      justify-content: center;
      gap: 8px;
    }

    .search-tag {
      padding: 6px 12px;
      background: #f0f0f0;
      border-radius: 16px;
      font-size: 12px;
      color: #666;
    }

    /* Edit Mode Toggle */
    .edit-toggle {
      padding: 6px 12px;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .edit-toggle:hover {
      background: #ffc107;
      color: #333;
    }

    .edit-toggle.active {
      background: #28a745;
      border-color: #28a745;
      color: white;
    }

    /* Editable Fields */
    .editable {
      cursor: pointer;
      position: relative;
      transition: all 0.2s;
      border-radius: 4px;
    }

    .edit-mode .editable:hover {
      outline: 2px dashed rgba(255, 193, 7, 0.8);
      outline-offset: 4px;
    }

    .editable.editing {
      outline: 2px solid #28a745 !important;
      outline-offset: 4px;
    }

    .editable-input {
      background: rgba(255, 255, 255, 0.95);
      border: 2px solid #28a745;
      border-radius: 4px;
      padding: 8px;
      font-family: inherit;
      width: 100%;
      box-sizing: border-box;
      resize: vertical;
    }

    .editable-input:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(40, 167, 69, 0.25);
    }

    .edit-hint {
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      z-index: 100;
      animation: fadeIn 0.3s;
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
      background-color: var(--brand-positive-color, #2d9d78); /* Default to positive */
    }

    .visual-alignment-badge.warning {
      background-color: var(--brand-warning-color, #ff8f00);
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }
    }

    /* Responsive Styles */
    @media (max-width: 1024px) {
      .footer-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .team-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .pricing-cards {
        grid-template-columns: repeat(2, 1fr);
      }

      .product-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .preview-header {
        flex-direction: column;
        gap: 12px;
        padding: 12px 16px;
      }

      .preview-header h2 {
        font-size: 12px;
      }

      .preview-actions {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
      }

      .preview-action-btn {
        flex: 1;
        min-width: 80px;
        text-align: center;
      }

      .preview-container {
        padding: 12px;
      }

      .preview-placeholder {
        padding: 24px;
      }

      .preview-placeholder-icon {
        font-size: 60px;
      }

      .preview-placeholder h3 {
        font-size: 20px;
      }

      .preview-placeholder p {
        font-size: 14px;
      }

      .preview-placeholder-steps {
        flex-direction: column;
        gap: 8px;
        padding: 16px;
      }

      .step-arrow {
        transform: rotate(90deg);
        justify-content: center;
      }

      /* Hero responsive */
      .hero-preview {
        min-height: 300px;
      }

      .hero-preview .hero-image {
        height: 300px;
      }

      .hero-preview .hero-overlay {
        padding: 24px;
      }

      .hero-preview h2 {
        font-size: 26px;
      }

      .hero-preview .subtitle {
        font-size: 15px;
      }

      .hero-preview .description {
        font-size: 14px;
      }

      .hero-preview .cta-button {
        padding: 10px 24px;
        font-size: 14px;
      }

      /* Teaser responsive */
      .teaser-preview {
        grid-template-columns: 1fr;
      }

      .teaser-preview .teaser-content {
        padding: 16px;
      }

      .teaser-preview h3 {
        font-size: 18px;
      }

      /* Product responsive */
      .product-preview .product-image {
        height: 220px;
      }

      .product-preview .product-content {
        padding: 16px;
      }

      .product-preview h3 {
        font-size: 20px;
      }

      .product-preview .price {
        font-size: 24px;
      }

      /* Banner responsive */
      .banner-preview {
        padding: 24px;
      }

      .banner-preview h3 {
        font-size: 22px;
      }

      /* Navigation responsive */
      .nav-bar {
        flex-direction: column;
        gap: 12px;
        padding: 12px 16px;
      }

      .nav-links {
        flex-wrap: wrap;
        justify-content: center;
        gap: 16px;
      }

      /* Footer responsive */
      .footer-preview {
        padding: 24px 16px;
      }

      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }

      /* Form responsive */
      .form-preview {
        padding: 16px;
      }

      /* CTA responsive */
      .cta-preview {
        padding: 40px 24px;
      }

      .cta-preview h3 {
        font-size: 24px;
      }

      .cta-preview .description {
        font-size: 15px;
      }

      /* Team responsive */
      .team-preview {
        padding: 16px;
      }

      .team-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .team-avatar {
        width: 80px;
        height: 80px;
        font-size: 28px;
      }

      /* Pricing responsive */
      .pricing-preview {
        padding: 16px;
      }

      .pricing-cards {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .pricing-card {
        padding: 20px;
      }

      /* Gallery responsive */
      .gallery-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      /* Product List responsive */
      .product-list-preview {
        padding: 16px;
      }

      .product-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }

      /* Carousel responsive */
      .carousel-slide img {
        height: 220px;
      }

      /* Tabs responsive */
      .tab-headers {
        flex-wrap: wrap;
      }

      .tab-header {
        padding: 10px 16px;
        font-size: 13px;
      }

      /* Quote responsive */
      .quote-preview {
        padding: 24px;
      }

      .quote-preview blockquote {
        font-size: 18px;
      }

      /* Search responsive */
      .search-box {
        flex-direction: column;
      }

      .search-input {
        border-radius: 24px;
        border-right: 2px solid #e0e0e0;
      }

      .search-button {
        border-radius: 24px;
        margin-top: 8px;
      }

      .edit-hint {
        bottom: 60px;
        padding: 6px 12px;
        font-size: 11px;
      }
    }

    @media (max-width: 480px) {
      .preview-header {
        padding: 10px 12px;
      }

      .preview-header h2 {
        font-size: 11px;
      }

      .preview-actions {
        gap: 4px;
      }

      .preview-action-btn {
        padding: 5px 8px;
        font-size: 11px;
      }

      .edit-toggle {
        padding: 5px 10px;
        font-size: 11px;
      }

      .preview-container {
        padding: 8px;
      }

      .preview-placeholder {
        padding: 16px;
      }

      .preview-placeholder-icon {
        font-size: 48px;
      }

      .preview-placeholder h3 {
        font-size: 18px;
      }

      .step-item {
        padding: 8px 12px;
      }

      .step-item-number {
        width: 28px;
        height: 28px;
        font-size: 12px;
      }

      /* Hero mobile */
      .hero-preview {
        min-height: 250px;
      }

      .hero-preview .hero-image {
        height: 250px;
      }

      .hero-preview .hero-overlay {
        padding: 16px;
      }

      .hero-preview h2 {
        font-size: 22px;
      }

      .hero-preview .subtitle {
        font-size: 14px;
      }

      .hero-preview .description {
        font-size: 13px;
        margin-bottom: 16px;
      }

      .hero-preview .cta-button {
        padding: 10px 20px;
        font-size: 13px;
      }

      /* Teaser mobile */
      .teaser-preview .teaser-image {
        height: 180px;
      }

      .teaser-preview .teaser-content {
        padding: 12px;
      }

      .teaser-preview h3 {
        font-size: 16px;
      }

      .teaser-preview .description {
        font-size: 13px;
      }

      /* Product mobile */
      .product-preview .product-image {
        height: 180px;
      }

      .product-preview .product-content {
        padding: 12px;
      }

      .product-preview h3 {
        font-size: 18px;
      }

      .product-preview .price {
        font-size: 22px;
      }

      /* Banner mobile */
      .banner-preview {
        padding: 20px;
      }

      .banner-preview h3 {
        font-size: 18px;
      }

      .banner-preview .subtitle {
        font-size: 14px;
      }

      /* Footer mobile */
      .footer-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      /* CTA mobile */
      .cta-preview {
        padding: 32px 16px;
      }

      .cta-preview h3 {
        font-size: 20px;
      }

      .cta-preview .cta-button {
        padding: 12px 24px;
        font-size: 14px;
      }

      /* Team mobile */
      .team-grid {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }

      .team-avatar {
        width: 60px;
        height: 60px;
        font-size: 24px;
      }

      .team-name {
        font-size: 13px;
      }

      .team-role {
        font-size: 12px;
      }

      /* Product List mobile */
      .product-grid {
        grid-template-columns: 1fr;
      }

      .product-card-mini img {
        height: 150px;
      }

      /* Gallery mobile */
      .gallery-grid {
        grid-template-columns: 1fr 1fr;
        gap: 6px;
      }

      /* Social mobile */
      .social-buttons {
        gap: 8px;
      }

      .social-btn {
        width: 40px;
        height: 40px;
        font-size: 18px;
      }

      /* Video mobile */
      .play-button {
        width: 60px;
        height: 60px;
        font-size: 24px;
      }

      /* Carousel mobile */
      .carousel-slide img {
        height: 180px;
      }

      .carousel-caption {
        padding: 12px;
      }

      /* Accordion mobile */
      .accordion-header {
        padding: 12px 14px;
        font-size: 14px;
      }

      .accordion-content {
        padding: 12px 14px;
        font-size: 13px;
      }

      /* Tabs mobile */
      .tab-header {
        padding: 8px 12px;
        font-size: 12px;
      }

      .tab-content {
        font-size: 13px;
      }

      /* Quote mobile */
      .quote-icon {
        font-size: 36px;
      }

      .quote-preview blockquote {
        font-size: 16px;
      }

      .quote-author {
        font-size: 14px;
      }

      .quote-role {
        font-size: 12px;
      }

      /* Breadcrumb mobile */
      .breadcrumb-nav {
        flex-wrap: wrap;
        padding: 10px 12px;
      }

      .breadcrumb-item {
        font-size: 12px;
      }

      .edit-hint {
        bottom: 50px;
        font-size: 10px;
      }
    }
  `;

  render() {
    return html`
      <div class="right-panel">
        <div class="preview-header">
          <h2>Live Component Preview</h2>
          ${
            this.appliedContent
              ? html`
                  <div class="preview-actions">
                    <button class="edit-toggle ${this.editMode ? 'active' : ''}" @click=${() => this.toggleEditMode()}>
                      ${this.editMode ? '&#x2714; Editing' : '&#x270F; Edit'}
                    </button>
                    <button class="preview-action-btn" @click=${() => this.copyToClipboard('html')}>Copy HTML</button>
                    <button class="preview-action-btn" @click=${() => this.copyToClipboard('json')}>Copy JSON</button>
                  </div>
                `
              : ''
          }
        </div>
        <div class="preview-container ${this.editMode ? 'edit-mode' : ''}">
          ${
            this.appliedContent
              ? html`
                  ${this.renderComponentPreview(this.appliedContent)} ${this.renderBrandScore(this.appliedContent)}
                `
              : html`
                  <div class="preview-placeholder">
                    <div class="preview-placeholder-icon">&#x2728;</div>
                    <h3>Ready to Create</h3>
                    <p>
                      Use the guided wizard on the left to create stunning AEM components. Your live preview will appear
                      here.
                    </p>
                    <div class="preview-placeholder-steps">
                      <div class="step-item">
                        <div class="step-item-number">1</div>
                        <div class="step-item-label">Choose Type</div>
                      </div>
                      <div class="step-arrow">&#x2192;</div>
                      <div class="step-item">
                        <div class="step-item-number">2</div>
                        <div class="step-item-label">Customize</div>
                      </div>
                      <div class="step-arrow">&#x2192;</div>
                      <div class="step-item">
                        <div class="step-item-number">3</div>
                        <div class="step-item-label">Generate</div>
                      </div>
                    </div>
                  </div>
                `
          }
        </div>
        ${this.editMode ? html` <div class="edit-hint">Click on any text to edit it directly</div> ` : ''}
      </div>
    `;
  }

  private toggleEditMode() {
    this.editMode = !this.editMode;
    this.editingField = null;
  }

  private renderBrandScore(content: ContentSuggestion) {
    const { score, factors } = BrandScore.calculateScore({
      title: content.title,
      subtitle: content.subtitle,
      description: content.description,
      cta: content.ctaText || content.cta?.text,
    });

    return html`
      <div style="margin-top: 16px;">
        <brand-score .score=${score} .factors=${factors}></brand-score>
      </div>
    `;
  }

  private renderComponentPreview(content: ContentSuggestion) {
    const type = content.componentType?.toLowerCase() || 'hero';
    console.log('renderComponentPreview - content.componentType:', content.componentType, 'normalized type:', type);

    switch (type) {
      case 'hero':
        return html`
          <div class="component-preview hero-preview">
            <img class="hero-image" src="${content.imageUrl}" alt="${content.imageAlt || content.title}" />
            ${
              content.visualScore !== undefined
                ? html`
                    <span class="visual-alignment-badge ${content.visualScore > 0 ? '' : 'warning'}">
                      ${content.visualScore > 0 ? 'Brand Aligned' : 'Review Visual'}
                    </span>
                  `
                : ''
            }
            <div class="hero-overlay">
              ${this.renderEditableField('title', content.title, 'h2')}
              ${content.subtitle ? this.renderEditableField('subtitle', content.subtitle, 'div', 'subtitle') : ''}
              ${this.renderEditableField('description', content.description, 'div', 'description')}
              ${this.renderEditableField('ctaText', content.ctaText || 'Learn More', 'a', 'cta-button')}
            </div>
          </div>
        `;

      case 'product':
        return html`
          <div class="component-preview product-preview">
            <img class="product-image" src="${content.imageUrl}" alt="${content.imageAlt || content.title}" />
            ${
              content.visualScore !== undefined
                ? html`
                    <span class="visual-alignment-badge ${content.visualScore > 0 ? '' : 'warning'}">
                      ${content.visualScore > 0 ? 'Brand Aligned' : 'Review Visual'}
                    </span>
                  `
                : ''
            }
            <div class="product-content">
              ${this.renderEditableField('title', content.title, 'h3')}
              ${content.price ? this.renderEditableField('price', content.price, 'div', 'price') : ''}
              ${this.renderEditableField('description', content.description, 'div', 'description')}
              ${this.renderEditableField('ctaText', content.ctaText || 'Shop Now', 'a', 'cta-button')}
            </div>
          </div>
        `;

      case 'teaser':
        return html`
          <div class="component-preview teaser-preview">
            <img class="teaser-image" src="${content.imageUrl}" alt="${content.imageAlt || content.title}" />
            ${
              content.visualScore !== undefined
                ? html`
                    <span class="visual-alignment-badge ${content.visualScore > 0 ? '' : 'warning'}">
                      ${content.visualScore > 0 ? 'Brand Aligned' : 'Review Visual'}
                    </span>
                  `
                : ''
            }
            <div class="teaser-content">
              ${this.renderEditableField('title', content.title, 'h3')}
              ${content.subtitle ? this.renderEditableField('subtitle', content.subtitle, 'div', 'subtitle') : ''}
              ${this.renderEditableField('description', content.description, 'div', 'description')}
              ${this.renderEditableField('ctaText', (content.ctaText || 'Read More') + ' →', 'a', 'cta-link')}
            </div>
          </div>
        `;

      case 'banner':
        return html`
          <div class="component-preview banner-preview">
            ${this.renderEditableField('title', content.title, 'h3')}
            ${content.subtitle ? this.renderEditableField('subtitle', content.subtitle, 'div', 'subtitle') : ''}
            ${this.renderEditableField('description', content.description, 'div', 'description')}
            ${this.renderEditableField('ctaText', content.ctaText || 'Learn More', 'a', 'cta-button')}
          </div>
        `;

      case 'accordion':
        return html`
          <div class="component-preview accordion-preview">
            ${this.renderEditableField('title', content.title, 'h3')}
            <div class="accordion-item">
              <div class="accordion-header">
                <span>Section 1: ${content.subtitle || 'Overview'}</span>
                <span>▼</span>
              </div>
              <div class="accordion-content">${content.description}</div>
            </div>
            <div class="accordion-item">
              <div class="accordion-header">
                <span>Section 2: Details</span>
                <span>▶</span>
              </div>
            </div>
            <div class="accordion-item">
              <div class="accordion-header">
                <span>Section 3: FAQ</span>
                <span>▶</span>
              </div>
            </div>
          </div>
        `;

      case 'breadcrumb':
        return html`
          <div class="component-preview breadcrumb-preview">
            ${this.renderEditableField('title', content.title || 'Breadcrumb Navigation', 'h3')}
            <nav class="breadcrumb-nav">
              <a href="#" class="breadcrumb-item">Home</a>
              <span class="breadcrumb-separator">›</span>
              <a href="#" class="breadcrumb-item">Products</a>
              <span class="breadcrumb-separator">›</span>
              <a href="#" class="breadcrumb-item">Category</a>
              <span class="breadcrumb-separator">›</span>
              <span class="breadcrumb-item current">${content.subtitle || 'Current Page'}</span>
            </nav>
          </div>
        `;

      case 'quote':
        return html`
          <div class="component-preview quote-preview">
            <div class="quote-icon">"</div>
            <blockquote>${this.renderEditableField('description', content.description, 'span')}</blockquote>
            <div class="quote-author">${this.renderEditableField('title', content.title, 'span')}</div>
            <div class="quote-role">${content.subtitle || 'Customer'}</div>
          </div>
        `;

      case 'tabs':
        return html`
          <div class="component-preview tabs-preview">
            ${this.renderEditableField('title', content.title, 'h3')}
            <div class="tab-headers">
              <div class="tab-header active">Overview</div>
              <div class="tab-header">Features</div>
              <div class="tab-header">Specifications</div>
              <div class="tab-header">Reviews</div>
            </div>
            <div class="tab-content">${content.description}</div>
          </div>
        `;

      case 'carousel':
        return html`
          <div class="component-preview carousel-preview">
            ${this.renderEditableField('title', content.title, 'h3')}
            <div class="carousel-container">
              <div class="carousel-slide">
                <img src="${content.imageUrl}" alt="${content.imageAlt || 'Slide 1'}" />
                <div class="carousel-caption">
                  <strong>${content.subtitle || 'Featured Content'}</strong>
                  <p>${content.description}</p>
                </div>
              </div>
            </div>
            <div class="carousel-dots">
              <div class="carousel-dot active"></div>
              <div class="carousel-dot"></div>
              <div class="carousel-dot"></div>
            </div>
          </div>
        `;

      case 'navigation':
        return html`
          <div class="component-preview navigation-preview">
            <div class="nav-bar">
              <div class="nav-logo">${content.title || 'Acme Corp'}</div>
              <nav class="nav-links">
                <a href="#" class="nav-link">Products</a>
                <a href="#" class="nav-link">Solutions</a>
                <a href="#" class="nav-link">Pricing</a>
                <a href="#" class="nav-link">About</a>
                <a href="#" class="nav-link">Contact</a>
              </nav>
            </div>
          </div>
        `;

      case 'footer':
        return html`
          <div class="component-preview footer-preview">
            <div class="footer-grid">
              <div class="footer-section">
                <h4>Products</h4>
                <a href="#" class="footer-link">Enterprise</a>
                <a href="#" class="footer-link">Small Business</a>
                <a href="#" class="footer-link">Developers</a>
              </div>
              <div class="footer-section">
                <h4>Company</h4>
                <a href="#" class="footer-link">About Us</a>
                <a href="#" class="footer-link">Careers</a>
                <a href="#" class="footer-link">Press</a>
              </div>
              <div class="footer-section">
                <h4>Resources</h4>
                <a href="#" class="footer-link">Documentation</a>
                <a href="#" class="footer-link">Blog</a>
                <a href="#" class="footer-link">Support</a>
              </div>
              <div class="footer-section">
                <h4>Legal</h4>
                <a href="#" class="footer-link">Privacy</a>
                <a href="#" class="footer-link">Terms</a>
                <a href="#" class="footer-link">Cookies</a>
              </div>
            </div>
          </div>
        `;

      case 'form':
        return html`
          <div class="component-preview form-preview">
            ${this.renderEditableField('title', content.title, 'h3')}
            <div class="form-field">
              <label>Name</label>
              <input type="text" placeholder="Enter your name" />
            </div>
            <div class="form-field">
              <label>Email</label>
              <input type="email" placeholder="Enter your email" />
            </div>
            <div class="form-field">
              <label>Message</label>
              <textarea rows="4" placeholder="${content.description || 'Enter your message'}"></textarea>
            </div>
            <button class="form-submit">${content.ctaText || 'Submit'}</button>
          </div>
        `;

      case 'cta':
        return html`
          <div class="component-preview cta-preview">
            ${this.renderEditableField('title', content.title, 'h3')}
            ${this.renderEditableField('description', content.description, 'div', 'description')}
            ${this.renderEditableField('ctaText', content.ctaText || 'Get Started', 'a', 'cta-button')}
          </div>
        `;

      case 'team':
        return html`
          <div class="component-preview team-preview">
            ${this.renderEditableField('title', content.title || 'Our Team', 'h3')}
            <div class="team-grid">
              <div class="team-member">
                <div class="team-avatar">👤</div>
                <div class="team-name">John Smith</div>
                <div class="team-role">CEO</div>
              </div>
              <div class="team-member">
                <div class="team-avatar">👤</div>
                <div class="team-name">Sarah Johnson</div>
                <div class="team-role">CTO</div>
              </div>
              <div class="team-member">
                <div class="team-avatar">👤</div>
                <div class="team-name">Mike Brown</div>
                <div class="team-role">Designer</div>
              </div>
            </div>
          </div>
        `;

      case 'pricing':
        return html`
          <div class="component-preview pricing-preview">
            ${this.renderEditableField('title', content.title || 'Choose Your Plan', 'h3')}
            <div class="pricing-cards">
              <div class="pricing-card">
                <div class="pricing-tier">Starter</div>
                <div class="pricing-price">$9<span>/mo</span></div>
                <div>${content.description || 'Basic features included'}</div>
              </div>
              <div class="pricing-card featured">
                <div class="pricing-tier">Pro</div>
                <div class="pricing-price">$29<span>/mo</span></div>
                <div>Advanced features</div>
              </div>
              <div class="pricing-card">
                <div class="pricing-tier">Enterprise</div>
                <div class="pricing-price">$99<span>/mo</span></div>
                <div>Full access</div>
              </div>
            </div>
          </div>
        `;

      case 'socialshare':
        return html`
          <div class="component-preview social-preview">
            ${this.renderEditableField('title', content.title || 'Share This Page', 'h3')}
            <div class="social-buttons">
              <a href="#" class="social-btn facebook">f</a>
              <a href="#" class="social-btn twitter">𝕏</a>
              <a href="#" class="social-btn linkedin">in</a>
              <a href="#" class="social-btn instagram">📷</a>
            </div>
          </div>
        `;

      case 'video':
        return html`
          <div class="component-preview video-preview">
            ${this.renderEditableField('title', content.title, 'h3')}
            <div class="video-container">
              <div class="video-placeholder">
                <div class="play-button">▶</div>
                <div>${content.description || 'Click to play video'}</div>
              </div>
            </div>
          </div>
        `;

      case 'gallery':
        return html`
          <div class="component-preview gallery-preview">
            ${this.renderEditableField('title', content.title || 'Image Gallery', 'h3')}
            <div class="gallery-grid">
              <div class="gallery-item">
                <img src="${content.imageUrl}" alt="Gallery 1" />
              </div>
              <div class="gallery-item">
                <img src="${content.imageUrl}" alt="Gallery 2" />
              </div>
              <div class="gallery-item">
                <img src="${content.imageUrl}" alt="Gallery 3" />
              </div>
              <div class="gallery-item">
                <img src="${content.imageUrl}" alt="Gallery 4" />
              </div>
              <div class="gallery-item">
                <img src="${content.imageUrl}" alt="Gallery 5" />
              </div>
              <div class="gallery-item">
                <img src="${content.imageUrl}" alt="Gallery 6" />
              </div>
            </div>
          </div>
        `;

      case 'productlist':
        return html`
          <div class="component-preview product-list-preview">
            ${this.renderEditableField('title', content.title, 'h2')}
            <div class="product-grid">
              <div class="product-card-mini">
                <img src="${content.imageUrl}" alt="Product 1" />
                <div class="product-info">
                  <div class="product-name">Product One</div>
                  <div class="product-price">$49.99</div>
                </div>
              </div>
              <div class="product-card-mini">
                <img src="${content.imageUrl}" alt="Product 2" />
                <div class="product-info">
                  <div class="product-name">Product Two</div>
                  <div class="product-price">$59.99</div>
                </div>
              </div>
              <div class="product-card-mini">
                <img src="${content.imageUrl}" alt="Product 3" />
                <div class="product-info">
                  <div class="product-name">Product Three</div>
                  <div class="product-price">$69.99</div>
                </div>
              </div>
            </div>
          </div>
        `;

      case 'search':
        return html`
          <div class="component-preview search-preview">
            ${this.renderEditableField('title', content.title || 'Search', 'h3')}
            <div class="search-box">
              <input
                type="text"
                placeholder="${content.description || 'Search for products, articles...'}"
                class="search-input"
              />
              <button class="search-button">🔍</button>
            </div>
            <div class="search-suggestions">
              <span class="search-tag">Popular</span>
              <span class="search-tag">Recent</span>
              <span class="search-tag">Trending</span>
            </div>
          </div>
        `;

      default:
        // Generic component with title, description, image, and CTA
        return html`
          <div class="component-preview teaser-preview">
            ${content.imageUrl ? html`<img class="teaser-image" src="${content.imageUrl}" alt="${content.imageAlt || content.title}" />` : ''}
            <div class="teaser-content">
              ${this.renderEditableField('title', content.title, 'h3')}
              ${content.subtitle ? this.renderEditableField('subtitle', content.subtitle, 'div', 'subtitle') : ''}
              ${this.renderEditableField('description', content.description, 'div', 'description')}
              ${content.ctaText ? this.renderEditableField('ctaText', content.ctaText, 'a', 'cta-link') : ''}
            </div>
          </div>
        `;
    }
  }

  private renderEditableField(field: string, value: string, tag: string = 'div', className: string = '') {
    const isEditing = this.editingField === field;
    const content = value || '';

    if (this.editMode && isEditing) {
      // Show input when editing
      const isMultiline = field === 'description';
      return isMultiline
        ? html`
            <textarea
              class="editable-input ${className}"
              .value=${content}
              @blur=${(e: Event) => this.finishEditing(field, (e.target as HTMLTextAreaElement).value)}
              @keydown=${(e: KeyboardEvent) => this.handleKeyDown(e, field)}
              rows="3"
            ></textarea>
          `
        : html`
            <input
              type="text"
              class="editable-input ${className}"
              .value=${content}
              @blur=${(e: Event) => this.finishEditing(field, (e.target as HTMLInputElement).value)}
              @keydown=${(e: KeyboardEvent) => this.handleKeyDown(e, field)}
            />
          `;
    }

    // Non-editing mode - just show the element with click handler
    const editableClass = this.editMode ? 'editable' : '';

    switch (tag) {
      case 'h2':
        return html`<h2 class="${editableClass} ${className}" @click=${() => this.startEditing(field)}>${content}</h2>`;
      case 'h3':
        return html`<h3 class="${editableClass} ${className}" @click=${() => this.startEditing(field)}>${content}</h3>`;
      case 'a':
        return html`<a
          class="${editableClass} ${className}"
          @click=${(e: Event) => {
            e.preventDefault();
            this.startEditing(field);
          }}
          >${content}</a
        >`;
      default:
        return html`<div class="${editableClass} ${className}" @click=${() => this.startEditing(field)}>
          ${content}
        </div>`;
    }
  }

  private startEditing(field: string) {
    if (!this.editMode) return;
    this.editingField = field;

    // Focus the input after render
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector('.editable-input') as HTMLInputElement | HTMLTextAreaElement;
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  private finishEditing(field: string, value: string) {
    if (!this.appliedContent) return;

    // Update the content
    const updatedContent = { ...this.appliedContent, [field]: value };

    // Dispatch event to parent
    this.dispatchEvent(
      new CustomEvent('content-updated', {
        detail: { field, value, content: updatedContent },
        bubbles: true,
        composed: true,
      }),
    );

    this.editingField = null;
  }

  private handleKeyDown(e: KeyboardEvent, field: string) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      this.finishEditing(field, target.value);
    } else if (e.key === 'Escape') {
      this.editingField = null;
    }
  }

  private copyToClipboard(format: 'json' | 'html') {
    if (!this.appliedContent) return;
    this.dispatchEvent(
      new CustomEvent('copy-content', {
        detail: { content: this.appliedContent, format },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'assistant-preview': AssistantPreview;
  }
}
