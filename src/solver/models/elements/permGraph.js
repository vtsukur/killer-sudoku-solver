import { PermEdge } from './permEdge';

// experimental
export class PermGraph {
    #cellMs;
    #cellCount;
    #edgesByCellM;

    constructor(cellMs) {
        this.#edgesByCellM = new Map();
        this.#cellMs = cellMs.map(cellM => {
            this.#edgesByCellM.set(cellM.cell.key, new Map());
            return cellM;
        });
        this.#cellCount = this.#cellMs.length;
    }

    addCombo(combo) {
        const ctx = {
            processedCellMs: new Set(),
            remainingCellMs: new Set(this.#cellMs),
            processedNums: new Set(),
            numbersStack: new Array(this.#cellCount),
            cellMsStack: new Array(this.#cellCount),
            i: 0,
            tracker: [],
            processCell: function(cellM, step, fn) {
                if (this.processedCellMs.has(cellM)) return;
                this.processedCellMs.add(cellM); this.remainingCellMs.delete(cellM);
                this.cellMsStack[step] = cellM;
                const retVal = fn();
                this.cellMsStack[step] = undefined;
                this.processedCellMs.delete(cellM); this.remainingCellMs.add(cellM);    
                return retVal;
            },
            processNum: function(num, step, fn) {
                if (this.processedNums.has(num)) return;
                this.processedNums.add(num);
                this.numbersStack[step] = num;
                const retVal = fn();
                this.numbersStack[step] = undefined;
                this.processedNums.delete(num);
                return retVal;
            },
            remainingCellM: function() {
                return this.remainingCellMs.values().next().value;
            }
        };

        this.#addComboRecursive(combo, 0, ctx);
    }

    #addComboRecursive(combo, step, context) {
        if (step >= this.#cellCount) return;

        for (const cellM of this.#cellMs) {
            context.processCell(cellM, step, () => {
                for (const num of combo) {
                    context.processNum(num, step, () => {
                        if (step === 2) {
                            context.i++;
                            context.tracker.push(context.cellMsStack.map(c => c.cell).concat(context.numbersStack));
                        }
                        const edge = new PermEdge(cellM, num);
                        this.#edgesByCellM.get(cellM.cell.key).set(edge.key, edge);
                        this.#addComboRecursive(combo, step + 1, context);
                    });
                }
            });
        }
    }
}
