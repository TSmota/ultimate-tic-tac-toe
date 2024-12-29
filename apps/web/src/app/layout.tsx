import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages, getTranslations } from 'next-intl/server';
import { type PropsWithChildren } from 'react';
import { Header } from '@src/components/header';
import { ThemeProvider } from '@src/components/theme-provider';
import '../styles/global.css';
import { cn } from '@src/lib/utils';
import { Footer } from '@src/components/footer';

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
      <body className={cn('bg-background min-h-screen antialiased flex flex-col', inter.variable)}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Header />
            <div className="flex flex-col flex-1">
              {children}
            </div>
            <Footer />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
