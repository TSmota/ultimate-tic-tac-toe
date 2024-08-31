'use client';

import { Locale, locales } from '@src/constants';
import { setUserLocale } from '@src/services/locale';
import { useLocale, useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger } from './ui/select';

export function LocaleSwitcher() {
  const t = useTranslations('languages');
  const locale = useLocale() as Locale;

  const onChange = (value: Locale) => {
    setUserLocale(value);
  };

  return (
    <Select onValueChange={onChange} value={locale}>
      <SelectTrigger className="w-auto">{t(locale)}</SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem key={locale} value={locale}>
            {t(locale)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
