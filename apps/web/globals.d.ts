import type en from './messages/en.json';

export type Messages = typeof en;

declare global {
  interface IntlMessages extends Messages {}
}
