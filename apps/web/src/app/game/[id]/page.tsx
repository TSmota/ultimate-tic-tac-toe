'use client';

import { useEffect, useState } from 'react';
import { ReadyState } from 'react-use-websocket';
import { type AreaLocation, PlayerInfo, type RoomInfo, WebSocketClientAction, WebSocketCommonAction, WebSocketServerAction } from '@repo/commons';
import { storageService } from '@src/services/storage';
import { PLAYER_INFO_KEY, ROOM_INFO_KEY } from '@src/constants';
import { TicTacToe } from '@src/components/tic-tac-toe/tic-tac-toe';
import { useRoomSocket } from './room-socket-context';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  params: {
    id: string;
  };
}

export default function GamePage(props: Props) {
  const { params } = props;

  const [isLoadingInformation, setIsLoadingInformation] = useState(true);
  const [playerInfo, setPlayerInfo] = useState<PlayerInfo>();
  const [roomInfo, setRoomInfo] = useState<RoomInfo>();

  const router = useRouter();
  const { lastJsonMessage, readyState, sendJsonMessage } = useRoomSocket();

  const updateRoomInfo = (info: RoomInfo) => {
    setRoomInfo(info);
    storageService.setItem(`${params.id}-${ROOM_INFO_KEY}`, info);
  }

  useEffect(() => {
    const localRoomInfo = storageService.getItem<RoomInfo>(`${params.id}-${ROOM_INFO_KEY}`);
    const localPlayerInfo = storageService.getItem<PlayerInfo>(PLAYER_INFO_KEY);

    if (!localPlayerInfo) {
      router.push('/');
    }

    setPlayerInfo(localPlayerInfo);

    if (localPlayerInfo?.isHost && localRoomInfo) {
      setRoomInfo(localRoomInfo);
      setIsLoadingInformation(false);
    }
  }, []);

  useEffect(() => {
    if (readyState === ReadyState.CLOSED) {
      // TODO: Handle disconnect
      console.log('Disconnected');
      return;
    }

    if (readyState !== ReadyState.OPEN || !playerInfo) {
      return;
    }

    sendJsonMessage({
      broadcast: true,
      type: WebSocketClientAction.UPDATE_PLAYER_INFO,
      topic: params.id,
      payload: {
        player: playerInfo,
      },
    });
  }, [readyState, params, playerInfo]);

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }

    const { type, payload } = lastJsonMessage;

    switch (type) {
      case WebSocketCommonAction.KEEP_ALIVE: {
        break;
      }
      case WebSocketServerAction.PLAYER_INFO: {
        if (playerInfo?.isHost && roomInfo) {
          const isNewPlayer = !roomInfo.players.some((player) => player.uuid === payload.player.uuid);

          const players = isNewPlayer
            ? [...roomInfo.players, payload.player]
            : roomInfo.players.map(player => {
              if (player.uuid === payload.player.uuid) {
                return payload.player;
              }

              return player;
            });

          sendJsonMessage({
            broadcast: true,
            type: WebSocketClientAction.UPDATE_ROOM_INFORMATION,
            topic: params.id,
            payload: {
              ...roomInfo,
              players,
            } as RoomInfo,
          });
        }
        break;
      }
      case WebSocketServerAction.ROOM_INFORMATION: {
        updateRoomInfo(payload);
        setIsLoadingInformation(false);
        break;
      }
      case WebSocketServerAction.CELL_CLICKED: {
        if (roomInfo) {
          updateRoomInfo({
            ...roomInfo,
            selectedAreas: [...roomInfo.selectedAreas ?? [], payload],
          });
        }
        break;
      }

      default:
        console.warn('Unknown message type', lastJsonMessage);
        break;
    }
  }, [lastJsonMessage]);

  const onClick = (location: AreaLocation) => {
    if (!playerInfo) {
      return;
    }

    sendJsonMessage({
      broadcast: true,
      type: WebSocketClientAction.CLICK_CELL,
      topic: params.id,
      payload: {
        location,
        player: playerInfo,
      },
    });
  };

  if (isLoadingInformation) {
    return <Loader className="animate-spin" />;
  }

  return (
    <div>
      <p>
        {params.id} {roomInfo ? `- Game mode: ${roomInfo.variant}` : null}
      </p>
      <br />
      {roomInfo?.players.map((player) => (
        <p key={player.uuid}>{player.username} {player.uuid}</p>
      ))}
      <TicTacToe currentPlayer={playerInfo} onClick={onClick} selectedAreas={roomInfo?.selectedAreas} />
      {roomInfo?.selectedAreas?.map((play) => (
        <p key={`${play.location.x} - ${play.location.y}`}>{`${play.player.username}: ${play.location.x} - ${play.location.y}`}</p>
      ))}
    </div>
  );
}
