import { Routes } from '@angular/router';
import { DynamicFormComponent } from '../components/dynamic-form/dynamic-form.component';
import { FormSchema } from '../types';

export function getDynamicRoutes(dynamicForms: Array<Partial<FormSchema>>) {
   const dynamicFormRoutes: Routes = dynamicForms.map((schema) => ({
      path: schema.path,
      component: DynamicFormComponent,
      data: { schema }
   }));

   const detailsRoutes: Routes = dynamicForms
      .filter((form) => form.type === 'data-table')
      .map((schema) => ({
         path: schema.path + '/:id',
         component: DynamicFormComponent,
         data: { schema }
      }));

   return [...dynamicFormRoutes, ...detailsRoutes];
}
