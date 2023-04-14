export type ReductionActions = {

    deleteNums: Array<Array<number>>;

    isDeleteCombo: boolean;

}

export type ReductionEntry = {

    state: number;

    stateRadix2String: string;

    isValid: boolean;

    actions: ReductionActions | undefined;

}

export type ComboReductions = {

    combo: ReadonlyArray<number>;

    entries: Array<ReductionEntry>;

}

export type SumReductions = {

    sum: number;

    combos: Array<ComboReductions>;

}

export type CageSizeNReductionsDb = {

    cageSize: number;

    sums: Array<SumReductions>;

}
