export const defaultLocale = 'en';
export const locales = ['en', 'pt'] as const;

export type Locale = (typeof locales)[number];

export const port = process.env.PORT ?? '3000';
export const host = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${port}`;

export const WS_ENDPOINT = process.env.NEXT_PUBLIC_WS_ENDPOINT ?? 'ws://localhost:3333/socket';

export const PLAYER_INFO_KEY = 'player-info';

export const ROOM_INFO_KEY = 'room-info';
