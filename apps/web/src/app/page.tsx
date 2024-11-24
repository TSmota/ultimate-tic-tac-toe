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
    <div className="flex flex-col gap-12 p-20">
      <h1 className="text-6xl font-semibold">{t('title')}</h1>
      <div className="flex flex-col gap-8">
        <div
          className="text-3xl hover:cursor-pointer hover:font-semibold"
          onClick={() => { setOption('create'); }}
        >
          {t('createGame')}
        </div>
        <div
          className="text-3xl hover:cursor-pointer hover:font-semibold"
          onClick={() => { setOption('join'); }}
        >
          {t('joinGame')}
        </div>
        <div
          className="text-3xl hover:cursor-pointer hover:font-semibold"
          onClick={() => { setOption('about'); }}
        >
          {t('about')}
        </div>
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
