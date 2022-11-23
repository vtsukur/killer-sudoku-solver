import _ from 'lodash';
import { SolverModel } from './solverModel';
import { FindAndReduceCagePermsByHouseStrategy } from './strategies/tactics/findAndReduceCagePermsByHouseStrategy';
import { FindAndSliceResidualSumsStrategy } from './strategies/tactics/findAndSliceResidualSums';
import { InitPermsForCagesStrategy } from './strategies/tactics/initPermsForCagesStrategy';
import { PlaceNumsForSingleOptionCellsStrategy } from './strategies/tactics/placeNumsForSingleOptionCellsStrategy';
import { ReduceHousePermsBySolvedCellsStrategy } from './strategies/tactics/reduceHousePermsBySolvedCellsStrategy';
import { ReducePermsInCagesStrategy } from './strategies/tactics/reducePermsInCagesStrategy';
import { SliceCagesForSolvedCellsStrategy } from './strategies/tactics/sliceCagesForSolvedCellsStrategy';

export class PuzzleSolver {
    #model;

    constructor(problem) {
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
