import { type MetadataRoute } from 'next';
import { getTranslations } from 'next-intl/server';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations({ locale: 'en', namespace: 'manifest' });

  return {
    name: t('name'),
    start_url: '/',
  };
}
