import { Cell } from './cell';

export class CellsKeys {
    readonly unique: ReadonlySet<string>;
    readonly duplicates: ReadonlySet<string>;

    constructor(cells: Array<Cell>) {
        const unique = new Set<string>();
        const duplicates = new Set<string>();
        for (const cell of cells) {
            if (unique.has(cell.key)) {
                duplicates.add(cell.key);
            } else {
                unique.add(cell.key);
            }
        }
        this.unique = unique;
        this.duplicates = duplicates;
    }
}
