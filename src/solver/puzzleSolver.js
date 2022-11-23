import _ from 'lodash';
import { SolverModel } from './solverModel';
import { FindAndReduceCagePermsByHouseStrategy } from './strategies/findAndReduceCagePermsByHouseStrategy';
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
                nextCagesSet = new FindAndReduceCagePermsByHouseStrategy(this.#model).apply();
                cageSolversIterable = nextCagesSet.values();
            }

            iterate = nextCagesSet.size > 0;
        }
    }

    get model() {
        return this.#model;
    }
}
