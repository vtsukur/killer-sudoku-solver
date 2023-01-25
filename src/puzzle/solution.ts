import { EOL } from 'os';

type NumbersMatrix = number[][];

export class Solution {
    readonly data: NumbersMatrix;
    private readonly _asString: string;

    constructor(data: NumbersMatrix) {
        this.data = data;
        this._asString = Solution.toString(data);
    }

    toString(): string {
        return this._asString;
    }

    private static toString(data: NumbersMatrix): string {
        return data.map(numRow => numRow.join(' ')).join(EOL);
    }
}
