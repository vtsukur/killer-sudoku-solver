import { GRID_SIDE_LENGTH } from './problem';

export function digitSetsForSum(sum, count) {
	const allCombinations = new Set();

	const wipState = [];
	wipState.length = count;

	function hasUniqueNumbers() {
		return new Set(wipState).size === wipState.length;
	}

	function currentSum() {
		return wipState.reduce((partialSum, a) => partialSum + a, 0);
	}

	function normalizeAndAddPerm() {
		allCombinations.add([...wipState].sort().join(""));
	}

	function combinationsRecursive(level) {
		if (level > count) {
			if (hasUniqueNumbers() && currentSum() === sum) {
				normalizeAndAddPerm();
			}
		} else {
			for (let i = 1; i <= GRID_SIDE_LENGTH; ++i) {
				wipState[level - 1] = i;
				combinationsRecursive(level + 1);
			}
		}
	}

	combinationsRecursive(1);

	return Array.from(allCombinations.values()).map(comboStr => {
        console.log(comboStr);
        return new Set(comboStr.split('').map(s => parseInt(s)))
    });
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
