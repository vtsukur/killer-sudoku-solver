import { MasterModel } from '../models/masterModel';
import { Context } from './context';

interface StrategyFactory {

    new(context: Context): Strategy;

}

/**
 * {@link Strategy} produces hints which help to narrow down the possible numbers
 * for the {@link Cell}s on the {@link Grid}
 * and potentially advances towards solving Killer Sudoku {@link Puzzle}.
 *
 * @public
 */
export abstract class Strategy {

    protected readonly _context: Context;
    protected readonly _model: MasterModel;

    constructor(context: Context) {
        this._context = context;
        this._model = context.model;
    }

    abstract execute(): void;

    executeAnother(StrategyClass: StrategyFactory): void {
        new StrategyClass(this._context).execute();
    }

}
