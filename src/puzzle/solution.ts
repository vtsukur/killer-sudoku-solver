import { EOL } from 'os';

export class Solution {
    readonly data: Array<Array<number>>;
    private asString: string;

    constructor(data: number[][]) {
        this.data = data;
        this.asString = Solution.toString(data);
    }

    toString(): string {
        return this.asString;
    }

    private static toString(data: Array<Array<number>>): string {
        return data.map(numRow => numRow.join(' ')).join(EOL);
    }
}
