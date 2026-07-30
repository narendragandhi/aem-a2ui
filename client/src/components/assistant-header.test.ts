import { expect } from 'chai';
import sinon from 'sinon';
import { html, fixture, waitUntil } from '@open-wc/testing';
import { AssistantHeader } from './assistant-header.js';
import './assistant-header.js';

describe('AssistantHeader', () => {
  let element: AssistantHeader;
  const agents = [
    { name: 'Java Agent + Ollama', url: 'http://localhost:10003', port: 10003, hasAI: true },
    { name: 'Python Agent', url: 'http://localhost:10002', port: 10002, hasAI: false },
  ];

  beforeEach(async () => {
    element = await fixture(html`<assistant-header .agents=${agents}></assistant-header>`);
  });

  it('should render the header', () => {
    const h1 = element.shadowRoot?.querySelector('h1');
    expect(h1).to.exist;
    expect(h1?.textContent).to.include('AEM Component Factory');
  });

  it('should dispatch an agent-changed event when the selection changes', async () => {
    const spy = sinon.spy();
    element.addEventListener('agent-changed', spy);
    const select = element.shadowRoot?.querySelector('select');
    if (select) {
      select.value = 'http://localhost:10002';
      select.dispatchEvent(new Event('change'));
    }
    await waitUntil(() => spy.called);
    expect(spy).to.have.been.calledOnce;
    const event = spy.getCall(0).args[0] as CustomEvent;
    expect(event.detail.agent.url).to.equal('http://localhost:10002');
  });
});
