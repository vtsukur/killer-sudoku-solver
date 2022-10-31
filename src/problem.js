import _ from 'lodash';

export const SIZE = 9;
export const LINE_OR_SECTION_SUM = 45;
export const WHOLE_SUM = SIZE * LINE_OR_SECTION_SUM;

export class Problem {
    constructor(inputSums) {
        this.inputSums = [...inputSums];
    }
    
    validate() {
        return this.inputSums.reduce((prev, current) => prev + current.value, 0) === WHOLE_SUM;
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
