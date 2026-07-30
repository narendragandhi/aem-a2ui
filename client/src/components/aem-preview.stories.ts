import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './aem-preview';

const meta: Meta = {
  title: 'Components/AemPreview',
  component: 'aem-preview',
  tags: ['autodocs'],
  argTypes: {
    viewMode: {
      control: 'select',
      options: ['preview', 'edit', 'structure'],
      description: 'View mode for the preview (Preview, Edit with component chrome, Structure/JCR tree)',
    },
    sections: {
      control: 'object',
      description: 'Array of page sections with content',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'AEM authoring environment simulation with Preview, Edit (component chrome), and Structure (JCR tree) modes. Includes responsive device preview.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const mockSections = [
  {
    id: 'nav-1',
    type: 'navigation',
    content: { title: 'Navigation', description: '' },
    status: 'ready' as const,
  },
  {
    id: 'hero-1',
    type: 'hero',
    content: {
      id: 'hero-1',
      title: 'Transform Your Business Today',
      subtitle: 'Enterprise solutions that scale with your needs',
      description: 'Discover powerful tools designed for modern teams',
      ctaText: 'Get Started',
      ctaUrl: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
      componentType: 'hero',
    },
    status: 'ready' as const,
  },
  {
    id: 'teaser-1',
    type: 'teaser',
    content: {
      id: 'teaser-1',
      title: 'Streamline Your Workflow',
      description:
        'Our platform integrates seamlessly with your existing tools, reducing friction and increasing productivity.',
      ctaText: 'Learn More',
      ctaUrl: '#',
      imageUrl:
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
      componentType: 'teaser',
    },
    status: 'ready' as const,
  },
  {
    id: 'cta-1',
    type: 'cta',
    content: {
      id: 'cta-1',
      title: 'Ready to Get Started?',
      description: 'Join thousands of companies already using our platform',
      ctaText: 'Start Free Trial',
      ctaUrl: '#',
      componentType: 'cta',
    },
    status: 'ready' as const,
  },
  {
    id: 'footer-1',
    type: 'footer',
    content: { title: 'Footer', description: '' },
    status: 'ready' as const,
  },
];

export const PreviewMode: Story = {
  name: 'Preview Mode',
  args: {
    viewMode: 'preview',
    sections: mockSections,
  },
  render: (args) => html`
    <div style="height: 700px;">
      <aem-preview .viewMode=${args.viewMode} .sections=${args.sections}></aem-preview>
    </div>
  `,
};

export const EditMode: Story = {
  name: 'Edit Mode (Component Chrome)',
  args: {
    viewMode: 'edit',
    sections: mockSections,
  },
  render: (args) => html`
    <div style="height: 700px;">
      <aem-preview .viewMode=${args.viewMode} .sections=${args.sections}></aem-preview>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Edit mode shows AEM-style component chrome with edit/configure/delete actions when hovering components.',
      },
    },
  },
};

export const StructureMode: Story = {
  name: 'Structure View (JCR Tree)',
  args: {
    viewMode: 'structure',
    sections: mockSections,
  },
  render: (args) => html`
    <div style="height: 700px;">
      <aem-preview .viewMode=${args.viewMode} .sections=${args.sections}></aem-preview>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Structure view displays the JCR content tree with node paths and properties.',
      },
    },
  },
};

export const EmptyState: Story = {
  name: 'Empty State',
  args: {
    viewMode: 'preview',
    sections: [],
  },
  render: (args) => html`
    <div style="height: 400px;">
      <aem-preview .viewMode=${args.viewMode} .sections=${args.sections}></aem-preview>
    </div>
  `,
};

export const GeneratingState: Story = {
  name: 'Generating Content',
  args: {
    viewMode: 'preview',
    sections: [
      { id: 'hero-1', type: 'hero', content: null, status: 'generating' as const },
      { id: 'teaser-1', type: 'teaser', content: null, status: 'empty' as const },
    ],
  },
  render: (args) => html`
    <div style="height: 500px;">
      <aem-preview .viewMode=${args.viewMode} .sections=${args.sections}></aem-preview>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Shows loading spinner while content is being generated for a section.',
      },
    },
  },
};
