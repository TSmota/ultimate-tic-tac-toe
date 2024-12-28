'use client';

import { useEffect, useState } from 'react';
import { ReadyState } from 'react-use-websocket';
import { type AreaLocation, checkBoardWin, getTeamTurn, isDefined, PlayerInfo, type RoomInfo, Team, WebSocketClientAction, WebSocketServerAction } from '@repo/commons';
import { storageService } from '@src/services/storage';
import { PLAYER_INFO_KEY, ROOM_INFO_KEY } from '@src/constants';
import { UltimateTicTacToe } from '@src/components/tic-tac-toe/ultimate-tic-tac-toe';
import { useRoomSocket } from './room-socket-context';
import { CopyIcon, LoaderIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@src/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@src/components/ui/toggle-group';
import { CircleIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@src/lib/utils';

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

  const isRoomHost = roomInfo?.host === playerInfo?.uuid;

  const updatePlayerInfo = (info: PlayerInfo) => {
    setPlayerInfo(info);
    storageService.setItem(PLAYER_INFO_KEY, info);
  }

  const updateRoomInfo = (info: RoomInfo) => {
    setRoomInfo(info);
    storageService.setItem(`${params.id}-${ROOM_INFO_KEY}`, info);
  }

  useEffect(() => {
    const localRoomInfo = storageService.getItem<RoomInfo>(`${params.id}-${ROOM_INFO_KEY}`);
    const localPlayerInfo = storageService.getItem<PlayerInfo>(PLAYER_INFO_KEY);

    if (!localPlayerInfo) {
      router.push(`/?code=${params.id}`);
      return;
    }

    setPlayerInfo(localPlayerInfo);

    if (localRoomInfo && localPlayerInfo.uuid === localRoomInfo.host) {
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
      case WebSocketServerAction.PLAYER_INFO: {
        if (roomInfo && isRoomHost) {
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
          gameInfo: {
            selectedAreas: [],
          },
          gameStarted: true,
        });
        break;
      }
      case WebSocketServerAction.CELL_CLICKED: {
        if (roomInfo?.gameInfo) {
          const selectedAreas = [...roomInfo.gameInfo.selectedAreas, payload];

          const clickedCellBoardAreas = selectedAreas.filter((area) => area.location.x === payload.location.x);
          const teamAreas = clickedCellBoardAreas.filter((area) => area.player.team === payload.player.team);

          const wonBoardGame = checkBoardWin(teamAreas.map((area) => area.location.y));
          const boardWinners = roomInfo.gameInfo.boardWinners ?? {};

          let gameWinner: Team | undefined = undefined;

          if (wonBoardGame && payload.player.team) {
            boardWinners[payload.location.x] = payload.player.team;

            const teamBoards = Object.entries(boardWinners).filter(([, team]) => team === payload.player.team).map(([n]) => Number(n));

            if (checkBoardWin(teamBoards)) {
              gameWinner = payload.player.team;
            }
          }

          if (!wonBoardGame && clickedCellBoardAreas.length === 9) {
            boardWinners[payload.location.x] = '-';
          }

          if (!gameWinner && Object.keys(boardWinners).length === 9) {
            gameWinner = '-';
          }

          const nextBoard = boardWinners[payload.location.y] ? undefined : payload.location.y;

          updateRoomInfo({
            ...roomInfo,
            gameInfo: {
              ...roomInfo.gameInfo,
              boardWinners,
              gameWinner,
              currentBoard: nextBoard,
              selectedAreas,
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
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <LoaderIcon className="animate-spin" />
      </div>
    );
  }

  const players = roomInfo.players ?? [];
  const canStart = !roomInfo.gameStarted
    && isRoomHost
    && players?.length === 2
    && players[0]?.team
    && players[1]?.team
    && players[0].team !== players[1].team;

  const startGame = () => {
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

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const teamTurn = getTeamTurn(roomInfo.gameInfo);

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="flex items-center gap-4">
        {params.id}
        <CopyIcon className="cursor-pointer" onClick={copyRoomLink} />
      </p>

      <div className={cn('flex justify-between w-[80%]', { 'hidden': roomInfo.gameStarted })}>
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


      {isDefined(roomInfo.gameInfo.gameWinner) && (
        <div className="flex flex-col gap-4">
          <p className="text-3xl">{t('gameWinner', { team: roomInfo.gameInfo.gameWinner })}</p>
          <Button disabled={!isRoomHost} onClick={startGame}>{t('playAgain')}</Button>
        </div>
      )}

      {roomInfo.gameStarted && (
        <>
          {!roomInfo.gameInfo.gameWinner && (
            <p className="text-3xl">{t('teamTurn', { team: teamTurn })}</p>
          )}
          <UltimateTicTacToe
            disabled={teamTurn !== playerInfo?.team || isDefined(roomInfo.gameInfo.gameWinner)}
            gameInfo={roomInfo.gameInfo}
            onClick={onClick}
          />
        </>
      )}
    </div>
  );
}
