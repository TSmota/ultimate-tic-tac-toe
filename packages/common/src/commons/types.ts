import { GameVariant } from "./game-variants";

export type Team = 'X' | 'O';

export type AreaLocation = {
  x: number;
  y: number;
}

export interface PlayerInfo {
  team?: Team;
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
  host: string;
  players: PlayerInfo[];
  variant: GameVariant;
}
