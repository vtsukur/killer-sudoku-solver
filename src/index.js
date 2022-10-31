import problemReader from './reader.js';

class InputSum {
    constructor({ value, cells }) {
        this.value = value;
        this.cells = [...cells];
    }
}

class Field {
    constructor({ inputSums }) {
        this.inputSums = [...inputSums];
    }

    solve() {

    }
}

new Field({
    inputSums: [
    ]
}).solve();

console.log(problemReader('./problems/1.txt'));
