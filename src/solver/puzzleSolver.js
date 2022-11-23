import _ from 'lodash';
import { House } from '../problem/house';
import { SolverModel } from './solverModel';
import { FindAndSliceResidualSumsStrategy } from './strategies/findAndSliceResidualSums';
import { InitPermsForCagesStrategy } from './strategies/initPermsForCagesStrategy';
import { PlaceNumsForSingleOptionCellsStrategy } from './strategies/placeNumsForSingleOptionCellsStrategy';
import { ReduceHousePermsBySolvedCellsStrategy } from './strategies/reduceHousePermsBySolvedCellsStrategy';
import { ReducePermsInCagesStrategy } from './strategies/reducePermsInCagesStrategy';
import { SliceCagesForSolvedCellsStrategy } from './strategies/sliceCagesForSolvedCellsStrategy';

export class PuzzleSolver {
    #model;

    constructor(problem) {
        this.problem = problem;
        this.#model = new SolverModel(problem);
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
            let nextCagesSet = new ReduceHousePermsBySolvedCellsStrategy(this.#model, solvedCellDets).apply();

            newlySolvedCellDets = newlySolvedCellDets.concat(Array.from(solvedCellDets));

            if (nextCagesSet.size > 0) {
                cageSolversIterable = nextCagesSet.values();
            } else if (newlySolvedCellDets.length > 0) {
                new SliceCagesForSolvedCellsStrategy(this.#model, newlySolvedCellDets).apply();
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
