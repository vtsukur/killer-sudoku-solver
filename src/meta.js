export class Problem {
    constructor(inputSums) {
        this.inputSums = [...inputSums];
    }
    
    equals(a) {
        return this.inputSums.every(v => a.inputSums.find(v));
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
        return this.value === value && this.cells.every(v => a.cells.find(v));
    }
}

export class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(a) {
        return this.x === x && this.y === this.y;
    }
}
