import { AreaLocation, SelectedArea, Team } from "@repo/commons";

import { BoardArea } from "./board-area";

const N = 3;
const areas = Array.from({ length: N * N }).map((_, i) => i);

interface BoardProps {
  disabled?: boolean;
  boardWinner?: Team;
  selectedAreas?: SelectedArea[];
  onClick: (area: AreaLocation) => void;
  parentArea: number;
}

export function Board(props: BoardProps) {
  const { disabled, boardWinner, selectedAreas = [], onClick, parentArea: x } = props;

  const handleOnClick = (area: AreaLocation) => {
    onClick(area);
  }

  return (
    <>
      {boardWinner && (
        <div className="absolute inset-0.5 flex items-center justify-center bg-black bg-opacity-90">
          <p className="text-6xl text-white">{boardWinner}</p>
        </div>
      )}
      {disabled && !boardWinner && (
        <div className="absolute inset-0.5 flex bg-[#a8a29ecc] cursor-not-allowed" />
      )}
      {areas.map((y) => (
        <BoardArea key={y}>
          <button
            className="size-16 text-4xl hover:bg-accent hover:cursor-pointer"
            disabled={disabled}
            onClick={() => { handleOnClick({ x, y }) }}
            type="button"
          >
            {selectedAreas.find((area) => area.location.x === x && area.location.y === y)?.player.team}
          </button>
        </BoardArea>
      ))}
    </>
  )
}
