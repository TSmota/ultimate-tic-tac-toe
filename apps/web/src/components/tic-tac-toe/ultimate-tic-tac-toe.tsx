'use client';

import { type AreaLocation, GameInfo, isDefined } from "@repo/commons";

import { BoardArea } from "./board-area";
import { Board } from "./board";

const N = 3;
const areas = Array.from({ length: N * N }).map((_, i) => i);

interface TicTacToeProps {
  disabled?: boolean;
  gameInfo: GameInfo;
  onClick: (area: AreaLocation) => void;
}

export function UltimateTicTacToe(props: TicTacToeProps) {
  const { disabled, gameInfo, onClick, } = props;

  const handleOnClick = (area: AreaLocation) => {
    onClick(area);
  }

  return (
    <div className="grid grid-cols-3 m-4 w-fit">
      {areas.map((x) => {
        const isDisabled = disabled || isDefined(gameInfo.currentBoard) && gameInfo.currentBoard !== x;

        return (
          <BoardArea key={x}>
            <div className="grid grid-cols-3 w-full h-full p-4 relative">
              <Board
                disabled={isDisabled}
                boardWinner={gameInfo.boardWinners?.[x]}
                onClick={handleOnClick}
                parentArea={x}
                selectedAreas={gameInfo.selectedAreas}
              />
            </div>
          </BoardArea>
        );
      })}
    </div>
  );
}
