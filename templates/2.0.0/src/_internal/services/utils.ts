import { GeneralService } from '.';
import { FormActionContext } from '../types';

export function getEntityService(cn: FormActionContext, serviceName: string) {
   const generalService = cn.injector.get(GeneralService);
   return generalService.getEntityService(serviceName);
}
