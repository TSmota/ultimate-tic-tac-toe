import { GameVariant } from "./game-variants";

export type AreaLocation = {
  x: number;
  y: number;
}

export interface PlayerInfo {
  isHost?: boolean;
  username: string;
  uuid: string;
}

export interface SelectedArea {
  player: PlayerInfo;
  location: AreaLocation;
}

export interface RoomInfo {
  selectedAreas?: SelectedArea[];
  players: PlayerInfo[];
  variant: GameVariant;
}
