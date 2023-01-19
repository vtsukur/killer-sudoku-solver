import { Context } from './context';

export abstract class Strategy {
    protected readonly _context: Context;

    constructor(context: Context) {
        this._context = context;
    }

    abstract execute(): void;

    executeAnother(strategy: Strategy): void {
        strategy.execute();
    }

    executeAnotherFn(strategyFn: () => void): void {
        this._context.run(strategyFn);
    }
}
