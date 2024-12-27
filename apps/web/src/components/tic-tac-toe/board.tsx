import { cn } from "@src/lib/utils";
import { BoardArea } from "./board-area";
import { AreaLocation, isAreaDisabled, SelectedArea } from "@repo/commons";

const N = 3;
const areas = Array.from({ length: N * N }).map((_, i) => i);

interface BoardProps {
  disabled?: boolean;
  selectedAreas?: SelectedArea[];
  onClick: (area: AreaLocation) => void;
  parentArea: number;
}

export function Board(props: BoardProps) {
  const { disabled, selectedAreas = [], onClick, parentArea: x } = props;

  const getBackgroundColor = (x: number, y: number) => {
    const selected = selectedAreas.find((area) => area.location.x === x && area.location.y === y)

    if (selected) {
      return '';
    }

    return 'disabled:bg-[#fff2]';
  }

  const handleOnClick = (area: AreaLocation) => {
    onClick(area);
  }

  return (
    <>
      {areas.map((y) => (
        <BoardArea key={y}>
          <button
            className={cn('size-16 text-4xl [&:not([disabled])]:hover:bg-accent hover:cursor-pointer disabled:cursor-not-allowed', {
              [getBackgroundColor(x, y)]: true,
            })}
            disabled={disabled || isAreaDisabled({ x, y }, selectedAreas)}
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
