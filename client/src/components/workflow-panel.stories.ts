import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './workflow-panel';

const meta: Meta = {
  title: 'Components/WorkflowPanel',
  component: 'workflow-panel',
  tags: ['autodocs'],
  argTypes: {
    contentId: {
      control: 'text',
      description: 'ID of the content to submit to workflow',
    },
    contentPath: {
      control: 'text',
      description: 'AEM path where content will be published',
    },
    currentUser: {
      control: 'text',
      description: 'Current user ID',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Panel for submitting approved content to AEM workflows. Shows workflow model selection, progress tracking, and step management.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  name: 'Workflow Selection',
  args: {
    contentId: 'content-123',
    contentPath: '/content/aem-demo/pages/summer-sale',
    currentUser: 'demo-user',
  },
  render: (args) => html`
    <div style="max-width: 400px; padding: 20px;">
      <workflow-panel
        .contentId=${args.contentId}
        .contentPath=${args.contentPath}
        .currentUser=${args.currentUser}
        @workflow-started=${(e: CustomEvent) => console.log('Workflow started:', e.detail)}
      ></workflow-panel>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story:
          'Shows available workflow models (Request for Publication, Request for Activation, Review and Approve, Translation Request) for selection.',
      },
    },
  },
};

export const RequiresApproval: Story = {
  name: 'Content Not Approved',
  args: {
    contentId: 'content-456',
    currentUser: 'demo-user',
  },
  render: (args) => html`
    <div style="max-width: 400px; padding: 20px;">
      <workflow-panel
        .contentId=${args.contentId}
        .currentUser=${args.currentUser}
        .review=${{ status: 'pending_review' }}
      ></workflow-panel>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Displays info message when content must be approved before workflow submission.',
      },
    },
  },
};

export const WithApprovedReview: Story = {
  name: 'With Approved Review',
  args: {
    contentId: 'content-789',
    contentPath: '/content/aem-demo/pages/product-launch',
    currentUser: 'demo-user',
  },
  render: (args) => html`
    <div style="max-width: 400px; padding: 20px;">
      <workflow-panel
        .contentId=${args.contentId}
        .contentPath=${args.contentPath}
        .currentUser=${args.currentUser}
        .review=${{ status: 'approved', approvedBy: 'Content Manager', approvedAt: new Date().toISOString() }}
      ></workflow-panel>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'When review is approved, the Submit to Workflow button becomes enabled.',
      },
    },
  },
};
