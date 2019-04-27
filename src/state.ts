import { colors } from "./constants";

interface ActionObject {
  type: string;
  payload: any;
}

export const reducer = (state: any, action: ActionObject) => {
  switch (action.type) {
    case "SET_COLOR":
      if (state.currentColor === action.payload) return state;
      return {
        currentPlayer: state.currentPlayer === 0 ? 1 : 0,
        currentColor: action.payload,
        zone: getNewZoneFromColor(
          state.zone,
          state.currentPlayer,
          action.payload
        )
      };

    default:
      state;
  }
};

const getNewZoneFromColor = (
  zone: any[][],
  currentPlayer: 0 | 1,
  color: colorType
) => {
  const isOwned = getIsOwned(zone, currentPlayer);
  const isSameColor = getIsSameColor(zone, color)
  return zone.map(line =>
    line.map(col => {
      if (col.ownedBy === currentPlayer) {
        return {
          ...col,
          color
        };
      }
      if (col.color === color && col.ownedBy === null) {
        if (getColorLinkRecursive(isOwned, isSameColor, col.lineIndex, col.colIndex, [])) {
          return {
            ...col,
            ownedBy: currentPlayer
          };
        }
      }

      return col;
    })
  );
};

const getColorLinkRecursive = (isOwned: any, isSameColor: any, y: number, x: number, alreadyCheck: string[]): boolean => {
  const newAlreadyCheck = [...alreadyCheck, `${y}${x}`];
  const pair = (y % 2) === 0;
  return [
    [y, x - 1],
    [y, x + 1],
    [y - 1, pair ? x - 1 : x],
    [y - 1, pair ? x : x + 1],
    [y + 1, pair ? x - 1 : x],
    [y + 1, pair ? x : x + 1]
  ].some((element) => {
    if (isOwned(element)) {
      console.log('isOwned')
      return true
    } else if (isSameColor(element, newAlreadyCheck)) {
      console.log('isSameColor')
      return getColorLinkRecursive(isOwned, isSameColor, element[0], element[1], newAlreadyCheck);
    }
    return false;
  });
}

const getIsOwned = (zone: any[][], currentPlayer: 0 | 1) => (indexes: number[]) => {
  const [y, x] = indexes;
  const line = zone[y];
  if (line) {
    const element = line[x];
    return (
      element && element.ownedBy === currentPlayer
    );
  }
  return false;
};

const getIsSameColor = (zone: any[][], color: colorType) => (indexes: number[], alreadyCheck: string[]) => {
  const [y, x] = indexes;
  const indexKey = `${y}${x}`;
  if (alreadyCheck.some(element => element === indexKey)) {
    return false;
  }
  const line = zone[y];
  if (line) {
    const element = line[x];
    return (
      element && element.ownedBy === null && element.color === color
    );
  }
  return false;
};

// init
const getColor = (colIndex: number, lineIndex: number) => {
  if (colIndex === 0 && lineIndex === 0) {
    return 'black';
  } else if (lineIndex === 24 && colIndex === 49) {
    return 'black';
  }
  const random = Math.floor((Math.random() * 100) % 6);
  return colors[random];
};

const generateHexaProps = (colIndex: number, lineIndex: number) => ({
  color: getColor(colIndex, lineIndex),
  ownedBy: getOwnedBy(colIndex, lineIndex),
  colIndex,
  lineIndex
});

const getOwnedBy = (colIndex: number, lineIndex: number) => {
  if (colIndex === 0 && lineIndex === 0) {
    return 0;
  } else if (lineIndex === 24 && colIndex === 49) {
    return 1;
  } else {
    return null;
  }
};

export const initialState = {
  zone: Array(25)
    .fill(0)
    .map((_, lineNumber) =>
      Array(50)
        .fill(0)
        .map((_, colNumber) => generateHexaProps(colNumber, lineNumber))
    ),
  currentPlayer: 0,
  currentColor: null
};
