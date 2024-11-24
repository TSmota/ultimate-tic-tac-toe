export const defaultLocale = 'en';
export const locales = ['en', 'pt'] as const;

export type Locale = (typeof locales)[number];

export const port = process.env.PORT ?? '3000';
export const host = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${port}`;

export const wsEndpoint = process.env.WS_ENDPOINT ?? 'ws://localhost:3333/socket';

export const playerInfoKey = 'player-info';

export const roomInfoKey = 'room-info';
