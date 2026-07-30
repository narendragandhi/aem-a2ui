import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './aem-status';

const meta: Meta = {
  title: 'Components/AemStatus',
  component: 'aem-status',
  tags: ['autodocs'],
  argTypes: {
    showLabel: {
      control: 'boolean',
      description: 'Whether to show the AEM label text',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Connection status indicator for AEM. Shows green (connected), red (disconnected), or gray (disabled) dot with expandable details panel.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  name: 'With Label',
  args: {
    showLabel: true,
  },
  render: (args) => html`
    <div style="padding: 20px; background: var(--spectrum-gray-100);">
      <aem-status .showLabel=${args.showLabel}></aem-status>
    </div>
  `,
};

export const CompactMode: Story = {
  name: 'Compact (No Label)',
  args: {
    showLabel: false,
  },
  render: (args) => html`
    <div style="padding: 20px; background: var(--spectrum-gray-100);">
      <aem-status .showLabel=${args.showLabel}></aem-status>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Compact mode showing only the status dot, useful for tight header layouts.',
      },
    },
  },
};

export const InHeader: Story = {
  name: 'In Header Context',
  args: {
    showLabel: true,
  },
  render: (args) => html`
    <header
      style="
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 24px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
    "
    >
      <div style="font-size: 18px; font-weight: 600;">AEM Content Assistant</div>
      <div style="display: flex; align-items: center; gap: 16px;">
        <aem-status .showLabel=${args.showLabel}></aem-status>
        <button style="padding: 8px 16px; background: #1473e6; color: white; border: none; border-radius: 4px;">
          Settings
        </button>
      </div>
    </header>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Shows the status indicator positioned in a typical application header.',
      },
    },
  },
};

export const ClickToExpand: Story = {
  name: 'Click to Expand',
  args: {
    showLabel: true,
  },
  render: (args) => html`
    <div style="padding: 40px; background: var(--spectrum-gray-100);">
      <p style="margin-bottom: 20px; font-size: 13px; color: #666;">
        Click the status indicator to see connection details and test the connection.
      </p>
      <aem-status .showLabel=${args.showLabel}></aem-status>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'The status indicator expands on click to show: Connection status, Integration enabled/disabled, Author URL, Test Connection button, and Open AEM link.',
      },
    },
  },
};

export const MultipleInstances: Story = {
  name: 'Multiple Instances',
  render: () => html`
    <div style="padding: 20px; background: var(--spectrum-gray-100);">
      <div style="display: flex; gap: 24px; align-items: center;">
        <div>
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">With Label</div>
          <aem-status .showLabel=${true}></aem-status>
        </div>
        <div>
          <div style="font-size: 11px; color: #666; margin-bottom: 4px;">Compact</div>
          <aem-status .showLabel=${false}></aem-status>
        </div>
      </div>
    </div>
  `,
};
