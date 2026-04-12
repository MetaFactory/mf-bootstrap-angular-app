import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ToastifyService } from '../components';
import { AppErrorHandler } from '../components/app-error-handler/app-error-handler';
import { CommonComponentsModule } from '../components/common-components.module';
import { DynamicComponentHostDirective } from '../directives/DynamicComponentHost.directive';
import { HttpErrorInterceptor } from '../interceptors/HttpErrorInterceptor';
import { MockApiInterceptor } from '../interceptors/MockApiInterceptor';
import { ReportComponentsModule } from '../report-components/report-components.module';
import { AppComponent } from './app.component';

@NgModule({
   declarations: [AppComponent, DynamicComponentHostDirective],
   imports: [
      CommonModule,
      CommonComponentsModule,
      ReportComponentsModule,
      RouterModule,
      BrowserModule,
      HttpClientModule,
      ServiceWorkerModule.register('ngsw-worker.js', {
         enabled: false, //  !isDevMode(),
         // Register the ServiceWorker as soon as the application is stable
         // or after 30 seconds (whichever comes first).
         registrationStrategy: 'registerWhenStable:30000'
      })
   ],
   exports: [
      AppComponent
      // export components that will be used outside
   ],
   providers: [
      { provide: ErrorHandler, useClass: AppErrorHandler },
      {
         provide: HTTP_INTERCEPTORS,
         useClass: HttpErrorInterceptor,
         multi: true
      },
      ToastifyService,
      { provide: HTTP_INTERCEPTORS, useClass: MockApiInterceptor, multi: true }
   ]
})
export class CommonAppModule {}
