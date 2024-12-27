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
  const keepAliveMessage = {
    type: WebSocketCommonAction.KEEP_ALIVE,
    topic: params.id,
  };

  const webSocket = useWebSocket<WebSocketMessage>(`${WS_ENDPOINT}/${params.id}`, {
    heartbeat: {
      interval: 15000,
      message: JSON.stringify({
        ...keepAliveMessage,
        payload: 'ping',
      }),
      returnMessage: JSON.stringify({
        ...keepAliveMessage,
        payload: 'pong',
      }),
      timeout: 60000,
    },
    reconnectAttempts: 5,
    shouldReconnect: () => true,
    reconnectInterval(lastAttemptNumber) {
      return Math.pow(2, lastAttemptNumber) * 1000;
    },
  });

  return <RoomSocketContextProvider value={webSocket}>{children}</RoomSocketContextProvider>;
}
