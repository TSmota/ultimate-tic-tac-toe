'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CreateGameDialog } from '@src/components/create-game-dialog';
import { JoinGameDialog } from '@src/components/join-game-dialog';
import { useSearchParams } from 'next/navigation';

export default function HomePage() {
  const t = useTranslations('home');
  const params = useSearchParams();
  const code = params.get('code');

  const [option, setOption] = useState(code ? 'join' : '');

  return (
    <div className="flex flex-col flex-1 size-full gap-12 justify-center items-center">
      <h1 className="text-6xl font-semibold">{t('title')}</h1>
      <div className="flex flex-col gap-8">
        <button
          className="text-3xl m-auto p-4 rounded-md hover:cursor-pointer hover:outline"
          onClick={() => { setOption('create'); }}
          type="button"
        >
          {t('createGame')}
        </button>
        <button
          className="text-3xl m-auto p-4 rounded-md hover:cursor-pointer hover:outline"
          onClick={() => { setOption('join'); }}
          type="button"
        >
          {t('joinGame')}
        </button>
      </div>

      <CreateGameDialog
        open={option === 'create'}
        onOpenChange={(open) => { setOption(open ? 'create' : ''); }}
      />
      <JoinGameDialog
        code={code ?? ''}
        open={option === 'join'}
        onOpenChange={(open) => { setOption(open ? 'join' : ''); }}
      />
    </div>
  );
}
