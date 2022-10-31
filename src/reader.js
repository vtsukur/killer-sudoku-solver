import { readFileSync } from 'fs';
import { InputSum, Problem, Cell } from './meta';

const SUM_DEF_OR_REF_REGEX = /^([a-z][a-z0-9]*)(:([0-9]+))?$/i;
const SUM_VALUE_REGEX = /^([0-9]+)$/;

export default function problemReader(path) {
    const raw = readFileSync(path, 'utf8');
    const entries = raw.split(/(\s+)/).filter(e => e.trim().length > 0);
    const sums = new Map();

    entries.forEach((value, index) => {
        const sumRefOrDefMatch = value.match(SUM_DEF_OR_REF_REGEX);
        let sum;
        if (sumRefOrDefMatch) {
            const sumRef = sumRefOrDefMatch[1];
            const sumValue = sumRefOrDefMatch[3];
            if (sumValue) {
                sums.set(sumRef, new InputSum(parseInt(sumValue)))
            }
            sum = sums.get(sumRef);
        } else {
            const sumMatch = value.match(SUM_VALUE_REGEX);
            if (sumMatch) {
                const sumValue = parseInt(sumMatch[0]);
                sums.set(`${sumValue}_${index}`, sum = new InputSum(sumValue));
            } else {
                throw `Unknown input ${value}`;
            }
        }
        sum.addCell(new Cell(
            Math.floor(index / 9) + 1,
            index % 9 + 1
        ));
    });

    return new Problem(sums.values());
}
