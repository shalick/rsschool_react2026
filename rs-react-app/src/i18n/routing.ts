import { defineRouting } from 'next-intl/routing';
import { locales, defaultLocale, LOCALE_COOKIE } from './config';

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'never',
  localeCookie: {
    name: LOCALE_COOKIE,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  },
});
