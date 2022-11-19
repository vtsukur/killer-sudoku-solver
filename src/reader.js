import { readFileSync } from 'fs';
import { columnIdxInGridMatrixFromAbsloute, rowIdxInGridMatrixByAbsolute } from './matrix';
import { Problem } from './problem/problem';
import { Cage } from './problem/cage';

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

const readEntry = function(entry, index) {
    const sumRefOrDefMatch = entry.match(SUM_DEF_OR_REF_REGEX);
    if (sumRefOrDefMatch) {
        const key = sumRefOrDefMatch[1];
        const value = sumRefOrDefMatch[3];
        if (value) {
            return new SumDef(key, parseInt(value))
        } else {
            return new SumRef(key);
        }
    } else {
        const sumMatch = entry.match(SUM_VALUE_REGEX);
        if (sumMatch) {
            const value = parseInt(sumMatch[0]);
            return new SumDef(`${value}_${index}`, value);
        } else {
            throw `Unknown entry: ${entry}`;
        }
    }
}

export default function reader(path) {
    const raw = readFileSync(path, 'utf8');
    const entries = raw.split(/(\s+)/).filter(e => e.trim().length > 0);

    const sums = new Map();
    entries.forEach((value, idx) => {
        const sumEntry = readEntry(value, idx);
        if (!sums.has(sumEntry.ref)) {
            if (!sumEntry.value) {
                throw `Cage def without value: ${value}`;
            }
            sums.set(sumEntry.ref, Cage.of(sumEntry.value));
        }
        else if (sums.has(sumEntry.ref) && sumEntry.value) {
            throw `Cage def duplicate: ${sumEntry.ref}`;
        }
        sums.get(sumEntry.ref).cell(
            rowIdxInGridMatrixByAbsolute(idx),
            columnIdxInGridMatrixFromAbsloute(idx)
        );
    });

    return new Problem(Array.from(sums.values()).map(sumBuilder => sumBuilder.mk()));
}
