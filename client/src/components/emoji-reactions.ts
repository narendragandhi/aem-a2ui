import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

const REACTIONS = ['👍', '👎', '❤️', '🎉', '🤔', '👀', '🔥', '💯'];

@customElement('emoji-reactions')
export class EmojiReactions extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--spectrum-font-family-base, 'Adobe Clean', sans-serif);
    }

    .reactions-container {
      position: absolute;
      top: -40px;
      right: 0;
      display: flex;
      align-items: center;
      gap: 4px;
      z-index: 60;
    }

    .reaction {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--spectrum-gray-100);
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      cursor: pointer;
      transition:
        transform 0.15s,
        background 0.15s;
      position: relative;
    }

    .reaction:hover {
      transform: scale(1.15);
      background: var(--spectrum-gray-200);
    }

    .reaction-count {
      position: absolute;
      bottom: -4px;
      right: -4px;
      background: var(--spectrum-blue-500);
      color: white;
      font-size: 10px;
      font-weight: 600;
      min-width: 16px;
      height: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }

    .reaction.own {
      background: var(--spectrum-blue-100);
    }

    .emoji-picker {
      position: absolute;
      top: -50px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      padding: 8px;
      display: flex;
      gap: 4px;
      opacity: 0;
      visibility: hidden;
      transition:
        opacity 0.2s,
        visibility 0.2s;
    }

    .emoji-picker.visible {
      opacity: 1;
      visibility: visible;
    }

    .emoji-btn {
      width: 36px;
      height: 36px;
      border-radius: 6px;
      border: none;
      background: var(--spectrum-gray-100);
      font-size: 18px;
      cursor: pointer;
      transition: background 0.15s;
    }

    .emoji-btn:hover {
      background: var(--spectrum-gray-200);
    }

    .add-reaction {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--spectrum-gray-100);
      border: 2px dashed var(--spectrum-gray-300);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: var(--spectrum-gray-500);
      cursor: pointer;
      transition: all 0.15s;
    }

    .add-reaction:hover {
      background: var(--spectrum-gray-200);
      border-color: var(--spectrum-gray-400);
    }
  `;

  @property({ type: Array }) reactions: Array<{ emoji: string; count: number; sessionIds: string[] }> = [];
  @property({ type: String }) currentUserId = '';
  @state() private showPicker = false;

  private togglePicker() {
    this.showPicker = !this.showPicker;
  }

  private addReaction(emoji: string) {
    this.dispatchEvent(
      new CustomEvent('react', {
        detail: { emoji },
        bubbles: true,
        composed: true,
      }),
    );
    this.showPicker = false;
  }

  private removeReaction(emoji: string) {
    this.dispatchEvent(
      new CustomEvent('unreact', {
        detail: { emoji },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render() {
    return html`
      <div class="reactions-container">
        <div class="emoji-picker ${this.showPicker ? 'visible' : ''}">
          ${REACTIONS.map(
            (emoji) => html` <button class="emoji-btn" @click=${() => this.addReaction(emoji)}>${emoji}</button> `,
          )}
        </div>

        ${this.reactions.map((r) => {
          const isOwn = r.sessionIds.includes(this.currentUserId);
          return html`
            <div
              class="reaction ${isOwn ? 'own' : ''}"
              @click=${() => (isOwn ? this.removeReaction(r.emoji) : this.addReaction(r.emoji))}
            >
              ${r.emoji} ${r.count > 1 ? html`<span class="reaction-count">${r.count}</span>` : ''}
            </div>
          `;
        })}

        <div class="add-reaction" @click=${this.togglePicker}>+</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'emoji-reactions': EmojiReactions;
  }
}
