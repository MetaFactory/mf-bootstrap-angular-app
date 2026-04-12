import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { getDynamicRoutes } from '@common/app';
import { LayoutComponent } from '@common/components/layout/layout.component';
import { NotFoundComponent } from '@common/components/not-found/not-found.component';
import { GeneralErrorComponent } from '@common/pages/general-error/general-error.component';
import { LoginFailedComponent } from '@common/pages/login-failed/login-failed.component';
import { dynamicForms } from 'src/app';
import { AccountComponent } from 'src/pages/account/account.component';

const dynamicFormRoutes = getDynamicRoutes(dynamicForms);

export const routes: Routes = [
   {
      path: '',
      component: LayoutComponent,
      children: [
         { path: 'account', component: AccountComponent },

         // Dynamic Routes
         ...dynamicFormRoutes
      ]
   },
   { path: 'general-error', component: GeneralErrorComponent },
   { path: 'login-failed', component: LoginFailedComponent },
   { path: '**', component: NotFoundComponent },
   { path: '404', component: NotFoundComponent }
];

@NgModule({
   imports: [RouterModule.forRoot(routes)],
   declarations: [],
   exports: [RouterModule]
})
export class AppRoutingModule {}
