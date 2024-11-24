'use client';
import { type PropsWithChildren } from 'react';
import useWebSocket from 'react-use-websocket';
import { type WebSocketMessage } from '@repo/commons';
import { WS_ENDPOINT } from '@src/constants';
import { RoomSocketContextProvider } from './room-socket-context';

interface Props extends PropsWithChildren {
  params: {
    id: string;
  };
}

export default function GamePageLayout({ children, params }: Props) {
  const webSocket = useWebSocket<WebSocketMessage>(`${WS_ENDPOINT}/${params.id}`);

  return <RoomSocketContextProvider value={webSocket}>{children}</RoomSocketContextProvider>;
}
