import _ from 'lodash';
import { GRID_SIDE_LENGTH } from './problem';

const MIN_SUMS_PER_COUNT = new Array(GRID_SIDE_LENGTH);
const MAX_SUMS_PER_COUNT = new Array(GRID_SIDE_LENGTH);
_.range(0, GRID_SIDE_LENGTH).forEach(count => {
    if (count == 0) {
        MIN_SUMS_PER_COUNT[count] = 1;
        MAX_SUMS_PER_COUNT[count] = GRID_SIDE_LENGTH;
    } else {
        MIN_SUMS_PER_COUNT[count] = MIN_SUMS_PER_COUNT[count - 1] + (count + 1);
        MAX_SUMS_PER_COUNT[count] = MAX_SUMS_PER_COUNT[count - 1] + (GRID_SIDE_LENGTH - count);
    }
})

export function digitSetsForSum(sum, count) {
    if (sum <= 0 || count <= 0 || sum < MIN_SUMS_PER_COUNT[count - 1] || sum > MAX_SUMS_PER_COUNT[count - 1]) {
        return [];
    }

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
