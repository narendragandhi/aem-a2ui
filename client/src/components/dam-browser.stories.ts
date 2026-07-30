import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './dam-browser';

const meta: Meta = {
  title: 'Components/DamBrowser',
  component: 'dam-browser',
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the browser modal is open',
    },
    mimeTypeFilter: {
      control: 'text',
      description: 'Optional MIME type filter (e.g., "image/*")',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Modal browser for selecting assets from AEM DAM. Features folder navigation, search, type filtering, and grid/list views.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  name: 'Open Browser',
  args: {
    open: true,
  },
  render: (args) => html`
    <dam-browser
      .open=${args.open}
      @close=${() => console.log('Browser closed')}
      @asset-selected=${(e: CustomEvent) => console.log('Asset selected:', e.detail)}
    ></dam-browser>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Full DAM browser modal with folder sidebar, asset grid, and selection controls.',
      },
    },
  },
};

export const Closed: Story = {
  name: 'Closed State',
  args: {
    open: false,
  },
  render: (args) => html`
    <div style="padding: 20px;">
      <p>The DAM browser is currently closed. Set open=true to display.</p>
      <dam-browser .open=${args.open}></dam-browser>
    </div>
  `,
};

export const WithTypeFilter: Story = {
  name: 'Image Type Filter',
  args: {
    open: true,
    mimeTypeFilter: 'image/*',
  },
  render: (args) => html`
    <dam-browser
      .open=${args.open}
      .mimeTypeFilter=${args.mimeTypeFilter}
      @close=${() => console.log('Browser closed')}
      @asset-selected=${(e: CustomEvent) => console.log('Asset selected:', e.detail)}
    ></dam-browser>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Browser with type filter chips: All, Images, Videos, Documents.',
      },
    },
  },
};

export const WithTriggerButton: Story = {
  name: 'With Trigger Button',
  render: () => {
    return html`
      <div style="padding: 20px;">
        <button
          id="open-dam-btn"
          style="padding: 10px 20px; background: #1473e6; color: white; border: none; border-radius: 4px; cursor: pointer;"
          onclick="document.getElementById('dam-browser-story').open = true"
        >
          Browse DAM Assets
        </button>
        <dam-browser
          id="dam-browser-story"
          .open=${false}
          @close=${() => {
            const browser = document.getElementById('dam-browser-story') as any;
            if (browser) browser.open = false;
          }}
          @asset-selected=${(e: CustomEvent) => {
            console.log('Asset selected:', e.detail);
            alert('Selected: ' + e.detail.asset.name);
          }}
        ></dam-browser>
      </div>
    `;
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing how to trigger the DAM browser from a button click.',
      },
    },
  },
};

export const Disconnected: Story = {
  name: 'AEM Disconnected',
  args: {
    open: true,
  },
  render: (args) => html`
    <dam-browser .open=${args.open} @close=${() => console.log('Browser closed')}></dam-browser>
  `,
  parameters: {
    docs: {
      description: {
        story: 'When AEM is not connected, shows a friendly disconnected message instead of the asset browser.',
      },
    },
  },
};
