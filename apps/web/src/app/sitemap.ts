import { type MetadataRoute } from 'next';

import { defaultLocale, host, locales } from '@src/constants';

const pathnames = {};

export default function sitemap(): MetadataRoute.Sitemap {
  const keys = Object.keys(pathnames) as (keyof typeof pathnames)[];

  function getUrl(pathname: keyof typeof pathnames, locale: (typeof locales)[number]) {
    return `${host}/${locale}${pathname === '/' ? '' : pathname}`;
  }

  return keys.map((key) => ({
    url: getUrl(key, defaultLocale),
    alternates: {
      languages: Object.fromEntries(locales.map((locale) => [locale, getUrl(key, locale)])),
    },
  }));
}
