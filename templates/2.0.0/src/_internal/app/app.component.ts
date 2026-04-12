import { Component, inject, isDevMode, OnInit } from '@angular/core';
import { NavigationError, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent, interval, switchMap } from 'rxjs';
import { ConfigService } from '../services/config-service';

@Component({
   selector: 'app-root',
   standalone: false,
   template: `<router-outlet><app-toastify /></router-outlet>`
})
export class AppComponent implements OnInit {
   private updates = inject(SwUpdate);

   constructor(
      private router: Router,
      private translate: TranslateService,
      config: ConfigService
   ) {
      translate.setDefaultLang(config.value.defaultLanguage);
      translate.use(config.value.defaultLanguage);

      // Only subscribe to service worker updates if enabled and in production
      if (this.updates.isEnabled && !isDevMode()) {
         this.updates.versionUpdates.subscribe(async (ev) => {
            if (ev.type === 'VERSION_READY') {
               if (confirm('A new version is available. Reload now?')) {
                  await this.updates.activateUpdate();
                  document.location.reload();
               }
            }
         });
      }
   }

   switchLanguage(language: string) {
      this.translate.use(language);
   }

   async ngOnInit() {
      const clickObservable = fromEvent(document, 'click');

      const switchedObservable = clickObservable.pipe(switchMap(() => interval(500)));

      switchedObservable.subscribe((value) => {
         // console.log(value) // Outputs numbers from the inner interval observable
      });

      this.router.events.subscribe((event) => {
         if (event instanceof NavigationError && event.error.status === 404) {
            this.router.navigate(['/404']);
         }
      });
   }
}
