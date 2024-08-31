import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { PropsWithChildren } from 'react';
import { Header } from '@src/components/header';

import { ThemeProvider } from '@src/components/theme-provider';
import '../styles/global.css';
import { cn } from '@src/lib/utils';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale });

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
    keywords: t('metadata.keywords'),
  };
}

export default async function RootLayout({ children }: PropsWithChildren) {
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background antialiased', inter.variable)}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Header />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
