import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { EntityService, getCurrentPageFilter } from '..';
import { ToastifyService } from '../../components';
import {
   ApplicationError,
   Entity,
   EntityListItemDto,
   FormAction,
   FormActionContext,
   FormSchema,
   NavItem,
   PathAuthority,
   Theme
} from '../../types';
import { cloneSchema, isDark, writeLocalStorage } from '../../utils';
import { StoreServiceBase } from '../store-service-base';
import { UserService } from '../user';
import {
   activeNotificationsCountSet,
   collapseSidebarSet,
   detailsSectionPathSet,
   isDarkSet,
   isMobileSet,
   messageBoxSet,
   navItemsSet,
   setDefaults,
   themeSet
} from './general.reducer';
import { GeneralState } from './general.state';

type InitParams = {
   storeService: StoreServiceBase;
   userService: UserService;
   dynamicForms: FormSchema[];
   appNavItems: NavItem[];
   appAuthorities?: PathAuthority[];
};

@Injectable({
   providedIn: 'root'
})
export class GeneralService {
   store!: StoreServiceBase;
   dynamicForms!: FormSchema[];
   freeFormModal$ = new Subject<FormActionContext | null>();
   private refreshMainPanelSubject = new Subject<void>();
   private darkModeMediaQuery!: MediaQueryList;
   refreshMainPanel$ = this.refreshMainPanelSubject.asObservable();

   constructor(
      private injector: Injector,
      private translate: TranslateService,
      private router: Router,
      private toastify: ToastifyService
   ) {
      this.handleSystemThemeChange();
   }

   handleSystemThemeChange() {
      this.darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      // Listen for changes in the system theme
      this.darkModeMediaQuery.addEventListener('change', (e) => {
         const {
            general: { theme }
         } = this.store.getState();
         this.store.dispatch(isDarkSet(theme === 'system' ? e.matches : theme === 'dark'));
      });
   }

   refreshMainPanel() {
      this.refreshMainPanelSubject.next();
   }

   async init({
      storeService,
      userService,
      dynamicForms,
      appAuthorities,
      appNavItems
   }: InitParams) {
      this.store = storeService;
      this.dynamicForms = dynamicForms;

      const allowedNavItems = appNavItems.filter((item) => {
         const allowed = userService.checkPathAuthority(appAuthorities || [], item.path);
         if (!allowed) {
            return false;
         }

         // Apply the permission check for the sub items
         item.items = item.items?.filter((item) =>
            userService.checkPathAuthority(appAuthorities || [], item.path)
         );

         return true;
      });
      this.store.dispatch(navItemsSet(allowedNavItems));
   }

   select<STATE>(selector: (state: STATE) => unknown) {
      if (!this.store) {
         throw 'GeneralService is not initialized yet (store is empty)!';
      }
      return this.store.select((state: any) => selector(state.general));
   }

   setIsMobile(isMobile: boolean) {
      this.store.dispatch(isMobileSet(isMobile));
   }

   setActiveNotificationsCount(count: number) {
      this.store.dispatch(activeNotificationsCountSet(count));
   }

   navigateDetailsSection(path: string) {
      this.store.dispatch(detailsSectionPathSet(path));
   }

   closeDetailsSection() {
      this.store.dispatch(detailsSectionPathSet(''));
      this.refreshMainPanel();
   }

   openModal(cn: FormActionContext) {
      this.freeFormModal$.next(cn);
   }

   setTheme(theme: Theme) {
      writeLocalStorage('theme', theme);
      this.store.dispatch(themeSet(theme));
      this.store.dispatch(isDarkSet(isDark(theme)));
   }

   closeModal() {
      this.freeFormModal$.next(null);
      this.refreshMainPanel();
   }

   toggleSidebar() {
      const {
         general: { collapseSidebar }
      } = this.store.store.getState();

      this.store.dispatch(collapseSidebarSet(!collapseSidebar));
   }

   getDetailsFormSchema() {
      const {
         general: { detailsSectionPath }
      } = this.store.store.getState();

      if (!detailsSectionPath) return null;
      const segments = detailsSectionPath.split('/');
      if (segments.length < 2) {
         throw 'Invalid details form path: ' + detailsSectionPath;
      }
      const itemId = segments[segments.length - 1]; // last part
      const entity = segments.slice(0, segments.length - 1).join('/');

      const schema = this.dynamicForms.find((schema) =>
         itemId ? schema.path === `${entity}/:id` : schema.path === entity
      );

      if (!schema) {
         console.error('Sorry! We could not find a schema for the address: ' + detailsSectionPath);
      }

      return { schema };
   }

   getState() {
      return this.store.getState();
   }

   async processAction(action: FormAction, cn: Partial<FormActionContext>) {
      const serviceName = action.schema?.serviceName || cn.schema?.serviceName || cn.serviceName; // Pick action serviceName if provided, otherwise context serviceName
      if (!serviceName) {
         console.error(
            'processAction failed. serviceName is expected either in the action or the context. action:',
            action
         );
         console.debug('action context:', cn);
         throw `processAction failed.`;
      }

      const schema = action.schema ?? cn.schema; // Pick action schema if provided, otherwise the context schema

      const actionContext: FormActionContext = {
         ...cn,
         serviceName,
         service: EntityService.entityServices[serviceName],
         filter: cn.filter || getCurrentPageFilter(serviceName),
         schema,
         injector: this.injector
      };

      switch (action.command) {
         case 'view-item':
            if (cn.isInDetailsArea) {
               return;
            } else if (!cn.record) {
               this.closeDetailsSection();
            } else if (actionContext.serviceName) {
               const itemPath = actionContext.serviceName + '/' + cn.record!.id;
               if (action.standalone) {
                  this.router.navigate([itemPath]);
               } else {
                  this.navigateDetailsSection(itemPath);
               }
            }
            break;

         case 'export-excel':
            await actionContext.service!.exportToExcel(actionContext.schema!);
            break;

         case 'new-item':
            this.navigateDetailsSection(actionContext.serviceName + '/new');
            break;

         default:
            if (action.handler) {
               try {
                  await action.handler(actionContext);
               } catch (err) {
                  if (err instanceof ApplicationError) {
                     this.showMessageBox(err.message);
                  } else {
                     console.debug(`Failure in action '${action.title}' handler.`);
                     this.toastify.failure('Something went wrong!');
                  }
                  return;
               }
            } else if (action.schema) {
               try {
                  actionContext.schema = action.schema;

                  await actionContext.schema.onInit?.(actionContext);

                  if (actionContext.schema.onSchemaUpdate) {
                     const schema = cloneSchema(actionContext.schema);
                     await actionContext.schema!.onSchemaUpdate!(actionContext, schema);
                     actionContext.schema = schema;
                  }
               } catch (err) {
                  if (err instanceof ApplicationError) {
                     this.showMessageBox(err.message);
                  } else {
                     console.debug(
                        `Failure in action '${action.title ?? action.schema.title}' onInit.`
                     );
                     this.toastify.failure('Something went wrong!');
                  }
                  return;
               }
               this.openModal(actionContext);
               return; // return to prevent calling actionContext.onReloadSection
            } else {
               // Do nothing
            }
      }

      await actionContext.reloadSection?.();
   }

   /**
    * Returns EntityService by name
    * @param serviceName
    */
   getEntityService<
      ITEM extends EntityListItemDto = EntityListItemDto,
      ENTITY extends Entity = Entity
   >(serviceName: string) {
      const service = EntityService.entityServices[serviceName];
      if (!service) {
         throw `AutoService '${serviceName}' not found!`;
      }
      return service;
   }

   setDefaults(defaults: Partial<GeneralState>) {
      this.store.dispatch(setDefaults(defaults));
   }

   showMessageBox(message: string) {
      this.store.dispatch(messageBoxSet(message));
   }

   hideMessageBox() {
      this.store.dispatch(messageBoxSet(''));
   }

   switchLanguage(language: string) {
      localStorage.setItem('language', language);
      this.translate.use(language);
   }
}
