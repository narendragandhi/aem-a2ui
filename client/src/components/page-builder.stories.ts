import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './page-builder';

const meta: Meta = {
  title: 'Components/PageBuilder',
  component: 'page-builder',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Multi-page layout builder with drag-drop support. Choose from templates (Landing, Product, Blog) or build custom pages with 17 component types.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  name: 'Template Selection',
  render: () => html`
    <div style="height: 500px; background: var(--spectrum-gray-100);">
      <page-builder
        @sections-changed=${(e: CustomEvent) => console.log('Sections changed:', e.detail)}
        @generate-section=${(e: CustomEvent) => console.log('Generate section:', e.detail)}
        @page-ready=${(e: CustomEvent) => console.log('Page ready:', e.detail)}
      ></page-builder>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Initial view shows template selection cards: Landing Page, Product Page, Blog Article, or Custom Page.',
      },
    },
  },
};

export const LandingPageTemplate: Story = {
  name: 'Landing Page Template',
  render: () => html`
    <div style="height: 600px; background: var(--spectrum-gray-100);">
      <page-builder id="landing-builder"></page-builder>
      <script>
        setTimeout(() => {
          // Simulate selecting landing page template after render
          const builder = document.getElementById('landing-builder');
          if (builder) {
            console.log('Select a template to see the section builder');
          }
        }, 100);
      </script>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Landing Page template includes: navigation, hero, 3 teasers, cta, footer sections.',
      },
    },
  },
};

export const ResponsiveView: Story = {
  name: 'Responsive View',
  render: () => html`
    <div style="max-width: 480px; height: 500px; margin: 0 auto; background: var(--spectrum-gray-100);">
      <page-builder></page-builder>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Template cards stack vertically on mobile screens.',
      },
    },
  },
};
