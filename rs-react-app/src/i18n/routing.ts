import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale, LOCALE_COOKIE } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // No URL prefix — locale is stored in a cookie only
  localePrefix: 'never',
  localeCookie: {
    name: LOCALE_COOKIE,
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  },
});
