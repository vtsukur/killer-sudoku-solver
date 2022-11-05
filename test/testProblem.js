import { Problem, InputSum, InputCell } from '../src/problem';

const testProblem = new Problem([
    // upper subgrids
    new InputSum(15, [ new InputCell(0, 0), new InputCell(0, 1) ]),
    new InputSum(10, [ new InputCell(0, 2), new InputCell(1, 2) ]),
    new InputSum(17, [ new InputCell(0, 3), new InputCell(1, 3) ]),
    new InputSum(13, [ new InputCell(0, 4), new InputCell(0, 5), new InputCell(1, 4) ]),
    new InputSum(7, [ new InputCell(0, 6), new InputCell(0, 7) ]),
    new InputSum(11, [ new InputCell(0, 8), new InputCell(1, 8) ]),
    new InputSum(7, [ new InputCell(1, 0), new InputCell(1, 1) ]),
    new InputSum(10, [ new InputCell(1, 5), new InputCell(1, 6), new InputCell(1, 7) ]),
    new InputSum(13, [ new InputCell(2, 0), new InputCell(2, 1), new InputCell(2, 2) ]),
    new InputSum(11, [ new InputCell(2, 3), new InputCell(2, 4) ]),
    new InputSum(8, [ new InputCell(2, 5), new InputCell(3, 5) ]),
    new InputSum(16, [ new InputCell(2, 6), new InputCell(3, 6) ]),
    new InputSum(9, [ new InputCell(2, 7), new InputCell(2, 8) ]),

    // middle subgrids
    new InputSum(4, [ new InputCell(3, 0), new InputCell(3, 1) ]),
    new InputSum(2, [ new InputCell(3, 2) ]),
    new InputSum(14, [ new InputCell(3, 3), new InputCell(3, 4) ]),
    new InputSum(5, [ new InputCell(3, 7), new InputCell(4, 7) ]),
    new InputSum(19, [ new InputCell(3, 8), new InputCell(4, 8), new InputCell(5, 8) ]),
    new InputSum(27, [ new InputCell(4, 0), new InputCell(4, 1), new InputCell(5, 0), new InputCell(5, 1) ]),
    new InputSum(14, [ new InputCell(4, 2), new InputCell(5, 2), new InputCell(5, 3) ]),
    new InputSum(10, [ new InputCell(4, 3), new InputCell(4, 4) ]),
    new InputSum(20, [ new InputCell(4, 5), new InputCell(4, 6), new InputCell(5, 4), new InputCell(5, 5) ]),
    new InputSum(22, [ new InputCell(5, 6), new InputCell(5, 7), new InputCell(6, 6), new InputCell(6, 7) ]),

    // lower subgrids
    new InputSum(19, [ new InputCell(6, 0), new InputCell(7, 0), new InputCell(8, 0) ]),
    new InputSum(14, [ new InputCell(6, 1), new InputCell(7, 1), new InputCell(8, 1), new InputCell(8, 2) ]),
    new InputSum(15, [ new InputCell(6, 2), new InputCell(6, 3), new InputCell(7, 2)  ]),
    new InputSum(6, [ new InputCell(6, 4), new InputCell(6, 5) ]),
    new InputSum(14, [ new InputCell(6, 8), new InputCell(7, 8), new InputCell(8, 8) ]),
    new InputSum(6, [ new InputCell(7, 3), new InputCell(8, 3) ]),
    new InputSum(22, [ new InputCell(7, 4), new InputCell(8, 4), new InputCell(8, 5) ]),
    new InputSum(8, [ new InputCell(7, 5) ]),
    new InputSum(10, [ new InputCell(7, 6), new InputCell(7, 7) ]),
    new InputSum(7, [ new InputCell(8, 6), new InputCell(8, 7) ])
]);

export default testProblem;
