import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ContentSuggestion } from '../lib/types';

/**
 * AG-UI Event Types - Full Protocol Support (17 event types)
 */
type AgUiEventType =
  // Lifecycle Events
  | 'RUN_STARTED'
  | 'RUN_FINISHED'
  | 'RUN_ERROR'
  | 'STEP_STARTED'
  | 'STEP_FINISHED'
  // Text Message Events
  | 'TEXT_MESSAGE_START'
  | 'TEXT_MESSAGE_DELTA'
  | 'TEXT_MESSAGE_END'
  // Tool Call Events
  | 'TOOL_CALL_START'
  | 'TOOL_CALL_ARGS'
  | 'TOOL_CALL_END'
  | 'TOOL_CALL_RESULT'
  // State Management Events
  | 'STATE_DELTA'
  | 'STATE_SNAPSHOT'
  | 'MESSAGES_SNAPSHOT'
  // Extension Events
  | 'RAW_EVENT'
  | 'CUSTOM_EVENT'
  // HITL Events
  | 'INTERRUPT_REQUESTED'
  | 'INTERRUPT_RESOLVED';

interface AgentStep {
  stepId: string;
  stepIndex: number;
  stepName: string;
  stepTitle: string;
  icon?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

interface ToolCall {
  toolCallId: string;
  toolName: string;
  toolDescription: string;
  args?: Record<string, unknown>;
  result?: Record<string, unknown>;
  status: 'started' | 'args_received' | 'completed';
}

interface DamAsset {
  path: string;
  title: string;
  mimeType?: string;
  thumbnailUrl?: string;
}

interface HitlInterrupt {
  interruptId: string;
  type: string;
  title: string;
  description: string;
  options: Array<{ id: string; label: string; style: string }>;
  resolved: boolean;
  resolution?: string;
}

interface AgUiEvent {
  type: AgUiEventType;
  timestamp: number;
  data: {
    runId: string;
    // Step data
    stepId?: string;
    stepIndex?: number;
    stepName?: string;
    stepTitle?: string;
    stepDescription?: string;
    icon?: string;
    // Tool call data
    toolCallId?: string;
    toolName?: string;
    toolDescription?: string;
    args?: Record<string, unknown>;
    result?: Record<string, unknown>;
    // Text message data
    field?: string;
    delta?: string | { content?: ContentSuggestion; componentType?: string };
    content?: string | ContentSuggestion;
    // State data
    state?: Record<string, unknown>;
    // Custom event data
    eventType?: string;
    payload?: Record<string, unknown>;
    // Error data
    error?: string;
    status?: string;
    // Metadata
    agentName?: string;
    version?: string;
    aemConnected?: boolean;
    totalSteps?: number;
  };
}

/**
 * Streaming Content Component
 *
 * Displays content generation with real-time streaming updates.
 * Implements AG-UI protocol for progressive content display.
 *
 * Features:
 * - Real-time text streaming (word by word)
 * - Typing cursor animation
 * - Field-by-field progressive rendering
 * - Error handling with retry
 * - Cancel stream support
 */
@customElement('streaming-content')
export class StreamingContent extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family-base, 'Adobe Clean', sans-serif);
    }

    .streaming-container {
      background: var(--spectrum-gray-50, #ffffff);
      border-radius: 8px;
      overflow: hidden;
    }

    .stream-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: var(--spectrum-gray-100, #f5f5f5);
      border-bottom: 1px solid var(--spectrum-gray-200, #e1e1e1);
    }

    .stream-status {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--spectrum-gray-700, #464646);
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--spectrum-gray-400);
    }

    .status-dot.streaming {
      background: var(--spectrum-green-500, #12805c);
      animation: pulse 1.5s ease-in-out infinite;
    }

    .status-dot.completed {
      background: var(--spectrum-green-500, #12805c);
    }

    .status-dot.error {
      background: var(--spectrum-red-500, #d7373f);
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .cancel-btn {
      background: transparent;
      border: 1px solid var(--spectrum-gray-400);
      border-radius: 4px;
      padding: 4px 12px;
      font-size: 12px;
      cursor: pointer;
      color: var(--spectrum-gray-700);
    }

    .cancel-btn:hover {
      background: var(--spectrum-gray-200);
    }

    .content-preview {
      padding: 20px;
    }

    .field-group {
      margin-bottom: 16px;
    }

    .field-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--spectrum-gray-600, #6e6e6e);
      margin-bottom: 4px;
    }

    .field-value {
      font-size: 14px;
      line-height: 1.5;
      color: var(--spectrum-gray-900, #1d1d1d);
      min-height: 20px;
    }

    .field-value.title {
      font-size: 24px;
      font-weight: 700;
      line-height: 1.2;
    }

    .field-value.subtitle {
      font-size: 16px;
      color: var(--spectrum-gray-700);
    }

    .field-value.streaming {
      position: relative;
    }

    .field-value.streaming::after {
      content: '|';
      animation: blink 0.7s infinite;
      color: var(--spectrum-blue-500, #0d66d0);
      font-weight: normal;
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }

    .field-value.empty {
      color: var(--spectrum-gray-400);
      font-style: italic;
    }

    .image-preview {
      width: 100%;
      max-width: 400px;
      height: 200px;
      background: var(--spectrum-gray-200);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--spectrum-gray-500);
      overflow: hidden;
    }

    .image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cta-preview {
      display: inline-flex;
      align-items: center;
      padding: 10px 20px;
      background: var(--spectrum-blue-500, #0d66d0);
      color: white;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
    }

    .progress-bar {
      height: 3px;
      background: var(--spectrum-gray-200);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--spectrum-blue-500);
      transition: width 0.3s ease;
    }

    .error-message {
      padding: 16px;
      background: var(--spectrum-red-100);
      color: var(--spectrum-red-800);
      border-radius: 4px;
      margin: 16px;
    }

    .actions {
      display: flex;
      gap: 8px;
      padding: 16px;
      border-top: 1px solid var(--spectrum-gray-200);
    }

    .action-btn {
      flex: 1;
      padding: 10px 16px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      border: none;
    }

    .action-btn.primary {
      background: var(--spectrum-blue-500);
      color: white;
    }

    .action-btn.primary:hover {
      background: var(--spectrum-blue-600);
    }

    .action-btn.primary:disabled {
      background: var(--spectrum-gray-300);
      cursor: not-allowed;
    }

    .action-btn.secondary {
      background: transparent;
      border: 1px solid var(--spectrum-gray-400);
      color: var(--spectrum-gray-800);
    }

    .action-btn.secondary:hover {
      background: var(--spectrum-gray-100);
    }

    .idle-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--spectrum-gray-600);
    }

    .idle-state svg {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    /* Steps Progress */
    .steps-container {
      padding: 16px;
      background: var(--spectrum-gray-75);
      border-bottom: 1px solid var(--spectrum-gray-200);
    }

    .step-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      font-size: 13px;
    }

    .step-icon {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      background: var(--spectrum-gray-200);
      color: var(--spectrum-gray-600);
    }

    .step-icon.in_progress {
      background: var(--spectrum-blue-500);
      color: white;
      animation: pulse 1s infinite;
    }

    .step-icon.completed {
      background: var(--spectrum-green-500);
      color: white;
    }

    .step-icon.error {
      background: var(--spectrum-red-500);
      color: white;
    }

    .step-info {
      flex: 1;
    }

    .step-title {
      font-weight: 500;
      color: var(--spectrum-gray-800);
    }

    .step-title.in_progress {
      color: var(--spectrum-blue-600);
    }

    .step-description {
      font-size: 11px;
      color: var(--spectrum-gray-600);
    }

    /* Tool Calls */
    .tool-calls-container {
      padding: 12px 16px;
      background: var(--spectrum-gray-50);
      border-bottom: 1px solid var(--spectrum-gray-200);
    }

    .tool-call {
      background: white;
      border: 1px solid var(--spectrum-gray-200);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
    }

    .tool-call:last-child {
      margin-bottom: 0;
    }

    .tool-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .tool-icon {
      font-size: 16px;
    }

    .tool-name {
      font-weight: 600;
      font-size: 13px;
      color: var(--spectrum-gray-800);
    }

    .tool-status {
      margin-left: auto;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      background: var(--spectrum-gray-200);
    }

    .tool-status.completed {
      background: var(--spectrum-green-100);
      color: var(--spectrum-green-700);
    }

    .tool-args, .tool-result {
      font-size: 11px;
      font-family: monospace;
      background: var(--spectrum-gray-100);
      padding: 8px;
      border-radius: 4px;
      margin-top: 8px;
      overflow-x: auto;
    }

    .tool-args-label, .tool-result-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--spectrum-gray-600);
      margin-bottom: 4px;
    }

    /* DAM Assets */
    .dam-assets {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 8px;
    }

    .dam-asset {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      overflow: hidden;
      border: 2px solid transparent;
      cursor: pointer;
    }

    .dam-asset:hover {
      border-color: var(--spectrum-blue-500);
    }

    .dam-asset.selected {
      border-color: var(--spectrum-green-500);
    }

    .dam-asset img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* AEM Badge */
    .aem-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
    }

    .aem-badge.connected {
      background: var(--spectrum-green-100);
      color: var(--spectrum-green-700);
    }

    .aem-badge.disconnected {
      background: var(--spectrum-gray-200);
      color: var(--spectrum-gray-600);
    }

    /* Progress Message */
    .progress-message {
      padding: 8px 16px;
      font-size: 12px;
      color: var(--spectrum-gray-600);
      background: var(--spectrum-gray-50);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .progress-percentage {
      font-weight: 600;
      color: var(--spectrum-blue-600);
      min-width: 40px;
    }

    /* HITL Approval Panel */
    .hitl-panel {
      padding: 16px;
      background: linear-gradient(135deg, var(--spectrum-blue-50) 0%, var(--spectrum-purple-50) 100%);
      border: 2px solid var(--spectrum-blue-400);
      border-radius: 8px;
      margin: 16px;
    }

    .hitl-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .hitl-icon {
      font-size: 24px;
    }

    .hitl-title {
      font-weight: 600;
      font-size: 16px;
      color: var(--spectrum-gray-800);
    }

    .hitl-description {
      font-size: 13px;
      color: var(--spectrum-gray-700);
      margin-bottom: 16px;
    }

    .hitl-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .hitl-btn {
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
    }

    .hitl-btn.primary {
      background: var(--spectrum-green-500);
      color: white;
    }

    .hitl-btn.primary:hover {
      background: var(--spectrum-green-600);
    }

    .hitl-btn.secondary {
      background: var(--spectrum-gray-200);
      color: var(--spectrum-gray-800);
    }

    .hitl-btn.secondary:hover {
      background: var(--spectrum-gray-300);
    }

    .hitl-btn.danger {
      background: var(--spectrum-red-500);
      color: white;
    }

    .hitl-btn.danger:hover {
      background: var(--spectrum-red-600);
    }

    .hitl-resolved {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--spectrum-green-100);
      border-radius: 4px;
      font-size: 13px;
      color: var(--spectrum-green-700);
    }
  `;

  @property({ type: String }) agentUrl = 'http://localhost:10003';
  @property({ type: String }) componentType = '';
  @property({ type: String }) prompt = '';

  @state() private status: 'idle' | 'streaming' | 'completed' | 'error' = 'idle';
  @state() private currentField = '';
  @state() private content: Partial<ContentSuggestion> = {};
  @state() private error = '';
  @state() private progress = 0;
  @state() private runId = '';
  @state() private steps: AgentStep[] = [];
  @state() private toolCalls: ToolCall[] = [];
  @state() private damAssets: DamAsset[] = [];
  @state() private aemConnected = false;
  @state() private agentName = 'AEM Content Assistant';
  @state() private useAdvanced = false;
  @state() private progressMessage = '';
  @state() private hitlInterrupt: HitlInterrupt | null = null;

  private eventSource: EventSource | null = null;
  private fieldOrder = ['title', 'subtitle', 'description', 'ctaText', 'price', 'imageUrl'];

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cancelStream();
  }

  /**
   * Start streaming content generation
   * @param prompt User input prompt
   * @param componentType Target component type
   * @param advanced Use advanced endpoint with DAM integration
   */
  public async startStreaming(prompt: string, componentType?: string, advanced = false) {
    this.cancelStream(); // Cancel any existing stream
    this.reset();

    this.prompt = prompt;
    if (componentType) this.componentType = componentType;
    this.useAdvanced = advanced;
    this.status = 'streaming';

    const params = new URLSearchParams({
      input: prompt,
      ...(this.componentType && { componentType: this.componentType }),
    });

    // Use advanced endpoint for full AG-UI demo with DAM
    const endpoint = advanced ? '/stream/advanced' : '/stream/generate';

    try {
      this.eventSource = new EventSource(`${this.agentUrl}${endpoint}?${params}`);

      // Listen for ALL AG-UI event types (17 total)
      const eventTypes: AgUiEventType[] = [
        // Lifecycle
        'RUN_STARTED', 'RUN_FINISHED', 'RUN_ERROR',
        'STEP_STARTED', 'STEP_FINISHED',
        // Text Message
        'TEXT_MESSAGE_START', 'TEXT_MESSAGE_DELTA', 'TEXT_MESSAGE_END',
        // Tool Call
        'TOOL_CALL_START', 'TOOL_CALL_ARGS', 'TOOL_CALL_END', 'TOOL_CALL_RESULT',
        // State
        'STATE_DELTA', 'STATE_SNAPSHOT', 'MESSAGES_SNAPSHOT',
        // Extension
        'RAW_EVENT', 'CUSTOM_EVENT',
        // HITL
        'INTERRUPT_REQUESTED', 'INTERRUPT_RESOLVED',
      ];

      eventTypes.forEach((eventType) => {
        this.eventSource!.addEventListener(eventType, (e: MessageEvent) => {
          this.handleEvent(eventType, JSON.parse(e.data));
        });
      });

      this.eventSource.onerror = (e) => {
        console.error('SSE Error:', e);
        if (this.status === 'streaming') {
          this.status = 'error';
          this.error = 'Connection lost. Please try again.';
        }
        this.eventSource?.close();
      };
    } catch (err) {
      this.status = 'error';
      this.error = err instanceof Error ? err.message : 'Failed to connect';
    }
  }

  /**
   * Handle incoming AG-UI events (17 event types supported)
   */
  private handleEvent(type: AgUiEventType, event: AgUiEvent) {
    const { data } = event;

    switch (type) {
      // ═══════════════════════════════════════════════════════════
      // LIFECYCLE EVENTS
      // ═══════════════════════════════════════════════════════════
      case 'RUN_STARTED':
        this.runId = data.runId;
        this.progress = 5;
        if (data.agentName) this.agentName = data.agentName;
        if (data.aemConnected !== undefined) this.aemConnected = data.aemConnected;
        break;

      case 'STEP_STARTED':
        this.steps = [
          ...this.steps,
          {
            stepId: data.stepId || '',
            stepIndex: data.stepIndex || 0,
            stepName: data.stepName || '',
            stepTitle: data.stepTitle || '',
            icon: data.icon,
            status: 'in_progress',
          },
        ];
        break;

      case 'STEP_FINISHED':
        this.steps = this.steps.map((step) =>
          step.stepId === data.stepId
            ? { ...step, status: data.status === 'completed' ? 'completed' : 'error' }
            : step
        );
        // Update progress based on steps
        if (data.stepIndex && data.totalSteps) {
          this.progress = Math.min(95, (data.stepIndex / data.totalSteps) * 100);
        }
        break;

      // ═══════════════════════════════════════════════════════════
      // TOOL CALL EVENTS
      // ═══════════════════════════════════════════════════════════
      case 'TOOL_CALL_START':
        this.toolCalls = [
          ...this.toolCalls,
          {
            toolCallId: data.toolCallId || '',
            toolName: data.toolName || '',
            toolDescription: data.toolDescription || '',
            status: 'started',
          },
        ];
        break;

      case 'TOOL_CALL_ARGS':
        this.toolCalls = this.toolCalls.map((tc) =>
          tc.toolCallId === data.toolCallId
            ? { ...tc, args: data.args, status: 'args_received' }
            : tc
        );
        break;

      case 'TOOL_CALL_RESULT':
        this.toolCalls = this.toolCalls.map((tc) =>
          tc.toolCallId === data.toolCallId ? { ...tc, result: data.result } : tc
        );
        // Extract DAM assets from tool result if present
        if (data.result?.assets) {
          this.damAssets = data.result.assets as DamAsset[];
        }
        break;

      case 'TOOL_CALL_END':
        this.toolCalls = this.toolCalls.map((tc) =>
          tc.toolCallId === data.toolCallId ? { ...tc, status: 'completed' } : tc
        );
        break;

      // ═══════════════════════════════════════════════════════════
      // TEXT MESSAGE EVENTS
      // ═══════════════════════════════════════════════════════════
      case 'TEXT_MESSAGE_START':
        this.currentField = data.field || '';
        this.updateProgress(data.field);
        break;

      case 'TEXT_MESSAGE_DELTA':
        if (data.field && data.content) {
          this.content = {
            ...this.content,
            [data.field]: data.content,
          };
          this.requestUpdate();
        }
        break;

      case 'TEXT_MESSAGE_END':
        this.currentField = '';
        break;

      // ═══════════════════════════════════════════════════════════
      // STATE MANAGEMENT EVENTS
      // ═══════════════════════════════════════════════════════════
      case 'STATE_DELTA':
        if (data.delta && typeof data.delta === 'object') {
          const deltaObj = data.delta as {
            content?: ContentSuggestion;
            progress?: number;
            progressMessage?: string;
          };
          if (deltaObj.content) {
            this.content = deltaObj.content;
          }
          // Handle progress updates
          if (typeof deltaObj.progress === 'number') {
            this.progress = deltaObj.progress;
          }
          if (deltaObj.progressMessage) {
            this.progressMessage = deltaObj.progressMessage;
          }
        }
        break;

      case 'STATE_SNAPSHOT':
        // Full state recovery - useful for reconnection
        if (data.state) {
          const state = data.state as {
            content?: ContentSuggestion;
            damAssets?: DamAsset[];
            aemConnected?: boolean;
          };
          if (state.content) this.content = state.content;
          if (state.damAssets) this.damAssets = state.damAssets;
          if (state.aemConnected !== undefined) this.aemConnected = state.aemConnected;
        }
        break;

      // ═══════════════════════════════════════════════════════════
      // EXTENSION EVENTS
      // ═══════════════════════════════════════════════════════════
      case 'CUSTOM_EVENT':
        // Handle AEM-specific custom events
        if (data.eventType === 'aem.content.ready') {
          this.dispatchEvent(
            new CustomEvent('aem-content-ready', {
              detail: data.payload,
              bubbles: true,
              composed: true,
            })
          );
        }
        break;

      // ═══════════════════════════════════════════════════════════
      // HITL (Human-in-the-Loop) EVENTS
      // ═══════════════════════════════════════════════════════════
      case 'INTERRUPT_REQUESTED':
        this.hitlInterrupt = {
          interruptId: data.interruptId as string || '',
          type: data.type as string || 'approval',
          title: data.title as string || 'Review Required',
          description: data.description as string || '',
          options: (data.options as Array<{ id: string; label: string; style: string }>) || [],
          resolved: false,
        };
        // Emit event for parent components
        this.dispatchEvent(
          new CustomEvent('hitl-interrupt', {
            detail: this.hitlInterrupt,
            bubbles: true,
            composed: true,
          })
        );
        break;

      case 'INTERRUPT_RESOLVED':
        if (this.hitlInterrupt && this.hitlInterrupt.interruptId === data.interruptId) {
          this.hitlInterrupt = {
            ...this.hitlInterrupt,
            resolved: true,
            resolution: data.resolution as string,
          };
        }
        break;

      // ═══════════════════════════════════════════════════════════
      // COMPLETION EVENTS
      // ═══════════════════════════════════════════════════════════
      case 'RUN_FINISHED':
        this.status = 'completed';
        this.progress = 100;
        this.eventSource?.close();

        // Mark all steps as completed
        this.steps = this.steps.map((s) =>
          s.status === 'in_progress' ? { ...s, status: 'completed' } : s
        );

        // Emit content-ready event
        this.dispatchEvent(
          new CustomEvent('content-ready', {
            detail: {
              content: this.content,
              damAssets: this.damAssets,
              aemConnected: this.aemConnected,
            },
            bubbles: true,
            composed: true,
          })
        );
        break;

      case 'RUN_ERROR':
        this.status = 'error';
        this.error = data.error || 'An error occurred';
        this.eventSource?.close();
        break;
    }
  }

  /**
   * Update progress based on current field
   */
  private updateProgress(field?: string) {
    if (!field) return;
    const index = this.fieldOrder.indexOf(field);
    if (index !== -1) {
      this.progress = Math.min(95, 10 + (index / this.fieldOrder.length) * 85);
    }
  }

  /**
   * Cancel the current stream
   */
  public cancelStream() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.status === 'streaming') {
      this.status = 'idle';
    }
  }

  /**
   * Reset the component state
   */
  private reset() {
    this.status = 'idle';
    this.currentField = '';
    this.content = {};
    this.error = '';
    this.progress = 0;
    this.runId = '';
    this.steps = [];
    this.toolCalls = [];
    this.damAssets = [];
    this.progressMessage = '';
    this.hitlInterrupt = null;
  }

  /**
   * Retry after error
   */
  private retry() {
    if (this.prompt) {
      this.startStreaming(this.prompt, this.componentType);
    }
  }

  /**
   * Accept the generated content
   */
  private acceptContent() {
    this.dispatchEvent(
      new CustomEvent('content-accepted', {
        detail: { content: this.content },
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * Regenerate content
   */
  private regenerate() {
    if (this.prompt) {
      this.startStreaming(this.prompt, this.componentType);
    }
  }

  override render() {
    return html`
      <div class="streaming-container">
        ${this.renderHeader()}
        ${this.status !== 'idle' ? this.renderProgressBar() : ''}
        ${this.progressMessage ? this.renderProgressMessage() : ''}
        ${this.status === 'idle' ? this.renderIdleState() : ''}
        ${this.status === 'error' ? this.renderError() : ''}
        ${this.steps.length > 0 ? this.renderSteps() : ''}
        ${this.hitlInterrupt ? this.renderHitlPanel() : ''}
        ${this.toolCalls.length > 0 ? this.renderToolCalls() : ''}
        ${this.status === 'streaming' || this.status === 'completed'
          ? this.renderContent()
          : ''}
        ${this.status === 'completed' ? this.renderActions() : ''}
      </div>
    `;
  }

  private renderHeader() {
    const statusText = {
      idle: 'Ready',
      streaming: `Generating ${this.currentField || 'content'}...`,
      completed: 'Generation complete',
      error: 'Error',
    };

    return html`
      <div class="stream-header">
        <div class="stream-status">
          <span class="status-dot ${this.status}"></span>
          <span>${statusText[this.status]}</span>
          ${this.useAdvanced
            ? html`
                <span class="aem-badge ${this.aemConnected ? 'connected' : 'disconnected'}">
                  ${this.aemConnected ? '🟢 AEM Live' : '⚪ Mock Mode'}
                </span>
              `
            : ''}
        </div>
        ${this.status === 'streaming'
          ? html`
              <button class="cancel-btn" @click=${this.cancelStream}>Cancel</button>
            `
          : ''}
      </div>
    `;
  }

  private renderSteps() {
    return html`
      <div class="steps-container">
        ${this.steps.map(
          (step) => html`
            <div class="step-item">
              <div class="step-icon ${step.status}">
                ${step.status === 'completed'
                  ? '✓'
                  : step.status === 'in_progress'
                  ? '⟳'
                  : step.icon || (step.stepIndex || 0).toString()}
              </div>
              <div class="step-info">
                <div class="step-title ${step.status}">${step.stepTitle}</div>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  private renderToolCalls() {
    return html`
      <div class="tool-calls-container">
        ${this.toolCalls.map(
          (tc) => html`
            <div class="tool-call">
              <div class="tool-header">
                <span class="tool-icon">🔧</span>
                <span class="tool-name">${tc.toolName}</span>
                <span class="tool-status ${tc.status}">${tc.status}</span>
              </div>
              ${tc.toolDescription
                ? html`<div class="step-description">${tc.toolDescription}</div>`
                : ''}
              ${tc.args
                ? html`
                    <div class="tool-args-label">Arguments</div>
                    <div class="tool-args">
                      <pre>${JSON.stringify(tc.args, null, 2)}</pre>
                    </div>
                  `
                : ''}
              ${tc.result
                ? html`
                    <div class="tool-result-label">Result</div>
                    <div class="tool-result">
                      <pre>${JSON.stringify(tc.result, null, 2)}</pre>
                    </div>
                    ${this.renderDamAssets(tc)}
                  `
                : ''}
            </div>
          `
        )}
      </div>
    `;
  }

  private renderDamAssets(tc: ToolCall) {
    if (tc.toolName !== 'aem_dam_search' || !tc.result?.assets) return '';

    const assets = tc.result.assets as DamAsset[];
    if (assets.length === 0) return '';

    return html`
      <div class="dam-assets">
        ${assets.slice(0, 5).map(
          (asset) => html`
            <div class="dam-asset" title="${asset.title || asset.path}">
              <img
                src="${asset.thumbnailUrl ||
                `http://host.docker.internal:4502${asset.path}/_jcr_content/renditions/cq5dam.thumbnail.48.48.png`}"
                alt="${asset.title || 'Asset'}"
                onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 48 48%22><rect fill=%22%23f0f0f0%22 width=%2248%22 height=%2248%22/><text x=%2224%22 y=%2228%22 text-anchor=%22middle%22 fill=%22%23888%22 font-size=%2212%22>📷</text></svg>'"
              />
            </div>
          `
        )}
      </div>
    `;
  }

  private renderProgressBar() {
    return html`
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${this.progress}%"></div>
      </div>
    `;
  }

  private renderProgressMessage() {
    return html`
      <div class="progress-message">
        <span class="progress-percentage">${this.progress}%</span>
        <span>${this.progressMessage}</span>
      </div>
    `;
  }

  private renderHitlPanel() {
    if (!this.hitlInterrupt) return '';

    if (this.hitlInterrupt.resolved) {
      return html`
        <div class="hitl-panel">
          <div class="hitl-resolved">
            <span>✓</span>
            <span>Approved - Continuing workflow...</span>
          </div>
        </div>
      `;
    }

    return html`
      <div class="hitl-panel">
        <div class="hitl-header">
          <span class="hitl-icon">👁️</span>
          <span class="hitl-title">${this.hitlInterrupt.title}</span>
        </div>
        <p class="hitl-description">${this.hitlInterrupt.description}</p>
        <div class="hitl-actions">
          ${this.hitlInterrupt.options.map(
            (option) => html`
              <button
                class="hitl-btn ${option.style}"
                @click=${() => this.handleHitlAction(option.id)}
              >
                ${option.label}
              </button>
            `
          )}
        </div>
      </div>
    `;
  }

  private handleHitlAction(actionId: string) {
    this.dispatchEvent(
      new CustomEvent('hitl-action', {
        detail: {
          interruptId: this.hitlInterrupt?.interruptId,
          action: actionId,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private renderIdleState() {
    return html`
      <div class="idle-state">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
          />
        </svg>
        <p>Enter a prompt to start generating content</p>
      </div>
    `;
  }

  private renderError() {
    return html`
      <div class="error-message">
        ${this.error}
        <button class="action-btn secondary" style="margin-top: 8px" @click=${this.retry}>
          Retry
        </button>
      </div>
    `;
  }

  private renderContent() {
    return html`
      <div class="content-preview">
        ${this.renderField('title', 'Title', this.content.title)}
        ${this.renderField('subtitle', 'Subtitle', this.content.subtitle)}
        ${this.renderField('description', 'Description', this.content.description)}
        ${this.content.ctaText ? this.renderCta() : ''}
        ${this.content.price
          ? this.renderField('price', 'Price', this.content.price)
          : ''}
        ${this.content.imageUrl ? this.renderImage() : ''}
      </div>
    `;
  }

  private renderField(fieldName: string, label: string, value?: string) {
    const isStreaming = this.currentField === fieldName;
    const isEmpty = !value;

    return html`
      <div class="field-group">
        <div class="field-label">${label}</div>
        <div
          class="field-value ${fieldName} ${isStreaming ? 'streaming' : ''} ${isEmpty
            ? 'empty'
            : ''}"
        >
          ${value || (isStreaming ? '' : 'Waiting...')}
        </div>
      </div>
    `;
  }

  private renderCta() {
    const isStreaming = this.currentField === 'ctaText';

    return html`
      <div class="field-group">
        <div class="field-label">Call to Action</div>
        <div class="cta-preview ${isStreaming ? 'streaming' : ''}">
          ${this.content.ctaText || 'Button'}
        </div>
      </div>
    `;
  }

  private renderImage() {
    return html`
      <div class="field-group">
        <div class="field-label">Image</div>
        <div class="image-preview">
          ${this.content.imageUrl
            ? html`<img src="${this.content.imageUrl}" alt="Preview" />`
            : 'No image'}
        </div>
      </div>
    `;
  }

  private renderActions() {
    return html`
      <div class="actions">
        <button class="action-btn secondary" @click=${this.regenerate}>Regenerate</button>
        <button class="action-btn primary" @click=${this.acceptContent}>Accept Content</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'streaming-content': StreamingContent;
  }
}
