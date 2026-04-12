import { Component, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router, Scroll } from '@angular/router';
import markdownit from 'markdown-it';
import { BehaviorSubject, filter } from 'rxjs';
import { StoreServiceBase } from '../../services';
import { GeneralService } from '../../services/general';
import { GeneralState } from '../../services/general/general.state';
import { UserService } from '../../services/user';
import { FormActionContext, FormSchema, NavItem } from '../../types';
const md = markdownit({ html: true });

@Component({
   selector: 'app-layout',
   standalone: false,
   providers: [],
   templateUrl: './layout.component.html',
   styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
   store!: StoreServiceBase;
   showSidebar = false;
   sidebarItems: NavItem[] = [];
   selectedNavPath = '';

   // details panel
   detailsSchema?: FormSchema;
   detailsPanelPath?: string;

   // modal
   freeFormModal: FormActionContext | null = null;

   // From Redux
   general$!: BehaviorSubject<GeneralState>;
   messageBox$!: BehaviorSubject<string>;

   constructor(
      userService: UserService,
      private router: Router,
      public generalService: GeneralService,
      private renderer: Renderer2
   ) {
      this.store = userService.storeService!;

      // To improve the performance, replace below line with specific property (e.g. messageBox)
      this.general$ = this.generalService.select<GeneralState>((state) => state);
      this.messageBox$ = this.generalService.select<GeneralState>((state) => state.messageBox);
   }

   handleCloseModal() {
      this.generalService.closeModal();
   }

   handleCloseDetailsPanel() {
      this.generalService.refreshMainPanel();
   }

   async ngOnInit() {
      this.generalService.freeFormModal$.subscribe((freeFormModal) => {
         this.freeFormModal = freeFormModal;
      });

      this.general$.subscribe((general) => {
         const param = this.generalService.getDetailsFormSchema();
         this.detailsSchema = param?.schema;
         this.detailsPanelPath = general.detailsSectionPath;

         // filter sub items based on user authorities
         for (const item of general.navItems) {
            if (item.items) {
               item.items.forEach((subItem) => {
                  //! todo: fix this. It's readonly
                  // subItem.hidden = !this.userService.checkPathAuthority(subItem.path);
               });
            }
         }

         // Apply theming

         this.renderer.addClass(document.documentElement, general.isDark ? 'dark' : 'light');
         this.renderer.removeClass(document.documentElement, !general.isDark ? 'dark' : 'light');
         this.renderer.setStyle(
            document.documentElement,
            'color-scheme',
            general.isDark ? 'dark' : 'light'
         );
      });

      this.router.events.subscribe((event) => {
         if (event instanceof NavigationEnd) {
            this.generalService.closeDetailsSection();
         }
      });

      this.router.events
         .pipe(filter((event) => event instanceof NavigationEnd || event instanceof Scroll))
         .subscribe((event) => {
            if (event instanceof NavigationEnd) {
               // change navigation
               this.findSubmenu(event.urlAfterRedirects);
            } else if (event instanceof Scroll) {
               // First navigation
               this.findSubmenu(event.routerEvent.url);
            }
         });

      // Prevent Zoom on mobile
      document.addEventListener('gesturestart', function (event) {
         event.preventDefault();
      });
   }

   findSubmenu(url: string): void {
      this.selectedNavPath = '';
      this.showSidebar = false;

      for (const item of this.general$.value.navItems) {
         if (item.path && item.items) {
            const subMenu = item.items.find((subItem) => subItem.path && url == subItem.path);
            if (subMenu) {
               this.selectedNavPath = item.path;
               this.sidebarItems = item.items;
               this.showSidebar = true;
               return;
            }
         }
      }

      // we didn't find a submenu, check matching with top level menu
      for (const item of this.general$.value.navItems) {
         if (item.path && url.startsWith(item.path)) {
            this.selectedNavPath = item.path;
            if (item.items) {
               this.sidebarItems = item.items;
               this.showSidebar = true;
            }
            return;
         }
      }
   }

   getMessageBox() {
      if (!this.messageBox$.value) return '';

      return md.render(this.messageBox$.value);
   }
}
