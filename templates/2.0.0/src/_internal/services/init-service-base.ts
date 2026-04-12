import { GeneralService, StoreServiceBase } from '.';
import { FormSchema, NavItem, PathAuthority } from '../types';
import { UserService } from './user/user.service';

export type InitServiceContext = {
   generalService: GeneralService;
   userService: UserService;
   storeService: StoreServiceBase;
   appNavItems: NavItem[];
   appAuthorities?: PathAuthority[];
};

export abstract class InitServiceBase {
   /**
    * In implementation call baseInit in first line
    */
   abstract init(cn: InitServiceContext): void;

   async baseInit(cn: InitServiceContext, dynamicForms: FormSchema[]) {
      if (!(await cn.userService.init(cn.storeService))) {
         return false;
      }

      await cn.generalService.init({
         storeService: cn.storeService,
         dynamicForms,
         appNavItems: cn.appNavItems,
         appAuthorities: cn.appAuthorities,
         userService: cn.userService
      });

      return true;
   }
}
