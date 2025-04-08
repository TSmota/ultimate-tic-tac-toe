'use client';

import { useEffect } from 'react';
import { ReadyState } from 'react-use-websocket';
import {
  type AreaLocation,
  getTeamTurn,
  isDefined,
  PlayerInfo,
  Team,
  WebSocketClientAction,
} from '@repo/commons';
import { CircleIcon, CopyIcon, LoaderIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@src/lib/utils';
import { UltimateTicTacToe } from '@src/components/tic-tac-toe/ultimate-tic-tac-toe';
import { Button } from '@src/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@src/components/ui/table';

import { useRoomSocket } from './room-socket-context';
import { useRoomInformation } from './use-room-information';

interface Props {
  params: {
    id: string;
  };
}

function TablePlayersCell(props: { players: PlayerInfo[]; team?: Team }) {
  const { players, team } = props;

  return (
    <TableCell className="align-top">
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

  const { isRoomHost, playerInfo, roomInfo, updatePlayerInfo } = useRoomInformation({
    roomId: params.id,
  });

  const t = useTranslations('game');

  const { readyState, sendJsonMessage } = useRoomSocket();

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

  if (!roomInfo) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <LoaderIcon className="animate-spin" />
      </div>
    );
  }

  const players = roomInfo.players ?? [];
  const canStart =
    !roomInfo.gameStarted &&
    isRoomHost &&
    players?.length >= 2 &&
    players?.some((player) => player.team === 'X') &&
    players?.some((player) => player.team === 'O');

  const startGame = () => {
    sendJsonMessage({
      broadcast: true,
      type: WebSocketClientAction.START_GAME,
      topic: params.id,
      payload: {
        players,
      },
    });
  };

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
    void navigator.clipboard.writeText(window.location.href);
  };

  const teamTurn = getTeamTurn(roomInfo.gameInfo);

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="flex items-center gap-4">
        {params.id}
        <CopyIcon className="cursor-pointer" onClick={copyRoomLink} />
      </p>

      <div className={cn('flex flex-col gap-10', { hidden: roomInfo.gameStarted })}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('spectators')}</TableHead>
              <TableHead>
                <XIcon className="m-auto size-8" />
              </TableHead>
              <TableHead>
                <CircleIcon className="m-auto size-6" />
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
                <Button onClick={() => onSelectTeam(undefined)}>
                  {t('joinTeam', { team: t('spectators') })}
                </Button>
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

        <Button disabled={!canStart} onClick={startGame}>
          {t('startGame')}
        </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto]">
            <UltimateTicTacToe
              disabled={teamTurn !== playerInfo?.team || isDefined(roomInfo.gameInfo.gameWinner)}
              gameInfo={roomInfo.gameInfo}
              onClick={onClick}
            />
            <Table className="w-full md:w-min text-center">
              <TableHeader>
                <TableRow>
                  <TableHead colSpan={2}>{t('history')}</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead>{t('position')}</TableHead>
                  <TableHead>{t('team')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomInfo.gameInfo.selectedAreas.map((area) => (
                  <TableRow key={`${area.location.x}-${area.location.y}`}>
                    <TableCell>
                      {area.location.x + 1}{` - `}{area.location.y + 1}
                    </TableCell>
                    <TableCell>
                      {area.player.team}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
