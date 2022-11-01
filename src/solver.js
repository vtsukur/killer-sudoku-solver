import { GRID_SIDE_LENGTH } from './problem';

export function digitSetsForSum(sum, count) {
    const sets = [];
    const digits = new Array(count);
    let currentSum = 0;

    function combinationsRecursive(level, nextStartingDigit) {
        if (level > count) {
            if (currentSum === sum) {
                sets.push(new Set(digits));
            }
        } else {
            for (let i = nextStartingDigit; i <= GRID_SIDE_LENGTH; ++i) {
                if (currentSum + i > sum) {
                    return;
                } else {
                    digits[level - 1] = i;
                    currentSum += i;
                    combinationsRecursive(level + 1, i + 1);
                    currentSum -= i;
                }
            }
        }
    }

    combinationsRecursive(1, 1);

    return sets;
}

export class SummedArea {
    constructor(sum, cells) {
        this.sum = sum;
        this.cells = cells;
        this.subgridsIndices = new Set(cells.collect(cell => cell.subgridIndex));
    }

    reduceOptions() {

    }
}

export class Solver {

}
