import { GeneralService } from '../services';
import { FormAction, FormActionContext } from '../types';
import { normalizeFreeFormSchema } from '../utils';

async function handler(cn: FormActionContext) {
   const { currentPassword, newPassword, confirmPassword } = cn.state as any;
   const generalService = cn.injector.get(GeneralService);

   if (newPassword !== confirmPassword) {
      generalService.showMessageBox(`The password and its confirmation do not match!`);
      return;
   }

   try {
      await cn.service!.request('account/change-password', {
         method: 'POST',
         payload: {
            currentPassword,
            newPassword
         }
      });
      generalService.showMessageBox(`The password is changed!`);
   } catch (ex) {
      generalService.showMessageBox(`Error changing the password.`);
   }
}

export const changePasswordSchema = normalizeFreeFormSchema({
   title: 'Change Password',
   serviceName: 'user',
   fields: [
      {
         name: 'currentPassword',
         autocomplete: { paramName: 'current-password' },
         type: 'PASSWORD'
      },
      {
         name: 'newPassword',
         type: 'PASSWORD',
         autocomplete: { paramName: 'new-password' },
         pattern: '^.{8,}$',
         description:
            'Enter a complex password with at least 8 characters, including uppercase letters, lowercase letters, numbers, and special characters.'
      },
      {
         name: 'confirmPassword',
         autocomplete: { paramName: 'new-password' },
         type: 'PASSWORD',
         pattern: '^.{8,}$'
      }
   ],
   actions: [
      {
         title: 'Apply',
         handler: handler
      }
   ]
});

export const changePasswordAction: FormAction = {
   schema: changePasswordSchema
};
