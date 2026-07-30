import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import './error-message';

const meta: Meta = {
  title: 'Components/ErrorMessage',
  component: 'error-message',
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: 'text',
      description: 'The error message to display.',
    },
  },
  args: {
    message: '',
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: (args) => html` <error-message .message=${args.message}></error-message> `,
};

export const WithMessage: Story = {
  args: {
    message: 'This is an example error message.',
  },
  render: (args) => html` <error-message .message=${args.message}></error-message> `,
};
