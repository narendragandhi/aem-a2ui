import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

interface Agent {
  name: string;
  url: string;
  port: number;
  hasAI: boolean;
}

@customElement('assistant-header')
export class AssistantHeader extends LitElement {
  @property({ type: Array }) agents: Agent[] = [];
  @property({ type: String }) agentUrl = '';
  @property({ type: Boolean }) isAI = true;

  static styles = css`
    .header {
      background: var(--header-bg);
      color: var(--header-text);
      padding: 16px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .header-logo {
      width: 28px;
      height: 28px;
      background: var(--card-background);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: var(--primary-color);
      font-size: 14px;
    }

    .agent-selector {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .agent-selector select {
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      font-size: 13px;
      background: rgba(255, 255, 255, 0.2);
      color: var(--header-text);
      cursor: pointer;
    }

    .agent-selector select option {
      color: var(--text-color);
    }

    .ai-badge {
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.25);
      font-weight: 500;
    }

    .theme-toggle-btn {
      background: none;
      border: none;
      color: var(--header-text);
      font-size: 20px;
      cursor: pointer;
      margin-left: 10px;
    }

    @media (max-width: 600px) {
      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .agent-selector {
        width: 100%;
        justify-content: space-between;
      }

      .agent-selector select {
        flex-grow: 1;
      }
    }
  `;

  render() {
    return html`
      <div class="header">
        <h1>
          <span class="header-logo">🏭</span>
          AEM Component Factory
        </h1>
        <div class="agent-selector">
          <select @change=${this.handleAgentChange}>
            ${this.agents.map(
              (agent) => html`
                <option value=${agent.url} ?selected=${agent.url === this.agentUrl}>${agent.name}</option>
              `,
            )}
          </select>
          <span class="ai-badge">${this.isAI ? 'AI Powered' : 'Template Mode'}</span>
          <button class="theme-toggle-btn" @click=${this.toggleTheme}>&#9788;</button>
        </div>
      </div>
    `;
  }

  private toggleTheme() {
    this.dispatchEvent(
      new CustomEvent('toggle-theme', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private handleAgentChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const agent = this.agents.find((a) => a.url === select.value);
    if (agent) {
      this.dispatchEvent(
        new CustomEvent('agent-changed', {
          detail: { agent },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'assistant-header': AssistantHeader;
  }
  interface Agent {
    name: string;
    url: string;
    port: number;
    hasAI: boolean;
  }
}
