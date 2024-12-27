import { AreaLocation, SelectedArea } from "../commons/types";

export function isAreaDisabled(location: AreaLocation, selectedAreas: SelectedArea[] = []): boolean {
  if (!selectedAreas.length) {
    return false;
  }

  const lastMove = selectedAreas[selectedAreas.length - 1];

  return location.x !== lastMove?.location.y || selectedAreas.some((area) => area.location.x === location.x && area.location.y === location.y);
}
