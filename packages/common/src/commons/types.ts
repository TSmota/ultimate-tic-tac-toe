import { GameVariant } from "./game-variants";

export type AreaLocation = {
  x: number;
  y: number;
}

export interface PlayerInfo {
  isHost?: boolean;
  team?: 'X' | 'O';
  username: string;
  uuid: string;
}

export interface SelectedArea {
  player: PlayerInfo;
  location: AreaLocation;
}

export interface GameInfo {
  players?: [PlayerInfo, PlayerInfo];
  selectedAreas: SelectedArea[];
}

export interface RoomInfo {
  gameStarted?: boolean;
  gameInfo: GameInfo;
  players: PlayerInfo[];
  variant: GameVariant;
}
