'use client';

import { PlayerInfo, SelectedArea, type AreaLocation } from "@repo/commons";
import { type PropsWithChildren } from "react";
import { cn } from "@src/lib/utils";

const N = 3;
const areas = Array.from({ length: N * N }).map((_, i) => i);

function Area(props: PropsWithChildren) {
  return (
    <div className="border border-gray-300 flex items-center justify-center">
      {props.children}
    </div>
  )
}

interface TicTacToeProps {
  currentPlayer?: PlayerInfo;
  onClick: (area: AreaLocation) => void;
  selectedAreas?: SelectedArea[];
}

export function TicTacToe(props: TicTacToeProps) {
  const { currentPlayer, onClick, selectedAreas } = props;

  const getBackgroundColor = (x: number, y: number) => {
    const selected = selectedAreas?.find((area) => area.location.x === x && area.location.y === y)

    if (!selected) {
      return '';
    }

    return currentPlayer?.uuid === selected.player.uuid ? 'bg-green-500' : 'bg-red-400';
  }

  return (
    <div className="grid grid-cols-3 m-4 w-fit">
      {areas.map((x) => (
        <Area key={x}>
          <div className="grid grid-cols-3 w-full h-full p-4">
            {areas.map((y) => (
              <Area key={y}>
                <button
                  className={cn('w-16 h-16 hover:bg-accent hover:cursor-pointer', {
                    [getBackgroundColor(x, y)]: true,
                  })}
                  onClick={() => { onClick({ x, y }); }}
                  type="button"
                />
              </Area>
            ))}
          </div>
        </Area>
      ))}
    </div>
  );
}