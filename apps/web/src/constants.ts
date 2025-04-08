export const defaultLocale = 'en';
export const locales = ['en', 'pt'] as const;

export type Locale = (typeof locales)[number];

export const port = process.env.PORT ?? '3000';
export const host = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${port}`;

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

export const API_ENDPOINT = SERVER_URL ? `https://${SERVER_URL}/api` : 'http://localhost:3333/api';
export const WS_ENDPOINT = SERVER_URL ? `wss://${SERVER_URL}/socket` : 'ws://localhost:3333/socket';

export const PLAYER_INFO_KEY = 'player-info';

export const ROOM_INFO_KEY = 'room-info';
