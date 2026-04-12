import { Component, ElementRef, ViewChild } from '@angular/core';
import Chart from 'chart.js/auto';
import { Utils } from '../chart-card/utils.service';

@Component({
   selector: 'app-overview-report',
   standalone: false,
   templateUrl: './overview-report.component.html',
   styleUrl: './overview-report.component.scss'
})
export class OverviewReportComponent {
   @ViewChild('chart') chartRef!: ElementRef<HTMLCanvasElement>;
   ngAfterViewInit(): void {
      new Chart(this.chartRef.nativeElement, {} as any); // Workaround: Needed for initializing the charts
   }

   get amiBookedHours() {
      const data = {
         labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'],
         datasets: [
            {
               label: 'Dataset',
               data: Utils.numbers({ count: 6, min: -100, max: 100 }),
               borderColor: Utils.CHART_COLORS.red,
               backgroundColor: Utils.CHART_COLORS.red,
               pointStyle: 'circle',
               pointRadius: 10,
               pointHoverRadius: 15
            }
         ]
      };

      const config = {
         type: 'line',
         data: data,
         options: {
            responsive: true
         }
      };

      return config;
   }
}
