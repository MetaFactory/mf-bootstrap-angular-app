import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { GeneralService } from '../../../services/general';
import { GeneralState } from '../../../services/general/general.state';
import { NavItem } from '../../../types';

@Component({
   selector: 'app-sidebar',
   standalone: false,
   templateUrl: './sidebar.component.html',
   styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
   @Input() items!: NavItem[];

   // From Redux
   general$!: BehaviorSubject<GeneralState>;

   constructor(private generalService: GeneralService) {
      this.general$ = this.generalService.select<GeneralState>((state) => state);
   }
}
