import _ from 'lodash';
import { Cage } from '../problem/cage';
import { Grid } from '../problem/grid';
import { House } from '../problem/house';
import { CageSlicer } from './cageSlicer';
import { SolverModel } from './solverModel';
import { FindAndSliceResidualSumsStrategy } from './strategies/findAndSliceResidualSums';
import { InitPermsForCagesStrategy } from './strategies/initPermsForCagesStrategy';
import { PlaceNumsForSingleOptionCellsStrategy } from './strategies/placeNumsForSingleOptionCellsStrategy';
import { ReducePermsInCagesStrategy } from './strategies/reducePermsInCagesStrategy';

export class PuzzleSolver {
    #model;
    #cageSlicer;

    constructor(problem) {
        this.problem = problem;
        this.#model = new SolverModel(problem);
        this.#cageSlicer = new CageSlicer(this.#model);
    }

    solve() {
        new FindAndSliceResidualSumsStrategy(this.#model).apply();
        new InitPermsForCagesStrategy(this.#model).apply();
        this.#mainReduce();

        return this.#model.solution;
    }

    #mainReduce() {
        let cageSolversIterable = this.#model.cagesSolversMap.values();
        let iterate = true;
        let newlySolvedCellDets = [];

        while (iterate) {
            if (this.#model.placedNumCount >= 81) {
                return;
            }
    
            new ReducePermsInCagesStrategy(cageSolversIterable).apply();
    
            const solvedCellDets = new PlaceNumsForSingleOptionCellsStrategy(this.#model).apply();
            let nextCagesSet = this.#reduceHousesBySolvedCells(solvedCellDets);

            newlySolvedCellDets = newlySolvedCellDets.concat(Array.from(solvedCellDets));

            if (nextCagesSet.size > 0) {
                cageSolversIterable = nextCagesSet.values();
            } else if (newlySolvedCellDets.length > 0) {
                newlySolvedCellDets.forEach(cellSolver => {
                    const withinCageSolversSet = cellSolver.withinCageSolvers;
                    if (!(withinCageSolversSet.size === 1 && withinCageSolversSet.values().next().value.isSingleCellCage)) {
                        const firstChunkCage = Cage.ofSum(cellSolver.placedNum).at(cellSolver.cell.row, cellSolver.cell.col).mk();
                        this.#cageSlicer.addAndSliceResidualCageRecursively(firstChunkCage);
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
