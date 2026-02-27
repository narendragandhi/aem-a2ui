import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  highlight?: string; // CSS selector to highlight
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to AEM Content Assistant',
    description: 'Generate brand-aligned content for Adobe Experience Manager with AI assistance. Let\'s take a quick tour!',
    icon: '👋',
  },
  {
    id: 'describe',
    title: 'Describe What You Need',
    description: 'Start by describing the content you want to create. For example: "Hero banner for summer sale" or "Product card for new laptop".',
    icon: '✍️',
    highlight: '.input-section',
  },
  {
    id: 'suggestions',
    title: 'Review AI Suggestions',
    description: 'The AI generates multiple variations for you to choose from. Each suggestion is scored for brand alignment.',
    icon: '🎯',
    highlight: '.suggestions-section',
  },
  {
    id: 'preview',
    title: 'Live Preview',
    description: 'See your content rendered in real-time. Click any text to edit it directly in the preview.',
    icon: '👁️',
    highlight: '.preview-section',
  },
  {
    id: 'export',
    title: 'Export to AEM',
    description: 'When you\'re happy with the content, export it as JSON or HTML ready for AEM, or save directly to your AEM instance.',
    icon: '🚀',
    highlight: '.export-actions',
  },
];

const STORAGE_KEY = 'aem-a2ui-onboarding-completed';

@customElement('app-onboarding')
export class AppOnboarding extends LitElement {
  @property({ type: Boolean }) open = false;
  @state() private currentStep = 0;
  @state() private completed = false;

  static styles = css`
    :host {
      display: block;
    }

    /* Overlay */
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Modal */
    .modal {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      max-width: 500px;
      width: 90%;
      overflow: hidden;
      animation: slideUp 0.4s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Header */
    .modal-header {
      background: linear-gradient(135deg, #1473e6 0%, #0d66d0 100%);
      padding: 32px;
      text-align: center;
      color: white;
    }

    .step-icon {
      font-size: 48px;
      margin-bottom: 16px;
      display: block;
    }

    .step-title {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 8px 0;
    }

    .step-counter {
      font-size: 12px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    /* Body */
    .modal-body {
      padding: 32px;
    }

    .step-description {
      font-size: 16px;
      line-height: 1.6;
      color: #444;
      text-align: center;
      margin: 0;
    }

    /* Progress */
    .progress-bar {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 24px;
    }

    .progress-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #e0e0e0;
      transition: all 0.3s ease;
    }

    .progress-dot.active {
      background: #1473e6;
      transform: scale(1.2);
    }

    .progress-dot.completed {
      background: #4caf50;
    }

    /* Footer */
    .modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 32px;
      border-top: 1px solid #eee;
      background: #fafafa;
    }

    .btn {
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    }

    .btn-skip {
      background: transparent;
      color: #666;
    }

    .btn-skip:hover {
      color: #333;
      text-decoration: underline;
    }

    .btn-nav {
      display: flex;
      gap: 12px;
    }

    .btn-back {
      background: #f0f0f0;
      color: #333;
    }

    .btn-back:hover {
      background: #e0e0e0;
    }

    .btn-next {
      background: #1473e6;
      color: white;
    }

    .btn-next:hover {
      background: #0d66d0;
    }

    .btn-finish {
      background: #4caf50;
      color: white;
    }

    .btn-finish:hover {
      background: #43a047;
    }

    /* Welcome screen special styling */
    .welcome-features {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-top: 24px;
      text-align: left;
    }

    .feature {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .feature-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .feature-text {
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }

    .feature-text strong {
      color: #333;
      display: block;
      margin-bottom: 2px;
    }

    /* Quick start option */
    .quick-start {
      margin-top: 24px;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      text-align: center;
    }

    .quick-start-text {
      font-size: 13px;
      color: #666;
      margin: 0 0 12px 0;
    }

    .btn-quick-start {
      background: white;
      border: 2px solid #1473e6;
      color: #1473e6;
    }

    .btn-quick-start:hover {
      background: #1473e6;
      color: white;
    }
  `;

  connectedCallback() {
    super.connectedCallback();
    this.checkOnboardingStatus();
  }

  private checkOnboardingStatus() {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      this.open = true;
    }
  }

  render() {
    if (!this.open) return html``;

    const step = ONBOARDING_STEPS[this.currentStep];
    const isFirstStep = this.currentStep === 0;
    const isLastStep = this.currentStep === ONBOARDING_STEPS.length - 1;

    return html`
      <div class="overlay" @click=${this.handleOverlayClick}>
        <div class="modal" @click=${(e: Event) => e.stopPropagation()}>
          <div class="modal-header">
            <span class="step-icon">${step.icon}</span>
            <h2 class="step-title">${step.title}</h2>
            ${!isFirstStep
              ? html`<span class="step-counter">Step ${this.currentStep} of ${ONBOARDING_STEPS.length - 1}</span>`
              : ''}
          </div>

          <div class="modal-body">
            <p class="step-description">${step.description}</p>

            ${isFirstStep ? this.renderWelcomeFeatures() : ''}

            <div class="progress-bar">
              ${ONBOARDING_STEPS.map(
                (_, index) => html`
                  <div
                    class="progress-dot ${index === this.currentStep ? 'active' : ''} ${index < this.currentStep ? 'completed' : ''}"
                  ></div>
                `
              )}
            </div>

            ${isFirstStep
              ? html`
                  <div class="quick-start">
                    <p class="quick-start-text">Already know how to use content assistants?</p>
                    <button class="btn btn-quick-start" @click=${this.skipTour}>
                      Skip Tour & Start Creating
                    </button>
                  </div>
                `
              : ''}
          </div>

          <div class="modal-footer">
            <button class="btn btn-skip" @click=${this.skipTour}>Skip</button>
            <div class="btn-nav">
              ${!isFirstStep
                ? html`<button class="btn btn-back" @click=${this.prevStep}>Back</button>`
                : ''}
              ${isLastStep
                ? html`<button class="btn btn-finish" @click=${this.finishTour}>Get Started</button>`
                : html`<button class="btn btn-next" @click=${this.nextStep}>Next</button>`}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderWelcomeFeatures() {
    const features = [
      { icon: '🤖', title: 'AI-Powered', text: 'Generate content with LLM assistance' },
      { icon: '🎨', title: 'Brand-Aware', text: 'Content follows your brand guidelines' },
      { icon: '📊', title: 'SEO Ready', text: 'Built-in SEO analysis and suggestions' },
      { icon: '🔗', title: 'AEM Integration', text: 'Export directly to your AEM instance' },
    ];

    return html`
      <div class="welcome-features">
        ${features.map(
          (f) => html`
            <div class="feature">
              <span class="feature-icon">${f.icon}</span>
              <span class="feature-text">
                <strong>${f.title}</strong>
                ${f.text}
              </span>
            </div>
          `
        )}
      </div>
    `;
  }

  private handleOverlayClick(e: Event) {
    if ((e.target as HTMLElement).classList.contains('overlay')) {
      // Don't close on overlay click for onboarding
    }
  }

  private nextStep() {
    if (this.currentStep < ONBOARDING_STEPS.length - 1) {
      this.currentStep++;
      this.highlightElement();
    }
  }

  private prevStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.highlightElement();
    }
  }

  private highlightElement() {
    const step = ONBOARDING_STEPS[this.currentStep];
    if (step.highlight) {
      // Remove previous highlights
      document.querySelectorAll('.onboarding-highlight').forEach((el) => {
        el.classList.remove('onboarding-highlight');
      });

      // Add new highlight
      const element = document.querySelector(step.highlight);
      if (element) {
        element.classList.add('onboarding-highlight');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }

  private skipTour() {
    this.completeOnboarding();
  }

  private finishTour() {
    this.completeOnboarding();
  }

  private completeOnboarding() {
    localStorage.setItem(STORAGE_KEY, 'true');
    this.open = false;

    // Remove any highlights
    document.querySelectorAll('.onboarding-highlight').forEach((el) => {
      el.classList.remove('onboarding-highlight');
    });

    this.dispatchEvent(
      new CustomEvent('onboarding-complete', {
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public method to restart onboarding
  public restart() {
    localStorage.removeItem(STORAGE_KEY);
    this.currentStep = 0;
    this.open = true;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-onboarding': AppOnboarding;
  }
}
