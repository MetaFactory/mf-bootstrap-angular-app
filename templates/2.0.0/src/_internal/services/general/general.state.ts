import { NavItem, SelectOption, Theme } from '../../types';
import { isDark, readLocalStorage } from '../../utils';

export type GeneralState = {
   isMobile: boolean;
   detailsSectionPath?: string;
   modalFormPath?: string;
   collapseSidebar: boolean;
   loginTitle: string;
   navItems: NavItem[];
   accountUrlMobile: string;
   userPhoto?: string;
   languages: SelectOption[];
   notificationLink: string;
   activeNotificationsCount: number;
   messageBox: string;
   theme: Theme;
   isDark: boolean;
};

const theme = readLocalStorage<Theme>('theme', 'light');

export const initialState: GeneralState = {
   isMobile: /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      (navigator.userAgent || navigator.vendor || (window as any)['opera']).toLowerCase()
   ),
   collapseSidebar: false,
   loginTitle: 'Login',
   notificationLink: '',
   activeNotificationsCount: 0,
   languages: [],
   navItems: [],
   accountUrlMobile: '',
   messageBox: '',
   theme,
   isDark: isDark(theme)
};
