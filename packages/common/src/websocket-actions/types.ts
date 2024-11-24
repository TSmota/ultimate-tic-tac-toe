import { AreaLocation, PlayerInfo, RoomInfo } from '../commons/types';
import { WebSocketClientAction, WebSocketServerAction } from './constants';

interface BaseMessage {
  broadcast: boolean;
  type: WebSocketClientAction | WebSocketServerAction;
  topic: string;
}

export interface JoinGameMessage extends BaseMessage {
  type: WebSocketClientAction.JOIN_GAME;
  payload: {
    player: PlayerInfo;
  };
}

export interface StartGameMessage extends BaseMessage {
  type: WebSocketClientAction.START_GAME;
  payload: {
    players: PlayerInfo[];
  };
}

export interface ClickCellMessage extends BaseMessage {
  type: WebSocketClientAction.CLICK_CELL;
  payload: {
    location: AreaLocation;
    player: PlayerInfo;
  };
}

export interface ClickedCellMessage extends BaseMessage {
  type: WebSocketServerAction.CELL_CLICKED;
  payload: {
    location: AreaLocation;
    player: PlayerInfo;
  };
}

export interface PlayerJoinedMessage extends BaseMessage {
  type: WebSocketServerAction.PLAYER_JOINED;
  payload: {
    player: PlayerInfo;
  };
}

export interface UpdateRoomInformationMessage extends BaseMessage {
  type: WebSocketClientAction.UPDATE_ROOM_INFORMATION;
  payload: RoomInfo;
}

export interface RoomInformationMessage extends BaseMessage {
  type: WebSocketServerAction.ROOM_INFORMATION;
  payload: RoomInfo;
}

export interface GameStartedMessage extends BaseMessage {
  type: WebSocketServerAction.GAME_STARTED;
  payload: {
    players: PlayerInfo[];
  };
}

export interface GameEndedMessage extends BaseMessage {
  type: WebSocketServerAction.GAME_ENDED;
  payload: {
    winner: PlayerInfo;
  };
}

export type WebSocketMessage =
  | JoinGameMessage
  | StartGameMessage
  | ClickCellMessage
  | ClickedCellMessage
  | PlayerJoinedMessage
  | UpdateRoomInformationMessage
  | RoomInformationMessage
  | GameStartedMessage
  | GameEndedMessage;