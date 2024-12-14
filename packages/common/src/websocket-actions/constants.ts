export enum WebSocketCommonAction {
  KEEP_ALIVE = 'keep-alive',
}

export enum WebSocketClientAction {
  CLICK_CELL = 'click-cell',
  START_GAME = 'start-game',
  UPDATE_PLAYER_INFO = 'update-player-info',
  UPDATE_ROOM_INFORMATION = 'update-room-information',
}

export enum WebSocketServerAction {
  CELL_CLICKED = 'cell-clicked',
  GAME_STARTED = 'game-started',
  GAME_ENDED = 'game-ended',
  PLAYER_INFO = 'player-info',
  ROOM_INFORMATION = "room-information",
}
