import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProgressStatus } from '../../types';

@Component({
   selector: 'app-progress-status',
   standalone: false,
   templateUrl: './progress-status.component.html',
   styleUrl: './progress-status.component.scss'
})
export class ProgressStatusComponent {
   @Input() status: ProgressStatus = 'idle';
   @Input() failureMessage = 'Something went wrong.';
   @Input() retryMessage = '(Try again!)';
   @Output() retry = new EventEmitter();
}
