import _ from 'lodash';
import { newGridMatrix } from '../util/matrix';
import { House } from '../problem/house';
import { Cage } from '../problem/cage';
import { CellSolver } from './cellSolver';
import { CageSolver } from './cageSolver';
import { CagesArea } from './cagesArea';
import { findSumCombinationsForHouse } from './combinatorial';
import { RowSolver } from './rowSolver';
import { ColumnSolver } from './columnSolver';
import { NonetSolver } from './nonetSolver';

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

        this.rowSolvers = [];
        this.columnSolvers = [];
        this.nonetSolvers = [];
        _.range(House.SIZE).forEach(i => {
            this.rowSolvers.push(new RowSolver(i, this.#collectHouseCells(RowSolver.iteratorFor(i))));
            this.columnSolvers.push(new ColumnSolver(i, this.#collectHouseCells(ColumnSolver.iteratorFor(i))));
            this.nonetSolvers.push(new NonetSolver(i, this.#collectHouseCells(NonetSolver.iteratorFor(i))));
        }, this);

        this.cellSolversMatrix = newGridMatrix();
        const cells = problem.cages.map(cage => cage.cells).flat();
        cells.forEach(cell => {
            this.cellSolversMatrix[cell.rowIdx][cell.colIdx] = new CellSolver({
                cell,
                rowSolver: this.rowSolvers[cell.rowIdx],
                columnSolver: this.columnSolvers[cell.colIdx],
                nonetSolver: this.nonetSolvers[cell.nonetIdx]
            });
        }, this);

        problem.cages.forEach(cage => {
            this.#registerCage(cage);
        }, this);

        this.houseSolvers = [[...this.rowSolvers], [...this.columnSolvers], [...this.nonetSolvers]].flat();
    }

    #collectHouseCells(iterator) {
        return Array.from(iterator).map(coords => this.cellAt(coords.rowIdx, coords.colIdx), this);
    }

    solve() {
        this.#determineAndSliceResidualCagesInAdjacentNHouseAreas();
        this.#determineAndSliceResidualCagesInHouses();
        this.#fillUpCombinationsForCagesAndMakeInitialReduce();
        this.#mainReduce();

        return this.#solution;
    }

    #determineAndSliceResidualCagesInAdjacentNHouseAreas() {
        _.range(2, 9).reverse().forEach(n => {
            _.range(House.SIZE - n + 1).forEach(leftIdx => {
                this.#doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(n, leftIdx, (cageSolver, rightIdxExclusive) => {
                    return cageSolver.minColIdx >= leftIdx && cageSolver.maxColIdx < rightIdxExclusive;
                }, (colIdx) => {
                    return this.columnSolvers[colIdx].cellIterator()
                });
                this.#doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(n, leftIdx, (cageSolver, rightIdxExclusive) => {
                    return cageSolver.minRowIdx >= leftIdx && cageSolver.maxRowIdx < rightIdxExclusive;
                }, (rowIdx) => {
                    return this.rowSolvers[rowIdx].cellIterator()
                });
            });
        });
    }

    #doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(n, leftIdx, withinHouseFn, cellIteratorFn) {
        const nHouseCellCount = n * House.SIZE;
        const nHouseSumVal = n * House.SUM;

        const rightIdxExclusive = leftIdx + n;
        let cagesArea = new CagesArea();
        for (const cageSolver of this.cagesSolversMap.values()) {
            if (withinHouseFn(cageSolver, rightIdxExclusive)) {
                cagesArea = new CagesArea(cagesArea.cages.concat(cageSolver.cage), nHouseCellCount);
            }
        }
        if (cagesArea.nonOverlappingCellsSet.size > nHouseCellCount - 6) {
            const residualCells = [];
            _.range(leftIdx, rightIdxExclusive).forEach(idx => {
                for (const { rowIdx, colIdx } of cellIteratorFn(idx)) {
                    if (!cagesArea.hasNonOverlapping(this.cellAt(rowIdx, colIdx))) {
                        residualCells.push(this.cellAt(rowIdx, colIdx));
                    }
                }
            });
            if (residualCells.length) {
                const residualCage = new Cage(nHouseSumVal - cagesArea.totalValue, residualCells);
                if (!this.cagesSolversMap.has(residualCage.key())) {
                    this.#addAndSliceResidualCageRecursively(residualCage);                        
                }
            }
        }
    }

    #determineAndSliceResidualCagesInHouses() {
        this.houseSolvers.forEach(houseSolver => {
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
        return new Cage(cageToSlice.sum - firstChunkCage.sum, secondChunkCageCells);
    }

    #fillUpCombinationsForCagesAndMakeInitialReduce() {
        this.houseSolvers.forEach(houseSolver => {
            const combosForHouse = findSumCombinationsForHouse(houseSolver);
            houseSolver.debugCombosForHouse = combosForHouse;
            houseSolver.cages.forEach((cage, idx) => {
                const cageSolver = this.cagesSolversMap.get(cage.key());
                const combosKeySet = new Set();
                const combos = [];
                combosForHouse.forEach(combo => {
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
            let nextCagesSet = this.#reduceHousesBySolvedCells(solvedCellDets);

            newlySolvedCellDets = newlySolvedCellDets.concat(Array.from(solvedCellDets));

            if (nextCagesSet.size > 0) {
                cageSolversIterable = nextCagesSet.values();
            } else if (newlySolvedCellDets.length > 0) {
                newlySolvedCellDets.forEach(cellSolver => {
                    const withinCagesSet = cellSolver.withinCagesSet;
                    if (!(withinCagesSet.size === 1 && withinCagesSet.values().next().value.isSingleCellCage)) {
                        const firstChunkCage = Cage.ofSum(cellSolver.placedNumber).at(cellSolver.cell.rowIdx, cellSolver.cell.colIdx).mk();
                        this.#addAndSliceResidualCageRecursively(firstChunkCage);
                    }
                });
                newlySolvedCellDets = [];
                nextCagesSet = new Set(this.cagesSolversMap.values());
                cageSolversIterable = nextCagesSet.values();
            }
            else {
                nextCagesSet = this.#determineUniqueCagesInHouses();
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

    #reduceHousesBySolvedCells(cellsSolvers) {
        let cagesToReduceSet = new Set();
        cellsSolvers.forEach(cellSolver => {
            const number = cellSolver.placedNumber;
            [
                this.rowSolvers[cellSolver.cell.rowIdx],
                this.columnSolvers[cellSolver.cell.colIdx],
                this.nonetSolvers[cellSolver.cell.nonetIdx]
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

    #determineUniqueCagesInHouses() {
        let cagesToReduce = new Set();

        this.houseSolvers.forEach(houseSolver => {
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
            this.rowSolvers[cageSolver.anyRowIdx()].addCage(cage);
        }
        if (cage.isWithinColumn) {
            this.columnSolvers[cageSolver.anyColumnIdx()].addCage(cage);
        }
        if (cage.isWithinSubgrid) {
            this.nonetSolvers[cageSolver.anySubgridIdx()].addCage(cage);
        }
        cage.cells.forEach(cell => {
            this.cellSolverOf(cell).addWithinCage(cage);
        }, this);
        this.cagesSolversMap.set(cage.key(), cageSolver);
    }

    #unregisterCage(cage) {
        const cageSolver = this.cagesSolversMap.get(cage.key());
        if (cage.isWithinRow) {
            this.rowSolvers[cageSolver.anyRowIdx()].removeCage(cage);
        }
        if (cage.isWithinColumn) {
            this.columnSolvers[cageSolver.anyColumnIdx()].removeCage(cage);
        }
        if (cage.isWithinSubgrid) {
            this.nonetSolvers[cageSolver.anySubgridIdx()].removeCage(cage);
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
        return this.rowSolvers[idx];
    }

    columnSolver(idx) {
        return this.columnSolvers[idx];
    }

    nonetSolver(idx) {
        return this.nonetSolvers[idx];
    }
}
