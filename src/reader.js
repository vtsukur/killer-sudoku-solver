import { readFileSync } from 'fs';
import { columnIdxInGridMatrixFromAbsloute, rowIdxInGridMatrixByAbsolute } from './util/matrix';
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
    const cageRefOrDefMatch = entry.match(SUM_DEF_OR_REF_REGEX);
    if (cageRefOrDefMatch) {
        const key = cageRefOrDefMatch[1];
        const value = cageRefOrDefMatch[3];
        if (value) {
            return new SumDef(key, parseInt(value))
        } else {
            return new SumRef(key);
        }
    } else {
        const cageMatch = entry.match(SUM_VALUE_REGEX);
        if (cageMatch) {
            const value = parseInt(cageMatch[0]);
            return new SumDef(`${value}_${index}`, value);
        } else {
            throw `Unknown entry: ${entry}`;
        }
    }
}

export default function reader(path) {
    const raw = readFileSync(path, 'utf8');
    const entries = raw.split(/(\s+)/).filter(e => e.trim().length > 0);

    const cages = new Map();
    entries.forEach((value, idx) => {
        const cageEntry = readEntry(value, idx);
        if (!cages.has(cageEntry.ref)) {
            if (!cageEntry.value) {
                throw `Cage def without value: ${value}`;
            }
            cages.set(cageEntry.ref, Cage.of(cageEntry.value));
        }
        else if (cages.has(cageEntry.ref) && cageEntry.value) {
            throw `Cage def duplicate: ${cageEntry.ref}`;
        }
        cages.get(cageEntry.ref).cell(
            rowIdxInGridMatrixByAbsolute(idx),
            columnIdxInGridMatrixFromAbsloute(idx)
        );
    });

    return new Problem(Array.from(cages.values()).map(cageBuilder => cageBuilder.mk()));
}
