import { Theme } from '../types';

export function isDark(theme: Theme): boolean {
   const query = window.matchMedia('(prefers-color-scheme: dark)');
   return theme === 'system' ? query.matches : theme === 'dark';
}
