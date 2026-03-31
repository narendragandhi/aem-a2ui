import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { Task } from '@lit/task';
import brandConfig from "./data/brand-config.json";
import './spectrum-imports.js';

// Core components
import './components/assistant-header.js';
import './components/assistant-input.js';
import './components/assistant-suggestions.js';
import './components/assistant-preview.js';
import './components/error-message.js';
import './components/content-wizard.js';
import './components/brand-panel.js';
import './components/page-builder.js';
import './components/aem-preview.js';
import './components/seo-panel.js';
import './components/asset-browser.js';

// Review & workflow
import './components/review-panel.js';
import './components/review-comments.js';
import './components/workflow-panel.js';
import './components/version-history.js';
import './components/demo-hub.js';
import './components/telemetry-panel.js';

// Collaboration
import './components/live-presence.js';
import './components/live-cursors.js';
import './components/live-chat.js';
import './components/emoji-reactions.js';
import './components/content-locks.js';
import './components/live-notifications.js';
import './components/demo-mode.js';

// AEM integration
import './components/aem-connection-status.js';
import './components/dam-browser.js';
import './components/aem-status.js';
import './components/component-recommender.js';
import './components/streaming-content.js';
import './components/aem-export-panel.js';
import './components/bulk-generator.js';
import './components/content-fragment-panel.js';
import './components/advanced-export-panel.js';
import './components/seo-toolkit.js';
import './components/seo-dashboard.js';

// New UX components
import './components/loading-skeleton.js';
import './components/onboarding.js';
import './components/mode-toggle.js';
import './components/shortcuts-help.js';

// Types
import { ContentSuggestion, ImageAsset, Review, DamAsset, PageRecommendation, LiveUser, ChatMessage, CursorPosition } from './lib/types.js';
import { StreamingContent } from './components/streaming-content.js';

// Services
import { HistoryService } from './services/history-service.js';
import { collaborationService, LiveUser as CollaborationLiveUser, ChatMessage as CollabChatMessage } from './services/collaboration-service.js';
import { logger, uiLogger, contentLogger } from './services/logger.js';
import { api } from './services/api.js';
import { appState, ViewMode } from './services/app-state.js';
import { errorHandler, AppError, withRetry } from './services/error-handler.js';
import { keyboardShortcuts } from './services/keyboard-shortcuts.js';

// Component refs for type checking
import { ContentWizard } from './components/content-wizard.js';
import { BrandPanel } from './components/brand-panel.js';
import { PageBuilder } from './components/page-builder.js';
import { AemPreview } from './components/aem-preview.js';

interface PageSection {
  id: string;
  type: string;
  content: ContentSuggestion | null;
  status: 'empty' | 'generating' | 'ready';
}

const AGENTS = [
  { name: 'Java Agent + Ollama', url: 'http://localhost:10003', port: 10003, hasAI: true },
  { name: 'Python Agent', url: 'http://localhost:10002', port: 10002, hasAI: false },
];

// Local image type for predefined images (simpler than the full ImageAsset interface)
interface LocalImageAsset {
  url: string;
  tags: string[];
}

const PREDEFINED_IMAGES: LocalImageAsset[] = [
  { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200', tags: ['office', 'tech', 'clean', 'professional', 'minimalist'] }, // Hero office
  { url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200', tags: ['abstract', 'gradient', 'dynamic', 'modern', 'colorful'] }, // Banner abstract
  { url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200', tags: ['meeting', 'collaboration', 'people', 'diverse', 'professional'] }, // Team meeting
  { url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200', tags: ['coding', 'development', 'software', 'screen', 'focused'] }, // Coding
  { url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200', tags: ['laptop', 'desk', 'workspace', 'home office', 'minimalist'] }, // Laptop desk
  { url: 'https://images.unsplash.com/photo-1522204523234-87295a3ad7f0?w=1200', tags: ['team', 'discussion', 'startup', 'innovation', 'casual'] }, // Startup team
  { url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', tags: ['product', 'ecommerce', 'watch', 'luxury', 'clean'] }, // Product watch
  { url: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800', tags: ['video', 'media', 'creative', 'studio', 'production'] }, // Video production
  { url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800', tags: ['analytics', 'data', 'charts', 'business', 'strategy'] }, // Data analytics
  { url: 'https://images.unsplash.com/photo-1488590528505-98d2f092d077?w=1200', tags: ['server', 'datacenter', 'cloud', 'security', 'it infrastructure'] }, // Server room
];

@customElement('aem-assistant')
export class AemAssistant extends LitElement {
  @property({ type: String }) agentUrl = 'http://localhost:10003';

  @state() private selectedAgent = AGENTS[0];
  @state() private suggestions: ContentSuggestion[] = [];
  @state() private selectedSuggestion: ContentSuggestion | null = null;
  @state() private appliedContent: ContentSuggestion | null = null;
  @state() public prompt = '';
  @state() private showCopiedToast = false;
  @state() private refinementMode = false;
  @state() private history: ContentSuggestion[] = [];
  @state() private theme: 'light' | 'dark' = 'light';
  // Simplified to 2 modes: 'create' (wizard/quick combined) and 'build' (pagebuilder)
  @state() private viewMode: ViewMode = 'create';
  @state() private pageSections: PageSection[] = [];
  @state() private currentSectionIndex = 0;
  @state() private selectedComponentType = 'hero';
  @state() private wizardSelectedAsset: ImageAsset | null = null;
  @state() private currentReview: Review | null = null;
  @state() private showCommentsPanel = false;
  @state() private showDamBrowser = false;
  @state() private selectedDamAsset: DamAsset | null = null;
  @state() private loading = false;
  @state() private appError: AppError | null = null;

  // New UX state
  @state() private showOnboarding = false;
  @state() private showShortcutsHelp = false;
  @state() private showStreamingModal = false;
  @state() private streamingSectionId: string | null = null;
  @state() private streamingComponentType = '';
  @state() private streamingPrompt = '';

  @state() private connectedUsers: LiveUser[] = [];
  @state() private cursors: CursorPosition[] = [];
  @state() private chatMessages: ChatMessage[] = [];
  @state() private wsConnected = false;
  @state() private aemConnected = false;
  @state() private aemAuthorUrl = '';
  @state() private contentId: string | null = null;

  @state() private notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'review';
    title: string;
    message: string;
    fromUser?: string;
    timestamp: string;
  }> = [];

  @state() private fieldLocks: Array<{ field: string; sessionId: string; username: string }> = [];

  @state() private fieldReactions: Array<{ emoji: string; count: number; sessionIds: string[] }> = [];

  @state() private demoModeEnabled = false;

  private _generationTask = new Task(this, {
    task: async ([prompt], { signal }) => {
      if (!prompt.trim()) {
        return [];
      }

      const response = await fetch(`${this.agentUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          message: {
            role: 'user',
            parts: [{ text: prompt }],
          },
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const suggestions = this.parseAgentResponse(data);

      if (suggestions.length === 0) {
        throw new Error('No suggestions generated. Try a different prompt.');
      } else {
        this.suggestions = suggestions;
        this.selectedSuggestion = suggestions[0];
        this.appliedContent = suggestions[0];
        HistoryService.addSuggestion(suggestions[0]);
        this.history = HistoryService.getHistory();
        return suggestions;
      }
    },
    args: () => [this.prompt]
  });


  static styles = css`
    :host {
      display: block;
      font-family: adobe-clean, 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      height: 100vh;
      background-color: var(--spectrum-gray-100, #f5f5f5);
      color: var(--spectrum-gray-900, #1a1a1a);
    }

    :root {
      --primary-color: var(--spectrum-accent-color-default, #1473e6);
      --primary-hover-color: var(--spectrum-accent-color-hover, #0d66d0);
      --text-color: var(--spectrum-gray-900, #1a1a1a);
      --text-color-light: var(--spectrum-gray-700, #666);
      --background-color: var(--spectrum-gray-100, #f5f5f5);
      --card-background: var(--spectrum-gray-50, white);
      --border-color: var(--spectrum-gray-300, #e0e0e0);
      --header-bg: linear-gradient(135deg, var(--spectrum-accent-color-default, #1473e6) 0%, var(--spectrum-blue-900, #0d66d0) 100%);
      --header-text: white;
      --input-bg: var(--spectrum-gray-50, white);
      --input-border: var(--spectrum-gray-300, #e0e0e0);
      --input-focus-shadow: rgba(20, 115, 230, 0.1);
      --button-primary-bg: var(--spectrum-accent-color-default, #1473e6);
      --button-primary-hover-bg: var(--spectrum-accent-color-hover, #0d66d0);
      --button-secondary-bg: var(--spectrum-gray-200, #f0f0f0);
      --button-secondary-hover-bg: var(--spectrum-gray-300, #e0e0e0);
      --button-secondary-text: var(--spectrum-gray-900, #1a1a1a);
      --error-bg: var(--spectrum-negative-background-color-default, #ffebee);
      --error-text: var(--spectrum-negative-color-default, #c62828);
      --toast-bg: var(--spectrum-gray-800, #333);
      --toast-text: white;
      --empty-icon-color: var(--spectrum-gray-500, #999);
      --refinement-bg: var(--spectrum-yellow-100, #fff8e1);
      --refinement-border: var(--spectrum-yellow-400, #ffe082);
      --refinement-button-bg: var(--spectrum-orange-600, #ff8f00);
    }

    :host([data-theme='dark']) {
      --primary-color: var(--spectrum-accent-color-default, #008cff);
      --primary-hover-color: var(--spectrum-accent-color-hover, #0077e6);
      --text-color: var(--spectrum-gray-100, #e0e0e0);
      --text-color-light: var(--spectrum-gray-400, #b0b0b0);
      --background-color: var(--spectrum-gray-900, #2c2c2c);
      --card-background: var(--spectrum-gray-800, #3c3c3c);
      --border-color: var(--spectrum-gray-600, #444);
      --header-bg: linear-gradient(135deg, var(--spectrum-gray-800, #333) 0%, var(--spectrum-gray-900, #111) 100%);
      --header-text: white;
      --input-bg: var(--spectrum-gray-700, #444);
      --input-border: var(--spectrum-gray-600, #555);
      --input-focus-shadow: rgba(0, 140, 255, 0.2);
      --button-primary-bg: var(--spectrum-accent-color-default, #008cff);
      --button-primary-hover-bg: var(--spectrum-accent-color-hover, #0077e6);
      --button-secondary-bg: var(--spectrum-gray-600, #555);
      --button-secondary-hover-bg: var(--spectrum-gray-500, #666);
      --button-secondary-text: var(--spectrum-gray-100, #e0e0e0);
      --error-bg: #5c1414;
      --error-text: #ff8080;
      --toast-bg: var(--spectrum-gray-600, #555);
      --toast-text: white;
      --empty-icon-color: var(--spectrum-gray-600, #777);
      --refinement-bg: var(--spectrum-gray-700, #4a4a4a);
      --refinement-border: var(--spectrum-gray-600, #6a6a6a);
      --refinement-button-bg: var(--spectrum-orange-700, #d48200);
    }

    :host([data-theme='dark']) .agent-selector select option {
      color: var(--text-color);
    }

    /* Global Loading Indicator */
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }

    /* Streaming Modal */
    .streaming-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10001;
    }

    .streaming-modal {
      background: var(--card-background, white);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      max-width: 600px;
      width: 90%;
      max-height: 80vh;
      overflow: hidden;
      animation: modalSlideIn 0.3s ease;
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .streaming-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background: var(--spectrum-gray-100, #f5f5f5);
      border-bottom: 1px solid var(--spectrum-gray-300);
    }

    .streaming-modal-header h3 {
      margin: 0;
      font-size: 16px;
      color: var(--spectrum-gray-900);
    }

    .streaming-modal-close {
      background: transparent;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: var(--spectrum-gray-600);
      padding: 4px 8px;
      border-radius: 4px;
    }

    .streaming-modal-close:hover {
      background: var(--spectrum-gray-200);
    }

    .streaming-modal-body {
      padding: 0;
      max-height: calc(80vh - 60px);
      overflow-y: auto;
    }

    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-left-color: var(--primary-color);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Main Layout */
    .main-layout {
      display: grid;
      grid-template-columns: min(50%, 600px) 1fr;
      height: calc(100vh - 60px);
    }

    .right-panel-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow-y: auto;
    }

    .collaboration-panels {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: var(--spectrum-gray-50);
      border-top: 1px solid var(--spectrum-gray-300);
    }

    /* Left Panel - Input & Suggestions */
    /* Toast */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--toast-bg);
      color: var(--toast-text);
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
      z-index: 1000;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Empty state */
    .empty-suggestions {
      text-align: center;
      padding: 40px;
      color: var(--empty-icon-color);
    }

    .empty-suggestions-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    /* Refinement section */
    .refinement-section {
      padding: 16px 20px;
      background: var(--refinement-bg);
      border-top: 1px solid var(--refinement-border);
    }

    .refinement-input {
      display: flex;
      gap: 8px;
    }

    .refinement-input input {
      flex: 1;
      padding: 10px 14px;
      border: 1px solid var(--refinement-border);
      border-radius: 6px;
      font-size: 13px;
      background: var(--input-bg);
      color: var(--text-color);
    }

    .refinement-input button {
      padding: 10px 16px;
      background: var(--refinement-button-bg);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
    }

    /* History Section */
    .history-section {
      padding: 20px;
      border-top: 1px solid var(--border-color);
      background: var(--background-color);
      max-height: 200px; /* Adjust as needed */
      overflow-y: auto;
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .history-header h2 {
      margin: 0;
      font-size: 14px;
      color: var(--text-color-light);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .clear-history-btn {
      padding: 6px 12px;
      background: var(--button-secondary-bg);
      color: var(--button-secondary-text);
      border: none;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .clear-history-btn:hover {
      background: var(--button-secondary-hover-bg);
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .history-item {
      background: var(--card-background);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .history-item:hover {
      border-color: var(--primary-color);
      box-shadow: 0 2px 8px rgba(20, 115, 230, 0.1);
    }

    .history-item h3 {
      margin: 0 0 4px 0;
      font-size: 14px;
      color: var(--text-color);
    }

    .history-item p {
      margin: 0;
      font-size: 12px;
      color: var(--text-color-light);
      line-height: 1.4;
    }

    .empty-history {
      font-size: 13px;
      color: var(--text-color-light);
      text-align: center;
      padding: 10px 0;
    }

    /* View Mode Toggle */
    .view-mode-toggle {
      display: flex;
      justify-content: center;
      padding: 16px;
      gap: 8px;
      background: var(--card-background);
      border-bottom: 1px solid var(--border-color);
    }

    .view-mode-toggle sp-action-group {
      --spectrum-actiongroup-horizontal-spacing-regular: 8px;
    }

    /* Left Panel */
    .left-panel {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      background: var(--background-color);
    }

    .left-panel-content {
      flex: 1;
      overflow-y: auto;
    }

    /* Wizard Container */
    .wizard-container {
      flex: 1;
      padding: 24px;
      box-sizing: border-box;
    }

    /* Responsive Design */
    @media (max-width: 800px) {
      .main-layout {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
      }
    }

    @media (max-width: 768px) {
      .main-layout {
        grid-template-columns: 1fr;
        grid-template-rows: auto;
        height: auto;
        min-height: calc(100vh - 60px);
      }

      .left-panel {
        min-height: 50vh;
      }

      .view-mode-toggle {
        padding: 12px;
      }

      .view-mode-toggle sp-action-button {
        font-size: 12px;
        padding: 6px 10px;
      }

      .history-section {
        max-height: 150px;
        padding: 12px;
      }

      .refinement-section {
        padding: 12px;
      }

      .refinement-input {
        flex-direction: column;
      }

      .refinement-input button {
        width: 100%;
      }
    }
		
		@media (max-width: 480px) {
      :host {
        font-size: 14px;
      }

      .view-mode-toggle sp-action-button {
        font-size: 11px;
        padding: 4px 8px;
      }

      .toast {
        left: 16px;
        right: 16px;
        bottom: 16px;
      }
    }
  `;

  render() {
    const isAI = this.selectedAgent.hasAI;

    return html`
      <div class="header-wrapper" style="display: flex; align-items: center; gap: 12px;">
        <assistant-header
          style="flex: 1;"
          .agents=${AGENTS}
          .agentUrl=${this.agentUrl}
          .isAI=${this.selectedAgent.hasAI}
          @agent-changed=${this.handleAgentChange}
          @toggle-theme=${this.toggleTheme}
        ></assistant-header>

        <!-- Live Collaboration -->
        ${this.wsConnected ? html`
          <live-presence
            .users=${this.connectedUsers}
            .currentUserId=${collaborationService.getSessionId()}
            style="margin-right: 8px;"
          ></live-presence>
        ` : ''}

        <aem-connection-status
          .connected=${this.aemConnected}
          .authorUrl=${this.aemAuthorUrl}
          style="margin-right: 16px;"
        ></aem-connection-status>

        <live-chat
          .messages=${this.chatMessages}
          .currentUserId=${collaborationService.getSessionId()}
          .currentUserName=${'Demo User'}
          style="margin-right: 16px;"
          @send-message=${this.handleChatMessage}
        ></live-chat>

        <!-- Notifications -->
        <live-notifications
          .notifications=${this.notifications}
        ></live-notifications>

        <!-- Demo Mode Toggle -->
        <demo-mode
          .enabled=${this.demoModeEnabled}
        ></demo-mode>
      </div>

      <!-- DAM Browser Modal -->
      <dam-browser
        .open=${this.showDamBrowser}
        @close=${() => this.showDamBrowser = false}
        @asset-selected=${this.handleDamAssetSelected}
      ></dam-browser>

      <div class="main-layout">
        <!-- Left Panel: Input & Suggestions -->
        <div class="left-panel">
          <!-- Brand Guidelines Panel -->
          <brand-panel></brand-panel>

          <!-- SEO Panel -->
          ${this.appliedContent?.seo ? html`
            <seo-panel
              .seoSuggestions=${this.appliedContent.seo}
              .seoScore=${this.appliedContent.seoScore}
            ></seo-panel>
          ` : ''}

          <!-- View Mode Toggle - Simplified to 2 modes -->
          <mode-toggle
            .mode=${this.viewMode}
            @mode-changed=${(e: CustomEvent) => this.viewMode = e.detail.mode}
          ></mode-toggle>

          
          ${this.viewMode === 'build' ? html`
            <!-- Build Mode - Page Builder with AI Recommendations -->
            <div class="wizard-container">
              <component-recommender
                .agentUrl=${this.agentUrl}
                @recommendation-accepted=${this.handleRecommendationAccepted}
              ></component-recommender>
              <page-builder
                @sections-changed=${this.handleSectionsChanged}
                @generate-section=${this.handleGenerateSection}
                @page-ready=${this.handlePageReady}
              ></page-builder>

              <!-- Bulk Component Generator -->
              <bulk-generator
                .agentUrl=${this.agentUrl}
                @bulk-complete=${this.handleBulkComplete}
              ></bulk-generator>
            </div>
          ` : html`
            <!-- Create Mode - Unified wizard + quick content creation -->
            <div class="left-panel-content">
              <!-- Content Wizard for guided creation -->
              <content-wizard
                @generate=${this.handleWizardGenerate}
              ></content-wizard>

              <!-- Quick Input -->
              <assistant-input
                .prompt=${this.prompt}
                .loading=${this.loading}
                .componentType=${this.selectedComponentType}
                @prompt-changed=${this.handlePromptChange}
                @generate-content=${this.generateContent}
              ></assistant-input>

              <!-- Error with retry support -->
              ${this.appError ? html`
                <error-message
                  .error=${this.appError}
                  .showRetry=${this.appError.retryable}
                  @retry=${() => this.generateContent()}
                ></error-message>
              ` : ''}

              <!-- Loading skeleton while generating -->
              ${this.loading ? html`
                <content-skeleton type="suggestions"></content-skeleton>
              ` : html`
                <assistant-suggestions
                  .suggestions=${this.suggestions}
                  .selectedSuggestion=${this.selectedSuggestion}
                  @suggestion-selected=${this.handleSuggestionSelected}
                  @suggestion-applied=${this.handleSuggestionApplied}
                  @copy-suggestion=${this.handleCopySuggestion}
                ></assistant-suggestions>
              `}

              <!-- History Section -->
              <div class="history-section">
                <div class="history-header">
                  <h2>History</h2>
                  <button class="clear-history-btn" @click=${this.clearHistory}>Clear History</button>
                </div>
                <div class="history-list">
                  ${this.history.length === 0 ? html`
                    <p class="empty-history">No history yet.</p>
                  ` : html`
                    ${this.history.map(item => html`
                      <div class="history-item" @click=${() => this.handleHistoryItemClick(item)}>
                        <h3>${item.title}</h3>
                        <p>${item.description}</p>
                      </div>
                    `)}
                  `}
                </div>
              </div>

              ${this.appliedContent ? html`
                <div class="refinement-section">
                  <div class="refinement-input">
                    <input type="text" placeholder="Refine: Make it more playful, shorter, add urgency..." id="refinement-input" />
                    <button @click=${this.refineContent}>Refine</button>
                  </div>
                </div>
              ` : ''}
            </div>
          `}
        </div>

        ${this.viewMode === 'build' ? html`
          <aem-preview
            .sections=${this.pageSections}
          ></aem-preview>
        ` : html`
          <div class="right-panel-content">
            <live-cursors
              .cursors=${this.cursors}
              .currentUserId=${collaborationService.getSessionId()}
            ></live-cursors>

            <assistant-preview
              .appliedContent=${this.appliedContent}
              @copy-content=${this.handleCopyContent}
              @content-updated=${this.handleContentUpdated}
            ></assistant-preview>

            <!-- AEM Export Panel -->
            ${this.appliedContent ? html`
              <aem-export-panel
                .content=${this.appliedContent}
                .aemUrl=${this.agentUrl}
                .aemConnected=${this.aemConnected}
                @deployed=${(e: CustomEvent) => {
                  logger.info('Component deployed to AEM', 'Export', e.detail);
                }}
              ></aem-export-panel>

              <!-- Content Fragment Export Panel -->
              <content-fragment-panel
                .content=${this.appliedContent}
                .agentUrl=${this.agentUrl}
                .aemUrl=${this.aemAuthorUrl || 'http://localhost:4502'}
                .aemConnected=${this.aemConnected}
              ></content-fragment-panel>

              <!-- Advanced Export Panel -->
              <advanced-export-panel
                .content=${this.appliedContent}
                .contents=${this.suggestions}
                .aemUrl=${this.aemAuthorUrl || 'http://localhost:4502'}
                .aemConnected=${this.aemConnected}
              ></advanced-export-panel>

              <!-- SEO Toolkit (Basic) -->
              <seo-toolkit
                .content=${this.appliedContent}
                .baseUrl=${this.aemAuthorUrl || 'https://example.com'}
              ></seo-toolkit>

              <!-- SEO Dashboard (Advanced: SERP, Backlinks, PageSpeed, Rich Results) -->
              <seo-dashboard
                .content=${this.appliedContent}
                .targetUrl=${this.aemAuthorUrl || 'https://example.com'}
              ></seo-dashboard>
            ` : ''}

            <!-- Review & Workflow Panels -->
            ${this.appliedContent ? html`
              <div class="collaboration-panels">
                <review-panel
                  .content=${this.appliedContent}
                  .contentId=${this.contentId || this.appliedContent?.id || 'content-' + Date.now()}
                  @review-started=${this.handleReviewStarted}
                  @review-approved=${this.handleReviewApproved}
                  @review-rejected=${this.handleReviewRejected}
                  @open-comments=${this.handleOpenComments}
                ></review-panel>

                <workflow-panel
                  .contentId=${this.contentId || this.appliedContent?.id || 'content-' + Date.now()}
                  .review=${this.currentReview}
                  @workflow-started=${this.handleWorkflowStarted}
                  @workflow-advanced=${this.handleWorkflowAdvanced}
                ></workflow-panel>

                <version-history
                  .contentId=${this.contentId || this.appliedContent?.id || 'content-' + Date.now()}
                  .currentContent=${this.appliedContent}
                  @version-restored=${this.handleVersionRestored}
                ></version-history>

                <demo-hub
                  .agentUrl=${this.agentUrl}
                  .content=${this.appliedContent}
                ></demo-hub>

                <telemetry-panel
                  .agentUrl=${this.agentUrl}
                ></telemetry-panel>
              </div>
            ` : ''}
          </div>
        `}
      </div>

      <!-- Review Comments Slide Panel -->
      <review-comments
        .open=${this.showCommentsPanel}
        .review=${this.currentReview}
        @close=${() => this.showCommentsPanel = false}
        @comment-added=${this.handleCommentAdded}
      ></review-comments>

      <!-- Streaming Content Modal -->
      ${this.showStreamingModal ? html`
        <div class="streaming-modal-overlay" @click=${this.closeStreamingModal}>
          <div class="streaming-modal" @click=${(e: Event) => e.stopPropagation()}>
            <div class="streaming-modal-header">
              <h3>Generating ${this.streamingComponentType} content...</h3>
              <button class="streaming-modal-close" @click=${this.closeStreamingModal}>x</button>
            </div>
            <div class="streaming-modal-body">
              <streaming-content
                .agentUrl=${this.agentUrl}
                .componentType=${this.streamingComponentType}
                .prompt=${this.streamingPrompt}
                @content-ready=${this.handleStreamingContentReady}
                @content-accepted=${this.handleStreamingContentAccepted}
              ></streaming-content>
            </div>
          </div>
        </div>
      ` : ''}

      ${this.showCopiedToast ? html`
        <div class="toast">Copied to clipboard!</div>
      ` : ''}

      ${this.loading ? html`
        <div class="loading-overlay">
          <div class="spinner"></div>
        </div>
      ` : ''}

      <!-- Onboarding for first-time users -->
      ${this.showOnboarding ? html`
        <app-onboarding
          @complete=${() => {
            this.showOnboarding = false;
            localStorage.setItem('aem-assistant-onboarding-complete', 'true');
          }}
          @skip=${() => {
            this.showOnboarding = false;
            localStorage.setItem('aem-assistant-onboarding-complete', 'true');
          }}
        ></app-onboarding>
      ` : ''}

      <!-- Keyboard Shortcuts Help -->
      ${this.showShortcutsHelp ? html`
        <shortcuts-help
          @close=${() => this.showShortcutsHelp = false}
        ></shortcuts-help>
      ` : ''}
    `;
  }

  firstUpdated() {
    uiLogger.info('AEM Assistant initialized');

    // Load history
    this.history = HistoryService.getHistory();

    // Load theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.theme = 'dark';
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      this.theme = 'light';
      document.documentElement.removeAttribute('data-theme');
    }

    // Check for first-time user (show onboarding)
    const hasSeenOnboarding = localStorage.getItem('aem-assistant-onboarding-complete');
    if (!hasSeenOnboarding) {
      this.showOnboarding = true;
    }

    // Optional demo content injection for visual tests or demos
    this.initializeDemoContent();

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Connect collaboration services
    this.setupCollaboration();
    this.checkAemConnection();
  }

  /**
   * Initialize mock content when demo query param is present.
   * Usage: http://localhost:5173/?demo=1
   */
  private initializeDemoContent() {
    const params = new URLSearchParams(window.location.search);
    const demo = params.get('demo');
    if (!demo) {
      return;
    }

    this.prompt = 'Hero banner for summer sale';
    this.selectedComponentType = 'hero';
    const s1 = this.createMockSuggestion('1');
    const s2 = this.createMockSuggestion('2');
    const s3 = this.createMockSuggestion('3');
    this.suggestions = [s1, s2, s3];
    this.selectedSuggestion = s1;
    this.appliedContent = s1;
    this.contentId = s1.id;
  }

  private setupKeyboardShortcuts() {
    // Register app-specific shortcuts
    keyboardShortcuts.register({
      id: 'show-shortcuts',
      key: '?',
      modifiers: ['shift'],
      description: 'Show keyboard shortcuts',
      action: () => { this.showShortcutsHelp = true; }
    });

    keyboardShortcuts.register({
      id: 'toggle-mode',
      key: 'm',
      modifiers: ['ctrl'],
      description: 'Toggle view mode',
      action: () => { this.viewMode = this.viewMode === 'create' ? 'build' : 'create'; }
    });

    keyboardShortcuts.register({
      id: 'generate',
      key: 'Enter',
      modifiers: ['ctrl'],
      description: 'Generate content',
      action: () => { if (this.prompt.trim()) this.generateContent(); }
    });

    keyboardShortcuts.register({
      id: 'toggle-theme',
      key: 'd',
      modifiers: ['ctrl', 'shift'],
      description: 'Toggle dark mode',
      action: () => { this.toggleTheme(); }
    });

    keyboardShortcuts.register({
      id: 'focus-input',
      key: '/',
      description: 'Focus prompt input',
      action: () => {
        const input = this.shadowRoot?.querySelector('assistant-input');
        if (input) (input as HTMLElement).focus();
      }
    });

    keyboardShortcuts.register({
      id: 'escape',
      key: 'Escape',
      description: 'Close panels/modals',
      action: () => {
        this.showShortcutsHelp = false;
        this.showCommentsPanel = false;
        this.showDamBrowser = false;
        this.showStreamingModal = false;
      }
    });
  }

  private async setupCollaboration() {
    try {
      await collaborationService.connect(this.agentUrl);
      this.wsConnected = true;

      collaborationService.on('presence', (users: unknown) => {
        this.connectedUsers = users as LiveUser[];
      });

      collaborationService.on('cursor', (cursor: unknown) => {
        const existing = this.cursors.findIndex(c => c.sessionId === (cursor as CursorPosition).sessionId);
        if (existing >= 0) {
          this.cursors[existing] = cursor as CursorPosition;
        } else {
          this.cursors.push(cursor as CursorPosition);
        }
        this.cursors = [...this.cursors];
      });

      collaborationService.on('chat', (message: unknown) => {
        this.chatMessages = [...this.chatMessages, message as ChatMessage];
      });

      collaborationService.on('lock', (data: unknown) => {
        const lockData = data as { type: string; sessionId: string; username: string; field: string };
        if (lockData.type === 'locked') {
          this.fieldLocks = [...this.fieldLocks, { field: lockData.field, sessionId: lockData.sessionId, username: lockData.username }];
        } else if (lockData.type === 'unlocked' || lockData.type === 'released') {
          this.fieldLocks = this.fieldLocks.filter(l => !(l.field === lockData.field && l.sessionId === lockData.sessionId));
        }
      });

      collaborationService.on('reaction', (data: unknown) => {
        const reactionData = data as { type: string; emoji: string; sessionId: string };
        if (reactionData.type === 'remove') {
          const existing = this.fieldReactions.findIndex(r => r.emoji === reactionData.emoji);
          if (existing >= 0) {
            const reaction = this.fieldReactions[existing];
            reaction.sessionIds = reaction.sessionIds.filter(s => s !== reactionData.sessionId);
            reaction.count = reaction.sessionIds.length;
            if (reaction.count === 0) {
              this.fieldReactions = this.fieldReactions.filter(r => r.emoji !== reactionData.emoji);
            } else {
              this.fieldReactions = [...this.fieldReactions];
            }
          }
        } else {
          const existing = this.fieldReactions.findIndex(r => r.emoji === reactionData.emoji);
          if (existing >= 0) {
            const reaction = this.fieldReactions[existing];
            if (!reaction.sessionIds.includes(reactionData.sessionId)) {
              reaction.sessionIds.push(reactionData.sessionId);
              reaction.count = reaction.sessionIds.length;
              this.fieldReactions = [...this.fieldReactions];
            }
          } else {
            this.fieldReactions = [...this.fieldReactions, { emoji: reactionData.emoji, count: 1, sessionIds: [reactionData.sessionId] }];
          }
        }
      });

      collaborationService.on('notification', (notification: unknown) => {
        const notif = notification as { type: string; title: string; message: string; fromUser?: string };
        const notifType = (['info', 'success', 'warning', 'error', 'review'].includes(notif.type)
          ? notif.type
          : 'info') as 'info' | 'success' | 'warning' | 'error' | 'review';
        this.notifications = [{
          id: Date.now().toString(),
          type: notifType,
          title: notif.title,
          message: notif.message,
          fromUser: notif.fromUser,
          timestamp: new Date().toISOString()
        }, ...this.notifications];
      });

      if (this.appliedContent?.id) {
        collaborationService.joinRoom(this.appliedContent.id);
      }
    } catch (error) {
      logger.warn('WebSocket connection failed', 'Collaboration', error);
      this.wsConnected = false;
    }
  }

  private async checkAemConnection() {
    try {
      const status = await api.checkAemHealth();
      this.aemConnected = status.connected;
      this.aemAuthorUrl = status.authorUrl || '';
      logger.info(`AEM connection: ${status.connected ? 'connected' : 'disconnected'}`, 'AEM');
    } catch (error) {
      logger.warn('AEM health check failed', 'AEM', error);
      this.aemConnected = false;
    }
  }

  private toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    if (this.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  private handleHistoryItemClick(item: ContentSuggestion) {
    this.appliedContent = item;
    this.selectedSuggestion = item;
  }

  private clearHistory() {
    HistoryService.clearHistory();
    this.history = [];
  }

  public handleAgentChange(e: CustomEvent) {
    const agent = e.detail.agent;
    if (agent) {
      this.selectedAgent = agent;
      this.agentUrl = agent.url;
      this.suggestions = [];
      this.selectedSuggestion = null;
      this.appliedContent = null;
      this.appError = null;
    }
  }

  private handlePromptChange(e: CustomEvent) {
    this.prompt = e.detail.prompt;
  }

  private handleModeChange(e: Event) {
    const target = e.target as HTMLElement;
    const selected = target.querySelector('[selected]');
    if (selected) {
      this.viewMode = selected.getAttribute('value') as ViewMode;
      // Reset page sections when switching to build mode
      if (this.viewMode === 'build') {
        this.pageSections = [];
      }
      uiLogger.debug(`View mode changed to: ${this.viewMode}`);
    }
  }

  private async handleGenerateSection(e: CustomEvent) {
    const { sectionId, componentType, prompt } = e.detail;

    // Use streaming for section generation
    this.streamingSectionId = sectionId;
    this.streamingComponentType = componentType;
    this.streamingPrompt = prompt;
    this.showStreamingModal = true;

    // Start streaming after modal is shown
    await this.updateComplete;
    const streamingComponent = this.shadowRoot?.querySelector('streaming-content') as StreamingContent;
    if (streamingComponent) {
      streamingComponent.startStreaming(prompt, componentType);
    }
  }

  /**
   * Close the streaming modal
   */
  private closeStreamingModal() {
    const streamingComponent = this.shadowRoot?.querySelector('streaming-content') as StreamingContent;
    if (streamingComponent) {
      streamingComponent.cancelStream();
    }
    this.showStreamingModal = false;
    this.streamingSectionId = null;
    this.streamingComponentType = '';
    this.streamingPrompt = '';
  }

  /**
   * Handle streaming content ready (generation complete)
   */
  private handleStreamingContentReady(e: CustomEvent) {
    contentLogger.debug('Streaming content ready', e.detail.content);
    // Content is ready but user hasn't accepted yet
  }

  /**
   * Handle streaming content accepted by user
   */
  private handleStreamingContentAccepted(e: CustomEvent) {
    const streamedContent = e.detail.content as Partial<ContentSuggestion>;

    // Create a full ContentSuggestion from the streamed content
    const content: ContentSuggestion = {
      id: `streamed-${Date.now()}`,
      title: streamedContent.title || 'Untitled',
      subtitle: streamedContent.subtitle,
      description: streamedContent.description || '',
      ctaText: streamedContent.ctaText || 'Learn More',
      ctaUrl: streamedContent.ctaUrl || '#',
      imageUrl: streamedContent.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      componentType: this.streamingComponentType,
      price: streamedContent.price,
    };

    // Update the page builder section with the accepted content
    if (this.streamingSectionId) {
      const pageBuilder = this.shadowRoot?.querySelector('page-builder') as PageBuilder;
      if (pageBuilder) {
        pageBuilder.updateSectionContent(this.streamingSectionId, content);
      }
    }

    // Close the modal
    this.closeStreamingModal();
  }

  private handleSectionsChanged(e: CustomEvent) {
    const { sections } = e.detail;
    this.pageSections = sections;
  }

  private handlePageReady(e: CustomEvent) {
    const { sections } = e.detail;
    this.pageSections = sections;
    contentLogger.debug('Page ready with sections', sections);
  }

  private async handleWizardGenerate(e: CustomEvent) {
    const { componentType, tone, imageStyle, description, prompt, selectedAsset } = e.detail;
    contentLogger.debug('Wizard generate request', { componentType, selectedAsset: !!selectedAsset });

    // Store the selected component type for use in mock suggestions
    this.selectedComponentType = componentType;
    this.wizardSelectedAsset = selectedAsset || null;

    // Set the prompt and generate
    this.prompt = prompt;
    await this.generateContent();

    // Reset wizard loading state
    const wizard = this.shadowRoot?.querySelector('content-wizard') as ContentWizard;
    if (wizard) {
      wizard.setLoading(false);
    }

    // Stay in create mode - suggestions will show below the wizard
    contentLogger.info(`Wizard generated ${this.suggestions.length} suggestions`);
  }

  /**
   * Handle AI recommendation acceptance.
   * Converts recommended sections to page builder format and switches to page builder mode.
   */
  private handleRecommendationAccepted(e: CustomEvent) {
    const { recommendation, userInput } = e.detail as {
      recommendation: PageRecommendation;
      userInput: string;
    };

    contentLogger.info('Recommendation accepted', { pageType: recommendation.pageType });

    // Convert recommendation sections to page builder format
    this.pageSections = recommendation.sections.map((section, index) => ({
      id: `section-${index}-${Date.now()}`,
      type: section.componentType,
      content: null,
      status: 'empty' as const,
    }));

    // Store the user input as context for generation
    this.prompt = userInput;

    // Stay in build mode to show the recommended layout
    this.viewMode = 'build';

    // Update the page builder component with the sections
    setTimeout(() => {
      const pageBuilder = this.shadowRoot?.querySelector('page-builder') as PageBuilder;
      if (pageBuilder) {
        pageBuilder.setSectionsFromRecommendation(
          recommendation.sections.map(s => ({
            componentType: s.componentType,
            prompt: s.suggestedPrompt
          }))
        );
      }
    }, 100);
  }

  private async generateContent() {
    if (!this.prompt.trim()) return;

    this.loading = true;
    this.appError = null;
    this.suggestions = [];
    this.selectedSuggestion = null;

    contentLogger.info(`Generating content for: "${this.prompt.substring(0, 50)}..."`);

    try {
      const data = await withRetry(
        () => api.generateContent(this.prompt),
        { maxRetries: 2, delay: 1000 }
      );

      contentLogger.debug('Agent response received', data);

      // Parse the response to extract content suggestions
      const suggestions = this.parseAgentResponse(data);

      if (suggestions.length === 0) {
        this.appError = {
          code: 'NO_SUGGESTIONS',
          message: 'No suggestions generated',
          userMessage: 'No content suggestions were generated.',
          suggestion: 'Try rephrasing your prompt or be more specific about what you need.',
          retryable: true,
        };
      } else {
        this.suggestions = suggestions;
        // Auto-select and apply the first suggestion
        this.selectedSuggestion = suggestions[0];
        this.appliedContent = suggestions[0];
        HistoryService.addSuggestion(suggestions[0]);
        this.history = HistoryService.getHistory();
        contentLogger.info(`Generated ${suggestions.length} suggestions`);
      }
    } catch (error) {
      contentLogger.error('Generation failed', error);
      this.appError = errorHandler.handle(error);
    } finally {
      this.loading = false;
    }
  }

  private parseAgentResponse(data: any): ContentSuggestion[] {
    const suggestions: ContentSuggestion[] = [];

    // Try to extract from A2UI messages format
    if (data.messages && Array.isArray(data.messages)) {
      for (const msg of data.messages) {
        if (msg.parts) {
          for (const part of msg.parts) {
            if (part.a2ui) {
              const suggestion = this.extractFromA2UI(part.a2ui);
              if (suggestion) suggestions.push(suggestion);
            }
          }
        }
      }
    }

    // Also check for direct content in artifacts
    if (data.artifacts && Array.isArray(data.artifacts)) {
      for (const artifact of data.artifacts) {
        if (artifact.parts) {
          for (const part of artifact.parts) {
            if (part.data) {
              try {
                const parsed = typeof part.data === 'string' ? JSON.parse(part.data) : part.data;
                if (parsed.title) {
                  suggestions.push({
                    id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    ...parsed
                  });
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }
    }

    // If no suggestions found, create a mock for demo purposes
    if (suggestions.length === 0 && data.messages) {
      suggestions.push(this.createMockSuggestion('1'));
      suggestions.push(this.createMockSuggestion('2'));
      suggestions.push(this.createMockSuggestion('3'));
    }

    // Override componentType with user's selection from wizard if available
    if (this.selectedComponentType) {
      const normalizedType = this.selectedComponentType.toLowerCase();
      contentLogger.debug(`Setting component type to: ${normalizedType}`);
      suggestions.forEach(suggestion => {
        suggestion.componentType = normalizedType;

        // Use the wizard-selected asset if available, otherwise auto-select based on brand alignment
        if (this.wizardSelectedAsset) {
          suggestion.imageUrl = this.wizardSelectedAsset.url;
          suggestion.selectedAssetId = this.wizardSelectedAsset.id;
          suggestion.visualScore = this.wizardSelectedAsset.brandAligned ? 10 : 5;
        } else {
          const { url, score: visualScore } = this.getBrandAlignedImage(normalizedType);
          suggestion.imageUrl = url;
          suggestion.visualScore = visualScore;
        }

        // Generate SEO suggestions
        const { seo, seoScore } = this.generateSeoSuggestions(suggestion);
        suggestion.seo = seo;
        suggestion.seoScore = seoScore;
      });
    }

    return suggestions;
  }

  private extractFromA2UI(a2ui: any): ContentSuggestion | null {
    try {
      // Navigate A2UI structure to find content
      if (a2ui.surface?.components) {
        for (const comp of a2ui.surface.components) {
          if (comp.dataContext) {
            const suggestion = comp.dataContext.suggestion || comp.dataContext;
            if (suggestion.title) {
              return {
                id: `suggestion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: suggestion.title,
                subtitle: suggestion.subtitle,
                description: suggestion.description,
                ctaText: suggestion.ctaText || 'Learn More',
                ctaUrl: suggestion.ctaUrl || '#',
                imageUrl: suggestion.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
                imageAlt: suggestion.imageAlt,
                componentType: suggestion.componentType || 'hero',
                price: suggestion.price,
              };
            }
          }
        }
      }
    } catch (e) {
      contentLogger.error('Error extracting from A2UI', e);
    }
    return null;
  }

  private createMockSuggestion(variant: string): ContentSuggestion {
    // Use the stored component type from wizard, or detect from prompt for quick mode
    // Normalize to lowercase for consistent matching in preview
    const rawType = this.selectedComponentType || this.detectComponentType(this.prompt);
    const componentType = rawType.toLowerCase();
    const variations: Record<string, Partial<ContentSuggestion>> = {
      '1': {
        title: 'Unleash Your Potential',
        subtitle: 'Innovation Awaits',
        description: 'Discover innovative solutions designed to transform your digital experience and drive meaningful results.',
      },
      '2': {
        title: 'Experience Excellence',
        subtitle: 'Quality Redefined',
        description: 'Premium quality meets cutting-edge technology. Elevate your journey with our award-winning solutions.',
      },
      '3': {
        title: 'Transform Today',
        subtitle: 'Future Ready',
        description: 'Stay ahead of the curve with next-generation capabilities designed for modern enterprises.',
      },
    };

    const base = variations[variant] || variations['1'];
    const { url: imageUrl, score: visualScore } = this.getBrandAlignedImage(componentType);

    const mockSuggestion: ContentSuggestion = {
      id: `mock-${variant}-${Date.now()}`,
      title: base.title!,
      subtitle: base.subtitle,
      description: base.description!,
      ctaText: componentType === 'product' ? 'Shop Now' : 'Get Started',
      ctaUrl: '/get-started',
      imageUrl,
      imageAlt: `${componentType} image`,
      componentType,
      price: componentType === 'product' ? '$99.99' : undefined,
      visualScore,
    };

    // Generate SEO suggestions for mock content
    const { seo, seoScore } = this.generateSeoSuggestions(mockSuggestion);
    mockSuggestion.seo = seo;
    mockSuggestion.seoScore = seoScore;

    return mockSuggestion;
  }

  public detectComponentType(prompt: string): string {
    const lower = prompt.toLowerCase();
    // Marketing
    if (lower.includes('hero')) return 'hero';
    if (lower.includes('banner') || lower.includes('promo')) return 'banner';
    if (lower.includes('carousel') || lower.includes('slider')) return 'carousel';
    // Content
    if (lower.includes('teaser')) return 'teaser';
    if (lower.includes('quote') || lower.includes('testimonial')) return 'quote';
    if (lower.includes('accordion') || lower.includes('faq')) return 'accordion';
    if (lower.includes('tab')) return 'tabs';
    // Commerce
    if (lower.includes('product')) return 'product';
    if (lower.includes('pricing') || lower.includes('price table')) return 'pricing';
    // Media
    if (lower.includes('video')) return 'video';
    if (lower.includes('gallery')) return 'gallery';
    // Navigation
    if (lower.includes('navigation') || lower.includes('nav') || lower.includes('menu')) return 'navigation';
    if (lower.includes('footer')) return 'footer';
    if (lower.includes('breadcrumb')) return 'breadcrumb';
    // Interactive
    if (lower.includes('form') || lower.includes('contact')) return 'form';
    if (lower.includes('search')) return 'search';
    if (lower.includes('cta') || lower.includes('call to action')) return 'cta';
    // Social
    if (lower.includes('social') || lower.includes('share')) return 'socialshare';
    if (lower.includes('team')) return 'team';
    return 'hero';
  }

  private generateSeoSuggestions(content: ContentSuggestion): { seo: ContentSuggestion['seo'], seoScore: number } {
    const SEO_KEYWORDS_MAP: Record<string, string[]> = {
      hero: ['brand recognition', 'customer engagement', 'marketing strategy', 'digital transformation'],
      product: ['buy online', 'product features', 'best price', 'customer reviews'],
      teaser: ['learn more', 'read article', 'latest news', 'industry insights'],
      banner: ['limited offer', 'shop now', 'exclusive deal', 'save big'],
      // Add more component types and keywords
    };

    const componentKeywords = SEO_KEYWORDS_MAP[content.componentType.toLowerCase()] || [];
    const mainKeyword = componentKeywords[0] || content.title.split(' ')[0].toLowerCase();

    // Simulate meta title and description generation
    const metaTitle = `${content.title} | ${brandConfig.brand.name} - ${brandConfig.brand.tagline}`;
    const metaDescription = `${content.description.substring(0, 140)}... Discover more about ${mainKeyword} and how ${brandConfig.brand.name} can help.`;

    // Simple readability score (e.g., based on description length)
    const words = content.description.split(/\s+/).filter(word => word.length > 0).length;
    const sentences = content.description.split(/[.!?]+/).filter(sentence => sentence.length > 0).length;
    const readabilityScore = sentences > 0 ? (206.835 - 1.015 * (words / sentences) - 84.6 * (3 / words)) : 50; // Flesch-Kincaid style approximation

    // Basic keyword density check
    let keywordCount = 0;
    const contentLower = content.description.toLowerCase();
    for (const kw of componentKeywords) {
        if (contentLower.includes(kw.toLowerCase())) {
            keywordCount++;
        }
    }
    const keywordDensity = words > 0 ? (keywordCount / words) * 100 : 0;

    // Calculate SEO Score
    let seoScore = 0;
    const issues: string[] = [];

    // Title length
    if (content.title.length >= 20 && content.title.length <= 60) {
        seoScore += 20;
    } else {
        issues.push('Title length not optimal (20-60 chars).');
    }

    // Meta Description length
    if (metaDescription.length >= 50 && metaDescription.length <= 160) {
        seoScore += 20;
    } else {
        issues.push('Meta Description length not optimal (50-160 chars).');
    }

    // Main keyword in title
    if (content.title.toLowerCase().includes(mainKeyword)) {
        seoScore += 15;
    } else {
        issues.push(`Main keyword "${mainKeyword}" not found in title.`);
    }

    // Main keyword in description
    if (content.description.toLowerCase().includes(mainKeyword)) {
        seoScore += 15;
    } else {
        issues.push(`Main keyword "${mainKeyword}" not found in description.`);
    }

    // Readability
    if (readabilityScore >= 50) { // Aim for a decent score
        seoScore += 10;
    } else {
        issues.push('Content readability could be improved.');
    }

    // Keyword density (simple check for presence for now)
    if (keywordCount > 0) {
        seoScore += 10;
    } else {
        issues.push('No relevant keywords found in content body.');
    }

    // Add remaining score for general content quality, length etc.
    seoScore = Math.min(100, seoScore); // Cap at 100

    return {
      seo: {
        keywords: componentKeywords,
        metaTitle,
        metaDescription,
        readabilityScore: parseFloat(readabilityScore.toFixed(1)),
        keywordDensity: [{ keyword: mainKeyword, density: parseFloat(keywordDensity.toFixed(2)) }],
        issues: issues.length > 0 ? issues : undefined,
      },
      seoScore,
    };
  }

  private getBrandAlignedImage(componentType: string): { url: string; score: number } {
    const brandVisualKeywords = brandConfig.visuals.styleKeywords.map(k => k.toLowerCase());

    let bestMatch: LocalImageAsset | null = null;
    let highestScore = -1;

    for (const imageAsset of PREDEFINED_IMAGES) {
      let currentScore = 0;
      // Score based on matching brand visual keywords
      for (const keyword of brandVisualKeywords) {
        if (imageAsset.tags.includes(keyword)) {
          currentScore++;
        }
      }

      // Add score for component type relevance (simple for now)
      if (imageAsset.tags.includes(componentType.toLowerCase())) {
        currentScore += 2; // Give more weight to component type
      }

      if (currentScore > highestScore) {
        highestScore = currentScore;
        bestMatch = imageAsset;
      }
    }

    if (bestMatch) {
      return { url: bestMatch.url, score: highestScore };
    } else {
      // Fallback to a default image if no match
      return { url: PREDEFINED_IMAGES[0].url, score: 0 };
    }
  }

  private handleCopyContent(e: CustomEvent) {
    this.copyToClipboard(e.detail.content, e.detail.format);
  }

  private handleContentUpdated(e: CustomEvent) {
    const { content } = e.detail;
    this.appliedContent = content;

    if (!this.contentId) {
      this.contentId = content?.id || `content-${Date.now()}`;
    }
    if (content) {
      api.recordContentVersion(
        this.contentId,
        content,
        'demo-user',
        'Content updated'
      ).catch(() => undefined);
    }

    // Also update in suggestions if it exists there
    const index = this.suggestions.findIndex(s => s.id === content.id);
    if (index >= 0) {
      this.suggestions = [
        ...this.suggestions.slice(0, index),
        content,
        ...this.suggestions.slice(index + 1)
      ];
    }
  }

  private handleSuggestionSelected(e: CustomEvent) {
    this.selectedSuggestion = e.detail.suggestion;
  }

  private handleSuggestionApplied(e: CustomEvent) {
    this.appliedContent = e.detail.suggestion;
    this.selectedSuggestion = e.detail.suggestion;
    if (!this.contentId) {
      this.contentId = this.appliedContent?.id || `content-${Date.now()}`;
    }
    if (this.appliedContent) {
      api.recordContentVersion(
        this.contentId,
        this.appliedContent,
        'demo-user',
        'Applied suggestion'
      ).catch(() => undefined);
    }
  }

  private handleCopySuggestion(e: CustomEvent) {
    this.copyToClipboard(e.detail.suggestion);
  }

  // Review & Workflow Event Handlers
  private handleReviewStarted(e: CustomEvent) {
    this.currentReview = e.detail.review;
    logger.info('Review started', 'Review', { reviewId: this.currentReview?.id });
  }

  private handleReviewApproved(e: CustomEvent) {
    this.currentReview = e.detail.review;
    logger.info('Review approved', 'Review', { reviewId: this.currentReview?.id });
  }

  private handleReviewRejected(e: CustomEvent) {
    this.currentReview = e.detail.review;
    logger.info('Review rejected', 'Review', { reviewId: this.currentReview?.id });
  }

  private handleOpenComments(e: CustomEvent) {
    this.currentReview = e.detail.review;
    this.showCommentsPanel = true;
  }

  private handleCommentAdded(e: CustomEvent) {
    this.currentReview = e.detail.review;
  }

  private handleWorkflowStarted(e: CustomEvent) {
    logger.info('Workflow started', 'Workflow', { workflowId: e.detail.workflow?.id });
  }

  private handleWorkflowAdvanced(e: CustomEvent) {
    logger.info('Workflow advanced', 'Workflow', { workflowId: e.detail.workflow?.id });
  }

  private handleVersionRestored(e: CustomEvent) {
    this.appliedContent = e.detail.content;
    logger.info('Version restored', 'Content', { contentId: this.appliedContent?.id });
  }

  private handleBulkComplete(e: CustomEvent) {
    const { results, items } = e.detail;
    const successCount = items.filter((i: { status: string }) => i.status === 'complete').length;
    const errorCount = items.filter((i: { status: string }) => i.status === 'error').length;

    logger.info(`Bulk generation complete: ${successCount} succeeded, ${errorCount} failed`, 'BulkGenerator');

    // Convert results to page sections for preview
    if (results.length > 0) {
      this.pageSections = results.map((content: ContentSuggestion, index: number) => ({
        id: `bulk-section-${index}-${Date.now()}`,
        type: content.componentType || 'teaser',
        content,
        status: 'ready' as const,
      }));

      // Apply the first result as the selected content
      this.appliedContent = results[0];
      this.selectedSuggestion = results[0];
    }
  }

  private handleDamAssetSelected(e: CustomEvent) {
    const asset: DamAsset = e.detail.asset;
    this.selectedDamAsset = asset;
    logger.debug('DAM asset selected', 'DAM', { assetPath: asset.path });

    // If we have applied content, update its image URL
    if (this.appliedContent && asset.originalUrl) {
      this.appliedContent = {
        ...this.appliedContent,
        imageUrl: asset.originalUrl,
        imageAlt: asset.title || asset.name
      };
    }

    this.showDamBrowser = false;
  }

  private openDamBrowser() {
    this.showDamBrowser = true;
  }

  private handleChatMessage(e: CustomEvent) {
    const { message } = e.detail;
    collaborationService.sendChatMessage(message);
  }

  private async copyToClipboard(content: ContentSuggestion, format: 'json' | 'html' = 'json') {
    let text: string;

    if (format === 'html') {
      text = this.generateHTML(content);
    } else {
      text = JSON.stringify(content, null, 2);
    }

    try {
      await navigator.clipboard.writeText(text);
      this.showCopiedToast = true;
      setTimeout(() => {
        this.showCopiedToast = false;
      }, 2000);
    } catch (err) {
      uiLogger.error('Failed to copy to clipboard', err);
    }
  }

  private generateHTML(content: ContentSuggestion): string {
    const type = content.componentType?.toLowerCase() || 'hero';

    switch (type) {
      case 'hero':
        return `<div class="cmp-hero">
  <div class="cmp-hero__image-container">
    <img src="${content.imageUrl}" alt="${content.imageAlt || content.title}" class="cmp-hero__image" />
  </div>
  <div class="cmp-hero__content">
    <h1 class="cmp-hero__title">${content.title}</h1>
    ${content.subtitle ? `<p class="cmp-hero__subtitle">${content.subtitle}</p>` : ''}
    <p class="cmp-hero__description">${content.description}</p>
    <a href="${content.ctaUrl}" class="cmp-hero__cta">${content.ctaText}</a>
  </div>
</div>`;

      case 'product':
        return `<div class="cmp-product-card">
  <img src="${content.imageUrl}" alt="${content.imageAlt || content.title}" class="cmp-product-card__image" />
  <div class="cmp-product-card__content">
    <h3 class="cmp-product-card__title">${content.title}</h3>
    ${content.price ? `<span class="cmp-product-card__price">${content.price}</span>` : ''}
    <p class="cmp-product-card__description">${content.description}</p>
    <a href="${content.ctaUrl}" class="cmp-product-card__cta">${content.ctaText}</a>
  </div>
</div>`;

      default:
        return `<div class="cmp-${type}">
  <h2>${content.title}</h2>
  <p>${content.description}</p>
  <a href="${content.ctaUrl}">${content.ctaText}</a>
</div>`;
    }
  }

  private refineContent() {
    const input = this.shadowRoot?.querySelector('#refinement-input') as HTMLInputElement;
    if (input?.value && this.prompt) {
      this.prompt = `${this.prompt}. ${input.value}`;
      input.value = '';
      this.generateContent();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'aem-assistant': AemAssistant;
  }
}
