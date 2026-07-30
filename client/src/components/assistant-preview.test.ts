import { expect } from 'chai';
import sinon from 'sinon';
import { html, fixture, waitUntil } from '@open-wc/testing';
import { AssistantPreview } from './assistant-preview.js';
import './assistant-preview.js';
import { ContentSuggestion } from '../lib/types.js';

describe('AssistantPreview', () => {
  let element: AssistantPreview;
  const content: ContentSuggestion = {
    id: '1',
    title: 'Suggestion 1',
    description: 'Description 1',
    ctaText: 'CTA 1',
    ctaUrl: '#',
    imageUrl: '#',
    componentType: 'hero',
  };

  beforeEach(async () => {
    element = await fixture(html`<assistant-preview .appliedContent=${content}></assistant-preview>`);
  });

  it('should render the preview', () => {
    const h2 = element.shadowRoot?.querySelector('h2');
    expect(h2).to.exist;
    expect(h2?.textContent).to.include('Live Component Preview');
  });

  it('should dispatch a copy-content event when the copy html button is clicked', async () => {
    const spy = sinon.spy();
    element.addEventListener('copy-content', spy);
    const button = element.shadowRoot?.querySelector('.preview-action-btn');
    (button as HTMLElement)?.click();
    await waitUntil(() => spy.called);
    expect(spy).to.have.been.calledOnce;
    const event = spy.getCall(0).args[0] as CustomEvent;
    expect(event.detail.format).to.equal('html');
  });

  it('should dispatch a copy-content event when the copy json button is clicked', async () => {
    const spy = sinon.spy();
    element.addEventListener('copy-content', spy);
    const buttons = element.shadowRoot?.querySelectorAll('.preview-action-btn');
    if (buttons && buttons.length > 1) {
      // Added null check and length check
      (buttons[1] as HTMLElement)?.click();
    }
    await waitUntil(() => spy.called);
    expect(spy).to.have.been.calledOnce;
    const event = spy.getCall(0).args[0] as CustomEvent;
    expect(event.detail.format).to.equal('json');
  });
});
