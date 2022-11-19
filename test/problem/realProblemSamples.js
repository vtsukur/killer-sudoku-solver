import { Problem } from '../../src/problem/problem';
import { Cage } from '../../src/problem/cage';

export const sampleProblem = new Problem([
    // upper nonets
    Cage.ofSum(17).cell(0, 0).cell(1, 0).cell(1, 1).mk(),
    Cage.ofSum(7).cell(0, 1).mk(),
    Cage.ofSum(7).cell(0, 2).cell(0, 3).mk(),
    Cage.ofSum(4).cell(0, 4).cell(0, 5).mk(),
    Cage.ofSum(11).cell(0, 6).cell(1, 6).mk(),
    Cage.ofSum(14).cell(0, 7).cell(1, 7).cell(2, 7).mk(),
    Cage.ofSum(14).cell(0, 8).cell(1, 8).cell(2, 8).mk(),
    Cage.ofSum(7).cell(1, 2).cell(1, 3).mk(),
    Cage.ofSum(23).cell(1, 4).cell(1, 5).cell(2, 3).cell(2, 4).mk(),
    Cage.ofSum(10).cell(2, 0).cell(2, 1).cell(3, 1).mk(),
    Cage.ofSum(9).cell(2, 2).mk(),
    Cage.ofSum(13).cell(2, 5).cell(2, 6).mk(),

    // middle nonets
    Cage.ofSum(17).cell(3, 0).cell(4, 0).cell(4, 1).mk(),
    Cage.ofSum(14).cell(3, 2).cell(3, 3).mk(),
    Cage.ofSum(23).cell(3, 4).cell(4, 4).cell(4, 5).cell(4, 6).mk(),
    Cage.ofSum(5).cell(3, 5).cell(3, 6).mk(),
    Cage.ofSum(17).cell(3, 7).cell(3, 8).cell(4, 7).mk(),
    Cage.ofSum(4).cell(4, 2).cell(4, 3).mk(),
    Cage.ofSum(10).cell(4, 8).cell(5, 8).mk(),
    Cage.ofSum(16).cell(5, 0).cell(5, 1).cell(6, 1).mk(),
    Cage.ofSum(15).cell(5, 2).cell(6, 2).mk(),
    Cage.ofSum(23).cell(5, 3).cell(5, 4).cell(6, 3).cell(6, 4).mk(),
    Cage.ofSum(10).cell(5, 5).cell(6, 5).mk(),
    Cage.ofSum(25).cell(5, 6).cell(6, 6).cell(6, 7).cell(7, 7).mk(),
    Cage.ofSum(6).cell(5, 7).mk(),

    // lower nonets
    Cage.ofSum(3).cell(6, 0).cell(7, 0).mk(),
    Cage.ofSum(8).cell(6, 8).cell(7, 8).mk(),
    Cage.ofSum(27).cell(7, 1).cell(7, 2).cell(7, 3).cell(8, 2).cell(8, 3).mk(),
    Cage.ofSum(6).cell(7, 4).cell(8, 4).mk(),
    Cage.ofSum(12).cell(7, 5).cell(7, 6).cell(8, 5).mk(),
    Cage.ofSum(12).cell(8, 0).cell(8, 1).mk(),
    Cage.ofSum(16).cell(8, 6).cell(8, 7).cell(8, 8).mk()
]);

export const sudokuDotCom_dailyChallengeOf_2022_04_06 = new Problem([
    // upper nonets
    Cage.ofSum(7).cell(0, 0).cell(0, 1).mk(),
    Cage.ofSum(18).cell(1, 0).cell(1, 1).cell(2, 0).mk(),
    Cage.ofSum(20).cell(0, 2).cell(1, 2).cell(2, 1).cell(2, 2).mk(),
    Cage.ofSum(17).cell(0, 3).cell(1, 3).cell(1, 4).mk(),
    Cage.ofSum(7).cell(2, 3).cell(2, 4).mk(),
    Cage.ofSum(16).cell(0, 4).cell(0, 5).cell(0, 6).mk(),
    Cage.ofSum(6).cell(1, 5).mk(),
    Cage.ofSum(18).cell(2, 5).cell(3, 3).cell(3, 4).cell(3, 5).mk(),
    Cage.ofSum(11).cell(0, 7).cell(0, 8).cell(1, 8).mk(),
    Cage.ofSum(12).cell(1, 6).cell(1, 7).mk(),
    Cage.ofSum(8).cell(2, 6).cell(3, 6).mk(),
    Cage.ofSum(21).cell(2, 7).cell(2, 8).cell(3, 7).cell(3, 8).mk(),

    // middle nonets
    Cage.ofSum(20).cell(3, 0).cell(4, 0).cell(5, 0).cell(6, 0).cell(6, 1).mk(),
    Cage.ofSum(18).cell(3, 1).cell(3, 2).cell(4, 2).mk(),
    Cage.ofSum(9).cell(4, 1).cell(5, 1).mk(),
    Cage.ofSum(18).cell(5, 2).cell(6, 2).cell(6, 3).cell(6, 4).mk(),
    Cage.ofSum(8).cell(4, 3).cell(5, 3).mk(),
    Cage.ofSum(13).cell(4, 4).cell(5, 4).mk(),
    Cage.ofSum(12).cell(4, 5).cell(4, 6).mk(),
    Cage.ofSum(12).cell(5, 5).cell(6, 5).mk(),
    Cage.ofSum(10).cell(4, 7).cell(4, 8).mk(),
    Cage.ofSum(9).cell(5, 6).cell(5, 7).mk(),
    Cage.ofSum(14).cell(5, 8).cell(6, 8).mk(),

    // lower nonets
    Cage.ofSum(7).cell(7, 0).mk(),
    Cage.ofSum(6).cell(8, 0).mk(),
    Cage.ofSum(9).cell(7, 1).cell(8, 1).mk(),
    Cage.ofSum(11).cell(7, 2).cell(8, 2).mk(),
    Cage.ofSum(7).cell(7, 3).cell(7, 4).mk(),
    Cage.ofSum(20).cell(8, 3).cell(8, 4).cell(8, 5).mk(),
    Cage.ofSum(15).cell(7, 5).cell(7, 6).cell(7, 7).mk(),
    Cage.ofSum(11).cell(6, 6).cell(6, 7).mk(),
    Cage.ofSum(3).cell(8, 6).cell(8, 7).mk(),
    Cage.ofSum(12).cell(7, 8).cell(8, 8).mk()
]);

export const sudokuDotCom_dailyChallengeOf_2022_08_12 = new Problem([
    // upper nonets
    Cage.ofSum(6).cell(0, 0).cell(1, 0).mk(),
    Cage.ofSum(12).cell(0, 1).cell(1, 1).mk(),
    Cage.ofSum(20).cell(2, 0).cell(3, 0).cell(4, 0).mk(),
    Cage.ofSum(11).cell(0, 2).cell(0, 3).mk(),
    Cage.ofSum(10).cell(1, 2).cell(1, 3).mk(),
    Cage.ofSum(18).cell(2, 1).cell(2, 2).cell(2, 3).mk(),
    Cage.ofSum(17).cell(0, 4).cell(0, 5).cell(0, 6).mk(),
    Cage.ofSum(7).cell(1, 4).cell(1, 5).mk(),
    Cage.ofSum(14).cell(2, 4).cell(3, 4).mk(),
    Cage.ofSum(5).cell(2, 5).cell(2, 6).mk(),
    Cage.ofSum(13).cell(0, 7).cell(0, 8).mk(),
    Cage.ofSum(14).cell(1, 6).cell(1, 7).cell(1, 8).mk(),
    Cage.ofSum(10).cell(2, 7).cell(2, 8).mk(),

    // middle nonets
    Cage.ofSum(3).cell(3, 1).cell(4, 1).mk(),
    Cage.ofSum(12).cell(3, 2).cell(4, 2).mk(),
    Cage.ofSum(13).cell(5, 0).cell(6, 0).cell(6, 1).mk(),
    Cage.ofSum(21).cell(5, 1).cell(5, 2).cell(5, 3).cell(6, 2).mk(),
    Cage.ofSum(10).cell(3, 3).cell(4, 3).mk(),
    Cage.ofSum(8).cell(4, 4).cell(5, 4).mk(),
    Cage.ofSum(20).cell(3, 5).cell(3, 6).cell(3, 7).cell(3, 8).mk(),
    Cage.ofSum(11).cell(4, 5).cell(4, 6).mk(),
    Cage.ofSum(14).cell(5, 5).cell(6, 5).mk(),
    Cage.ofSum(14).cell(4, 7).cell(5, 6).cell(5, 7).mk(),
    Cage.ofSum(12).cell(4, 8).cell(5, 8).cell(6, 8).mk(),

    // lower nonets
    Cage.ofSum(22).cell(7, 0).cell(7, 1).cell(8, 0).cell(8, 1).mk(),
    Cage.ofSum(10).cell(7, 2).cell(8, 2).mk(),
    Cage.ofSum(15).cell(6, 3).cell(6, 4).cell(7, 3).mk(),
    Cage.ofSum(8).cell(8, 3).cell(8, 4).mk(),
    Cage.ofSum(17).cell(7, 4).cell(7, 5).cell(7, 6).mk(),
    Cage.ofSum(15).cell(8, 5).cell(8, 6).cell(8, 7).mk(),
    Cage.ofSum(4).cell(6, 6).mk(),
    Cage.ofSum(12).cell(6, 7).cell(7, 7).mk(),
    Cage.ofSum(7).cell(7, 8).cell(8, 8).mk()
]);

export const sudokuDotCom_dailyChallengeOf_2022_08_30 = new Problem([
    // upper nonets
    Cage.ofSum(15).cell(0, 0).cell(0, 1).cell(0, 2).mk(),
    Cage.ofSum(12).cell(1, 0).cell(1, 1).cell(1, 2).mk(),
    Cage.ofSum(18).cell(2, 0).cell(2, 1).cell(3, 0).mk(),
    Cage.ofSum(13).cell(2, 2).cell(2, 3).mk(),
    Cage.ofSum(22).cell(0, 3).cell(0, 4).cell(1, 3).mk(),
    Cage.ofSum(14).cell(0, 5).cell(0, 6).cell(0, 7).mk(),
    Cage.ofSum(15).cell(1, 4).cell(2, 4).cell(3, 4).mk(),
    Cage.ofSum(17).cell(1, 5).cell(2, 5).cell(3, 5).mk(),
    Cage.ofSum(14).cell(1, 6).cell(1, 7).cell(2, 6).mk(),
    Cage.ofSum(11).cell(0, 8).cell(1, 8).mk(),
    Cage.ofSum(7).cell(2, 7).cell(3, 7).mk(),
    Cage.ofSum(12).cell(2, 8).cell(3, 8).cell(4, 8).mk(),

    // middle nonets
    Cage.ofSum(8).cell(4, 0).cell(5, 0).mk(),
    Cage.ofSum(14).cell(3, 1).cell(4, 1).cell(5, 1).mk(),
    Cage.ofSum(6).cell(3, 2).cell(4, 2).mk(),
    Cage.ofSum(15).cell(5, 2).cell(6, 2).mk(),
    Cage.ofSum(5).cell(3, 3).mk(),
    Cage.ofSum(17).cell(4, 3).cell(4, 4).cell(4, 5).mk(),
    Cage.ofSum(9).cell(5, 3).cell(6, 3).mk(),
    Cage.ofSum(12).cell(5, 4).cell(6, 4).mk(),
    Cage.ofSum(7).cell(5, 5).cell(6, 5).mk(),
    Cage.ofSum(18).cell(3, 6).cell(4, 6).cell(4, 7).mk(),
    Cage.ofSum(15).cell(5, 6).cell(6, 6).cell(7, 6).mk(),
    Cage.ofSum(1).cell(5, 7).mk(),
    Cage.ofSum(10).cell(5, 8).cell(6, 8).mk(),

    // lower nonets
    Cage.ofSum(10).cell(6, 0).cell(7, 0).cell(8, 0).mk(),
    Cage.ofSum(19).cell(6, 1).cell(7, 1).cell(8, 1).mk(),
    Cage.ofSum(16).cell(7, 2).cell(7, 3).cell(8, 2).mk(),
    Cage.ofSum(7).cell(7, 4).cell(7, 5).mk(),
    Cage.ofSum(3).cell(8, 3).cell(8, 4).mk(),
    Cage.ofSum(13).cell(8, 5).cell(8, 6).mk(),
    Cage.ofSum(18).cell(6, 7).cell(7, 7).cell(8, 7).mk(),
    Cage.ofSum(12).cell(7, 8).cell(8, 8).mk()
]);

export const sudokuDotCom_dailyChallengeOf_2022_10_18 = new Problem([
    // upper nonets
    Cage.ofSum(8).cell(0, 0).cell(0, 1).mk(),
    Cage.ofSum(13).cell(1, 0).cell(1, 1).mk(),
    Cage.ofSum(19).cell(2, 0).cell(2, 1).cell(2, 2).cell(2, 3).mk(),
    Cage.ofSum(13).cell(0, 2).cell(0, 3).cell(1, 2).mk(),
    Cage.ofSum(4).cell(1, 3).mk(),
    Cage.ofSum(9).cell(0, 4).cell(1, 4).mk(),
    Cage.ofSum(17).cell(0, 5).cell(1, 5).mk(),
    Cage.ofSum(14).cell(2, 4).cell(3, 4).mk(),
    Cage.ofSum(5).cell(2, 5).cell(3, 5).mk(),
    Cage.ofSum(4).cell(0, 6).mk(),
    Cage.ofSum(9).cell(0, 7).cell(0, 8).cell(1, 8).mk(),
    Cage.ofSum(13).cell(1, 6).cell(1, 7).mk(),
    Cage.ofSum(22).cell(2, 6).cell(2, 7).cell(3, 6).cell(4, 6).mk(),
    Cage.ofSum(17).cell(2, 8).cell(3, 7).cell(3, 8).mk(),

    // middle nonets
    Cage.ofSum(4).cell(3, 0).cell(3, 1).mk(),
    Cage.ofSum(16).cell(4, 0).cell(5, 0).mk(),
    Cage.ofSum(20).cell(4, 1).cell(4, 2).cell(4, 3).cell(5, 1).mk(),
    Cage.ofSum(14).cell(3, 2).cell(3, 3).mk(),
    Cage.ofSum(8).cell(5, 2).cell(5, 3).mk(),
    Cage.ofSum(6).cell(4, 4).cell(5, 4).mk(),
    Cage.ofSum(10).cell(4, 5).cell(5, 5).mk(),
    Cage.ofSum(16).cell(4, 7).cell(4, 8).cell(5, 7).mk(),
    Cage.ofSum(12).cell(5, 6).cell(6, 6).cell(7, 6).mk(),
    Cage.ofSum(8).cell(5, 8).cell(6, 8).mk(),

    // lower nonets
    Cage.ofSum(19).cell(6, 0).cell(6, 1).cell(6, 2).mk(),
    Cage.ofSum(11).cell(7, 0).cell(8, 0).mk(),
    Cage.ofSum(6).cell(7, 1).cell(8, 1).mk(),
    Cage.ofSum(9).cell(7, 2).cell(8, 2).mk(),
    Cage.ofSum(13).cell(6, 3).cell(6, 4).cell(6, 5).mk(),
    Cage.ofSum(8).cell(7, 3).cell(8, 3).mk(),
    Cage.ofSum(18).cell(7, 4).cell(7, 5).cell(8, 4).mk(),
    Cage.ofSum(5).cell(6, 7).mk(),
    Cage.ofSum(15).cell(7, 7).cell(7, 8).mk(),
    Cage.ofSum(20).cell(8, 5).cell(8, 6).cell(8, 7).cell(8, 8).mk()
]);

export const sudokuDotCom_dailyChallengeOf_2022_10_19 = new Problem([
    // upper nonets
    Cage.ofSum(25).cell(0, 0).cell(1, 0).cell(2, 0).cell(3, 0).mk(),
    Cage.ofSum(7).cell(0, 1).cell(1, 1).mk(),
    Cage.ofSum(12).cell(2, 1).cell(2, 2).mk(),
    Cage.ofSum(14).cell(0, 2).cell(0, 3).mk(),
    Cage.ofSum(10).cell(1, 2).cell(1, 3).cell(1, 4).mk(),
    Cage.ofSum(18).cell(0, 4).cell(0, 5).cell(1, 5).mk(),
    Cage.ofSum(11).cell(2, 3).cell(2, 4).mk(),
    Cage.ofSum(8).cell(2, 5).cell(3, 5).mk(),
    Cage.ofSum(10).cell(2, 6).cell(3, 6).mk(),
    Cage.ofSum(13).cell(0, 6).cell(1, 6).mk(),
    Cage.ofSum(5).cell(0, 7).cell(1, 7).mk(),
    Cage.ofSum(8).cell(0, 8).cell(1, 8).mk(),
    Cage.ofSum(13).cell(2, 7).cell(2, 8).mk(),

    // middle nonets
    Cage.ofSum(17).cell(3, 1).cell(3, 2).cell(4, 0).cell(4, 1).mk(),
    Cage.ofSum(26).cell(5, 0).cell(5, 1).cell(6, 1).cell(7, 1).cell(7, 2).mk(),
    Cage.ofSum(9).cell(4, 2).cell(4, 3).cell(5, 3).mk(),
    Cage.ofSum(16).cell(5, 2).cell(6, 2).mk(),
    Cage.ofSum(6).cell(3, 3).cell(3, 4).mk(),
    Cage.ofSum(15).cell(4, 4).cell(4, 5).mk(),
    Cage.ofSum(12).cell(5, 4).cell(5, 5).mk(),
    Cage.ofSum(15).cell(3, 7).cell(3, 8).mk(),
    Cage.ofSum(9).cell(4, 6).cell(5, 6).mk(),
    Cage.ofSum(9).cell(4, 7).cell(4, 8).mk(),
    Cage.ofSum(11).cell(5, 7).cell(6, 7).mk(),
    Cage.ofSum(5).cell(5, 8).cell(6, 8).mk(),

    // lower nonets
    Cage.ofSum(7).cell(6, 0).cell(7, 0).mk(),
    Cage.ofSum(6).cell(8, 0).cell(8, 1).mk(),
    Cage.ofSum(15).cell(8, 2).cell(8, 3).mk(),
    Cage.ofSum(17).cell(6, 3).cell(7, 3).cell(7, 4).mk(),
    Cage.ofSum(15).cell(6, 4).cell(6, 5).cell(6, 6).mk(),
    Cage.ofSum(19).cell(7, 5).cell(7, 6).cell(7, 7).cell(8, 7).mk(),
    Cage.ofSum(13).cell(8, 4).cell(8, 5).cell(8, 6).mk(),
    Cage.ofSum(9).cell(7, 8).cell(8, 8).mk()
]);

export const sudokuDotCom_dailyChallengeOf_2022_10_22 = new Problem([
    // upper nonets
    Cage.ofSum(11).cell(0, 0).cell(0, 1).mk(),
    Cage.ofSum(10).cell(1, 0).cell(1, 1).mk(),
    Cage.ofSum(6).cell(2, 0).cell(2, 1).mk(),
    Cage.ofSum(19).cell(0, 2).cell(0, 3).cell(0, 4).cell(1, 2).mk(),
    Cage.ofSum(22).cell(2, 2).cell(3, 2).cell(3, 3).mk(),
    Cage.ofSum(10).cell(1, 3).cell(2, 3).mk(),
    Cage.ofSum(14).cell(1, 4).cell(2, 4).mk(),
    Cage.ofSum(14).cell(0, 5).cell(0, 6).cell(1, 5).mk(),
    Cage.ofSum(8).cell(2, 5).cell(2, 6).mk(),
    Cage.ofSum(8).cell(0, 7).cell(1, 6).cell(1, 7).mk(),
    Cage.ofSum(13).cell(0, 8).cell(1, 8).mk(),
    Cage.ofSum(15).cell(2, 7).cell(2, 8).cell(3, 8).mk(),

    // middle nonets
    Cage.ofSum(10).cell(3, 0).cell(3, 1).mk(),
    Cage.ofSum(27).cell(4, 0).cell(5, 0).cell(5, 1).cell(6, 0).mk(),
    Cage.ofSum(9).cell(4, 1).cell(4, 2).mk(),
    Cage.ofSum(14).cell(5, 2).cell(6, 1).cell(6, 2).mk(),
    Cage.ofSum(6).cell(4, 3).cell(5, 3).mk(),
    Cage.ofSum(8).cell(3, 4).cell(3, 5).mk(),
    Cage.ofSum(9).cell(4, 4).cell(4, 5).mk(),
    Cage.ofSum(17).cell(5, 4).cell(6, 3).cell(6, 4).mk(),
    Cage.ofSum(6).cell(5, 5).mk(),
    Cage.ofSum(18).cell(3, 6).cell(3, 7).cell(4, 6).mk(),
    Cage.ofSum(14).cell(4, 7).cell(5, 7).mk(),
    Cage.ofSum(4).cell(4, 8).cell(5, 8).mk(),
    Cage.ofSum(10).cell(5, 6).cell(6, 5).cell(6, 6).mk(),

    // lower nonets
    Cage.ofSum(8).cell(7, 0).cell(8, 0).mk(),
    Cage.ofSum(18).cell(7, 1).cell(7, 2).cell(7, 3).mk(),
    Cage.ofSum(4).cell(8, 1).cell(8, 2).mk(),
    Cage.ofSum(21).cell(7, 4).cell(7, 5).cell(7, 6).cell(8, 5).mk(),
    Cage.ofSum(10).cell(8, 3).cell(8, 4).mk(),
    Cage.ofSum(10).cell(6, 7).cell(7, 7).mk(),
    Cage.ofSum(19).cell(6, 8).cell(7, 8).cell(8, 8).mk(),
    Cage.ofSum(13).cell(8, 6).cell(8, 7).mk()
]);

export const sudokuDotCom_dailyChallengeOf_2022_10_25 = new Problem([
    // upper nonets
    Cage.ofSum(11).cell(0, 0).cell(0, 1).mk(),
    Cage.ofSum(12).cell(0, 2).cell(1, 2).cell(1, 3).mk(),
    Cage.ofSum(20).cell(1, 0).cell(1, 1).cell(2, 1).mk(),
    Cage.ofSum(7).cell(2, 0).cell(3, 0).mk(),
    Cage.ofSum(17).cell(2, 2).cell(2, 3).cell(2, 4).cell(2, 5).mk(),
    Cage.ofSum(11).cell(0, 3).cell(0, 4).mk(),
    Cage.ofSum(8).cell(1, 4).cell(1, 5).mk(),
    Cage.ofSum(12).cell(0, 5).cell(0, 6).cell(0, 7).mk(),
    Cage.ofSum(12).cell(0, 8).cell(1, 8).mk(),
    Cage.ofSum(20).cell(1, 6).cell(1, 7).cell(2, 6).mk(),
    Cage.ofSum(10).cell(2, 7).cell(2, 8).mk(),

    // middle nonets
    Cage.ofSum(10).cell(3, 1).cell(4, 1).mk(),
    Cage.ofSum(4).cell(4, 0).cell(5, 0).mk(),
    Cage.ofSum(18).cell(5, 1).cell(5, 2).cell(6, 2).mk(),
    Cage.ofSum(16).cell(3, 2).cell(3, 3).cell(3, 4).mk(),
    Cage.ofSum(10).cell(4, 2).cell(4, 3).mk(),
    Cage.ofSum(27).cell(3, 5).cell(4, 4).cell(4, 5).cell(5, 4).cell(5, 5).mk(),
    Cage.ofSum(5).cell(5, 3).cell(6, 3).mk(),
    Cage.ofSum(11).cell(3, 6).cell(3, 7).mk(),
    Cage.ofSum(20).cell(4, 6).cell(4, 7).cell(5, 6).mk(),
    Cage.ofSum(11).cell(3, 8).cell(4, 8).cell(5, 8).mk(),
    Cage.ofSum(11).cell(5, 7).cell(6, 7).cell(6, 8).mk(),

    // lower nonets
    Cage.ofSum(21).cell(6, 0).cell(7, 0).cell(8, 0).mk(),
    Cage.ofSum(7).cell(6, 1).cell(7, 1).mk(),
    Cage.ofSum(10).cell(8, 1).cell(8, 2).mk(),
    Cage.ofSum(20).cell(7, 2).cell(7, 3).cell(8, 3).mk(),
    Cage.ofSum(6).cell(6, 4).cell(7, 4).mk(),
    Cage.ofSum(13).cell(6, 5).cell(6, 6).mk(),
    Cage.ofSum(18).cell(7, 5).cell(8, 4).cell(8, 5).cell(8, 6).mk(),
    Cage.ofSum(12).cell(7, 6).cell(7, 7).mk(),
    Cage.ofSum(15).cell(7, 8).cell(8, 7).cell(8, 8).mk()
]);

export const sudokuDotCom_dailyChallengeOf_2022_11_01 = new Problem([
    // upper nonets
    Cage.ofSum(15).cell(0, 0).cell(0, 1).mk(),
    Cage.ofSum(10).cell(0, 2).cell(1, 2).mk(),
    Cage.ofSum(17).cell(0, 3).cell(1, 3).mk(),
    Cage.ofSum(13).cell(0, 4).cell(0, 5).cell(1, 4).mk(),
    Cage.ofSum(7).cell(0, 6).cell(0, 7).mk(),
    Cage.ofSum(11).cell(0, 8).cell(1, 8).mk(),
    Cage.ofSum(7).cell(1, 0).cell(1, 1).mk(),
    Cage.ofSum(10).cell(1, 5).cell(1, 6).cell(1, 7).mk(),
    Cage.ofSum(13).cell(2, 0).cell(2, 1).cell(2, 2).mk(),
    Cage.ofSum(11).cell(2, 3).cell(2, 4).mk(),
    Cage.ofSum(8).cell(2, 5).cell(3, 5).mk(),
    Cage.ofSum(16).cell(2, 6).cell(3, 6).mk(),
    Cage.ofSum(9).cell(2, 7).cell(2, 8).mk(),

    // middle nonets
    Cage.ofSum(4).cell(3, 0).cell(3, 1).mk(),
    Cage.ofSum(2).cell(3, 2).mk(),
    Cage.ofSum(14).cell(3, 3).cell(3, 4).mk(),
    Cage.ofSum(5).cell(3, 7).cell(4, 7).mk(),
    Cage.ofSum(19).cell(3, 8).cell(4, 8).cell(5, 8).mk(),
    Cage.ofSum(27).cell(4, 0).cell(4, 1).cell(5, 0).cell(5, 1).mk(),
    Cage.ofSum(14).cell(4, 2).cell(5, 2).cell(5, 3).mk(),
    Cage.ofSum(10).cell(4, 3).cell(4, 4).mk(),
    Cage.ofSum(20).cell(4, 5).cell(4, 6).cell(5, 4).cell(5, 5).mk(),
    Cage.ofSum(22).cell(5, 6).cell(5, 7).cell(6, 6).cell(6, 7).mk(),

    // lower nonets
    Cage.ofSum(19).cell(6, 0).cell(7, 0).cell(8, 0).mk(),
    Cage.ofSum(14).cell(6, 1).cell(7, 1).cell(8, 1).cell(8, 2).mk(),
    Cage.ofSum(15).cell(6, 2).cell(6, 3).cell(7, 2).mk(),
    Cage.ofSum(6).cell(6, 4).cell(6, 5).mk(),
    Cage.ofSum(14).cell(6, 8).cell(7, 8).cell(8, 8).mk(),
    Cage.ofSum(6).cell(7, 3).cell(8, 3).mk(),
    Cage.ofSum(22).cell(7, 4).cell(8, 4).cell(8, 5).mk(),
    Cage.ofSum(8).cell(7, 5).mk(),
    Cage.ofSum(10).cell(7, 6).cell(7, 7).mk(),
    Cage.ofSum(7).cell(8, 6).cell(8, 7).mk()
]);

export const sudokuDotCom_dailyChallengeOf_2022_11_10 = new Problem([
    // upper nonets
    Cage.ofSum(7).cell(0, 0).cell(0, 1).mk(),
    Cage.ofSum(7).cell(0, 2).cell(1, 2).mk(),
    Cage.ofSum(11).cell(1, 0).cell(2, 0).mk(),
    Cage.ofSum(11).cell(1, 1).cell(2, 1).mk(),
    Cage.ofSum(16).cell(2, 2).cell(3, 2).mk(),
    Cage.ofSum(11).cell(0, 3).cell(0, 4).mk(),
    Cage.ofSum(9).cell(0, 5).cell(1, 5).mk(),
    Cage.ofSum(22).cell(1, 3).cell(2, 3).cell(3, 3).mk(),
    Cage.ofSum(7).cell(1, 4).cell(2, 4).mk(),
    Cage.ofSum(15).cell(2, 5).cell(3, 4).cell(3, 5).mk(),
    Cage.ofSum(20).cell(0, 6).cell(0, 7).cell(1, 6).mk(),
    Cage.ofSum(15).cell(0, 8).cell(1, 8).cell(2, 8).cell(3, 8).mk(),
    Cage.ofSum(24).cell(1, 7).cell(2, 7).cell(3, 6).cell(3, 7).cell(4, 7).mk(),
    Cage.ofSum(7).cell(2, 6).mk(),

    // middle nonets
    Cage.ofSum(6).cell(3, 0).cell(3, 1).mk(),
    Cage.ofSum(15).cell(4, 0).cell(4, 1).cell(4, 2).mk(),
    Cage.ofSum(12).cell(5, 0).cell(6, 0).cell(7, 0).mk(),
    Cage.ofSum(11).cell(5, 1).cell(5, 2).mk(),
    Cage.ofSum(4).cell(4, 3).cell(5, 3).mk(),
    Cage.ofSum(13).cell(4, 4).cell(5, 4).mk(),
    Cage.ofSum(8).cell(4, 5).cell(4, 6).mk(),
    Cage.ofSum(11).cell(5, 5).cell(6, 5).mk(),
    Cage.ofSum(18).cell(4, 8).cell(5, 6).cell(5, 7).cell(5, 8).mk(),

    // lower nonets
    Cage.ofSum(12).cell(6, 1).cell(7, 1).mk(),
    Cage.ofSum(17).cell(6, 2).cell(6, 3).cell(7, 2).mk(),
    Cage.ofSum(13).cell(8, 0).cell(8, 1).mk(),
    Cage.ofSum(12).cell(7, 3).cell(8, 2).cell(8, 3).mk(),
    Cage.ofSum(11).cell(6, 4).cell(7, 4).mk(),
    Cage.ofSum(10).cell(8, 4).cell(8, 5).mk(),
    Cage.ofSum(17).cell(6, 6).cell(7, 5).cell(7, 6).cell(7, 7).mk(),
    Cage.ofSum(8).cell(6, 7).cell(6, 8).mk(),
    Cage.ofSum(17).cell(7, 8).cell(8, 8).mk(),
    Cage.ofSum(8).cell(8, 6).cell(8, 7).mk()
]);

export const sudokuDotCom_randomExpertLevelChallenge = new Problem([
    // upper nonets
    Cage.ofSum(30).cell(0, 0).cell(0, 1).cell(1, 0).cell(1, 1).cell(1, 2).cell(2, 0).mk(),
    Cage.ofSum(10).cell(2, 1).cell(2, 2).mk(),
    Cage.ofSum(6).cell(0, 2).cell(0, 3).mk(),
    Cage.ofSum(3).cell(0, 4).mk(),
    Cage.ofSum(20).cell(1, 3).cell(1, 4).cell(2, 4).mk(),
    Cage.ofSum(15).cell(2, 3).cell(3, 3).mk(),
    Cage.ofSum(6).cell(0, 5).cell(0, 6).mk(),
    Cage.ofSum(18).cell(1, 5).cell(1, 6).cell(2, 5).cell(2, 6).mk(),
    Cage.ofSum(16).cell(0, 7).cell(0, 8).mk(),
    Cage.ofSum(9).cell(1, 7).cell(2, 7).mk(),
    Cage.ofSum(10).cell(1, 8).cell(2, 8).mk(),

    // middle nonets
    Cage.ofSum(30).cell(3, 0).cell(3, 1).cell(3, 2).cell(4, 0).cell(4, 1).mk(),
    Cage.ofSum(4).cell(4, 2).cell(5, 2).mk(),
    Cage.ofSum(4).cell(5, 0).mk(),
    Cage.ofSum(21).cell(5, 1).cell(6, 1).cell(6, 2).mk(),
    Cage.ofSum(23).cell(3, 4).cell(4, 3).cell(4, 4).cell(4, 5).mk(),
    Cage.ofSum(7).cell(5, 3).cell(5, 4).mk(),
    Cage.ofSum(4).cell(3, 5).cell(3, 6).mk(),
    Cage.ofSum(21).cell(5, 5).cell(5, 6).cell(6, 5).mk(),
    Cage.ofSum(9).cell(3, 7).cell(3, 8).mk(),
    Cage.ofSum(15).cell(4, 6).cell(4, 7).cell(4, 8).mk(),
    Cage.ofSum(13).cell(5, 7).cell(5, 8).cell(6, 8).mk(),

    // lower nonets
    Cage.ofSum(8).cell(6, 0).cell(7, 0).mk(),
    Cage.ofSum(6).cell(7, 1).cell(7, 2).mk(),
    Cage.ofSum(10).cell(8, 0).cell(8, 1).mk(),
    Cage.ofSum(21).cell(8, 2).cell(8, 3).cell(8, 4).mk(),
    Cage.ofSum(13).cell(6, 3).cell(7, 3).mk(),
    Cage.ofSum(3).cell(6, 4).cell(7, 4).mk(),
    Cage.ofSum(11).cell(7, 5).cell(7, 6).mk(),
    Cage.ofSum(5).cell(8, 5).cell(8, 6).mk(),
    Cage.ofSum(10).cell(6, 6).cell(6, 7).mk(),
    Cage.ofSum(13).cell(7, 7).cell(8, 7).mk(),
    Cage.ofSum(11).cell(7, 8).cell(8, 8).mk()
]);
