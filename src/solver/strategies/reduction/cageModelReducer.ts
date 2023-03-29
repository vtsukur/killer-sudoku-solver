import { CombosSet } from '../../sets';
import { NumsReduction } from './numsReduction';

export interface CageModelReducer {

    reduce(cageMCombos: CombosSet, reduction: NumsReduction): void;

}
