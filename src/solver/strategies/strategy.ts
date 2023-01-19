import { Context } from './context';

interface StrategyFactory {
    new(context: Context): Strategy;
}

export abstract class Strategy {
    protected readonly _context: Context;

    constructor(context: Context) {
        this._context = context;
    }

    abstract execute(): void;

    executeAnother(StrategyClass: StrategyFactory): void {
        new StrategyClass(this._context).execute();
    }

    executeAnotherFn(strategyFn: () => void): void {
        this._context.run(strategyFn);
    }
}
