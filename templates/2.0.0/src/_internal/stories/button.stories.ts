import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from 'src/components/button/button.component';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<ButtonComponent> = {
   title: 'Components/Button',
   component: ButtonComponent,
   tags: ['autodocs'],
   argTypes: {
      variant: {
         control: 'color'
      }
   },
   // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
   args: {}
};

export default meta;
type Story = StoryObj<ButtonComponent>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
   args: {
      variant: 'contained'
   }
};

export const Secondary: Story = {
   args: {
      variant: 'contained'
   }
};

export const Medium: Story = {
   args: {
      variant: 'contained',
      size: 'md',
      endIcon: 'home'
   }
};

export const Small: Story = {
   args: {
      variant: 'contained',
      size: 'sm'
   }
};
