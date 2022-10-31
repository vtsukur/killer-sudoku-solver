import _ from 'lodash';

export const SIZE = 9;

export class Problem {
    constructor(inputSums) {
        this.inputSums = [...inputSums];
    }
    
    equals(a) {
        return _.isEqual(this, a);
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

    equals(a) {
        return _.isEqual(this, a);
    }
}

export class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(a) {
        return _.isEqual(this, a);
    }
}
