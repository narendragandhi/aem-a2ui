import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ContentSuggestion } from '../lib/types';

import './assistant-suggestions';

const meta: Meta = {
  title: 'Components/AssistantSuggestions',
  component: 'assistant-suggestions',
  tags: ['autodocs'],
  argTypes: {
    suggestions: {
      control: 'object',
      description: 'Array of content suggestions.',
    },
    selectedSuggestion: {
      control: 'object',
      description: 'The currently selected suggestion.',
    },
    error: {
      control: 'text',
      description: 'Error message to display.',
    },
  },
  args: {
    suggestions: [],
    selectedSuggestion: null,
    error: '',
  },
};

export default meta;

type Story = StoryObj;

const mockSuggestions: ContentSuggestion[] = [
  {
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
  },
  {
    id: '2',
    title: 'New Product Teaser',
    subtitle: 'Limited Edition',
    description: 'Catchy teaser for an upcoming gadget, emphasizing exclusivity and innovation.',
    ctaText: 'Learn More',
    ctaUrl: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06f163?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    imageAlt: 'Close-up of a new gadget',
    componentType: 'teaser',
  },
  {
    id: '3',
    title: 'Seasonal Product Card',
    subtitle: 'Cozy Winter Collection',
    description: 'Product card showcasing a warm winter sweater with compelling sales copy.',
    ctaText: 'View Product',
    ctaUrl: '#',
    imageUrl:
      'https://images.unsplash.com/photo-1523309015091-c16f283281b6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    imageAlt: 'Winter sweater on a model',
    componentType: 'product',
    price: '$79.99',
  },
];

export const Empty: Story = {
  render: (args) => html`
    <assistant-suggestions
      .suggestions=${args.suggestions}
      .selectedSuggestion=${args.selectedSuggestion}
      .error=${args.error}
    ></assistant-suggestions>
  `,
};

export const WithSuggestions: Story = {
  args: {
    suggestions: mockSuggestions,
  },
  render: (args) => html`
    <assistant-suggestions
      .suggestions=${args.suggestions}
      .selectedSuggestion=${args.selectedSuggestion}
      .error=${args.error}
    ></assistant-suggestions>
  `,
};

export const WithSelectedSuggestion: Story = {
  args: {
    suggestions: mockSuggestions,
    selectedSuggestion: mockSuggestions[0],
  },
  render: (args) => html`
    <assistant-suggestions
      .suggestions=${args.suggestions}
      .selectedSuggestion=${args.selectedSuggestion}
      .error=${args.error}
    ></assistant-suggestions>
  `,
};

export const WithError: Story = {
  args: {
    error: 'Failed to fetch suggestions. Please try again later.',
  },
  render: (args) => html`
    <assistant-suggestions
      .suggestions=${args.suggestions}
      .selectedSuggestion=${args.selectedSuggestion}
      .error=${args.error}
    ></assistant-suggestions>
  `,
};
