import { Message, MQEmitter } from 'mqemitter';
import type { WebSocket } from 'ws';
import {
  type WebSocketMessage,
  WebSocketClientAction,
  WebSocketServerAction,
  type JoinGameMessage,
  type StartGameMessage,
  type UpdateRoomInformationMessage,
  type ClickCellMessage,
  type PlayerInfo,
  WebSocketCommonAction,
  type KeepAliveMessage,
  type PlayerJoinedMessage,
  type GameStartedMessage,
  type RoomInformationMessage
} from '@repo/commons';

import { RoomState } from '../types';

export class GameRoomSocketHandler {
  static KEEP_ALIVE_TIMEOUT = 15 * 1000;

  keepAliveTimeoutId?: NodeJS.Timeout;
  player?: PlayerInfo;

  constructor(
    private socket: WebSocket,
    private emitter: MQEmitter,
    private roomId: string,
    private rooms: Map<string, RoomState>,
  ) {
    this.socket.on('message', (message) => {
      const parsedMessage: WebSocketMessage = JSON.parse(message.toString());

      this.handleMessage(parsedMessage);
    });

    this.socket.on('close', () => {
      this.emitter.removeListener(this.roomId, this.listener);

      if (this.player?.uuid === this.rooms.get(this.roomId)?.host) {
        this.rooms.delete(this.roomId);
      }
    });

    this.startOrResetTimeout();
  }

  listener = (message: Message, done: () => void) => {
    if (
      message.topic === this.roomId &&
      (message.broadcast || message.player?.uuid === this.player?.uuid)
    ) {
      this.socket.send(JSON.stringify(message));
    }

    done();
  };

  startOrResetTimeout() {
    if (this.keepAliveTimeoutId) {
      clearTimeout(this.keepAliveTimeoutId);
    }

    this.keepAliveTimeoutId = setTimeout(() => {
      this.socket.close();
    }, GameRoomSocketHandler.KEEP_ALIVE_TIMEOUT);
  }

  handleMessage(parsedMessage: WebSocketMessage) {
    if (parsedMessage.type !== WebSocketCommonAction.KEEP_ALIVE) {
      console.log('Received message:', parsedMessage);
    }

    switch (parsedMessage.type) {
      case WebSocketCommonAction.KEEP_ALIVE:
        this.handleKeepAlive();
        break;
      case WebSocketClientAction.UPDATE_PLAYER_INFO:
        this.handlePlayerJoinGame(parsedMessage);
        break;
      case WebSocketClientAction.UPDATE_ROOM_INFORMATION:
        this.handleUpdateRoomInformation(parsedMessage);
        break;
      case WebSocketClientAction.START_GAME:
        this.handleStartGame(parsedMessage);
        break;
      case WebSocketClientAction.CLICK_CELL:
        this.handleClickCell(parsedMessage);
        break;
      default:
        console.warn('Unknown message type', typeof parsedMessage, parsedMessage);
        break;
    }
  }

  handleKeepAlive() {
    if (!this.rooms.has(this.roomId)) {
      return;
    }

    this.startOrResetTimeout();

    this.socket.send(
      JSON.stringify({
        type: WebSocketCommonAction.KEEP_ALIVE,
        topic: this.roomId,
        payload: 'pong',
      } as KeepAliveMessage),
    );
  }

  handlePlayerJoinGame(message: JoinGameMessage) {
    this.emitter.on(this.roomId, this.listener);
    this.player = message.payload.player;

    this.emitter.emit({
      broadcast: true,
      type: WebSocketServerAction.PLAYER_INFO,
      topic: this.roomId,
      payload: {
        player: message.payload.player,
      },
    } as PlayerJoinedMessage);
  }

  handleUpdateRoomInformation(message: UpdateRoomInformationMessage) {
    const payload: RoomInformationMessage['payload'] = {
      gameInfo: message.payload.gameInfo,
      gameStarted: message.payload.gameStarted,
      host: message.payload.host,
      players: message.payload.players,
      variant: message.payload.variant,
    };

    this.emitter.emit({
      broadcast: true,
      type: WebSocketServerAction.ROOM_INFORMATION,
      topic: this.roomId,
      payload,
    } as RoomInformationMessage);

    this.rooms.set(this.roomId, {
      host: payload.host,
      room: payload.variant,
      players: payload.players.length,
    });
  }

  handleClickCell(message: ClickCellMessage) {
    this.emitter.emit({
      broadcast: true,
      type: WebSocketServerAction.CELL_CLICKED,
      topic: this.roomId,
      payload: {
        location: message.payload.location,
        player: message.payload.player,
      },
    } as ClickCellMessage);
  }

  handleStartGame(message: StartGameMessage) {
    this.emitter.emit({
      broadcast: true,
      type: WebSocketServerAction.GAME_STARTED,
      topic: this.roomId,
      payload: {
        players: message.payload.players,
      },
    } as GameStartedMessage);
  }
}
