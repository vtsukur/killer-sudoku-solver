import { Cell } from "./cell";

export class CellsKeys {
    readonly all: ReadonlySet<string>;
    readonly duplicates: ReadonlySet<string>;

    constructor(cells: Array<Cell>) {
        const all = new Set<string>();
        const duplicates = new Set<string>();
        for (const cell of cells) {
            if (all.has(cell.key)) {
                duplicates.add(cell.key);
            } else {
                all.add(cell.key);
            }
        }
        this.all = all;
        this.duplicates = duplicates;
    }
}
