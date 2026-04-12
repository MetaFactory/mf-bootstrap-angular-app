import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { InitServiceBase, InitServiceContext } from '@common/services';
import { dynamicForms } from 'src/app';
import { config } from 'src/config';

@Injectable({
   providedIn: 'root'
})
export class InitService extends InitServiceBase {
   constructor(private router: Router) {
      super();
   }

   override async init(cn: InitServiceContext) {
      try {
         if (!(await this.baseInit(cn, dynamicForms as any))) {
            return;
         }
         cn.generalService.setDefaults({
            loginTitle: config.loginTitle,
            notificationLink: config.notificationLink,
            languages: config.languages,
            accountUrlMobile: config.accountUrlMobile
         });
      } catch (ex) {
         console.error(ex); // Handling error is needed
      }
   }
}
