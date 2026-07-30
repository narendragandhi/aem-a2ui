import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import type { ContentSuggestion, Review } from '../lib/types.js';

import './review-panel';

const meta: Meta = {
  title: 'Components/ReviewPanel',
  component: 'review-panel',
  tags: ['autodocs'],
  argTypes: {
    contentId: {
      control: 'text',
      description: 'ID of the content being reviewed',
    },
    currentUser: {
      control: 'text',
      description: 'Current user ID',
    },
    currentUserName: {
      control: 'text',
      description: 'Display name of current user',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Content review panel with status tracking, reviewers list, approve/reject actions, and activity timeline.',
      },
    },
  },
};

export default meta;

type Story = StoryObj;

const mockContent: ContentSuggestion = {
  id: 'content-1',
  title: 'Summer Sale Hero Banner',
  subtitle: 'Up to 50% Off',
  description: 'A vibrant hero banner for the summer sale campaign',
  ctaText: 'Shop Now',
  ctaUrl: '/sale',
  imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961c3e',
  componentType: 'hero',
};

export const NoReview: Story = {
  name: 'No Review Started',
  args: {
    contentId: 'content-new',
    currentUser: 'demo-user',
    currentUserName: 'Demo User',
  },
  render: (args) => html`
    <div style="max-width: 400px; padding: 20px;">
      <review-panel
        .contentId=${args.contentId}
        .content=${mockContent}
        .currentUser=${args.currentUser}
        .currentUserName=${args.currentUserName}
        @review-started=${(e: CustomEvent) => console.log('Review started:', e.detail)}
      ></review-panel>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Empty state prompting user to start a new review.',
      },
    },
  },
};

export const PendingReview: Story = {
  name: 'Pending Review',
  args: {
    contentId: 'content-123',
    currentUser: 'demo-user',
    currentUserName: 'Demo User',
  },
  render: (args) => html`
    <div style="max-width: 400px; padding: 20px;">
      <review-panel
        .contentId=${args.contentId}
        .content=${mockContent}
        .currentUser=${args.currentUser}
        .currentUserName=${args.currentUserName}
      ></review-panel>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Review in pending status with reviewers list and action buttons.',
      },
    },
  },
};

export const ApprovedReview: Story = {
  name: 'Approved Review',
  args: {
    contentId: 'content-approved',
    currentUser: 'demo-user',
    currentUserName: 'Demo User',
  },
  render: (args) => html`
    <div style="max-width: 400px; padding: 20px;">
      <review-panel
        .contentId=${args.contentId}
        .content=${mockContent}
        .currentUser=${args.currentUser}
        .currentUserName=${args.currentUserName}
        @review-approved=${(e: CustomEvent) => console.log('Review approved:', e.detail)}
      ></review-panel>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Shows approved status with timeline showing approval activity.',
      },
    },
  },
};

export const WithComments: Story = {
  name: 'With Comments',
  args: {
    contentId: 'content-commented',
    currentUser: 'demo-user',
    currentUserName: 'Demo User',
  },
  render: (args) => html`
    <div style="max-width: 400px; padding: 20px;">
      <review-panel
        .contentId=${args.contentId}
        .content=${mockContent}
        .currentUser=${args.currentUser}
        .currentUserName=${args.currentUserName}
        @open-comments=${(e: CustomEvent) => console.log('Open comments:', e.detail)}
      ></review-panel>
    </div>
  `,
  parameters: {
    docs: {
      description: {
        story: 'Shows comment count with link to view full comment thread.',
      },
    },
  },
};
