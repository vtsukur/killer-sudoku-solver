import { readFileSync } from 'fs';
import { columnIdxInGridMatrixFromAbsloute, rowIdxInGridMatrixByAbsolute } from '../util/matrix';
import { Problem } from '../problem/problem';
import { Cage } from '../problem/cage';

const CAGE_DEF_OR_REF_REGEX = /^([a-z][a-z0-9]*)(:([0-9]+))?$/i;
const SUM_REGEX = /^([0-9]+)$/;

class CageEntry {
    constructor(ref) {
        this.ref = ref;
    }
}

class CageDef extends CageEntry {
    constructor(ref, sum) {
        super(ref);
        this.sum = sum;
    }
}

class CageRef extends CageEntry {
    constructor(ref) {
        super(ref)
    }
}

const readEntry = function(entry, index) {
    const cageRefOrDefMatch = entry.match(CAGE_DEF_OR_REF_REGEX);
    if (cageRefOrDefMatch) {
        const key = cageRefOrDefMatch[1];
        const sum = cageRefOrDefMatch[3];
        if (sum) {
            return new CageDef(key, parseInt(sum))
        } else {
            return new CageRef(key);
        }
    } else {
        const cageMatch = entry.match(SUM_REGEX);
        if (cageMatch) {
            const sum = parseInt(cageMatch[0]);
            return new CageDef(`${sum}_${index}`, sum);
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
            if (!cageEntry.sum) {
                throw `Cage def without sum: ${value}`;
            }
            cages.set(cageEntry.ref, Cage.ofSum(cageEntry.sum));
        }
        else if (cages.has(cageEntry.ref) && cageEntry.sum) {
            throw `Cage def duplicate: ${cageEntry.ref}`;
        }
        cages.get(cageEntry.ref).cell(
            rowIdxInGridMatrixByAbsolute(idx),
            columnIdxInGridMatrixFromAbsloute(idx)
        );
    });

    return new Problem(Array.from(cages.values()).map(cageBuilder => cageBuilder.mk()));
}
