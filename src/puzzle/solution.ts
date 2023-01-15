import { EOL } from 'os';

export class Solution {
    readonly data: Array<Array<number>>;
    private readonly _asString: string;

    constructor(data: number[][]) {
        this.data = data;
        this._asString = Solution.toString(data);
    }

    toString(): string {
        return this._asString;
    }

    private static toString(data: Array<Array<number>>): string {
        return data.map(numRow => numRow.join(' ')).join(EOL);
    }
}
