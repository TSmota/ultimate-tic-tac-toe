import type en from './messages/en.json';

export type Messages = typeof en;

declare global {
  type IntlMessages = Messages
}
