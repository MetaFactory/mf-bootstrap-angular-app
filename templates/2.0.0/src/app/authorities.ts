import { PathAuthority } from '@common/types';

export const appAuthorities: PathAuthority[] = [
   {
      path: 'user',
      authority: 'ROLE_ADMIN'
   }
].map((item) => ({
   ...item,
   path: item.path.replace(/^\/|\/$/, '')
}));
