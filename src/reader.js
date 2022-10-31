import { readFileSync } from 'fs';
import { Problem, InputSum, Cell, SIZE } from './meta';

const SUM_DEF_OR_REF_REGEX = /^([a-z][a-z0-9]*)(:([0-9]+))?$/i;
const SUM_VALUE_REGEX = /^([0-9]+)$/;

class SumEntry {
    constructor(ref) {
        this.ref = ref;
    }
}

class SumDef extends SumEntry {
    constructor(ref, value) {
        super(ref);
        this.value = value;
    }
}

class SumRef extends SumEntry {
    constructor(ref) {
        super(ref)
    }
}

const toInt = function(str) {
    const number = parseInt(str);
    if (number === NaN) {
        throw `Bad int: ${str}`;
    }
    return number;
}

const readEntry = function(entry, index) {
    const sumRefOrDefMatch = entry.match(SUM_DEF_OR_REF_REGEX);
    if (sumRefOrDefMatch) {
        const key = sumRefOrDefMatch[1];
        const value = sumRefOrDefMatch[3];
        if (value) {
            return new SumDef(key, toInt(value))
        } else {
            return new SumRef(key);
        }
    } else {
        const sumMatch = entry.match(SUM_VALUE_REGEX);
        if (sumMatch) {
            const value = parseInt(sumMatch[0]);
            return new SumDef(`${value}_${index}`, toInt(value));
        } else {
            throw `Unknown entry: ${entry}`;
        }
    }
}

export default function problemReader(path) {
    const raw = readFileSync(path, 'utf8');
    const entries = raw.split(/(\s+)/).filter(e => e.trim().length > 0);

    const sums = new Map();
    entries.forEach((value, index) => {
        const sumEntry = readEntry(value, index);
        if (!sums.has(sumEntry.ref)) {
            if (!sumEntry.value) {
                throw `Sum def without value: ${value}`;
            }
            sums.set(sumEntry.ref, new InputSum(sumEntry.value));
        }
        sums.get(sumEntry.ref).addCell(new Cell(
            Math.floor(index / SIZE) + 1,
            index % SIZE + 1
        ));
    });

    return new Problem(sums.values());
}
