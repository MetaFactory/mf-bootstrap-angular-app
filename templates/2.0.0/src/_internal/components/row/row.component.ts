import { Component, Input } from '@angular/core';

@Component({
   selector: 'app-row',
   standalone: false,
   templateUrl: './row.component.html',
   styleUrl: './row.component.css'
})
export class RowComponent {
   @Input() align: 'left' | 'right' | 'center' | 'space-between' = 'left';

   /**
    * The gap between the items in the row. (rem)
    * @default 0.5
    */
   @Input() gap: number = 0.5; // rem
   @Input() wrap?: boolean;
}
