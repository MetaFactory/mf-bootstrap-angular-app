import { Component, Input } from '@angular/core';

@Component({
   selector: 'app-report-card-container',
   standalone: false,
   templateUrl: './report-card-container.component.html',
   styleUrl: './report-card-container.component.scss'
})
export class ReportCardContainerComponent {
   @Input() title!: string;
}
