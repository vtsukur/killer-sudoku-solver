import _ from 'lodash';
import { newGridMatrix } from '../util/matrix';
import { House } from '../problem/house';
import { Cage } from '../problem/cage';
import { CellSolver } from './cellSolver';
import { CageSolver } from './cageSolver';
import { CagesArea } from './cagesArea';
import { findSumCombinationsForSegment } from './combinatorial';

const newAreaIterator = (valueOfFn, max) => {
    let i = 0;
    return {
        [Symbol.iterator]() { return this; },
        next() {
            if (i < max) {
                return { value: valueOfFn(i++), done: false };
            } else {
                return { value: max, done: true };
            }
        }
    }
};

const newSegmentIterator = (valueOfFn) => {
    return newAreaIterator(valueOfFn, House.SIZE);
};

class HouseSolver {
    #cagesArea;

    constructor(idx, cells, inputCages = [], cellIteratorFn) {
        this.idx = idx;
        this.cells = cells;
        this.cages = inputCages;
        this.#cagesArea = new CagesArea(this.cages);
        this.cellIteratorFn = cellIteratorFn;
    }

    determineResidualCage() {
        if (this.#cagesArea.totalValue === House.SUM && this.#cagesArea.cellsSet.size === House.SIZE) {
            return;
        }

        const residualCageCells = [];
        this.cells.forEach(cell => {
            if (!this.#cagesArea.hasNonOverlapping(cell)) {
                residualCageCells.push(cell);
            }
        }, this);

        return new Cage(House.SUM - this.#cagesArea.totalValue, residualCageCells);
    }

    addCage(newCage) {
        this.cages.push(newCage);
        this.#cagesArea = new CagesArea(this.cages);
    }

    removeCage(cageToRemove) {
        this.cages = this.cages.filter(cage => cage !== cageToRemove);
        this.#cagesArea = new CagesArea(this.cages);
    }

    cellIterator() {
        return this.cellIteratorFn(this.idx);
    }
}

export class RowSolver extends HouseSolver {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, RowSolver.iteratorFor);
    }

    static iteratorFor(idx) {
        return newSegmentIterator(colIdx => {
            return { rowIdx: idx, colIdx };
        });
    }
}

export class ColumnSolver extends HouseSolver {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, ColumnSolver.iteratorFor);
    }

    static iteratorFor(idx) {
        return newSegmentIterator(rowIdx => {
            return { rowIdx, colIdx: idx };
        });
    }
}

export class NonetSolver extends HouseSolver {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, NonetSolver.iteratorFor);
    }

    static iteratorFor(idx) {
        return newSegmentIterator(i => {
            const subgridStartingRowIdx = Math.floor(idx / House.NONET_SIDE_LENGTH) * House.NONET_SIDE_LENGTH;
            const subgridStartingColIdx = (idx % House.NONET_SIDE_LENGTH) * House.NONET_SIDE_LENGTH;
            const rowIdx = subgridStartingRowIdx + Math.floor(i / House.NONET_SIDE_LENGTH);
            const colIdx = subgridStartingColIdx + i % House.NONET_SIDE_LENGTH;
            return { rowIdx, colIdx };
        });
    }
}

export class Solver {
    #solution;
    #placedNumbersCount;

    constructor(problem) {
        this.problem = problem;
        this.inputCages = [];
        this.inputCagesMatrix = newGridMatrix();
        this.cagesSolversMap = new Map();
        this.cellsMatrix = newGridMatrix();
        this.#solution = newGridMatrix();
        this.#placedNumbersCount = 0;

        problem.cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this.inputCagesMatrix[cell.rowIdx][cell.colIdx] = cage;
                this.cellsMatrix[cell.rowIdx][cell.colIdx] = cell;
            }, this);
            this.inputCages.push(cage);
        }, this);

        this.rows = [];
        this.columns = [];
        this.subgrids = [];
        _.range(House.SIZE).forEach(i => {
            this.rows.push(new RowSolver(i, this.#collectSegmentCells(RowSolver.iteratorFor(i))));
            this.columns.push(new ColumnSolver(i, this.#collectSegmentCells(ColumnSolver.iteratorFor(i))));
            this.subgrids.push(new NonetSolver(i, this.#collectSegmentCells(NonetSolver.iteratorFor(i))));
        }, this);

        this.cellSolversMatrix = newGridMatrix();
        this.problem.cells.forEach(cell => {
            this.cellSolversMatrix[cell.rowIdx][cell.colIdx] = new CellSolver({
                cell,
                rowSolver: this.rows[cell.rowIdx],
                columnSolver: this.columns[cell.colIdx],
                nonetSolver: this.subgrids[cell.subgridIdx]
            });
        }, this);

        problem.cages.forEach(cage => {
            this.#registerCage(cage);
        }, this);

        this.segments = [[...this.rows], [...this.columns], [...this.subgrids]].flat();
    }

    #collectSegmentCells(iterator) {
        return Array.from(iterator).map(coords => this.cellAt(coords.rowIdx, coords.colIdx), this);
    }

    solve() {
        this.#determineAndSliceResidualCagesInAdjacentNSegmentAreas();
        this.#determineAndSliceResidualCagesInSegments();
        this.#fillUpCombinationsForCagesAndMakeInitialReduce();
        this.#mainReduce();

        return this.#solution;
    }

    #determineAndSliceResidualCagesInAdjacentNSegmentAreas() {
        _.range(2, 9).reverse().forEach(n => {
            _.range(House.SIZE - n + 1).forEach(leftIdx => {
                this.#doDetermineAndSliceResidualCagesInAdjacentNSegmentAreas(n, leftIdx, (cageSolver, rightIdxExclusive) => {
                    return cageSolver.minColIdx >= leftIdx && cageSolver.maxColIdx < rightIdxExclusive;
                }, (colIdx) => {
                    return this.columns[colIdx].cellIterator()
                });
                this.#doDetermineAndSliceResidualCagesInAdjacentNSegmentAreas(n, leftIdx, (cageSolver, rightIdxExclusive) => {
                    return cageSolver.minRowIdx >= leftIdx && cageSolver.maxRowIdx < rightIdxExclusive;
                }, (rowIdx) => {
                    return this.rows[rowIdx].cellIterator()
                });
            });
        });
    }

    #doDetermineAndSliceResidualCagesInAdjacentNSegmentAreas(n, leftIdx, withinSegmentFn, cellIteratorFn) {
        const nSegmentCellCount = n * House.SIZE;
        const nSegmentSumVal = n * House.SUM;

        const rightIdxExclusive = leftIdx + n;
        let cagesArea = new CagesArea();
        for (const cageSolver of this.cagesSolversMap.values()) {
            if (withinSegmentFn(cageSolver, rightIdxExclusive)) {
                cagesArea = new CagesArea(cagesArea.cages.concat(cageSolver.cage), nSegmentCellCount);
            }
        }
        if (cagesArea.nonOverlappingCellsSet.size > nSegmentCellCount - 6) {
            const residualCells = [];
            _.range(leftIdx, rightIdxExclusive).forEach(idx => {
                for (const { rowIdx, colIdx } of cellIteratorFn(idx)) {
                    if (!cagesArea.hasNonOverlapping(this.cellAt(rowIdx, colIdx))) {
                        residualCells.push(this.cellAt(rowIdx, colIdx));
                    }
                }
            });
            if (residualCells.length) {
                const residualCage = new Cage(nSegmentSumVal - cagesArea.totalValue, residualCells);
                if (!this.cagesSolversMap.has(residualCage.key())) {
                    this.#addAndSliceResidualCageRecursively(residualCage);                        
                }
            }
        }
    }

    #determineAndSliceResidualCagesInSegments() {
        this.segments.forEach(houseSolver => {
            const residualCage = houseSolver.determineResidualCage();
            if (residualCage) {
                this.#addAndSliceResidualCageRecursively(residualCage);
            }
        }, this);
    }

    #addAndSliceResidualCageRecursively(initialResidualCage) {
        let residualCages = [ initialResidualCage ];

        while (residualCages.length > 0) {
            const nextResidualCages = [];

            residualCages.forEach(residualCage => {
                if (this.cagesSolversMap.has(residualCage.key())) return;

                this.#registerCage(residualCage);

                const cagesForResidualCage = this.#getCagesFullyContainingResidualCage(residualCage);
                const cagesToUnregister = [];
                cagesForResidualCage.forEach(firstChunkCage => {
                    const secondChunkCage = this.#sliceCage(firstChunkCage, residualCage);
                    cagesToUnregister.push(firstChunkCage);
                    nextResidualCages.push(secondChunkCage);
                }, this);

                cagesToUnregister.forEach(cage => this.#unregisterCage(cage));
            });

            residualCages = nextResidualCages;
        }
    }

    #getCagesFullyContainingResidualCage(residualCage) {
        let allAssociatedCagesSet = new Set();
        residualCage.cells.forEach(cell => {
            allAssociatedCagesSet = new Set([...allAssociatedCagesSet, ...this.cellSolverOf(cell).withinCagesSet]);
        }, this);
        allAssociatedCagesSet.delete(residualCage);

        const result = [];
        for (const associatedCage of allAssociatedCagesSet.values()) {
            const associatedCageFullyContainsResidualCage = residualCage.cells.every(cell => {
                return this.cellSolverOf(cell).withinCagesSet.has(associatedCage);
            }, this);
            if (associatedCageFullyContainsResidualCage) {
                result.push(associatedCage);
            }
        }

        return result;
    }

    #sliceCage(cageToSlice, firstChunkCage) {
        const secondChunkCageCells = [];
        cageToSlice.cells.forEach(cell => {
            if (!firstChunkCage.has(cell)) {
                secondChunkCageCells.push(cell);
            }
        });
        return new Cage(cageToSlice.value - firstChunkCage.value, secondChunkCageCells);
    }

    #fillUpCombinationsForCagesAndMakeInitialReduce() {
        this.segments.forEach(houseSolver => {
            const combosForSegment = findSumCombinationsForSegment(houseSolver);
            houseSolver.debugCombosForSegment = combosForSegment;
            houseSolver.cages.forEach((cage, idx) => {
                const cageSolver = this.cagesSolversMap.get(cage.key());
                const combosKeySet = new Set();
                const combos = [];
                combosForSegment.forEach(combo => {
                    const comboSet = combo[idx];
                    const key = Array.from(combo[idx]).join();
                    if (!combosKeySet.has(key)) {
                        combos.push(comboSet);
                        combosKeySet.add(key);
                    }
                });
                cageSolver.updateCombinations(combos);
            }, this);
        }, this);
    }

    #mainReduce() {
        let cageSolversIterable = this.cagesSolversMap.values();
        let iterate = true;
        let newlySolvedCellDets = [];

        while (iterate) {
            if (this.#placedNumbersCount >= 81) {
                return;
            }
    
            this.#reduceCages(cageSolversIterable);
    
            const solvedCellDets = this.#determineCellsWithSingleOption();
            let nextCagesSet = this.#reduceSegmentsBySolvedCells(solvedCellDets);

            newlySolvedCellDets = newlySolvedCellDets.concat(Array.from(solvedCellDets));

            if (nextCagesSet.size > 0) {
                cageSolversIterable = nextCagesSet.values();
            } else if (newlySolvedCellDets.length > 0) {
                newlySolvedCellDets.forEach(cellSolver => {
                    const withinCagesSet = cellSolver.withinCagesSet;
                    if (!(withinCagesSet.size === 1 && withinCagesSet.values().next().value.isSingleCellCage)) {
                        const firstChunkCage = Cage.of(cellSolver.placedNumber).cell(cellSolver.cell.rowIdx, cellSolver.cell.colIdx).mk();
                        this.#addAndSliceResidualCageRecursively(firstChunkCage);
                    }
                });
                newlySolvedCellDets = [];
                nextCagesSet = new Set(this.cagesSolversMap.values());
                cageSolversIterable = nextCagesSet.values();
            }
            else {
                nextCagesSet = this.#determineUniqueCagesInSegments();
                cageSolversIterable = nextCagesSet.values();
            }

            iterate = nextCagesSet.size > 0;
        }
    }

    #reduceCages(cageSolversIterable) {
        let iterate = true;

        while (iterate) {
            let modifiedCellDets = new Set();

            for (const cageSolver of cageSolversIterable) {
                const currentlyModifiedCellDets = cageSolver.reduce();
                modifiedCellDets = new Set([...modifiedCellDets, ...currentlyModifiedCellDets]);
            }

            let moreCagesToReduce = new Set();
            for (const modifiedCellDet of modifiedCellDets.values()) {
                moreCagesToReduce = new Set([...moreCagesToReduce, ...modifiedCellDet.withinCagesSet]);
            }

            const nextCageSolversToReduce = new Set(Array.from(moreCagesToReduce).map(cage => this.cagesSolversMap.get(cage.key())));
            cageSolversIterable = nextCageSolversToReduce.values();
            iterate = nextCageSolversToReduce.size > 0;
        }
    }

    #reduceSegmentsBySolvedCells(cellsSolvers) {
        let cagesToReduceSet = new Set();
        cellsSolvers.forEach(cellSolver => {
            const number = cellSolver.placedNumber;
            [
                this.rows[cellSolver.cell.rowIdx],
                this.columns[cellSolver.cell.colIdx],
                this.subgrids[cellSolver.cell.subgridIdx]
            ].forEach(houseSolver => {
                for (const { rowIdx, colIdx } of houseSolver.cellIterator()) {
                    if (rowIdx === cellSolver.cell.rowIdx && colIdx === cellSolver.cell.colIdx) continue;
        
                    const aCellDet = this.cellSolverAt(rowIdx, colIdx);
                    if (aCellDet.hasNumOpt(number)) {
                        aCellDet.deleteNumOpt(number);
                        cagesToReduceSet = new Set([...cagesToReduceSet, ...aCellDet.withinCagesSet]);
                    }
                }    
            });
        });
        return new Set(Array.from(cagesToReduceSet).map(cage => this.cagesSolversMap.get(cage.key())));
    }

    #determineUniqueCagesInSegments() {
        let cagesToReduce = new Set();

        this.segments.forEach(houseSolver => {
            _.range(1, House.SIZE + 1).forEach(num => {
                const cageSolversWithNum = [];
                // consider overlapping vs non-overlapping cages
                houseSolver.cages.forEach(cage => {
                    if (cage.isSingleCellCage) return;
                    const cageSolver = this.cagesSolversMap.get(cage.key());
                    const hasNumInCells = cageSolver.cellSolvers.some(cellSolver => cellSolver.hasNumOpt(num));
                    if (hasNumInCells) {
                        cageSolversWithNum.push(cageSolver);
                    }
                });
                if (cageSolversWithNum.length !== 1) return;

                const cageSolverToReDefine = cageSolversWithNum[0];
                const reducedCellDets = cageSolverToReDefine.reduceToCombinationsContaining(num);
                
                if (!reducedCellDets.length) return;
                reducedCellDets.forEach(cellSolver => {
                    cagesToReduce = new Set([...cagesToReduce, ...cellSolver.withinCagesSet]);
                });

                // remove number from other cells
                const furtherReducedCellDets = new Set();
                for (const { rowIdx, colIdx } of houseSolver.cellIterator()) {
                    const cellSolver = this.cellSolverAt(rowIdx, colIdx);
                    if (cageSolverToReDefine.has(cellSolver)) return;

                    if (cellSolver.hasNumOpt(num)) {
                        cellSolver.deleteNumOpt(num);
                        furtherReducedCellDets.add(cellSolver);
                    }
                }
                furtherReducedCellDets.forEach(cellSolver => {
                    cagesToReduce = new Set([...cagesToReduce, ...cellSolver.withinCagesSet]);
                });
            });
        });

        return new Set(Array.from(cagesToReduce).map(cage => this.cagesSolversMap.get(cage.key())));
    }

    #determineCellsWithSingleOption() {
        const cellsSolvers = [];

        _.range(House.SIZE).forEach(rowIdx => {
            _.range(House.SIZE).forEach(colIdx => {
                const cellSolver = this.cellSolverAt(rowIdx, colIdx);
                if (cellSolver.numOpts().size === 1 && !cellSolver.solved) {
                    this.#placeNumber(cellSolver.cell, cellSolver.numOpts().values().next().value);
                    cellsSolvers.push(cellSolver);
                }
            });
        });

        return cellsSolvers;
    }

    #placeNumber(cell, number) {
        const cellSolver = this.cellSolverOf(cell);
        cellSolver.placeNumber(number);

        this.#solution[cell.rowIdx][cell.colIdx] = number;
        this.#placedNumbersCount++;
    }

    #registerCage(cage) {
        const cageSolver = new CageSolver(cage, cage.cells.map(cell => this.cellSolverOf(cell), this));
        if (cage.isWithinRow) {
            this.rows[cageSolver.anyRowIdx()].addCage(cage);
        }
        if (cage.isWithinColumn) {
            this.columns[cageSolver.anyColumnIdx()].addCage(cage);
        }
        if (cage.isWithinSubgrid) {
            this.subgrids[cageSolver.anySubgridIdx()].addCage(cage);
        }
        cage.cells.forEach(cell => {
            this.cellSolverOf(cell).addWithinCage(cage);
        }, this);
        this.cagesSolversMap.set(cage.key(), cageSolver);
    }

    #unregisterCage(cage) {
        const cageSolver = this.cagesSolversMap.get(cage.key());
        if (cage.isWithinRow) {
            this.rows[cageSolver.anyRowIdx()].removeCage(cage);
        }
        if (cage.isWithinColumn) {
            this.columns[cageSolver.anyColumnIdx()].removeCage(cage);
        }
        if (cage.isWithinSubgrid) {
            this.subgrids[cageSolver.anySubgridIdx()].removeCage(cage);
        }
        cage.cells.forEach(cell => {
            this.cellSolverOf(cell).removeWithinCage(cage);
        }, this);
        this.cagesSolversMap.delete(cage.key());
    }

    inputCageAt(rowIdx, colIdx) {
        return this.inputCagesMatrix[rowIdx][colIdx];
    }

    cellAt(rowIds, colIdx) {
        return this.cellsMatrix[rowIds][colIdx];
    }

    cellSolverOf(cell) {
        return this.cellSolverAt(cell.rowIdx, cell.colIdx);
    }

    cellSolverAt(rowIdx, colIdx) {
        return this.cellSolversMatrix[rowIdx][colIdx];
    }

    rowSolver(idx) {
        return this.rows[idx];
    }

    columnSolver(idx) {
        return this.columns[idx];
    }

    nonetSolver(idx) {
        return this.subgrids[idx];
    }
}
