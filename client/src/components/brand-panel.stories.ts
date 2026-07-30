import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './brand-panel';

const meta: Meta = {
  title: 'Components/BrandPanel',
  component: 'brand-panel',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Collapsible panel displaying brand guidelines. Shows voice/tone, colors, value pillars, and example headlines loaded from brand-config.json.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <div style="max-width: 400px; padding: 20px;">
      <brand-panel></brand-panel>
    </div>
  `,
};

export const Collapsed: Story = {
  name: 'Collapsed State',
  render: () => html`
    <div style="max-width: 400px; padding: 20px;">
      <brand-panel></brand-panel>
      <p style="margin-top: 16px; font-size: 12px; color: #666;">
        Click the header to expand and view brand guidelines
      </p>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'By default, the panel shows a compact header with brand name and "Active & Loaded" status indicator.',
      },
    },
  },
};

export const InSidebar: Story = {
  name: 'In Sidebar Context',
  render: () => html`
    <div style="width: 320px; background: var(--spectrum-gray-50); padding: 16px; border-radius: 8px;">
      <h3 style="margin: 0 0 16px 0; font-size: 14px;">Configuration</h3>
      <brand-panel></brand-panel>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Shows how the brand panel appears in a typical sidebar layout.',
      },
    },
  },
};
