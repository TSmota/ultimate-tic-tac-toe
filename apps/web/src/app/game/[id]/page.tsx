'use client';

import { useEffect, useState } from 'react';
import { ReadyState } from 'react-use-websocket';
import { type AreaLocation, getTeamTurn, PlayerInfo, type RoomInfo, WebSocketClientAction, WebSocketCommonAction, WebSocketServerAction } from '@repo/commons';
import { storageService } from '@src/services/storage';
import { PLAYER_INFO_KEY, ROOM_INFO_KEY } from '@src/constants';
import { TicTacToe } from '@src/components/tic-tac-toe/tic-tac-toe';
import { useRoomSocket } from './room-socket-context';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@src/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@src/components/ui/toggle-group';
import { CircleIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('game');

  const router = useRouter();
  const { lastJsonMessage, readyState, sendJsonMessage } = useRoomSocket();

  const updatePlayerInfo = (info: PlayerInfo) => {
    setPlayerInfo(info);
    storageService.setItem(`${params.id}-${PLAYER_INFO_KEY}`, info);
  }

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
      case WebSocketServerAction.GAME_STARTED: {
        if (!roomInfo) {
          return;
        }

        updateRoomInfo({
          ...roomInfo,
          gameStarted: true,
        });
        break;
      }
      case WebSocketServerAction.CELL_CLICKED: {
        if (roomInfo?.gameInfo) {
          updateRoomInfo({
            ...roomInfo,
            gameInfo: {
              ...roomInfo.gameInfo,
              selectedAreas: [...roomInfo.gameInfo.selectedAreas, payload],
            }
          });
        }
        break;
      }

      default:
        console.warn('Unknown message type', lastJsonMessage);
        break;
    }
  }, [lastJsonMessage]);

  if (isLoadingInformation || !roomInfo) {
    return <Loader className="animate-spin" />;
  }

  const players = roomInfo.players ?? [];
  const canStart = !roomInfo.gameStarted
    && playerInfo?.uuid === roomInfo.host
    && players?.length === 2
    && players[0]?.team
    && players[1]?.team
    && players[0].team !== players[1].team;

  const startGame = () => {
    if (!canStart) {
      return;
    }

    sendJsonMessage({
      broadcast: true,
      type: WebSocketClientAction.START_GAME,
      topic: params.id,
      payload: {
        players,
      },
    });
  }

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

  const onSelectTeam = (team: 'X' | 'O') => {
    if (!playerInfo) {
      return;
    }

    updatePlayerInfo({
      ...playerInfo,
      team,
    });
  };

  const teamTurn = getTeamTurn(roomInfo.gameInfo);

  return (
    <div className="flex flex-col items-center gap-8">
      <p> {/* TODO: Change this */}
        {params.id} {`- Game mode: ${roomInfo.variant}`}
      </p>

      <div className="flex justify-between w-[80%]">
        <div className="flex flex-col gap-1">
          <p>{t('players')}</p>

          {roomInfo.players.map((player) => (
            <p key={player.uuid}>{player.username} {player.team}</p>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <p>{t('selectTeam')}</p>

          <ToggleGroup disabled={roomInfo.gameStarted} onValueChange={onSelectTeam} type="single" value={playerInfo?.team} variant="outline">
            <ToggleGroupItem value="O" aria-label="Circle team">
              <CircleIcon />
            </ToggleGroupItem>
            <ToggleGroupItem value="X" aria-label="X team">
              <XIcon />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Button disabled={!canStart} onClick={startGame}>{t('startGame')}</Button>
      </div>


      {roomInfo?.gameStarted && (
        <TicTacToe
          currentPlayer={playerInfo}
          disabled={teamTurn !== playerInfo?.team}
          onClick={onClick}
          selectedAreas={roomInfo?.gameInfo?.selectedAreas}
        />
      )}
    </div>
  );
}
