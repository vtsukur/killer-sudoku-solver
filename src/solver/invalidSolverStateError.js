export class InvalidSolverStepError {
    #message;

    constructor(message) {
        this.#message = message;
    }

    get message() {
        return this.#message;
    }
}
