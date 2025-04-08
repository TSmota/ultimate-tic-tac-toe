import { Suspense } from 'react';
import { Dot } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { API_ENDPOINT } from '@src/constants';

type ServerStatus = 'up' | 'down' | 'loading';

async function ServerHealthStatus({ status }: { status: ServerStatus }) {
  const t = await getTranslations('components.serverStatus');
  const color = status === 'up' ? 'green' : status === 'down' ? 'red' : 'yellow';

  return (
    <div className={`flex h-10 items-center rounded-md border border-${color}-300 pl-1 pr-3`}>
      <Dot
        className={`h-6 w-6 animate-pulse text-${color}-500`}
        strokeWidth={6}
      />
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

    if (response.ok) {
      status = 'up';
    }
  } catch (error) {
    console.error('Error fetching server health:', error);
    status = 'down';
  }

  return (
    <ServerHealthStatus status={status} />
  );
}

export async function ServerHealth() {
  return (
    <Suspense fallback={<ServerHealthStatus status="loading" />}>
      <ServerHealthCheck />
    </Suspense>
  );
}
