'use client';

import { type WebSocketMessage } from '@repo/commons';
import { createContext, type PropsWithChildren, useContext } from 'react';
import { type WebSocketHook } from 'react-use-websocket/dist/lib/types';

type RoomSocketContextValue = Pick<
  WebSocketHook<WebSocketMessage>,
  'lastJsonMessage' | 'readyState' | 'sendJsonMessage'
>

const RoomSocketContext = createContext<RoomSocketContextValue | null>(null);

export function useRoomSocket() {
  const context = useContext<RoomSocketContextValue | null>(RoomSocketContext);

  if (!context) {
    throw new Error('useRoomSocket must be used within a RoomSocketContextProvider');
  }

  return context;
}

interface RoomSocketContextProviderProps extends PropsWithChildren {
  value: RoomSocketContextValue;
}

export function RoomSocketContextProvider({ children, value }: RoomSocketContextProviderProps) {
  return <RoomSocketContext.Provider value={value}>{children}</RoomSocketContext.Provider>;
}
