import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ContentSuggestion } from '../lib/types';

import './assistant-preview';

const meta: Meta = {
  title: 'Components/AssistantPreview',
  component: 'assistant-preview',
  tags: ['autodocs'],
  argTypes: {
    appliedContent: {
      control: 'object',
      description: 'The content suggestion to display in the preview.',
    },
  },
  args: {
    appliedContent: null,
  },
};

export default meta;

type Story = StoryObj;

const mockContent: ContentSuggestion = {
  id: '1',
  title: 'Summer Sale Hero',
  subtitle: 'Up to 50% off!',
  description: 'A vibrant hero banner for your summer sale, featuring beach imagery and clear call to action.',
  ctaText: 'Shop Now',
  ctaUrl: '#',
  imageUrl:
    'https://images.unsplash.com/photo-1507525428034-b723cf961c3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  imageAlt: 'Beach with palm trees',
  componentType: 'hero',
};

const mockProductContent: ContentSuggestion = {
  id: '2',
  title: 'Cozy Winter Sweater',
  subtitle: 'New Collection',
  description: 'Stay warm and stylish with our new cozy winter sweater. Made from 100% organic cotton.',
  ctaText: 'Buy Now',
  ctaUrl: '#',
  imageUrl:
    'https://images.unsplash.com/photo-1523309015091-c16f283281b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  imageAlt: 'Winter sweater on a model',
  componentType: 'product',
  price: '$79.99',
};

const mockTeaserContent: ContentSuggestion = {
  id: '3',
  title: 'Limited Edition Gadget',
  subtitle: 'Unleash Your Potential',
  description: 'Discover the future with our revolutionary new gadget. Limited stock available.',
  ctaText: 'Discover',
  ctaUrl: '#',
  imageUrl:
    'https://images.unsplash.com/photo-1505740420928-5e560c06f163?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  imageAlt: 'Close-up of a new gadget',
  componentType: 'teaser',
};

const mockBannerContent: ContentSuggestion = {
  id: '4',
  title: 'New Feature Rollout',
  subtitle: 'Experience the Difference',
  description: 'Our latest update brings powerful new features to enhance your workflow.',
  ctaText: 'Learn More',
  ctaUrl: '#',
  imageUrl:
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
  imageAlt: 'Abstract tech background',
  componentType: 'banner',
};

export const Empty: Story = {
  render: (args) => html` <assistant-preview .appliedContent=${args.appliedContent}></assistant-preview> `,
};

export const HeroPreview: Story = {
  args: {
    appliedContent: mockContent,
  },
  render: (args) => html` <assistant-preview .appliedContent=${args.appliedContent}></assistant-preview> `,
};

export const ProductPreview: Story = {
  args: {
    appliedContent: mockProductContent,
  },
  render: (args) => html` <assistant-preview .appliedContent=${args.appliedContent}></assistant-preview> `,
};

export const TeaserPreview: Story = {
  args: {
    appliedContent: mockTeaserContent,
  },
  render: (args) => html` <assistant-preview .appliedContent=${args.appliedContent}></assistant-preview> `,
};

export const BannerPreview: Story = {
  args: {
    appliedContent: mockBannerContent,
  },
  render: (args) => html` <assistant-preview .appliedContent=${args.appliedContent}></assistant-preview> `,
};
