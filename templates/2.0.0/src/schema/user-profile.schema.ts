import { UserService } from '@common/services/user';
import { FormAction, FormActionContext } from '@common/types';
import { normalizeFreeFormSchema } from '@common/utils';

async function onInit(cn: FormActionContext) {
   const userService = cn.injector.get(UserService);
   cn.state = userService.account as {};
}

async function save(cn: FormActionContext) {}

export const userProfileSchema = normalizeFreeFormSchema({
   title: 'User Profile',
   serviceName: 'user',
   fields: [
      {
         name: 'firstName',
         type: 'TEXT'
      },
      {
         name: 'lastName',
         type: 'TEXT'
      },
      {
         name: 'email',
         type: 'TEXT'
      }
   ],
   onInit,
   actions: [
      {
         title: 'Save',
         handler: save
      }
   ]
});

export const userProfileAction: FormAction = {
   schema: userProfileSchema
};
