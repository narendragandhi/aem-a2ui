import { expect } from 'chai';
import { html, fixture } from '@open-wc/testing';
import { ErrorMessage } from './error-message.js';
import './error-message.js';

describe('ErrorMessage', () => {
  let element: ErrorMessage;

  it('should not render if message is empty', async () => {
    element = await fixture(html`<error-message message=""></error-message>`);
    const div = element.shadowRoot?.querySelector('.error-message');
    expect(div).to.not.exist;
  });

  it('should render the error message if message is provided', async () => {
    element = await fixture(html`<error-message message="Test Error"></error-message>`);
    const div = element.shadowRoot?.querySelector('.error-simple');
    expect(div).to.exist;
    expect(div?.textContent).to.include('Test Error');
  });
});
