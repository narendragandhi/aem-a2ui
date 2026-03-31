import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('telemetry-panel')
export class TelemetryPanel extends LitElement {
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
      padding: 10px 14px;
      background: var(--spectrum-gray-100);
      font-size: 13px;
      font-weight: 600;
      color: var(--spectrum-gray-800);
    }

    .panel-body {
      padding: 12px 14px;
    }

    .btn {
      padding: 6px 10px;
      border-radius: 6px;
      border: none;
      background: var(--spectrum-blue-500);
      color: white;
      font-size: 11px;
      cursor: pointer;
    }

    .mono {
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 11px;
      white-space: pre-wrap;
    }
  `;

  @property({ type: String }) agentUrl = 'http://localhost:10003';

  @state() private summary: any = null;
  @state() private events: any[] = [];

  connectedCallback() {
    super.connectedCallback();
    this.refresh();
  }

  render() {
    return html`
      <div class="panel">
        <div class="panel-header">Telemetry</div>
        <div class="panel-body">
          <button class="btn" @click=${this.refresh}>Refresh</button>
          <div class="mono" style="margin-top: 10px;">
            ${this.summary ? JSON.stringify(this.summary, null, 2) : 'No summary'}
          </div>
          <div class="mono" style="margin-top: 10px;">
            ${this.events.length ? JSON.stringify(this.events, null, 2) : 'No events'}
          </div>
        </div>
      </div>
    `;
  }

  private async refresh() {
    const summary = await fetch(`${this.agentUrl}/telemetry/summary`);
    if (summary.ok) {
      this.summary = await summary.json();
    }
    const events = await fetch(`${this.agentUrl}/telemetry/events`);
    if (events.ok) {
      this.events = await events.json();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'telemetry-panel': TelemetryPanel;
  }
}
