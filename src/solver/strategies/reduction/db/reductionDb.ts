export type ReductionActions = {

    deleteNumsInCell1: Array<number> | undefined;

    deleteNumsInCell2: Array<number> | undefined;

    deleteNumsInCell3: Array<number> | undefined;

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
