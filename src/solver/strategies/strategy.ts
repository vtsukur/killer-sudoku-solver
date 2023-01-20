import { MasterModel } from '../models/masterModel';
import { Context } from './context';

interface StrategyFactory {
    new(context: Context): Strategy;
}

export abstract class Strategy {
    protected readonly _context: Context;
    protected readonly _model: MasterModel;

    constructor(context: Context) {
        this._context = context;
        this._model = context.model;
    }

    abstract execute(): void;

    protected executeAnother(StrategyClass: StrategyFactory): void {
        new StrategyClass(this._context).execute();
    }

    protected executeAnotherFn(strategyFn: () => void): void {
        this._context.run(strategyFn);
    }
}
