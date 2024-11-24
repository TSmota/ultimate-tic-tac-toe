import { Message, MQEmitter } from 'mqemitter';
import type { WebSocket } from 'ws';
import {
  WebSocketMessage,
  WebSocketClientAction,
  WebSocketServerAction,
  JoinGameMessage,
  StartGameMessage,
  UpdateRoomInformationMessage,
  ClickCellMessage,
} from '@repo/commons';

export class GameRoomSocketHandler {
  username?: string;

  constructor(
    private socket: WebSocket,
    private emitter: MQEmitter,
    private roomId: string,
  ) {
    this.handleConnection();
  }

  handleConnection() {
    this.socket.on('message', (message) => {
      const parsedMessage: WebSocketMessage = JSON.parse(message.toString());

      this.handleMessage(parsedMessage);
    });

    this.socket.on('close', () => {
      this.emitter.removeListener(this.roomId, this.listener);
    });
  }

  listener = (message: Message, done: () => void) => {
    if (
      message.topic === this.roomId &&
      (message.broadcast || message.username === this.username)
    ) {
      this.socket.send(JSON.stringify(message));
    }

    done();
  };

  handleMessage(parsedMessage: WebSocketMessage) {
    console.log('Received message:', parsedMessage);
    switch (parsedMessage.type) {
      case WebSocketClientAction.JOIN_GAME:
        this.handlePlayerJoined(parsedMessage);
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

  handlePlayerJoined(message: JoinGameMessage) {
    this.emitter.on(this.roomId, this.listener);
    this.username = message.payload.username;

    this.emitter.emit({
      broadcast: true,
      type: WebSocketServerAction.PLAYER_JOINED,
      topic: this.roomId,
      payload: {
        username: message.payload.username,
      },
    });
  }

  handleUpdateRoomInformation(message: UpdateRoomInformationMessage) {
    this.emitter.emit({
      broadcast: true,
      type: WebSocketServerAction.ROOM_INFORMATION,
      topic: this.roomId,
      payload: {
        players: message.payload.players,
        variant: message.payload.variant,
      },
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
    });
  }

  handleStartGame(message: StartGameMessage) {
    this.emitter.emit({
      broadcast: true,
      type: WebSocketServerAction.GAME_STARTED,
      topic: this.roomId,
      payload: {
        players: message.payload.players,
      },
    });
  }
}
