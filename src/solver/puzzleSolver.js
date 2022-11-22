import _ from 'lodash';
import { Cage } from '../problem/cage';
import { Grid } from '../problem/grid';
import { House } from '../problem/house';
import { CagesArea } from './cagesArea';
import { findSumCombinationsForHouse } from './combinatorial';
import { SolverModel } from './solverModel';
import { ReducePermsInCagesStrategy } from './strategies/reducePermsInCagesStrategy';

export class PuzzleSolver {
    #solution;
    #placedNumsCount;
    #model;

    constructor(problem) {
        this.problem = problem;
        this.#model = new SolverModel(problem);
        this.#solution = Grid.newMatrix();
        this.#placedNumsCount = 0;
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
                    return this.#model.columnSolvers[col].cellIterator()
                });
                this.#doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(n, leftIdx, (cageSolver, rightIdxExclusive) => {
                    return cageSolver.minRow >= leftIdx && cageSolver.maxRow < rightIdxExclusive;
                }, (row) => {
                    return this.#model.rowSolvers[row].cellIterator()
                });
            });
        });
    }

    #doDetermineAndSliceResidualCagesInAdjacentNHouseAreas(n, leftIdx, withinHouseFn, cellIteratorFn) {
        const nHouseCellCount = n * House.SIZE;
        const nHouseSum = n * House.SUM;

        const rightIdxExclusive = leftIdx + n;
        let cagesArea = new CagesArea();
        for (const cageSolver of this.#model.cagesSolversMap.values()) {
            if (withinHouseFn(cageSolver, rightIdxExclusive)) {
                cagesArea = new CagesArea(cagesArea.cages.concat(cageSolver.cage), nHouseCellCount);
            }
        }
        if (cagesArea.nonOverlappingCellsSet.size > nHouseCellCount - 6) {
            const residualCells = [];
            _.range(leftIdx, rightIdxExclusive).forEach(idx => {
                for (const { row, col } of cellIteratorFn(idx)) {
                    if (!cagesArea.hasNonOverlapping(this.#model.cellAt(row, col))) {
                        residualCells.push(this.#model.cellAt(row, col));
                    }
                }
            });
            if (residualCells.length) {
                const residualCage = new Cage(nHouseSum - cagesArea.sum, residualCells);
                if (!this.#model.cagesSolversMap.has(residualCage.key)) {
                    this.#addAndSliceResidualCageRecursively(residualCage);                        
                }
            }
        }
    }

    #determineAndSliceResidualCagesInHouses() {
        this.#model.houseSolvers.forEach(houseSolver => {
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
                if (this.#model.cagesSolversMap.has(residualCage.key)) return;

                this.#model.registerCage(residualCage);

                const cageSolversForResidualCage = this.#getCageSolversFullyContainingResidualCage(residualCage);
                const cagesToUnregister = [];
                cageSolversForResidualCage.forEach(firstChunkCageSolver => {
                    const secondChunkCage = this.#sliceCage(firstChunkCageSolver.cage, residualCage);
                    cagesToUnregister.push(firstChunkCageSolver.cage);
                    nextResidualCages.push(secondChunkCage);
                }, this);

                cagesToUnregister.forEach(cage => this.#model.unregisterCage(cage));
            });

            residualCages = nextResidualCages;
        }
    }

    #getCageSolversFullyContainingResidualCage(residualCage) {
        let allAssociatedCageSolversSet = new Set();
        residualCage.cells.forEach(cell => {
            allAssociatedCageSolversSet = new Set([...allAssociatedCageSolversSet, ...this.cellSolverOf(cell).withinCageSolvers]);
        }, this);
        allAssociatedCageSolversSet.delete(this.#model.cagesSolversMap.get(residualCage.key));

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
        this.#model.houseSolvers.forEach(houseSolver => {
            const combosForHouse = findSumCombinationsForHouse(houseSolver);
            houseSolver.debugCombosForHouse = combosForHouse;
            houseSolver.cages.forEach((cage, idx) => {
                const cageSolver = this.#model.cagesSolversMap.get(cage.key);
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
        let cageSolversIterable = this.#model.cagesSolversMap.values();
        let iterate = true;
        let newlySolvedCellDets = [];

        while (iterate) {
            if (this.#placedNumsCount >= 81) {
                return;
            }
    
            new ReducePermsInCagesStrategy(cageSolversIterable).apply();
    
            const solvedCellDets = this.#determineCellsWithSingleOption();
            let nextCagesSet = this.#reduceHousesBySolvedCells(solvedCellDets);

            newlySolvedCellDets = newlySolvedCellDets.concat(Array.from(solvedCellDets));

            if (nextCagesSet.size > 0) {
                cageSolversIterable = nextCagesSet.values();
            } else if (newlySolvedCellDets.length > 0) {
                newlySolvedCellDets.forEach(cellSolver => {
                    const withinCageSolversSet = cellSolver.withinCageSolvers;
                    if (!(withinCageSolversSet.size === 1 && withinCageSolversSet.values().next().value.isSingleCellCage)) {
                        const firstChunkCage = Cage.ofSum(cellSolver.placedNum).at(cellSolver.cell.row, cellSolver.cell.col).mk();
                        this.#addAndSliceResidualCageRecursively(firstChunkCage);
                    }
                });
                newlySolvedCellDets = [];
                nextCagesSet = new Set(this.#model.cagesSolversMap.values());
                cageSolversIterable = nextCagesSet.values();
            }
            else {
                nextCagesSet = this.#determineUniqueCagesInHouses();
                cageSolversIterable = nextCagesSet.values();
            }

            iterate = nextCagesSet.size > 0;
        }
    }

    #reduceHousesBySolvedCells(cellsSolvers) {
        let cageSolversToReduceSet = new Set();
        cellsSolvers.forEach(cellSolver => {
            const num = cellSolver.placedNum;
            [
                this.#model.rowSolvers[cellSolver.cell.row],
                this.#model.columnSolvers[cellSolver.cell.col],
                this.#model.nonetSolvers[cellSolver.cell.nonet]
            ].forEach(houseSolver => {
                for (const { row, col } of houseSolver.cellIterator()) {
                    if (row === cellSolver.cell.row && col === cellSolver.cell.col) continue;
        
                    const aCellDet = this.cellSolverAt(row, col);
                    if (aCellDet.hasNumOpt(num)) {
                        aCellDet.deleteNumOpt(num);
                        cageSolversToReduceSet = new Set([...cageSolversToReduceSet, ...aCellDet.withinCageSolvers]);
                    }
                }    
            });
        });
        return cageSolversToReduceSet;
    }

    #determineUniqueCagesInHouses() {
        let cageSolversToReduce = new Set();

        this.#model.houseSolvers.forEach(houseSolver => {
            _.range(1, House.SIZE + 1).forEach(num => {
                const cageSolversWithNum = [];
                // consider overlapping vs non-overlapping cages
                houseSolver.cages.forEach(cage => {
                    if (this.#model.cagesSolversMap.get(cage.key).isSingleCellCage) return;
                    const cageSolver = this.#model.cagesSolversMap.get(cage.key);
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
                    this.#placeNum(cellSolver.cell, cellSolver.numOpts().values().next().value);
                    cellsSolvers.push(cellSolver);
                }
            });
        });

        return cellsSolvers;
    }

    #placeNum(cell, num) {
        const cellSolver = this.cellSolverOf(cell);
        cellSolver.placeNum(num);

        this.#solution[cell.row][cell.col] = num;
        this.#placedNumsCount++;
    }

    cellSolverOf(cell) {
        return this.cellSolverAt(cell.row, cell.col);
    }

    cellSolverAt(row, col) {
        return this.#model.cellSolversMatrix[row][col];
    }

    rowSolver(idx) {
        return this.#model.rowSolvers[idx];
    }

    columnSolver(idx) {
        return this.#model.columnSolvers[idx];
    }

    nonetSolver(idx) {
        return this.#model.nonetSolvers[idx];
    }
}
