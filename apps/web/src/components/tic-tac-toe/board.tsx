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

function toLocationKey(location: AreaLocation) {
  return `${location.x}${location.y}`;
}

export function Board(props: BoardProps) {
  const { disabled, boardWinner, selectedAreas = [], onClick, parentArea: x } = props;

  const selectedAreasMap = selectedAreas.reduce((map, area) => {
    map.set(toLocationKey(area.location), area);

    return map;
  }, new Map<string, SelectedArea>());

  const handleOnClick = (area: AreaLocation) => {
    if (disabled || selectedAreasMap.has(toLocationKey(area))) {
      return;
    }

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
            {selectedAreasMap.get(toLocationKey({ x, y }))?.player.team}
          </button>
        </BoardArea>
      ))}
    </>
  )
}
