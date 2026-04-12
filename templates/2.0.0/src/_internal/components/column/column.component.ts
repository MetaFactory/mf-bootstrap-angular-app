import { Component, Input } from '@angular/core';

@Component({
   selector: 'app-column',
   standalone: false,
   templateUrl: './column.component.html',
   styleUrl: './column.component.css'
})
export class ColumnComponent {
   @Input() align: 'center' | 'flex-start' = 'center';
   @Input() gap: number = 0; // rem
}
