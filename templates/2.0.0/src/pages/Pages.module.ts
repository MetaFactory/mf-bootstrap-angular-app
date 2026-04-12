import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CommonComponentsModule } from '@common/components/common-components.module';
import { AccountComponent } from './account/account.component';

@NgModule({
   imports: [CommonComponentsModule, CommonModule],
   declarations: [AccountComponent]
})
export class PagesModule {}
