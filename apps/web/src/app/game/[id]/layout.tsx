'use client';
import { type PropsWithChildren } from 'react';
import useWebSocket from 'react-use-websocket';
import { WebSocketCommonAction, type WebSocketMessage } from '@repo/commons';
import { WS_ENDPOINT } from '@src/constants';
import { RoomSocketContextProvider } from './room-socket-context';

interface Props extends PropsWithChildren {
  params: {
    id: string;
  };
}

export default function GamePageLayout({ children, params }: Props) {
  const webSocket = useWebSocket<WebSocketMessage>(`${WS_ENDPOINT}/${params.id}`, {
    reconnectAttempts: 3,
    heartbeat: {
      interval: 10000,
      message: JSON.stringify({
        type: WebSocketCommonAction.KEEP_ALIVE,
        broadcast: false,
        topic: params.id,
      }),
    }
  });

  return <RoomSocketContextProvider value={webSocket}>{children}</RoomSocketContextProvider>;
}
