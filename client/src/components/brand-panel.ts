import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import brandConfig from '../data/brand-config.json';

@customElement('brand-panel')
export class BrandPanel extends LitElement {
  @state() private expanded = false;

  static styles = css`
    :host {
      display: block;
    }

    .brand-panel {
      background: linear-gradient(135deg, var(--spectrum-gray-50, white) 0%, var(--spectrum-gray-100, #f8f9fa) 100%);
      border: 1px solid var(--spectrum-gray-300, #e0e0e0);
      border-radius: 12px;
      overflow: hidden;
    }

    .brand-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      cursor: pointer;
      background: linear-gradient(90deg, var(--spectrum-accent-background-color-default, #1473e6) 0%, #0d66d0 100%);
      color: white;
    }

    .brand-header:hover {
      opacity: 0.95;
    }

    .brand-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-icon {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .brand-name {
      font-weight: 700;
      font-size: 15px;
    }

    .brand-status {
      font-size: 11px;
      opacity: 0.9;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      background: #4ade80;
      border-radius: 50%;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .expand-icon {
      transition: transform 0.3s;
    }

    .expand-icon.expanded {
      transform: rotate(180deg);
    }

    .brand-content {
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition:
        max-height 0.3s ease,
        padding 0.3s ease;
    }

    .brand-content.expanded {
      padding: 16px;
      max-height: 500px;
    }

    .brand-section {
      margin-bottom: 16px;
    }

    .brand-section:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--spectrum-gray-600, #6e6e6e);
      margin-bottom: 8px;
    }

    .tone-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .tone-tag {
      padding: 4px 10px;
      background: var(--spectrum-accent-background-color-hover, #e5f0ff);
      color: var(--spectrum-accent-color-default, #1473e6);
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .color-swatches {
      display: flex;
      gap: 8px;
    }

    .color-swatch {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      border: 2px solid var(--spectrum-gray-300, #e0e0e0);
      position: relative;
    }

    .color-swatch::after {
      content: attr(data-name);
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 9px;
      color: var(--spectrum-gray-600, #6e6e6e);
      white-space: nowrap;
      margin-top: 4px;
    }

    .value-pillars {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .pillar {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--spectrum-gray-800, #4b4b4b);
    }

    .pillar-icon {
      color: var(--spectrum-positive-color-default, #2d9d78);
    }

    .avoid-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .avoid-tag {
      padding: 4px 10px;
      background: var(--spectrum-negative-background-color-hover, #ffebe7);
      color: var(--spectrum-negative-color-default, #d7373f);
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .examples-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .example {
      font-size: 12px;
      color: var(--spectrum-gray-700, #666);
      padding-left: 12px;
      border-left: 2px solid var(--spectrum-accent-color-default, #1473e6);
    }
  `;

  render() {
    const brand = brandConfig;

    return html`
      <div class="brand-panel">
        <div class="brand-header" @click=${() => (this.expanded = !this.expanded)}>
          <div class="brand-title">
            <span class="brand-icon">🎨</span>
            <div>
              <div class="brand-name">${brand.brand.name} Brand Guidelines</div>
              <div class="brand-status">
                <span class="status-dot"></span>
                Active & Loaded
              </div>
            </div>
          </div>
          <span class="expand-icon ${this.expanded ? 'expanded' : ''}">▼</span>
        </div>

        <div class="brand-content ${this.expanded ? 'expanded' : ''}">
          <div class="brand-section">
            <div class="section-title">Voice & Tone</div>
            <div class="tone-tags">${brand.voice.tone.map((t) => html`<span class="tone-tag">${t}</span>`)}</div>
          </div>

          <div class="brand-section">
            <div class="section-title">Brand Colors</div>
            <div class="color-swatches">
              <div class="color-swatch" style="background: ${brand.colors.primary}" data-name="Primary"></div>
              <div class="color-swatch" style="background: ${brand.colors.secondary}" data-name="Secondary"></div>
              <div class="color-swatch" style="background: ${brand.colors.accent}" data-name="Accent"></div>
              <div class="color-swatch" style="background: ${brand.colors.neutral}" data-name="Neutral"></div>
            </div>
          </div>

          <div class="brand-section">
            <div class="section-title">Value Pillars</div>
            <div class="value-pillars">
              ${brand.messaging.valuePillars.map(
                (p) => html`
                  <div class="pillar">
                    <span class="pillar-icon">✓</span>
                    ${p}
                  </div>
                `,
              )}
            </div>
          </div>

          <div class="brand-section">
            <div class="section-title">Visual Style</div>
            <div class="tone-tags">
              ${brand.visuals.styleKeywords.map((k) => html`<span class="tone-tag">${k}</span>`)}
            </div>
            <div class="color-swatches" style="margin-top: 12px;">
              ${Object.entries(brand.visuals.brandColors).map(
                ([name, color]) => html`
                  <div class="color-swatch" style="background: ${color}" data-name=${name}></div>
                `,
              )}
            </div>
          </div>

          <div class="brand-section">
            <div class="section-title">Avoid</div>
            <div class="avoid-list">${brand.voice.avoid.map((a) => html`<span class="avoid-tag">✕ ${a}</span>`)}</div>
          </div>

          <div class="brand-section">
            <div class="section-title">Example Headlines</div>
            <div class="examples-list">
              ${brand.examples.goodHeadlines.map((h) => html`<div class="example">"${h}"</div>`)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Public method to get brand context for prompts
  public getBrandContext(): string {
    const brand = brandConfig;
    return `
BRAND GUIDELINES FOR ${brand.brand.name.toUpperCase()}:

Brand Voice: ${brand.voice.tone.join(', ')}
Personality: ${brand.voice.personality}

MUST AVOID: ${brand.voice.avoid.join(', ')}

Target Audience: ${brand.messaging.targetAudience}

Value Pillars (incorporate these themes):
${brand.messaging.valuePillars.map((p) => `- ${p}`).join('\n')}

Headline Style: ${brand.typography.headingStyle}
Body Copy Style: ${brand.typography.bodyStyle}
CTA Style: ${brand.messaging.ctaStyle}

Example Good Headlines:
${brand.examples.goodHeadlines.map((h) => `- "${h}"`).join('\n')}

Example Good CTAs:
${brand.examples.goodCTAs.map((c) => `- "${c}"`).join('\n')}
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'brand-panel': BrandPanel;
  }
}
