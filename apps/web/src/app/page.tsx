'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AboutDialog } from '@src/components/about-dialog';
import { CreateGameDialog } from '@src/components/create-game-dialog';
import { JoinGameDialog } from '@src/components/join-game-dialog';

export default function HomePage() {
  const t = useTranslations('home');

  const [option, setOption] = useState('');

  return (
    <div className="flex flex-col gap-12 p-20 size-full text-center">
      <h1 className="text-6xl font-semibold">{t('title')}</h1>
      <div className="flex flex-col gap-8">
        <button
          className="size-2/6 text-3xl m-auto p-4 hover:cursor-pointer hover:outline"
          onClick={() => { setOption('create'); }}
          type="button"
        >
          {t('createGame')}
        </button>
        <button
          className="size-2/6 text-3xl m-auto p-4 hover:cursor-pointer hover:outline"
          onClick={() => { setOption('join'); }}
          type="button"
        >
          {t('joinGame')}
        </button>
        <button
          className="size-2/6 text-3xl m-auto p-4 hover:cursor-pointer hover:outline"
          onClick={() => { setOption('about'); }}
          type="button"
        >
          {t('about')}
        </button>
      </div>

      <CreateGameDialog
        open={option === 'create'}
        onOpenChange={(open) => { setOption(open ? 'create' : ''); }}
      />
      <JoinGameDialog
        open={option === 'join'}
        onOpenChange={(open) => { setOption(open ? 'join' : ''); }}
      />
      <AboutDialog
        open={option === 'about'}
        onOpenChange={(open) => { setOption(open ? 'about' : ''); }}
      />
    </div>
  );
}
