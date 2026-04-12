import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CommonComponentsModule } from 'src/components/common-components.module';
import { InputTimeComponent } from 'src/components/input-time/input-time.component';
import { ConfigService } from 'src/services';

const mockConfigService = {
   value: {}
};

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
   title: 'Components/Input Time',
   component: InputTimeComponent,
   tags: ['autodocs'],
   argTypes: {},
   // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
   args: {},
   decorators: [
      moduleMetadata({
         imports: [
            CommonComponentsModule // Import the module where app-icon-button is declared
         ],
         providers: [
            { provide: ConfigService, useValue: mockConfigService } // Use an appropriate mock or value for testing
         ]
      })
   ]
} satisfies Meta<InputTimeComponent>;

type Story = StoryObj<InputTimeComponent>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
   args: {}
};
