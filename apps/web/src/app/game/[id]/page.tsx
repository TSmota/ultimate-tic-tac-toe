'use client';

import { useEffect, useState } from 'react';
import { ReadyState } from 'react-use-websocket';
import { type AreaLocation, checkBoardWin, getTeamTurn, isDefined, PlayerInfo, type RoomInfo, Team, WebSocketClientAction, WebSocketServerAction } from '@repo/commons';
import { CopyIcon, LoaderIcon, CircleIcon, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { cn } from '@src/lib/utils';
import { storageService } from '@src/services/storage';
import { PLAYER_INFO_KEY, ROOM_INFO_KEY } from '@src/constants';
import { UltimateTicTacToe } from '@src/components/tic-tac-toe/ultimate-tic-tac-toe';
import { Button } from '@src/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@src/components/ui/table';

import { useRoomSocket } from './room-socket-context';

interface Props {
  params: {
    id: string;
  };
}

function TablePlayersCell(props: { players: PlayerInfo[], team?: Team }) {
  const { players, team } = props;

  return (
    <TableCell>
      <span className={cn('flex flex-col gap-2', { 'text-center': !!team })}>
        {players
          .filter((player) => player.team === team)
          .map((player) => (
            <p key={player.uuid}>{player.username}</p>
          ))}
      </span>
    </TableCell>
  );
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
          const selectedAreas = [...roomInfo.gameInfo.selectedAreas, payload]
            .filter((area, index, self) => self.findIndex((a) => a.location.x === area.location.x && a.location.y === area.location.y) === index);

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

  const onSelectTeam = (team?: 'X' | 'O') => {
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

      <div className={cn('flex flex-col gap-10', { 'hidden': roomInfo.gameStarted })}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('spectators')}</TableHead>
              <TableHead>
                <XIcon className="size-8 m-auto" />
              </TableHead>
              <TableHead>
                <CircleIcon className="size-6 m-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TablePlayersCell players={players} />
              <TablePlayersCell players={players} team="X" />
              <TablePlayersCell players={players} team="O" />
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>
                <Button onClick={() => onSelectTeam(undefined)}>{t('joinTeam', { team: t('spectators') })}</Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => onSelectTeam('X')}>{t('joinTeam', { team: 'X' })}</Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => onSelectTeam('O')}>{t('joinTeam', { team: 'O' })}</Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        <Button disabled={!canStart} onClick={startGame}>{t('startGame')}</Button>
      </div>

      {isDefined(roomInfo.gameInfo.gameWinner) && (
        <div className="flex flex-col gap-4">
          <p className="text-3xl">{t('gameWinner', { team: roomInfo.gameInfo.gameWinner })}</p>
          {isRoomHost && <Button onClick={startGame}>{t('playAgain')}</Button>}
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
