export type ReductionActions = {

    readonly deleteNums: Array<Array<number>>;

}

export type ReductionEntry = {

    readonly state: number;

    readonly actions: ReductionActions | undefined;

}

export type ComboReductions = {

    readonly combo: ReadonlyArray<number>;

    readonly entries: Array<ReductionEntry>;

}

export type SumReductions = {

    readonly sum: number;

    readonly combos: Array<ComboReductions>;

}

export type CageSizeNReductionsDb = Array<SumReductions>;
