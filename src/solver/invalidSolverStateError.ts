export class InvalidSolverStepError {
    readonly message: string;

    constructor(message: string) {
        this.message = message;
    }
}
