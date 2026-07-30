import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './content-wizard';

const meta: Meta = {
  title: 'Components/ContentWizard',
  component: 'content-wizard',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A 3-step guided wizard for creating AEM content. Users select component type, customize tone/style, and generate content.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="height: 600px; padding: 20px; background: var(--spectrum-gray-100);">
      <content-wizard @generate=${(e: CustomEvent) => console.log('Generate event:', e.detail)}></content-wizard>
    </div>
  `,
};

export const Step1ComponentSelection: Story = {
  name: 'Step 1: Component Selection',
  render: () => html`
    <div style="height: 600px; padding: 20px; background: var(--spectrum-gray-100);">
      <content-wizard></content-wizard>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'First step shows a grid of 20 component types across 7 categories (Marketing, Content, Commerce, Media, Navigation, Interactive, Social).',
      },
    },
  },
};

export const WithCategoryFilter: Story = {
  name: 'With Category Filter',
  render: () => html`
    <div style="height: 600px; padding: 20px; background: var(--spectrum-gray-100);">
      <content-wizard></content-wizard>
      <p style="margin-top: 16px; font-size: 12px; color: #666;">
        Click category chips to filter components: All, Marketing, Content, Commerce, Media, Navigation, Interactive,
        Social
      </p>
    </div>
  `,
};

export const ResponsiveLayout: Story = {
  name: 'Responsive Layout',
  render: () => html`
    <div style="max-width: 480px; height: 600px; padding: 12px; background: var(--spectrum-gray-100); margin: 0 auto;">
      <content-wizard></content-wizard>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'The wizard adapts to smaller screens with adjusted grid layouts and touch-friendly interactions.',
      },
    },
  },
};
