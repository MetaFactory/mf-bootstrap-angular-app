import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigService, StoreServiceBase } from '../../../services';
import { GeneralService } from '../../../services/general';
import { GeneralState } from '../../../services/general/general.state';

@Component({
   selector: 'app-toolbar',
   standalone: false,
   templateUrl: './toolbar.component.html',
   styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
   @Input() store!: StoreServiceBase;
   @Input() showSidebarIndicator: boolean = false;
   isAccountMenuVisible = false;
   isDark = false;
   logo = '';

   // From Redux
   general$!: BehaviorSubject<GeneralState>;

   constructor(
      private generalService: GeneralService,
      private configService: ConfigService
   ) {
      this.general$ = this.generalService.select<GeneralState>((state) => state);
      this.general$.subscribe((value) => {
         this.isDark = value.isDark;
         this.logo = this.isDark
            ? this.configService.value.darkLogo
            : this.configService.value.lightLogo;
      });
   }

   hideAccountMenu() {
      this.isAccountMenuVisible = false;
   }

   handleClick(ev: MouseEvent) {
      ev.preventDefault();
      if (!this.general$.value.isMobile) {
         this.isAccountMenuVisible = true;
      } else {
         location.href = this.general$.value.accountUrlMobile;
      }
   }

   toggleSidebar() {
      this.generalService.toggleSidebar();
   }
}
