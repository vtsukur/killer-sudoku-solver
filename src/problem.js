import _ from 'lodash';

export const SIZE = 9;
export const LINE_OR_SECTION_SUM = 45;
export const WHOLE_SUM = SIZE * LINE_OR_SECTION_SUM;
export const MAX_CELLS = SIZE * SIZE;

export class Problem {
    constructor(inputSums) {
        this.inputSums = [...inputSums];
    }
    
    checkCorrectness() {
        const overallSumMatches = this.inputSums.reduce((prev, current) => prev + current.value, 0) === WHOLE_SUM;

        const allCells = this.inputSums.flatMap(sum => sum.cells);
        const cellCountMatches = allCells.length === MAX_CELLS;
        let cellUniquePresenceMatch = true;

        for (var i = 1; i <= SIZE; i++) {
            for (var j = 1; j <= SIZE; j++) {
                cellUniquePresenceMatch = cellUniquePresenceMatch && allCells.filter(cell => cell.x === i && cell.y === j).length === 1;
            }
        }

        return overallSumMatches && cellCountMatches && cellUniquePresenceMatch;
    }
}

export class InputSum {
    constructor(value, cells = []) {
        this.value = value;
        this.cells = [...cells];
    }

    addCell(cell) {
        this.cells.push(cell);
    }
}

export class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
