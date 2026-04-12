import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonComponentsModule } from '../components/common-components.module';
import { BarChartCardComponent } from './bar-chart-card/bar-chart-card.component';
import { ChartCardComponent } from './chart-card/chart-card.component';
import { OverviewReportComponent } from './overview-report/overview-report.component';
import { ReportCardContainerComponent } from './report-card-container/report-card-container.component';

@NgModule({
   imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      RouterModule,
      TranslateModule,
      CommonComponentsModule
   ],
   declarations: [
      BarChartCardComponent,
      ReportCardContainerComponent,
      ChartCardComponent,
      OverviewReportComponent
   ]
})
export class ReportComponentsModule {}
