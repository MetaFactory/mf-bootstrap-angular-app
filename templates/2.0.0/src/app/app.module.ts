import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppComponent } from '@common/app/app.component';
import { CommonAppModule } from '@common/app/app.module';
import { ConfigService, UserService } from '@common/services';
import { GeneralService } from '@common/services/general';
import { GlobalErrorHandler } from '@common/services/global-error-service';
import { MultiTranslateHttpLoader } from '@common/utils';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { config } from 'src/config';
import { PagesModule } from 'src/pages/Pages.module';
import { languageFiles } from '../assets/i18n';
import { InitService, StoreService } from '../services';
import { AuthInterceptor } from '../services/auth.interceptor';
import { AuthService } from '../services/auth.service';
import { AppRoutingModule } from './app.routing-module';
import { appAuthorities } from './authorities';
import { appNavItems } from './nav-items';

export function HttpLoaderFactory(http: HttpClient) {
   return new MultiTranslateHttpLoader(http, languageFiles);
}

export function init(
   generalService: GeneralService,
   storeService: StoreService,
   userService: UserService,
   initService: InitService
) {
   return () =>
      initService.init({ generalService, storeService, userService, appNavItems, appAuthorities });
}

@NgModule({
   providers: [
      {
         provide: ErrorHandler,
         useClass: GlobalErrorHandler
      },
      {
         provide: ConfigService,
         useFactory: () => new ConfigService(config)
      },
      {
         provide: APP_INITIALIZER,
         useFactory: init,
         deps: [GeneralService, StoreService, UserService, InitService],
         multi: true
      },
      {
         provide: HTTP_INTERCEPTORS,
         useClass: AuthInterceptor,
         multi: true
      },
      AuthService
   ],

   imports: [
      CommonAppModule,
      AppRoutingModule,
      PagesModule,

      // I18n
      TranslateModule.forRoot({
         loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
         }
      }),
      ServiceWorkerModule.register('ngsw-worker.js', {
         enabled: false, //  !isDevMode(),
         // Register the ServiceWorker as soon as the application is stable
         // or after 30 seconds (whichever comes first).
         registrationStrategy: 'registerWhenStable:30000'
      })
   ],

   bootstrap: [AppComponent]
})
export class AppModule {}
