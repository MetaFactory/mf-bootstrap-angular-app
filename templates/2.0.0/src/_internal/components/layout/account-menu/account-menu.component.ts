import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { changePasswordAction } from '../../../schema/change-password.schema';
import {
   ConfigService,
   GeneralService,
   GeneralState,
   StoreServiceBase,
   UserService
} from '../../../services';
import { SelectOption, Theme } from '../../../types';

@Component({
   selector: 'app-account-menu',
   standalone: false,
   templateUrl: './account-menu.component.html',
   styleUrl: './account-menu.component.scss'
})
export class AccountMenuComponent implements OnChanges {
   @Input() store!: StoreServiceBase;
   @Output() close = new EventEmitter<unknown>();
   title = '';
   email = '';
   version = '';

   // From Redux
   general$!: BehaviorSubject<GeneralState>;

   constructor(
      private router: Router,
      private userService: UserService,
      private generalService: GeneralService,
      private config: ConfigService,
      public translate: TranslateService
   ) {
      this.general$ = this.generalService.select<GeneralState>((state) => state);
      this.version = this.config.value.version;
   }

   ngOnChanges(changes: SimpleChanges): void {
      if (changes['store'] && this.store) {
         this.store
            .select((state) => state.user.account)
            .subscribe((account) => {
               if (account) {
                  this.title = account.firstName + ' ' + account.lastName;
                  this.email = account.email;
               }
            });
      }
   }

   get hasUserPreference() {
      return !!this.config.value.userPreferenceAction;
   }

   handlePreferences() {
      this.close.emit();
      this.generalService.processAction(this.config.value.userPreferenceAction!, {});
   }

   handleChangePassword() {
      this.close.emit();
      this.generalService.processAction(changePasswordAction, {});
   }

   handleUserProfile() {
      this.close.emit();
      if (!this.config.value.userProfileAction)
         throw "Configuration error: 'userProfileAction' is not set in the configuration.";

      this.generalService.processAction(this.config.value.userProfileAction!, {});
   }

   closeAndNavigate(ev: MouseEvent, href: string) {
      ev.preventDefault();
      ev.stopPropagation();

      this.close.emit();
      // Use a short delay to ensure the `close.emit()` is processed before navigation
      setTimeout(() => {
         this.router.navigate([href]);
      }, 10);
   }

   logout() {
      this.userService.logout();
   }

   chooseLanguage(language: SelectOption) {
      this.generalService.switchLanguage(String(language.id));
      this.close.emit();
   }

   selectTheme(theme: Theme) {
      this.generalService.setTheme(theme);
   }
}
