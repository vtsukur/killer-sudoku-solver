import { readFileSync } from 'fs';
import { InputSum, Problem, Cell } from './meta';

export default function problemReader(path) {
    const raw = readFileSync(path, 'utf8');
    const map = raw.split(/(\s+)/).filter(e => e.trim().length > 0);
    const sumDefOrRefRegex = /^([a-z][a-z0-9]*)(:([0-9]+))?$/i;
    const sumRegex = /^([0-9]+)$/;
    const sums = {};
    const sumsArr = [];

    map.forEach((value, index) => {
        const sumRefOrDefMatch = value.match(sumDefOrRefRegex);
        let sum;
        if (sumRefOrDefMatch) {
            const sumRef = sumRefOrDefMatch[1];
            const sumValue = sumRefOrDefMatch[3];
            if (sumValue) {
                sumsArr.push(sums[sumRef] = new InputSum(parseInt(sumValue)));
            }
            sum = sums[sumRef];
        } else {
            const sumMatch = value.match(sumRegex);
            if (sumMatch) {
                const sumValue = parseInt(sumMatch[0]);
                sumsArr.push(sum = (sums[`${sumValue}_${index}`] = new InputSum(sumValue)));
            } else {
                throw `Unknown input ${value}`;
            }
        }
        sum.addCell(new Cell(
            Math.floor(index / 9) + 1,
            index % 9 + 1
        ));
    });

    return new Problem(sumsArr);
}
