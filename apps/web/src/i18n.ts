import { getRequestConfig } from 'next-intl/server';
import { type IntlConfig } from 'next-intl';

import { defaultLocale, locales } from './constants';
import { getUserLocale } from './services/locale';

type RequestConfig = Omit<IntlConfig, 'locale'> & {
  locale?: IntlConfig['locale'];
};

interface GetRequestConfigParams {
  locale: string;
}

interface LocaleModule {
  default: Record<string, string>;
}

const config: (params: GetRequestConfigParams) => RequestConfig | Promise<RequestConfig> =
  getRequestConfig(async () => {
    const locale = await getUserLocale();

    if (!locales.includes(locale as (typeof locales)[number])) {
      return {
        locale,
        messages: (await import(`../messages/${defaultLocale}.json`) as LocaleModule).default,
      };
    }

    return {
      locale,
      messages: (await import(`../messages/${locale}.json`) as LocaleModule).default,
    };
  });

export default config;
