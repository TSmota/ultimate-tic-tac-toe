import { GameInfo, Team } from "../commons/types";

export function getTeamTurn(gameInfo: GameInfo): Team {
  const lastMove = gameInfo.selectedAreas[gameInfo.selectedAreas.length - 1];

  if (!lastMove) {
    return 'X';
  }

  return lastMove.player.team === 'X' ? 'O' : 'X';
}
