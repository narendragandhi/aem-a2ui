import { expect } from 'chai';
import sinon from 'sinon';
import { html, fixture, waitUntil } from '@open-wc/testing';
import { AssistantSuggestions } from './assistant-suggestions.js';
import './assistant-suggestions.js';
import { ContentSuggestion } from '../lib/types.js';

describe('AssistantSuggestions', () => {
  let element: AssistantSuggestions;
  const suggestions: ContentSuggestion[] = [
    {
      id: '1',
      title: 'Suggestion 1',
      description: 'Description 1',
      ctaText: 'CTA 1',
      ctaUrl: '#',
      imageUrl: '#',
      componentType: 'hero',
    },
    {
      id: '2',
      title: 'Suggestion 2',
      description: 'Description 2',
      ctaText: 'CTA 2',
      ctaUrl: '#',
      imageUrl: '#',
      componentType: 'teaser',
    },
  ];

  beforeEach(async () => {
    element = await fixture(html`<assistant-suggestions .suggestions=${suggestions}></assistant-suggestions>`);
  });

  it('should render the suggestions', () => {
    const suggestionCards = element.shadowRoot?.querySelectorAll('.suggestion-card');
    expect(suggestionCards).to.have.lengthOf(2);
  });

  it('should dispatch a suggestion-selected event when a suggestion is clicked', async () => {
    const spy = sinon.spy();
    element.addEventListener('suggestion-selected', spy);
    const suggestionCard = element.shadowRoot?.querySelector('.suggestion-card');
    (suggestionCard as HTMLElement)?.click();
    await waitUntil(() => spy.called);
    expect(spy).to.have.been.calledOnce;
    const event = spy.getCall(0).args[0] as CustomEvent;
    expect(event.detail.suggestion.id).to.equal('1');
  });

  it('should dispatch a suggestion-applied event when the apply button is clicked', async () => {
    const spy = sinon.spy();
    element.addEventListener('suggestion-applied', spy);
    const applyButton = element.shadowRoot?.querySelector('.btn-apply');
    (applyButton as HTMLElement)?.click();
    await waitUntil(() => spy.called);
    expect(spy).to.have.been.calledOnce;
    const event = spy.getCall(0).args[0] as CustomEvent;
    expect(event.detail.suggestion.id).to.equal('1');
  });

  it('should dispatch a copy-suggestion event when the copy button is clicked', async () => {
    const spy = sinon.spy();
    element.addEventListener('copy-suggestion', spy);
    const copyButton = element.shadowRoot?.querySelector('.btn-copy');
    (copyButton as HTMLElement)?.click();
    await waitUntil(() => spy.called);
    expect(spy).to.have.been.calledOnce;
    const event = spy.getCall(0).args[0] as CustomEvent;
    expect(event.detail.suggestion.id).to.equal('1');
  });
});
