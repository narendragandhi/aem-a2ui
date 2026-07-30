import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './assistant-input';

const meta: Meta = {
  title: 'Components/AssistantInput',
  component: 'assistant-input',
  tags: ['autodocs'],
  argTypes: {
    prompt: {
      control: 'text',
      description: 'The current input prompt.',
    },
    loading: {
      control: 'boolean',
      description: 'Whether content generation is in progress.',
    },
  },
  args: {
    prompt: '',
    loading: false,
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: (args) => html` <assistant-input .prompt=${args.prompt} .loading=${args.loading}></assistant-input> `,
};

export const Loading: Story = {
  args: {
    loading: true,
  },
  render: (args) => html` <assistant-input .prompt=${args.prompt} .loading=${args.loading}></assistant-input> `,
};

export const WithPrompt: Story = {
  args: {
    prompt: 'Create a hero banner for a new product launch',
  },
  render: (args) => html` <assistant-input .prompt=${args.prompt} .loading=${args.loading}></assistant-input> `,
};
