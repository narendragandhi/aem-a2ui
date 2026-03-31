import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { ContentSuggestion } from '../lib/types.js';
import './streaming-content.js';

@customElement('demo-hub')
export class DemoHub extends LitElement {
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
      margin-bottom: 16px;
    }

    .panel-header {
      padding: 12px 16px;
      background: linear-gradient(135deg, #111827 0%, #374151 100%);
      color: white;
      font-size: 14px;
      font-weight: 600;
    }

    .panel-body {
      padding: 16px;
    }

    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }

    .tab {
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid var(--spectrum-gray-300);
      background: var(--spectrum-gray-100);
      font-size: 11px;
      cursor: pointer;
    }

    .tab.active {
      background: var(--spectrum-blue-500);
      border-color: var(--spectrum-blue-500);
      color: white;
    }

    .row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin: 8px 0;
    }

    .input {
      flex: 1;
      min-width: 180px;
      padding: 8px 10px;
      border: 1px solid var(--spectrum-gray-300);
      border-radius: 6px;
      font-size: 12px;
    }

    .btn {
      padding: 8px 12px;
      border-radius: 6px;
      border: none;
      background: var(--spectrum-blue-500);
      color: white;
      font-size: 12px;
      cursor: pointer;
    }

    .card {
      background: var(--spectrum-gray-100);
      border: 1px solid var(--spectrum-gray-300);
      border-radius: 6px;
      padding: 10px;
      font-size: 12px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .mono {
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 11px;
      white-space: pre-wrap;
    }

    .event-log {
      max-height: 160px;
      overflow: auto;
      background: var(--spectrum-gray-100);
      border: 1px solid var(--spectrum-gray-300);
      border-radius: 6px;
      padding: 8px;
      font-size: 11px;
    }

    .event-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid var(--spectrum-gray-300);
    }

    .event-row:last-child {
      border-bottom: none;
    }

    .event-type {
      font-weight: 600;
      color: var(--spectrum-blue-600);
    }

    .progress {
      height: 6px;
      background: var(--spectrum-gray-200);
      border-radius: 6px;
      overflow: hidden;
      margin-top: 8px;
    }

    .progress-fill {
      height: 100%;
      background: var(--spectrum-blue-500);
      width: 0%;
      transition: width 0.3s ease;
    }
  `;

  @property({ type: String }) agentUrl = 'http://localhost:10003';
  @property({ type: Object }) content: ContentSuggestion | null = null;

  @state() private activeDemo:
    | 'workflow'
    | 'governance'
    | 'component'
    | 'dam'
    | 'personalize'
    | 'xf' = 'workflow';

  @state() private prompt = 'Hero banner for summer sale';
  @state() private governanceResult: any = null;
  @state() private governanceStreaming = false;
  @state() private componentSchema: any = null;
  @state() private damResult: any = null;
  @state() private personas = 'Executive,Developer,Marketer';
  @state() private personalization: any = null;
  @state() private localization: any = null;
  @state() private xfResult: any = null;
  @state() private componentType = 'hero';
  @state() private damQuery = 'adventure';
  @state() private guidedMode = false;
  @state() private guidedStep = 0;
  @state() private guidedRunning = false;
  @state() private guidedEvents: Array<{ type: string; label: string; ts: string }> = [];

  private guidedSteps = [
    'Orchestrate workflow (AG-UI streaming)',
    'Run governance checks (brand + SEO)',
    'Assemble DAM assets',
    'Load component schema',
    'Generate personalization + localization',
    'Generate experience fragment',
  ];

  render() {
    return html`
      <div class="panel">
        <div class="panel-header">AG‑UI / A2UI Demo Hub</div>
        <div class="panel-body">
          <div class="tabs">
            ${this.renderTab('workflow', 'Workflow Orchestration')}
            ${this.renderTab('governance', 'Governance')}
            ${this.renderTab('component', 'Component Config')}
            ${this.renderTab('dam', 'DAM Assembly')}
            ${this.renderTab('personalize', 'Personalization')}
            ${this.renderTab('xf', 'Experience Fragments')}
          </div>

          ${this.renderGuidedStory()}

          ${this.activeDemo === 'workflow' ? this.renderWorkflow() : ''}
          ${this.activeDemo === 'governance' ? this.renderGovernance() : ''}
          ${this.activeDemo === 'component' ? this.renderComponentSchema() : ''}
          ${this.activeDemo === 'dam' ? this.renderDamAssembly() : ''}
          ${this.activeDemo === 'personalize' ? this.renderPersonalization() : ''}
          ${this.activeDemo === 'xf' ? this.renderXf() : ''}
        </div>
      </div>
    `;
  }

  private renderTab(id: DemoHub['activeDemo'], label: string) {
    return html`
      <button
        class="tab ${this.activeDemo === id ? 'active' : ''}"
        @click=${() => (this.activeDemo = id)}
      >
        ${label}
      </button>
    `;
  }

  private renderWorkflow() {
    return html`
      <div class="row">
        <input class="input" .value=${this.prompt} @input=${this.onPromptInput} />
        <button class="btn" @click=${this.startWorkflowDemo}>Start</button>
      </div>
      <streaming-content
        .agentUrl=${this.agentUrl}
        .componentType=${this.componentType}
        .prompt=${this.prompt}
      ></streaming-content>
    `;
  }

  private renderGovernance() {
    return html`
      <div class="row">
        <button class="btn" @click=${this.runGovernance}>Run Check</button>
        <button class="btn" @click=${this.startGovernanceStream}>Stream Compliance</button>
      </div>
      ${this.governanceStreaming ? html`
        <streaming-content
          id="governance-stream"
          .agentUrl=${this.agentUrl}
        ></streaming-content>
      ` : ''}
      ${this.governanceResult
        ? html`
            <div class="grid">
              <div class="card">
                <div><strong>Brand Score:</strong> ${this.governanceResult.brand?.score ?? '-'}</div>
                <div class="mono">${JSON.stringify(this.governanceResult.brand?.issues || [], null, 2)}</div>
              </div>
              <div class="card">
                <div><strong>SEO Score:</strong> ${this.governanceResult.seo?.score ?? '-'}</div>
                <div class="mono">${JSON.stringify(this.governanceResult.seo?.issues || [], null, 2)}</div>
              </div>
            </div>
          `
        : html`<div class="card">Provide content and run a check.</div>`}
    `;
  }

  private renderComponentSchema() {
    return html`
      <div class="row">
        <input class="input" .value=${this.componentType} @input=${this.onComponentTypeInput} />
        <button class="btn" @click=${this.loadComponentSchema}>Load Schema</button>
      </div>
      ${this.componentSchema
        ? html`<div class="card mono">${JSON.stringify(this.componentSchema, null, 2)}</div>`
        : html`<div class="card">Load the schema for a component type.</div>`}
    `;
  }

  private renderDamAssembly() {
    return html`
      <div class="row">
        <input class="input" .value=${this.damQuery} @input=${this.onDamQueryInput} />
        <button class="btn" @click=${this.loadDamAssembly}>Search</button>
      </div>
      ${this.damResult
        ? html`<div class="card mono">${JSON.stringify(this.damResult, null, 2)}</div>`
        : html`<div class="card">Search DAM assets and view selection.</div>`}
    `;
  }

  private renderPersonalization() {
    return html`
      <div class="row">
        <input class="input" .value=${this.personas} @input=${this.onPersonasInput} />
        <button class="btn" @click=${this.runPersonalization}>Generate</button>
      </div>
      ${this.personalization
        ? html`<div class="card mono">${JSON.stringify(this.personalization, null, 2)}</div>`
        : html`<div class="card">Generate persona variants from content.</div>`}
      ${this.localization
        ? html`<div class="card mono">${JSON.stringify(this.localization, null, 2)}</div>`
        : ''}
    `;
  }

  private renderXf() {
    return html`
      <div class="row">
        <button class="btn" @click=${this.generateXf}>Generate XF</button>
      </div>
      ${this.xfResult
        ? html`<div class="card mono">${JSON.stringify(this.xfResult, null, 2)}</div>`
        : html`<div class="card">Generate a demo XF entry.</div>`}
    `;
  }

  private renderGuidedStory() {
    const progressPct = Math.round(((this.guidedStep + 1) / this.guidedSteps.length) * 100);
    return html`
      <div class="card" style="margin-bottom: 12px;">
        <div style="display:flex; justify-content: space-between; align-items:center;">
          <strong>Guided Story</strong>
          <div>
            <button class="btn" @click=${this.toggleGuided}>
              ${this.guidedMode ? 'Stop' : 'Start'} Guided
            </button>
          </div>
        </div>
        <div class="mono" style="margin-top: 8px;">
          Step ${this.guidedStep + 1} of ${this.guidedSteps.length}: ${this.guidedSteps[this.guidedStep]}
        </div>
        <div class="progress">
          <div class="progress-fill" style="width: ${progressPct}%;"></div>
        </div>
        <div class="row" style="margin-top: 8px;">
          <button class="btn" @click=${this.runGuidedStep} ?disabled=${!this.guidedMode || this.guidedRunning}>
            ${this.guidedRunning ? 'Running...' : 'Run Step'}
          </button>
          <button class="btn" @click=${this.nextGuidedStep} ?disabled=${!this.guidedMode}>
            Next
          </button>
          <button class="btn" @click=${this.resetGuided} ?disabled=${!this.guidedMode}>
            Reset
          </button>
        </div>
        <div class="event-log" style="margin-top: 10px;">
          ${this.guidedEvents.length === 0 ? 'No guided events yet.' : ''}
          ${this.guidedEvents.map((e) => html`
            <div class="event-row">
              <span class="event-type">${e.type}</span>
              <span>${e.label}</span>
              <span>${e.ts}</span>
            </div>
          `)}
        </div>
      </div>
    `;
  }

  private onPromptInput(e: Event) {
    this.prompt = (e.target as HTMLInputElement).value;
  }

  private onComponentTypeInput(e: Event) {
    this.componentType = (e.target as HTMLInputElement).value;
  }

  private onDamQueryInput(e: Event) {
    this.damQuery = (e.target as HTMLInputElement).value;
  }

  private onPersonasInput(e: Event) {
    this.personas = (e.target as HTMLInputElement).value;
  }

  private startWorkflowDemo() {
    const streamer = this.shadowRoot?.querySelector('streaming-content') as any;
    if (streamer) {
      streamer.startStreaming(this.prompt, this.componentType, true);
    }
  }

  /**
   * Run the governance checks as a one-shot request.
   */
  private async runGovernance() {
    if (!this.content) return;
    const response = await fetch(`${this.agentUrl}/demo/governance/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: this.content }),
    });
    if (response.ok) {
      this.governanceResult = await response.json();
    }
  }

  /**
   * Stream governance checks via AG-UI events.
   */
  private async startGovernanceStream() {
    if (!this.content) return;
    this.governanceStreaming = true;
    await this.updateComplete;
    const streamer = this.shadowRoot?.getElementById('governance-stream') as any;
    if (streamer) {
      streamer.startGovernanceStreaming(this.content);
    }
  }

  private async loadComponentSchema() {
    const response = await fetch(`${this.agentUrl}/demo/component-schema?type=${encodeURIComponent(this.componentType)}`);
    if (response.ok) {
      this.componentSchema = await response.json();
    }
  }

  private async loadDamAssembly() {
    const response = await fetch(`${this.agentUrl}/demo/dam-assembly?query=${encodeURIComponent(this.damQuery)}`);
    if (response.ok) {
      this.damResult = await response.json();
    }
  }

  private async runPersonalization() {
    if (!this.content) return;
    const personaList = this.personas.split(',').map((p) => p.trim()).filter(Boolean);
    const response = await fetch(`${this.agentUrl}/demo/personalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: this.content, personas: personaList }),
    });
    if (response.ok) {
      this.personalization = await response.json();
    }

    const localization = await fetch(`${this.agentUrl}/demo/localize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: this.content, languages: ['es-ES', 'fr-FR'] }),
    });
    if (localization.ok) {
      this.localization = await localization.json();
    }
  }

  private async generateXf() {
    const response = await fetch(`${this.agentUrl}/demo/xf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: this.content?.title || 'Experience Fragment' }),
    });
    if (response.ok) {
      this.xfResult = await response.json();
    }
  }

  /**
   * Start the guided narrative and reset to the first step.
   */
  private toggleGuided() {
    this.guidedMode = !this.guidedMode;
    if (this.guidedMode) {
      this.guidedStep = 0;
      this.activeDemo = 'workflow';
      this.emitGuidedEvent('GUIDED_STARTED', { step: this.guidedStep });
    } else {
      this.emitGuidedEvent('GUIDED_STOPPED', { step: this.guidedStep });
    }
  }

  /**
   * Reset guided narrative state.
   */
  private resetGuided() {
    this.guidedStep = 0;
    this.activeDemo = 'workflow';
    this.emitGuidedEvent('GUIDED_RESET', { step: this.guidedStep });
  }

  /**
   * Move to the next guided step.
   */
  private nextGuidedStep() {
    if (this.guidedStep < this.guidedSteps.length - 1) {
      this.guidedStep += 1;
    }
    this.setActiveDemoForStep();
    this.emitGuidedEvent('GUIDED_STEP_CHANGED', { step: this.guidedStep });
  }

  private setActiveDemoForStep() {
    const map: Record<number, DemoHub['activeDemo']> = {
      0: 'workflow',
      1: 'governance',
      2: 'dam',
      3: 'component',
      4: 'personalize',
      5: 'xf',
    };
    this.activeDemo = map[this.guidedStep] || 'workflow';
  }

  /**
   * Execute the current guided step and advance on completion.
   */
  private async runGuidedStep() {
    this.setActiveDemoForStep();
    this.guidedRunning = true;
    this.emitGuidedEvent('GUIDED_STEP_STARTED', { step: this.guidedStep });
    switch (this.guidedStep) {
      case 0:
        this.startWorkflowDemo();
        // allow stream to start
        await this.delay(500);
        break;
      case 1:
        await this.runGovernance();
        break;
      case 2:
        await this.loadDamAssembly();
        break;
      case 3:
        await this.loadComponentSchema();
        break;
      case 4:
        await this.runPersonalization();
        break;
      case 5:
        await this.generateXf();
        break;
      default:
        break;
    }
    this.emitGuidedEvent('GUIDED_STEP_FINISHED', { step: this.guidedStep });
    this.guidedRunning = false;

    if (this.guidedMode && this.guidedStep < this.guidedSteps.length - 1) {
      this.guidedStep += 1;
      this.setActiveDemoForStep();
      this.emitGuidedEvent('GUIDED_STEP_CHANGED', { step: this.guidedStep });
    }
  }

  private emitGuidedEvent(type: string, data: Record<string, unknown>) {
    const ts = new Date().toLocaleTimeString();
    this.guidedEvents = [
      { type, label: this.guidedSteps[this.guidedStep], ts },
      ...this.guidedEvents,
    ].slice(0, 20);
    window.dispatchEvent(new CustomEvent('aem-guided-event', {
      detail: {
        type,
        data: {
          ...data,
          label: this.guidedSteps[this.guidedStep],
          timestamp: ts,
        },
      },
    }));
    this.dispatchEvent(new CustomEvent('guided-event', {
      detail: {
        type,
        data: {
          ...data,
          label: this.guidedSteps[this.guidedStep],
        },
      },
      bubbles: true,
      composed: true,
    }));
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'demo-hub': DemoHub;
  }
}
