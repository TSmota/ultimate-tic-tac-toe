import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, locales } from './constants';
import { getUserLocale } from './services/locale';
import { IntlConfig } from 'next-intl';

type RequestConfig = Omit<IntlConfig, 'locale'> & {
  locale?: IntlConfig['locale'];
};

type GetRequestConfigParams = {
  locale: string;
};

const config: (params: GetRequestConfigParams) => RequestConfig | Promise<RequestConfig> = getRequestConfig(async () => {
  const locale = await getUserLocale();

  if (!locales.includes(locale as (typeof locales)[number])) {
    return {
      locale,
      messages: (await import(`../messages/${defaultLocale}.json`)).default,
    };
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});

export default config;
