import { type ClassValue, clsx } from 'clsx';
import { MessageKeys, NestedKeyOf } from 'next-intl';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateGameCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let gameCode = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    gameCode += characters[randomIndex];
  }

  return gameCode;
}

export function customZodMessage(message: MessageKeys<IntlMessages, NestedKeyOf<IntlMessages>>, parameters: Record<string, string | number> = {}) {
  return JSON.stringify({
    message,
    parameters,
  });
}
