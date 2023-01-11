import { EOL } from 'os';

export class Solution {
    readonly data: number[][];
    private asString: string;

    constructor(data: number[][]) {
        this.data = data;
        this.asString = Solution.toString(data);
    }

    toString(): string {
        return this.asString;
    }

    private static toString(data: number[][]): string {
        return data.map(numRow => numRow.join(' ')).join(EOL);
    }
}
