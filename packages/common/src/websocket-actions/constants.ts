export enum WebSocketClientAction {
  KEEP_ALIVE = 'keep-alive',

  JOIN_GAME = 'join-game',
  START_GAME = 'start-game',
  CLICK_CELL = 'click-cell',
  UPDATE_ROOM_INFORMATION = 'update-room-information',
}

export enum WebSocketServerAction {
  KEEP_ALIVE = 'keep-alive',

  GAME_STARTED = 'game-started',
  GAME_ENDED = 'game-ended',
  CELL_CLICKED = 'cell-clicked',
  PLAYER_JOINED = 'player-joined',
  ROOM_INFORMATION = "room-information",
}
