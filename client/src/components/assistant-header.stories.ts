import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './assistant-header';

const meta: Meta = {
  title: 'Components/AssistantHeader',
  component: 'assistant-header',
  tags: ['autodocs'],
  argTypes: {
    agentUrl: {
      control: 'text',
      description: 'The URL of the selected agent.',
    },
    isAI: {
      control: 'boolean',
      description: 'Whether the selected agent is AI-powered.',
    },
    agents: {
      control: 'object',
      description: 'Array of available agents.',
    },
  },
  args: {
    agentUrl: 'http://localhost:10003',
    isAI: true,
    agents: [
      { name: 'Java Agent + Ollama', url: 'http://localhost:10003', port: 10003, hasAI: true },
      { name: 'Python Agent', url: 'http://localhost:10002', port: 10002, hasAI: false },
    ],
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <assistant-header .agentUrl=${args.agentUrl} .isAI=${args.isAI} .agents=${args.agents}></assistant-header>
  `,
};
