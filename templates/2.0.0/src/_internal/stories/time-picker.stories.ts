import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { CommonComponentsModule } from 'src/components/common-components.module';
import { TimePickerComponent } from 'src/components/time-picker/time-picker.component';
import { ConfigService } from 'src/services';

const mockConfigService = {
   getConfig: () => ({
      /* mock config data */
   })
};

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
   title: 'Components/Time Picker',
   component: TimePickerComponent,
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
} satisfies Meta<TimePickerComponent>;

type Story = StoryObj<TimePickerComponent>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
   args: {}
};
