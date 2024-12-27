'use client';

import { PlayerInfo, SelectedArea, type AreaLocation } from "@repo/commons";
import { BoardArea } from "./board-area";
import { Board } from "./board";

const N = 3;
const areas = Array.from({ length: N * N }).map((_, i) => i);

interface TicTacToeProps {
  currentPlayer?: PlayerInfo;
  disabled?: boolean;
  onClick: (area: AreaLocation) => void;
  selectedAreas?: SelectedArea[];
}

export function UltimateTicTacToe(props: TicTacToeProps) {
  const { disabled, onClick, selectedAreas = [] } = props;

  const handleOnClick = (area: AreaLocation) => {
    onClick(area);
  }

  return (
    <div className="grid grid-cols-3 m-4 w-fit">
      {areas.map((x) => (
        <BoardArea key={x}>
          <div className="grid grid-cols-3 w-full h-full p-4">
            <Board disabled={disabled} onClick={handleOnClick} parentArea={x} selectedAreas={selectedAreas} />
          </div>
        </BoardArea>
      ))}
    </div>
  );
}
