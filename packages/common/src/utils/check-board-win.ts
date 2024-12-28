const winPatterns: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function checkBoardWin(ownedAreas: number[]): boolean {
  return winPatterns.some((pattern) => {
    const [a, b, c] = pattern;

    return ownedAreas.includes(a) && ownedAreas.includes(b) && ownedAreas.includes(c);
  });
}
