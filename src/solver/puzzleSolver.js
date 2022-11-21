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

export class PuzzleSolver {
    #solution;
    #placedNumbersCount;

    constructor(problem) {
        this.problem = problem;
        this.cagesSolversMap = new Map();
        this.cellsMatrix = newGridMatrix();
        this.#solution = newGridMatrix();
        this.#placedNumbersCount = 0;

        problem.cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this.cellsMatrix[cell.row][cell.col] = cell;
            }, this);
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
            this.cellSolversMatrix[cell.row][cell.col] = new CellSolver({
                cell,
                rowSolver: this.rowSolvers[cell.row],
                columnSolver: this.columnSolvers[cell.col],
                nonetSolver: this.nonetSolvers[cell.nonet]
            });
        }, this);

        problem.cages.forEach(cage => {
            this.#registerCage(cage);
        }, this);

        this.houseSolvers = [[...this.rowSolvers], [...this.columnSolvers], [...this.nonetSolvers]].flat();
    }

    #collectHouseCells(iterator) {
        return Array.from(iterator).map(coords => this.cellAt(coords.row, coords.col), this);
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
                    return cageSolver.minCol >= leftIdx && cageSolver.maxCol < rightIdxExclusive;
                }, (col) => {
                    return this.columnSolvers[col].cellIterator()
                });
                this.#doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(n, leftIdx, (cageSolver, rightIdxExclusive) => {
                    return cageSolver.minRow >= leftIdx && cageSolver.maxRow < rightIdxExclusive;
                }, (row) => {
                    return this.rowSolvers[row].cellIterator()
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
                for (const { row, col } of cellIteratorFn(idx)) {
                    if (!cagesArea.hasNonOverlapping(this.cellAt(row, col))) {
                        residualCells.push(this.cellAt(row, col));
                    }
                }
            });
            if (residualCells.length) {
                const residualCage = new Cage(nHouseSumVal - cagesArea.sum, residualCells);
                if (!this.cagesSolversMap.has(residualCage.key)) {
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
                if (this.cagesSolversMap.has(residualCage.key)) return;

                this.#registerCage(residualCage);

                const cageSolversForResidualCage = this.#getCageSolversFullyContainingResidualCage(residualCage);
                const cagesToUnregister = [];
                cageSolversForResidualCage.forEach(firstChunkCageSolver => {
                    const secondChunkCage = this.#sliceCage(firstChunkCageSolver.cage, residualCage);
                    cagesToUnregister.push(firstChunkCageSolver.cage);
                    nextResidualCages.push(secondChunkCage);
                }, this);

                cagesToUnregister.forEach(cage => this.#unregisterCage(cage));
            });

            residualCages = nextResidualCages;
        }
    }

    #getCageSolversFullyContainingResidualCage(residualCage) {
        let allAssociatedCageSolversSet = new Set();
        residualCage.cells.forEach(cell => {
            allAssociatedCageSolversSet = new Set([...allAssociatedCageSolversSet, ...this.cellSolverOf(cell).withinCageSolvers]);
        }, this);
        allAssociatedCageSolversSet.delete(this.cagesSolversMap.get(residualCage.key));

        const result = [];
        for (const associatedCageSolver of allAssociatedCageSolversSet.values()) {
            const associatedCageFullyContainsResidualCage = residualCage.cells.every(cell => {
                return this.cellSolverOf(cell).withinCageSolvers.has(associatedCageSolver);
            }, this);
            if (associatedCageFullyContainsResidualCage) {
                result.push(associatedCageSolver);
            }
        }

        return result;
    }

    #sliceCage(cageToSlice, firstChunkCage) {
        const secondChunkCageCells = [];
        cageToSlice.cells.forEach(cell => {
            if (firstChunkCage.cells.findIndex(aCell => aCell.key === cell.key) === -1) {
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
                const cageSolver = this.cagesSolversMap.get(cage.key);
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
                    const withinCageSolversSet = cellSolver.withinCageSolvers;
                    if (!(withinCageSolversSet.size === 1 && withinCageSolversSet.values().next().value.isSingleCellCage)) {
                        const firstChunkCage = Cage.ofSum(cellSolver.placedNumber).at(cellSolver.cell.row, cellSolver.cell.col).mk();
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

            let moreCageSolversToReduce = new Set();
            for (const modifiedCellDet of modifiedCellDets.values()) {
                moreCageSolversToReduce = new Set([...moreCageSolversToReduce, ...modifiedCellDet.withinCageSolvers]);
            }

            cageSolversIterable = moreCageSolversToReduce.values();
            iterate = moreCageSolversToReduce.size > 0;
        }
    }

    #reduceHousesBySolvedCells(cellsSolvers) {
        let cageSolversToReduceSet = new Set();
        cellsSolvers.forEach(cellSolver => {
            const number = cellSolver.placedNumber;
            [
                this.rowSolvers[cellSolver.cell.row],
                this.columnSolvers[cellSolver.cell.col],
                this.nonetSolvers[cellSolver.cell.nonet]
            ].forEach(houseSolver => {
                for (const { row, col } of houseSolver.cellIterator()) {
                    if (row === cellSolver.cell.row && col === cellSolver.cell.col) continue;
        
                    const aCellDet = this.cellSolverAt(row, col);
                    if (aCellDet.hasNumOpt(number)) {
                        aCellDet.deleteNumOpt(number);
                        cageSolversToReduceSet = new Set([...cageSolversToReduceSet, ...aCellDet.withinCageSolvers]);
                    }
                }    
            });
        });
        return cageSolversToReduceSet;
    }

    #determineUniqueCagesInHouses() {
        let cageSolversToReduce = new Set();

        this.houseSolvers.forEach(houseSolver => {
            _.range(1, House.SIZE + 1).forEach(num => {
                const cageSolversWithNum = [];
                // consider overlapping vs non-overlapping cages
                houseSolver.cages.forEach(cage => {
                    if (this.cagesSolversMap.get(cage.key).isSingleCellCage) return;
                    const cageSolver = this.cagesSolversMap.get(cage.key);
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
                    cageSolversToReduce = new Set([...cageSolversToReduce, ...cellSolver.withinCageSolvers]);
                });
            });
        });

        return cageSolversToReduce;
    }

    #determineCellsWithSingleOption() {
        const cellsSolvers = [];

        _.range(House.SIZE).forEach(row => {
            _.range(House.SIZE).forEach(col => {
                const cellSolver = this.cellSolverAt(row, col);
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

        this.#solution[cell.row][cell.col] = number;
        this.#placedNumbersCount++;
    }

    #registerCage(cage) {
        const cageSolver = new CageSolver(cage, cage.cells.map(cell => this.cellSolverOf(cell), this));
        if (cageSolver.isWithinRow) {
            this.rowSolvers[cageSolver.anyRow()].addCage(cage);
        }
        if (cageSolver.isWithinColumn) {
            this.columnSolvers[cageSolver.anyColumnIdx()].addCage(cage);
        }
        if (cageSolver.isWithinNonet) {
            this.nonetSolvers[cageSolver.anySubgridIdx()].addCage(cage);
        }
        cage.cells.forEach(cell => {
            this.cellSolverOf(cell).addWithinCageSolver(cageSolver);
        }, this);
        this.cagesSolversMap.set(cage.key, cageSolver);
    }

    #unregisterCage(cage) {
        const cageSolver = this.cagesSolversMap.get(cage.key);
        if (cageSolver.isWithinRow) {
            this.rowSolvers[cageSolver.anyRow()].removeCage(cage);
        }
        if (cageSolver.isWithinColumn) {
            this.columnSolvers[cageSolver.anyColumnIdx()].removeCage(cage);
        }
        if (cageSolver.isWithinNonet) {
            this.nonetSolvers[cageSolver.anySubgridIdx()].removeCage(cage);
        }
        cage.cells.forEach(cell => {
            this.cellSolverOf(cell).removeWithinCageSolver(cageSolver);
        }, this);
        this.cagesSolversMap.delete(cage.key);
    }

    cellAt(rowIds, col) {
        return this.cellsMatrix[rowIds][col];
    }

    cellSolverOf(cell) {
        return this.cellSolverAt(cell.row, cell.col);
    }

    cellSolverAt(row, col) {
        return this.cellSolversMatrix[row][col];
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
