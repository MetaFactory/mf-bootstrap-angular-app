import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
   selector: 'app-chart-card',
   standalone: false,
   templateUrl: './chart-card.component.html',
   styleUrl: './chart-card.component.scss'
})
export class ChartCardComponent {
   @Input() config?: any;
   @Input() title!: string;

   @ViewChild('chart') chartRef!: ElementRef<HTMLCanvasElement>;
   chart!: Chart;

   ngAfterViewInit(): void {
      this.chart = new Chart(this.chartRef.nativeElement, this.config);
   }
}
