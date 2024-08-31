'use server';

import { cookies } from 'next/headers';

const COOKIE_NAME = 'NEXT_USERNAME';

export async function getUsername() {
  return cookies().get(COOKIE_NAME)?.value;
}

export async function setUsername(name: string) {
  cookies().set(COOKIE_NAME, name);
}
