import { Router } from '@angular/router';
import { FormActionContext } from '../types';

export function navigate(cn: FormActionContext, url: string) {
   const router = cn.injector.get(Router);
   router.navigate([url], {});
}

export async function reloadSection(cn: FormActionContext) {
   await cn.reloadSection?.();
}
