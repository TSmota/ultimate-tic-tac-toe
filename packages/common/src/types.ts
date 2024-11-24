export type AreaLocation = {
  x: number;
  y: number;
}

export interface PlayerInfo {
  username: string;
  isHost: boolean;
}

export interface RoomInfo {
  players: string[];
  variant: string;
}
