import { Suspense } from 'react';
import { Dot } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { API_ENDPOINT } from '@src/constants';

type ServerStatus = 'up' | 'down' | 'loading';

async function ServerHealthIndicator({ status }: { status: ServerStatus }) {
  const t = await getTranslations('components.serverStatus');

  return (
    <div
      className={`flex h-10 items-center rounded-md border pl-1 pr-3 ${
        status === 'up'
          ? 'border-green-300 text-green-500'
          : status === 'down'
            ? 'border-red-300 text-red-500'
            : 'border-yellow-300 text-yellow-500'
      }`}
    >
      <Dot className={`h-6 w-6 animate-pulse`} strokeWidth={6} />
      <span className="text-sm">{t(status)}</span>
    </div>
  );
}

async function ServerHealthCheck() {
  let status: ServerStatus = 'down';

  try {
    const response = await fetch(`${API_ENDPOINT}/healthcheck`, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await response.json();

    if (response.ok) {
      status = 'up';
    }

    console.log(data);
  } catch (error) {
    console.error('Error fetching server health:', error);
    status = 'down';
  }

  return <ServerHealthIndicator status={status} />;
}

export async function ServerStatus() {
  return (
    <Suspense fallback={<ServerHealthIndicator status="loading" />}>
      <ServerHealthCheck />
    </Suspense>
  );
}
