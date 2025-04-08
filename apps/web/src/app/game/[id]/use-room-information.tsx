import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  checkBoardWin,
  PlayerInfo,
  type RoomInfo,
  Team,
  WebSocketClientAction,
  WebSocketServerAction,
} from '@repo/commons';

import { storageService } from '@src/services/storage';
import { PLAYER_INFO_KEY, ROOM_INFO_KEY } from '@src/constants';
import { useRoomSocket } from '@src/app/game/[id]/room-socket-context';

interface UseRoomInfoOptions {
  roomId: string;
}

export function useRoomInformation(options: UseRoomInfoOptions) {
  const { roomId } = options;

  const router = useRouter();

  const [playerInfo, setPlayerInfo] = useState<PlayerInfo>();
  const [roomInfo, setRoomInfo] = useState<RoomInfo>();

  const { lastJsonMessage, sendJsonMessage } = useRoomSocket();

  useEffect(() => {
    const localRoomInfo = storageService.getItem<RoomInfo>(`${roomId}-${ROOM_INFO_KEY}`);
    const localPlayerInfo = storageService.getItem<PlayerInfo>(PLAYER_INFO_KEY);

    if (!localPlayerInfo) {
      router.push(`/?code=${roomId}`);
      return;
    }

    setPlayerInfo(localPlayerInfo);

    if (localRoomInfo && localPlayerInfo.uuid === localRoomInfo.host) {
      setRoomInfo(localRoomInfo);
    }
  }, []);

  useEffect(() => {
    if (!lastJsonMessage) {
      return;
    }

    const { type, payload } = lastJsonMessage;

    switch (type) {
      case WebSocketServerAction.PLAYER_INFO: {
        if (roomInfo && isRoomHost) {
          const isNewPlayer = !roomInfo.players.some(
            (player) => player.uuid === payload.player.uuid,
          );

          const players = isNewPlayer
            ? [...roomInfo.players, payload.player]
            : roomInfo.players.map((player) => {
              if (player.uuid === payload.player.uuid) {
                return payload.player;
              }

              return player;
            });

          sendJsonMessage({
            broadcast: true,
            type: WebSocketClientAction.UPDATE_ROOM_INFORMATION,
            topic: roomId,
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
          const selectedAreas = [...roomInfo.gameInfo.selectedAreas, payload].filter(
            (area, index, self) =>
              self.findIndex(
                (a) => a.location.x === area.location.x && a.location.y === area.location.y,
              ) === index,
          );

          const clickedCellBoardAreas = selectedAreas.filter(
            (area) => area.location.x === payload.location.x,
          );
          const teamAreas = clickedCellBoardAreas.filter(
            (area) => area.player.team === payload.player.team,
          );

          const wonBoardGame = checkBoardWin(teamAreas.map((area) => area.location.y));
          const boardWinners = roomInfo.gameInfo.boardWinners ?? {};

          let gameWinner: Team | undefined = undefined;

          if (wonBoardGame && payload.player.team) {
            boardWinners[payload.location.x] = payload.player.team;

            const teamBoards = Object.entries(boardWinners)
              .filter(([, team]) => team === payload.player.team)
              .map(([n]) => Number(n));

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
            },
          });
        }
        break;
      }

      default:
        console.warn('Unknown message type', lastJsonMessage);
        break;
    }
  }, [lastJsonMessage]);

  const updatePlayerInfo = (info: PlayerInfo) => {
    setPlayerInfo(info);
    storageService.setItem(PLAYER_INFO_KEY, info);
  };

  const updateRoomInfo = (info: RoomInfo) => {
    setRoomInfo(info);
    storageService.setItem(`${roomId}-${ROOM_INFO_KEY}`, info);
  };

  const isRoomHost = roomInfo?.host === playerInfo?.uuid;

  return {
    isRoomHost,
    playerInfo,
    roomInfo,
    updatePlayerInfo,
    updateRoomInfo,
  }
}
