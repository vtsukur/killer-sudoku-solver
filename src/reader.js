import { readFileSync } from 'fs';

export default function problemReader(path) {
    const raw = readFileSync(path, 'utf8');
    const map = raw.split(/(\s+)/).filter(e => e.trim().length > 0);
    const sumDefOrRefRegex = /^([a-z][a-z0-9]*)(:([0-9]+))?$/i;
    const sumRegex = /^([0-9]+)$/;
    const sums = {};

    map.forEach((value, index) => {
        const sumRefOrDefMatch = value.match(sumDefOrRefRegex);
        let sum;
        if (sumRefOrDefMatch) {
            const sumRef = sumRefOrDefMatch[1];
            const sumValue = sumRefOrDefMatch[3];
            if (sumValue) {
                sums[sumRef] = { value: sumValue, cells: [] };
            }
            sum = sums[sumRef];
        } else {
            const sumMatch = value.match(sumRegex);
            if (sumMatch) {
                const sumValue = sumMatch[0];
                sum = (sums[`${sumValue}_${index}`] = { value: sumValue, cells: [] });
            } else {
                throw `Unknown input ${value}`;
            }
        }
        sum.cells.push({
            x: Math.floor(index / 9) + 1,
            y: index % 9 + 1
        });
    });

    return raw;
}

// module.exports = { problemReader };
// exports.problemReader = problemReader;
