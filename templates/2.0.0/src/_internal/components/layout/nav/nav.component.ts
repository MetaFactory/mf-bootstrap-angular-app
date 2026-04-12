import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GeneralService, GeneralState } from '../../../services';
import { NavItem } from '../../../types';

@Component({
   selector: 'app-nav',
   standalone: false,
   templateUrl: './nav.component.html',
   styleUrl: './nav.component.scss'
})
export class NavComponent {
   @Input() items!: NavItem[];
   @Input() selectedPath?: string;

   general$!: BehaviorSubject<GeneralState>;

   constructor(private generalService: GeneralService) {
      this.general$ = this.generalService.select<GeneralState>((state) => state);
   }
}
