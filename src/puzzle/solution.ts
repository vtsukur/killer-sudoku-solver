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
        let str = `${EOL}`;
        for (const numRow of data) {
            str += `  [ ${data.join(', ')} ]${EOL}`;
        }
        return str;
    }
}
