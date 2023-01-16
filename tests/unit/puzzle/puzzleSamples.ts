import { Cage } from '../../../src/puzzle/cage';
import { Puzzle } from '../../../src/puzzle/puzzle';

const samplePuzzle = new Puzzle([
    // upper nonets
    Cage.ofSum(17).at(0, 0).at(1, 0).at(1, 1).mk(),
    Cage.ofSum(7).at(0, 1).mk(),
    Cage.ofSum(7).at(0, 2).at(0, 3).mk(),
    Cage.ofSum(4).at(0, 4).at(0, 5).mk(),
    Cage.ofSum(11).at(0, 6).at(1, 6).mk(),
    Cage.ofSum(14).at(0, 7).at(1, 7).at(2, 7).mk(),
    Cage.ofSum(14).at(0, 8).at(1, 8).at(2, 8).mk(),
    Cage.ofSum(7).at(1, 2).at(1, 3).mk(),
    Cage.ofSum(23).at(1, 4).at(1, 5).at(2, 3).at(2, 4).mk(),
    Cage.ofSum(10).at(2, 0).at(2, 1).at(3, 1).mk(),
    Cage.ofSum(9).at(2, 2).mk(),
    Cage.ofSum(13).at(2, 5).at(2, 6).mk(),

    // middle nonets
    Cage.ofSum(17).at(3, 0).at(4, 0).at(4, 1).mk(),
    Cage.ofSum(14).at(3, 2).at(3, 3).mk(),
    Cage.ofSum(23).at(3, 4).at(4, 4).at(4, 5).at(4, 6).mk(),
    Cage.ofSum(5).at(3, 5).at(3, 6).mk(),
    Cage.ofSum(17).at(3, 7).at(3, 8).at(4, 7).mk(),
    Cage.ofSum(4).at(4, 2).at(4, 3).mk(),
    Cage.ofSum(10).at(4, 8).at(5, 8).mk(),
    Cage.ofSum(16).at(5, 0).at(5, 1).at(6, 1).mk(),
    Cage.ofSum(15).at(5, 2).at(6, 2).mk(),
    Cage.ofSum(23).at(5, 3).at(5, 4).at(6, 3).at(6, 4).mk(),
    Cage.ofSum(10).at(5, 5).at(6, 5).mk(),
    Cage.ofSum(25).at(5, 6).at(6, 6).at(6, 7).at(7, 7).mk(),
    Cage.ofSum(6).at(5, 7).mk(),

    // lower nonets
    Cage.ofSum(3).at(6, 0).at(7, 0).mk(),
    Cage.ofSum(8).at(6, 8).at(7, 8).mk(),
    Cage.ofSum(27).at(7, 1).at(7, 2).at(7, 3).at(8, 2).at(8, 3).mk(),
    Cage.ofSum(6).at(7, 4).at(8, 4).mk(),
    Cage.ofSum(12).at(7, 5).at(7, 6).at(8, 5).mk(),
    Cage.ofSum(12).at(8, 0).at(8, 1).mk(),
    Cage.ofSum(16).at(8, 6).at(8, 7).at(8, 8).mk()
]);

class SudokuDotComPuzzleSamples {
    readonly dailyChallengeOf_2022_04_06 = new Puzzle([
        // upper nonets
        Cage.ofSum(7).at(0, 0).at(0, 1).mk(),
        Cage.ofSum(18).at(1, 0).at(1, 1).at(2, 0).mk(),
        Cage.ofSum(20).at(0, 2).at(1, 2).at(2, 1).at(2, 2).mk(),
        Cage.ofSum(17).at(0, 3).at(1, 3).at(1, 4).mk(),
        Cage.ofSum(7).at(2, 3).at(2, 4).mk(),
        Cage.ofSum(16).at(0, 4).at(0, 5).at(0, 6).mk(),
        Cage.ofSum(6).at(1, 5).mk(),
        Cage.ofSum(18).at(2, 5).at(3, 3).at(3, 4).at(3, 5).mk(),
        Cage.ofSum(11).at(0, 7).at(0, 8).at(1, 8).mk(),
        Cage.ofSum(12).at(1, 6).at(1, 7).mk(),
        Cage.ofSum(8).at(2, 6).at(3, 6).mk(),
        Cage.ofSum(21).at(2, 7).at(2, 8).at(3, 7).at(3, 8).mk(),
    
        // middle nonets
        Cage.ofSum(20).at(3, 0).at(4, 0).at(5, 0).at(6, 0).at(6, 1).mk(),
        Cage.ofSum(18).at(3, 1).at(3, 2).at(4, 2).mk(),
        Cage.ofSum(9).at(4, 1).at(5, 1).mk(),
        Cage.ofSum(18).at(5, 2).at(6, 2).at(6, 3).at(6, 4).mk(),
        Cage.ofSum(8).at(4, 3).at(5, 3).mk(),
        Cage.ofSum(13).at(4, 4).at(5, 4).mk(),
        Cage.ofSum(12).at(4, 5).at(4, 6).mk(),
        Cage.ofSum(12).at(5, 5).at(6, 5).mk(),
        Cage.ofSum(10).at(4, 7).at(4, 8).mk(),
        Cage.ofSum(9).at(5, 6).at(5, 7).mk(),
        Cage.ofSum(14).at(5, 8).at(6, 8).mk(),
    
        // lower nonets
        Cage.ofSum(7).at(7, 0).mk(),
        Cage.ofSum(6).at(8, 0).mk(),
        Cage.ofSum(9).at(7, 1).at(8, 1).mk(),
        Cage.ofSum(11).at(7, 2).at(8, 2).mk(),
        Cage.ofSum(7).at(7, 3).at(7, 4).mk(),
        Cage.ofSum(20).at(8, 3).at(8, 4).at(8, 5).mk(),
        Cage.ofSum(15).at(7, 5).at(7, 6).at(7, 7).mk(),
        Cage.ofSum(11).at(6, 6).at(6, 7).mk(),
        Cage.ofSum(3).at(8, 6).at(8, 7).mk(),
        Cage.ofSum(12).at(7, 8).at(8, 8).mk()
    ]);
    
    readonly dailyChallengeOf_2022_08_12 = new Puzzle([
        // upper nonets
        Cage.ofSum(6).at(0, 0).at(1, 0).mk(),
        Cage.ofSum(12).at(0, 1).at(1, 1).mk(),
        Cage.ofSum(20).at(2, 0).at(3, 0).at(4, 0).mk(),
        Cage.ofSum(11).at(0, 2).at(0, 3).mk(),
        Cage.ofSum(10).at(1, 2).at(1, 3).mk(),
        Cage.ofSum(18).at(2, 1).at(2, 2).at(2, 3).mk(),
        Cage.ofSum(17).at(0, 4).at(0, 5).at(0, 6).mk(),
        Cage.ofSum(7).at(1, 4).at(1, 5).mk(),
        Cage.ofSum(14).at(2, 4).at(3, 4).mk(),
        Cage.ofSum(5).at(2, 5).at(2, 6).mk(),
        Cage.ofSum(13).at(0, 7).at(0, 8).mk(),
        Cage.ofSum(14).at(1, 6).at(1, 7).at(1, 8).mk(),
        Cage.ofSum(10).at(2, 7).at(2, 8).mk(),
    
        // middle nonets
        Cage.ofSum(3).at(3, 1).at(4, 1).mk(),
        Cage.ofSum(12).at(3, 2).at(4, 2).mk(),
        Cage.ofSum(13).at(5, 0).at(6, 0).at(6, 1).mk(),
        Cage.ofSum(21).at(5, 1).at(5, 2).at(5, 3).at(6, 2).mk(),
        Cage.ofSum(10).at(3, 3).at(4, 3).mk(),
        Cage.ofSum(8).at(4, 4).at(5, 4).mk(),
        Cage.ofSum(20).at(3, 5).at(3, 6).at(3, 7).at(3, 8).mk(),
        Cage.ofSum(11).at(4, 5).at(4, 6).mk(),
        Cage.ofSum(14).at(5, 5).at(6, 5).mk(),
        Cage.ofSum(14).at(4, 7).at(5, 6).at(5, 7).mk(),
        Cage.ofSum(12).at(4, 8).at(5, 8).at(6, 8).mk(),
    
        // lower nonets
        Cage.ofSum(22).at(7, 0).at(7, 1).at(8, 0).at(8, 1).mk(),
        Cage.ofSum(10).at(7, 2).at(8, 2).mk(),
        Cage.ofSum(15).at(6, 3).at(6, 4).at(7, 3).mk(),
        Cage.ofSum(8).at(8, 3).at(8, 4).mk(),
        Cage.ofSum(17).at(7, 4).at(7, 5).at(7, 6).mk(),
        Cage.ofSum(15).at(8, 5).at(8, 6).at(8, 7).mk(),
        Cage.ofSum(4).at(6, 6).mk(),
        Cage.ofSum(12).at(6, 7).at(7, 7).mk(),
        Cage.ofSum(7).at(7, 8).at(8, 8).mk()
    ]);
    
    readonly dailyChallengeOf_2022_08_30 = new Puzzle([
        // upper nonets
        Cage.ofSum(15).at(0, 0).at(0, 1).at(0, 2).mk(),
        Cage.ofSum(12).at(1, 0).at(1, 1).at(1, 2).mk(),
        Cage.ofSum(18).at(2, 0).at(2, 1).at(3, 0).mk(),
        Cage.ofSum(13).at(2, 2).at(2, 3).mk(),
        Cage.ofSum(22).at(0, 3).at(0, 4).at(1, 3).mk(),
        Cage.ofSum(14).at(0, 5).at(0, 6).at(0, 7).mk(),
        Cage.ofSum(15).at(1, 4).at(2, 4).at(3, 4).mk(),
        Cage.ofSum(17).at(1, 5).at(2, 5).at(3, 5).mk(),
        Cage.ofSum(14).at(1, 6).at(1, 7).at(2, 6).mk(),
        Cage.ofSum(11).at(0, 8).at(1, 8).mk(),
        Cage.ofSum(7).at(2, 7).at(3, 7).mk(),
        Cage.ofSum(12).at(2, 8).at(3, 8).at(4, 8).mk(),
    
        // middle nonets
        Cage.ofSum(8).at(4, 0).at(5, 0).mk(),
        Cage.ofSum(14).at(3, 1).at(4, 1).at(5, 1).mk(),
        Cage.ofSum(6).at(3, 2).at(4, 2).mk(),
        Cage.ofSum(15).at(5, 2).at(6, 2).mk(),
        Cage.ofSum(5).at(3, 3).mk(),
        Cage.ofSum(17).at(4, 3).at(4, 4).at(4, 5).mk(),
        Cage.ofSum(9).at(5, 3).at(6, 3).mk(),
        Cage.ofSum(12).at(5, 4).at(6, 4).mk(),
        Cage.ofSum(7).at(5, 5).at(6, 5).mk(),
        Cage.ofSum(18).at(3, 6).at(4, 6).at(4, 7).mk(),
        Cage.ofSum(15).at(5, 6).at(6, 6).at(7, 6).mk(),
        Cage.ofSum(1).at(5, 7).mk(),
        Cage.ofSum(10).at(5, 8).at(6, 8).mk(),
    
        // lower nonets
        Cage.ofSum(10).at(6, 0).at(7, 0).at(8, 0).mk(),
        Cage.ofSum(19).at(6, 1).at(7, 1).at(8, 1).mk(),
        Cage.ofSum(16).at(7, 2).at(7, 3).at(8, 2).mk(),
        Cage.ofSum(7).at(7, 4).at(7, 5).mk(),
        Cage.ofSum(3).at(8, 3).at(8, 4).mk(),
        Cage.ofSum(13).at(8, 5).at(8, 6).mk(),
        Cage.ofSum(18).at(6, 7).at(7, 7).at(8, 7).mk(),
        Cage.ofSum(12).at(7, 8).at(8, 8).mk()
    ]);
    
    readonly dailyChallengeOf_2022_10_18 = new Puzzle([
        // upper nonets
        Cage.ofSum(8).at(0, 0).at(0, 1).mk(),
        Cage.ofSum(13).at(1, 0).at(1, 1).mk(),
        Cage.ofSum(19).at(2, 0).at(2, 1).at(2, 2).at(2, 3).mk(),
        Cage.ofSum(13).at(0, 2).at(0, 3).at(1, 2).mk(),
        Cage.ofSum(4).at(1, 3).mk(),
        Cage.ofSum(9).at(0, 4).at(1, 4).mk(),
        Cage.ofSum(17).at(0, 5).at(1, 5).mk(),
        Cage.ofSum(14).at(2, 4).at(3, 4).mk(),
        Cage.ofSum(5).at(2, 5).at(3, 5).mk(),
        Cage.ofSum(4).at(0, 6).mk(),
        Cage.ofSum(9).at(0, 7).at(0, 8).at(1, 8).mk(),
        Cage.ofSum(13).at(1, 6).at(1, 7).mk(),
        Cage.ofSum(22).at(2, 6).at(2, 7).at(3, 6).at(4, 6).mk(),
        Cage.ofSum(17).at(2, 8).at(3, 7).at(3, 8).mk(),
    
        // middle nonets
        Cage.ofSum(4).at(3, 0).at(3, 1).mk(),
        Cage.ofSum(16).at(4, 0).at(5, 0).mk(),
        Cage.ofSum(20).at(4, 1).at(4, 2).at(4, 3).at(5, 1).mk(),
        Cage.ofSum(14).at(3, 2).at(3, 3).mk(),
        Cage.ofSum(8).at(5, 2).at(5, 3).mk(),
        Cage.ofSum(6).at(4, 4).at(5, 4).mk(),
        Cage.ofSum(10).at(4, 5).at(5, 5).mk(),
        Cage.ofSum(16).at(4, 7).at(4, 8).at(5, 7).mk(),
        Cage.ofSum(12).at(5, 6).at(6, 6).at(7, 6).mk(),
        Cage.ofSum(8).at(5, 8).at(6, 8).mk(),
    
        // lower nonets
        Cage.ofSum(19).at(6, 0).at(6, 1).at(6, 2).mk(),
        Cage.ofSum(11).at(7, 0).at(8, 0).mk(),
        Cage.ofSum(6).at(7, 1).at(8, 1).mk(),
        Cage.ofSum(9).at(7, 2).at(8, 2).mk(),
        Cage.ofSum(13).at(6, 3).at(6, 4).at(6, 5).mk(),
        Cage.ofSum(8).at(7, 3).at(8, 3).mk(),
        Cage.ofSum(18).at(7, 4).at(7, 5).at(8, 4).mk(),
        Cage.ofSum(5).at(6, 7).mk(),
        Cage.ofSum(15).at(7, 7).at(7, 8).mk(),
        Cage.ofSum(20).at(8, 5).at(8, 6).at(8, 7).at(8, 8).mk()
    ]);
    
    readonly dailyChallengeOf_2022_10_19 = new Puzzle([
        // upper nonets
        Cage.ofSum(25).at(0, 0).at(1, 0).at(2, 0).at(3, 0).mk(),
        Cage.ofSum(7).at(0, 1).at(1, 1).mk(),
        Cage.ofSum(12).at(2, 1).at(2, 2).mk(),
        Cage.ofSum(14).at(0, 2).at(0, 3).mk(),
        Cage.ofSum(10).at(1, 2).at(1, 3).at(1, 4).mk(),
        Cage.ofSum(18).at(0, 4).at(0, 5).at(1, 5).mk(),
        Cage.ofSum(11).at(2, 3).at(2, 4).mk(),
        Cage.ofSum(8).at(2, 5).at(3, 5).mk(),
        Cage.ofSum(10).at(2, 6).at(3, 6).mk(),
        Cage.ofSum(13).at(0, 6).at(1, 6).mk(),
        Cage.ofSum(5).at(0, 7).at(1, 7).mk(),
        Cage.ofSum(8).at(0, 8).at(1, 8).mk(),
        Cage.ofSum(13).at(2, 7).at(2, 8).mk(),
    
        // middle nonets
        Cage.ofSum(17).at(3, 1).at(3, 2).at(4, 0).at(4, 1).mk(),
        Cage.ofSum(26).at(5, 0).at(5, 1).at(6, 1).at(7, 1).at(7, 2).mk(),
        Cage.ofSum(9).at(4, 2).at(4, 3).at(5, 3).mk(),
        Cage.ofSum(16).at(5, 2).at(6, 2).mk(),
        Cage.ofSum(6).at(3, 3).at(3, 4).mk(),
        Cage.ofSum(15).at(4, 4).at(4, 5).mk(),
        Cage.ofSum(12).at(5, 4).at(5, 5).mk(),
        Cage.ofSum(15).at(3, 7).at(3, 8).mk(),
        Cage.ofSum(9).at(4, 6).at(5, 6).mk(),
        Cage.ofSum(9).at(4, 7).at(4, 8).mk(),
        Cage.ofSum(11).at(5, 7).at(6, 7).mk(),
        Cage.ofSum(5).at(5, 8).at(6, 8).mk(),
    
        // lower nonets
        Cage.ofSum(7).at(6, 0).at(7, 0).mk(),
        Cage.ofSum(6).at(8, 0).at(8, 1).mk(),
        Cage.ofSum(15).at(8, 2).at(8, 3).mk(),
        Cage.ofSum(17).at(6, 3).at(7, 3).at(7, 4).mk(),
        Cage.ofSum(15).at(6, 4).at(6, 5).at(6, 6).mk(),
        Cage.ofSum(19).at(7, 5).at(7, 6).at(7, 7).at(8, 7).mk(),
        Cage.ofSum(13).at(8, 4).at(8, 5).at(8, 6).mk(),
        Cage.ofSum(9).at(7, 8).at(8, 8).mk()
    ]);
    
    readonly dailyChallengeOf_2022_10_22 = new Puzzle([
        // upper nonets
        Cage.ofSum(11).at(0, 0).at(0, 1).mk(),
        Cage.ofSum(10).at(1, 0).at(1, 1).mk(),
        Cage.ofSum(6).at(2, 0).at(2, 1).mk(),
        Cage.ofSum(19).at(0, 2).at(0, 3).at(0, 4).at(1, 2).mk(),
        Cage.ofSum(22).at(2, 2).at(3, 2).at(3, 3).mk(),
        Cage.ofSum(10).at(1, 3).at(2, 3).mk(),
        Cage.ofSum(14).at(1, 4).at(2, 4).mk(),
        Cage.ofSum(14).at(0, 5).at(0, 6).at(1, 5).mk(),
        Cage.ofSum(8).at(2, 5).at(2, 6).mk(),
        Cage.ofSum(8).at(0, 7).at(1, 6).at(1, 7).mk(),
        Cage.ofSum(13).at(0, 8).at(1, 8).mk(),
        Cage.ofSum(15).at(2, 7).at(2, 8).at(3, 8).mk(),
    
        // middle nonets
        Cage.ofSum(10).at(3, 0).at(3, 1).mk(),
        Cage.ofSum(27).at(4, 0).at(5, 0).at(5, 1).at(6, 0).mk(),
        Cage.ofSum(9).at(4, 1).at(4, 2).mk(),
        Cage.ofSum(14).at(5, 2).at(6, 1).at(6, 2).mk(),
        Cage.ofSum(6).at(4, 3).at(5, 3).mk(),
        Cage.ofSum(8).at(3, 4).at(3, 5).mk(),
        Cage.ofSum(9).at(4, 4).at(4, 5).mk(),
        Cage.ofSum(17).at(5, 4).at(6, 3).at(6, 4).mk(),
        Cage.ofSum(6).at(5, 5).mk(),
        Cage.ofSum(18).at(3, 6).at(3, 7).at(4, 6).mk(),
        Cage.ofSum(14).at(4, 7).at(5, 7).mk(),
        Cage.ofSum(4).at(4, 8).at(5, 8).mk(),
        Cage.ofSum(10).at(5, 6).at(6, 5).at(6, 6).mk(),
    
        // lower nonets
        Cage.ofSum(8).at(7, 0).at(8, 0).mk(),
        Cage.ofSum(18).at(7, 1).at(7, 2).at(7, 3).mk(),
        Cage.ofSum(4).at(8, 1).at(8, 2).mk(),
        Cage.ofSum(21).at(7, 4).at(7, 5).at(7, 6).at(8, 5).mk(),
        Cage.ofSum(10).at(8, 3).at(8, 4).mk(),
        Cage.ofSum(10).at(6, 7).at(7, 7).mk(),
        Cage.ofSum(19).at(6, 8).at(7, 8).at(8, 8).mk(),
        Cage.ofSum(13).at(8, 6).at(8, 7).mk()
    ]);
    
    readonly dailyChallengeOf_2022_10_25 = new Puzzle([
        // upper nonets
        Cage.ofSum(11).at(0, 0).at(0, 1).mk(),
        Cage.ofSum(12).at(0, 2).at(1, 2).at(1, 3).mk(),
        Cage.ofSum(20).at(1, 0).at(1, 1).at(2, 1).mk(),
        Cage.ofSum(7).at(2, 0).at(3, 0).mk(),
        Cage.ofSum(17).at(2, 2).at(2, 3).at(2, 4).at(2, 5).mk(),
        Cage.ofSum(11).at(0, 3).at(0, 4).mk(),
        Cage.ofSum(8).at(1, 4).at(1, 5).mk(),
        Cage.ofSum(12).at(0, 5).at(0, 6).at(0, 7).mk(),
        Cage.ofSum(12).at(0, 8).at(1, 8).mk(),
        Cage.ofSum(20).at(1, 6).at(1, 7).at(2, 6).mk(),
        Cage.ofSum(10).at(2, 7).at(2, 8).mk(),
    
        // middle nonets
        Cage.ofSum(10).at(3, 1).at(4, 1).mk(),
        Cage.ofSum(4).at(4, 0).at(5, 0).mk(),
        Cage.ofSum(18).at(5, 1).at(5, 2).at(6, 2).mk(),
        Cage.ofSum(16).at(3, 2).at(3, 3).at(3, 4).mk(),
        Cage.ofSum(10).at(4, 2).at(4, 3).mk(),
        Cage.ofSum(27).at(3, 5).at(4, 4).at(4, 5).at(5, 4).at(5, 5).mk(),
        Cage.ofSum(5).at(5, 3).at(6, 3).mk(),
        Cage.ofSum(11).at(3, 6).at(3, 7).mk(),
        Cage.ofSum(20).at(4, 6).at(4, 7).at(5, 6).mk(),
        Cage.ofSum(11).at(3, 8).at(4, 8).at(5, 8).mk(),
        Cage.ofSum(11).at(5, 7).at(6, 7).at(6, 8).mk(),
    
        // lower nonets
        Cage.ofSum(21).at(6, 0).at(7, 0).at(8, 0).mk(),
        Cage.ofSum(7).at(6, 1).at(7, 1).mk(),
        Cage.ofSum(10).at(8, 1).at(8, 2).mk(),
        Cage.ofSum(20).at(7, 2).at(7, 3).at(8, 3).mk(),
        Cage.ofSum(6).at(6, 4).at(7, 4).mk(),
        Cage.ofSum(13).at(6, 5).at(6, 6).mk(),
        Cage.ofSum(18).at(7, 5).at(8, 4).at(8, 5).at(8, 6).mk(),
        Cage.ofSum(12).at(7, 6).at(7, 7).mk(),
        Cage.ofSum(15).at(7, 8).at(8, 7).at(8, 8).mk()
    ]);
    
    readonly dailyChallengeOf_2022_11_01 = new Puzzle([
        // upper nonets
        Cage.ofSum(15).at(0, 0).at(0, 1).mk(),
        Cage.ofSum(10).at(0, 2).at(1, 2).mk(),
        Cage.ofSum(17).at(0, 3).at(1, 3).mk(),
        Cage.ofSum(13).at(0, 4).at(0, 5).at(1, 4).mk(),
        Cage.ofSum(7).at(0, 6).at(0, 7).mk(),
        Cage.ofSum(11).at(0, 8).at(1, 8).mk(),
        Cage.ofSum(7).at(1, 0).at(1, 1).mk(),
        Cage.ofSum(10).at(1, 5).at(1, 6).at(1, 7).mk(),
        Cage.ofSum(13).at(2, 0).at(2, 1).at(2, 2).mk(),
        Cage.ofSum(11).at(2, 3).at(2, 4).mk(),
        Cage.ofSum(8).at(2, 5).at(3, 5).mk(),
        Cage.ofSum(16).at(2, 6).at(3, 6).mk(),
        Cage.ofSum(9).at(2, 7).at(2, 8).mk(),
    
        // middle nonets
        Cage.ofSum(4).at(3, 0).at(3, 1).mk(),
        Cage.ofSum(2).at(3, 2).mk(),
        Cage.ofSum(14).at(3, 3).at(3, 4).mk(),
        Cage.ofSum(5).at(3, 7).at(4, 7).mk(),
        Cage.ofSum(19).at(3, 8).at(4, 8).at(5, 8).mk(),
        Cage.ofSum(27).at(4, 0).at(4, 1).at(5, 0).at(5, 1).mk(),
        Cage.ofSum(14).at(4, 2).at(5, 2).at(5, 3).mk(),
        Cage.ofSum(10).at(4, 3).at(4, 4).mk(),
        Cage.ofSum(20).at(4, 5).at(4, 6).at(5, 4).at(5, 5).mk(),
        Cage.ofSum(22).at(5, 6).at(5, 7).at(6, 6).at(6, 7).mk(),
    
        // lower nonets
        Cage.ofSum(19).at(6, 0).at(7, 0).at(8, 0).mk(),
        Cage.ofSum(14).at(6, 1).at(7, 1).at(8, 1).at(8, 2).mk(),
        Cage.ofSum(15).at(6, 2).at(6, 3).at(7, 2).mk(),
        Cage.ofSum(6).at(6, 4).at(6, 5).mk(),
        Cage.ofSum(14).at(6, 8).at(7, 8).at(8, 8).mk(),
        Cage.ofSum(6).at(7, 3).at(8, 3).mk(),
        Cage.ofSum(22).at(7, 4).at(8, 4).at(8, 5).mk(),
        Cage.ofSum(8).at(7, 5).mk(),
        Cage.ofSum(10).at(7, 6).at(7, 7).mk(),
        Cage.ofSum(7).at(8, 6).at(8, 7).mk()
    ]);
    
    readonly dailyChallengeOf_2022_11_10 = new Puzzle([
        // upper nonets
        Cage.ofSum(7).at(0, 0).at(0, 1).mk(),
        Cage.ofSum(7).at(0, 2).at(1, 2).mk(),
        Cage.ofSum(11).at(1, 0).at(2, 0).mk(),
        Cage.ofSum(11).at(1, 1).at(2, 1).mk(),
        Cage.ofSum(16).at(2, 2).at(3, 2).mk(),
        Cage.ofSum(11).at(0, 3).at(0, 4).mk(),
        Cage.ofSum(9).at(0, 5).at(1, 5).mk(),
        Cage.ofSum(22).at(1, 3).at(2, 3).at(3, 3).mk(),
        Cage.ofSum(7).at(1, 4).at(2, 4).mk(),
        Cage.ofSum(15).at(2, 5).at(3, 4).at(3, 5).mk(),
        Cage.ofSum(20).at(0, 6).at(0, 7).at(1, 6).mk(),
        Cage.ofSum(15).at(0, 8).at(1, 8).at(2, 8).at(3, 8).mk(),
        Cage.ofSum(24).at(1, 7).at(2, 7).at(3, 6).at(3, 7).at(4, 7).mk(),
        Cage.ofSum(7).at(2, 6).mk(),
    
        // middle nonets
        Cage.ofSum(6).at(3, 0).at(3, 1).mk(),
        Cage.ofSum(15).at(4, 0).at(4, 1).at(4, 2).mk(),
        Cage.ofSum(12).at(5, 0).at(6, 0).at(7, 0).mk(),
        Cage.ofSum(11).at(5, 1).at(5, 2).mk(),
        Cage.ofSum(4).at(4, 3).at(5, 3).mk(),
        Cage.ofSum(13).at(4, 4).at(5, 4).mk(),
        Cage.ofSum(8).at(4, 5).at(4, 6).mk(),
        Cage.ofSum(11).at(5, 5).at(6, 5).mk(),
        Cage.ofSum(18).at(4, 8).at(5, 6).at(5, 7).at(5, 8).mk(),
    
        // lower nonets
        Cage.ofSum(12).at(6, 1).at(7, 1).mk(),
        Cage.ofSum(17).at(6, 2).at(6, 3).at(7, 2).mk(),
        Cage.ofSum(13).at(8, 0).at(8, 1).mk(),
        Cage.ofSum(12).at(7, 3).at(8, 2).at(8, 3).mk(),
        Cage.ofSum(11).at(6, 4).at(7, 4).mk(),
        Cage.ofSum(10).at(8, 4).at(8, 5).mk(),
        Cage.ofSum(17).at(6, 6).at(7, 5).at(7, 6).at(7, 7).mk(),
        Cage.ofSum(8).at(6, 7).at(6, 8).mk(),
        Cage.ofSum(17).at(7, 8).at(8, 8).mk(),
        Cage.ofSum(8).at(8, 6).at(8, 7).mk()
    ]);
    
    readonly randomExpertLevelChallenge = new Puzzle([
        // upper nonets
        Cage.ofSum(30).at(0, 0).at(0, 1).at(1, 0).at(1, 1).at(1, 2).at(2, 0).mk(),
        Cage.ofSum(10).at(2, 1).at(2, 2).mk(),
        Cage.ofSum(6).at(0, 2).at(0, 3).mk(),
        Cage.ofSum(3).at(0, 4).mk(),
        Cage.ofSum(20).at(1, 3).at(1, 4).at(2, 4).mk(),
        Cage.ofSum(15).at(2, 3).at(3, 3).mk(),
        Cage.ofSum(6).at(0, 5).at(0, 6).mk(),
        Cage.ofSum(18).at(1, 5).at(1, 6).at(2, 5).at(2, 6).mk(),
        Cage.ofSum(16).at(0, 7).at(0, 8).mk(),
        Cage.ofSum(9).at(1, 7).at(2, 7).mk(),
        Cage.ofSum(10).at(1, 8).at(2, 8).mk(),
    
        // middle nonets
        Cage.ofSum(30).at(3, 0).at(3, 1).at(3, 2).at(4, 0).at(4, 1).mk(),
        Cage.ofSum(4).at(4, 2).at(5, 2).mk(),
        Cage.ofSum(4).at(5, 0).mk(),
        Cage.ofSum(21).at(5, 1).at(6, 1).at(6, 2).mk(),
        Cage.ofSum(23).at(3, 4).at(4, 3).at(4, 4).at(4, 5).mk(),
        Cage.ofSum(7).at(5, 3).at(5, 4).mk(),
        Cage.ofSum(4).at(3, 5).at(3, 6).mk(),
        Cage.ofSum(21).at(5, 5).at(5, 6).at(6, 5).mk(),
        Cage.ofSum(9).at(3, 7).at(3, 8).mk(),
        Cage.ofSum(15).at(4, 6).at(4, 7).at(4, 8).mk(),
        Cage.ofSum(13).at(5, 7).at(5, 8).at(6, 8).mk(),
    
        // lower nonets
        Cage.ofSum(8).at(6, 0).at(7, 0).mk(),
        Cage.ofSum(6).at(7, 1).at(7, 2).mk(),
        Cage.ofSum(10).at(8, 0).at(8, 1).mk(),
        Cage.ofSum(21).at(8, 2).at(8, 3).at(8, 4).mk(),
        Cage.ofSum(13).at(6, 3).at(7, 3).mk(),
        Cage.ofSum(3).at(6, 4).at(7, 4).mk(),
        Cage.ofSum(11).at(7, 5).at(7, 6).mk(),
        Cage.ofSum(5).at(8, 5).at(8, 6).mk(),
        Cage.ofSum(10).at(6, 6).at(6, 7).mk(),
        Cage.ofSum(13).at(7, 7).at(8, 7).mk(),
        Cage.ofSum(11).at(7, 8).at(8, 8).mk()
    ]);    
}

class DailyKillerSudokuDotComSamples {
    // https://www.dailykillersudoku.com/puzzle/24789
    readonly puzzle24789_difficulty10 = new Puzzle([
        // upper nonets
        Cage.ofSum(8).at(0, 0).at(0, 1).at(1, 0).mk(),
        Cage.ofSum(15).at(2, 0).at(3, 0).mk(),
        Cage.ofSum(19).at(1, 1).at(1, 2).at(2, 1).mk(),
        Cage.ofSum(12).at(0, 2).at(0, 3).mk(),
        Cage.ofSum(35).at(2, 2).at(2, 3).at(3, 2).at(3, 3).at(3, 4).at(4, 3).mk(),
        Cage.ofSum(31).at(0, 4).at(0, 5).at(0, 6).at(1, 3).at(1, 4).at(1, 5).at(1, 6).mk(),
        Cage.ofSum(6).at(2, 4).at(2, 5).mk(),
        Cage.ofSum(16).at(0, 7).at(1, 7).mk(),
        Cage.ofSum(11).at(0, 8).at(1, 8).mk(),
        Cage.ofSum(14).at(2, 6).at(2, 7).at(2, 8).at(3, 8).mk(),

        // middle nonets
        Cage.ofSum(33).at(3, 1).at(4, 0).at(4, 1).at(5, 0).at(5, 1).at(6, 0).at(6, 1).mk(),
        Cage.ofSum(6).at(4, 2).at(5, 2).mk(),
        Cage.ofSum(20).at(4, 4).at(4, 5).at(5, 4).at(5, 5).mk(),
        Cage.ofSum(30).at(3, 5).at(3, 6).at(4, 6).at(5, 6).at(5, 7).mk(),
        Cage.ofSum(7).at(3, 7).at(4, 7).mk(),
        Cage.ofSum(19).at(4, 8).at(5, 8).at(6, 8).mk(),

        // lower nonets
        Cage.ofSum(10).at(7, 0).at(7, 1).mk(),
        Cage.ofSum(13).at(8, 0).at(8, 1).mk(),
        Cage.ofSum(13).at(6, 2).at(7, 2).at(8, 2).at(8, 3).mk(),
        Cage.ofSum(24).at(5, 3).at(6, 3).at(6, 4).at(6, 5).at(7, 5).mk(),
        Cage.ofSum(14).at(7, 3).at(7, 4).mk(),
        Cage.ofSum(14).at(8, 4).at(8, 5).at(8, 6).mk(),
        Cage.ofSum(35).at(6, 6).at(6, 7).at(7, 6).at(7, 7).at(7, 8).at(8, 7).at(8, 8).mk()
    ]);

    // https://www.dailykillersudoku.com/puzzle/24889
    readonly puzzle24889_difficulty10 = new Puzzle([
        // upper nonets
        Cage.ofSum(17).at(0, 0).at(0, 1).at(1, 0).mk(),
        Cage.ofSum(15).at(0, 2).at(0, 3).at(1, 2).mk(),
        Cage.ofSum(3).at(1, 1).at(2, 1).mk(),
        Cage.ofSum(13).at(2, 2).at(3, 1).at(3, 2).mk(),
        Cage.ofSum(34).at(2, 0).at(3, 0).at(4, 0).at(4, 1).at(4, 2).at(5, 0).at(6, 0).mk(),
        Cage.ofSum(18).at(1, 3).at(2, 3).at(3, 3).at(4, 3).mk(),
        Cage.ofSum(18).at(0, 4).at(1, 4).at(2, 4).mk(),
        Cage.ofSum(6).at(3, 4).at(4, 4).mk(),
        Cage.ofSum(13).at(0, 5).at(0, 6).at(1, 6).mk(),
        Cage.ofSum(14).at(1, 5).at(2, 5).at(3, 5).at(4, 5).mk(),
        Cage.ofSum(19).at(2, 6).at(3, 6).at(3, 7).mk(),
        Cage.ofSum(18).at(0, 7).at(0, 8).at(1, 8).mk(),
        Cage.ofSum(13).at(1, 7).at(2, 7).mk(),
        Cage.ofSum(34).at(2, 8).at(3, 8).at(4, 6).at(4, 7).at(4, 8).at(5, 8).at(6, 8).mk(),

        // lower nonets
        Cage.ofSum(11).at(5, 1).at(6, 1).mk(),
        Cage.ofSum(29).at(5, 2).at(6, 2).at(7, 0).at(7, 1).at(7, 2).at(8, 0).mk(),
        Cage.ofSum(33).at(5, 3).at(5, 4).at(5, 5).at(6, 3).at(6, 5).mk(),
        Cage.ofSum(12).at(6, 4).at(7, 4).at(8, 4).mk(),
        Cage.ofSum(25).at(7, 3).at(8, 1).at(8, 2).at(8, 3).mk(),
        Cage.ofSum(16).at(7, 5).at(8, 5).at(8, 6).at(8, 7).mk(),
        Cage.ofSum(34).at(5, 6).at(6, 6).at(7, 6).at(7, 7).at(7, 8).at(8, 8).mk(),
        Cage.ofSum(10).at(5, 7).at(6, 7).mk()
    ]);

    // https://www.dailykillersudoku.com/puzzle/24914
    readonly puzzle24914_difficulty10 = new Puzzle([
        // upper nonets
        Cage.ofSum(17).at(0, 0).at(1, 0).at(2, 0).mk(),
        Cage.ofSum(32).at(0, 1).at(0, 2).at(0, 3).at(1, 3).at(0, 4).at(0, 5).at(0, 6).mk(),
        Cage.ofSum(15).at(0, 7).at(0, 8).mk(),
        Cage.ofSum(12).at(1, 1).at(1, 2).at(2, 1).mk(),
        Cage.ofSum(8).at(1, 4).at(1, 5).mk(),
        Cage.ofSum(9).at(2, 3).at(2, 4).mk(),
        Cage.ofSum(29).at(1, 6).at(2, 5).at(2, 6).at(3, 5).at(3, 6).mk(),
        Cage.ofSum(11).at(1, 7).at(1, 8).mk(),
        Cage.ofSum(10).at(2, 7).at(2, 8).at(3, 7).mk(),

        // middle nonets
        Cage.ofSum(14).at(3, 0).at(4, 0).at(4, 1).at(5, 0).mk(),
        Cage.ofSum(25).at(2, 2).at(3, 1).at(3, 2).at(3, 3).mk(),
        Cage.ofSum(15).at(5, 1).at(5, 2).at(5, 3).at(6, 2).mk(),
        Cage.ofSum(30).at(3, 4).at(4, 2).at(4, 3).at(4, 4).at(5, 4).mk(),
        Cage.ofSum(16).at(4, 5).at(4, 6).at(4, 7).mk(),
        Cage.ofSum(11).at(3, 8).at(4, 8).at(5, 8).mk(),
        Cage.ofSum(31).at(5, 5).at(5, 6).at(6, 5).at(6, 6).at(7, 6).mk(),
        Cage.ofSum(12).at(5, 7).at(6, 7).at(6, 8).mk(),

        // lower nonets
        Cage.ofSum(16).at(6, 0).at(7, 0).at(8, 0).mk(),
        Cage.ofSum(18).at(6, 1).at(7, 1).at(7, 2).mk(),
        Cage.ofSum(13).at(6, 3).at(6, 4).mk(),
        Cage.ofSum(28).at(7, 3).at(8, 1).at(8, 2).at(8, 3).at(8, 4).at(8, 5).at(8, 6).mk(),
        Cage.ofSum(10).at(7, 4).at(7, 5).mk(),
        Cage.ofSum(14).at(7, 7).at(7, 8).mk(),
        Cage.ofSum(9).at(8, 7).at(8, 8).mk()
    ]);

    // https://www.dailykillersudoku.com/puzzle/24919
    readonly puzzle24919_difficulty10 = new Puzzle([
        // upper nonets
        Cage.ofSum(17).at(0, 0).at(0, 1).at(1, 0).at(1, 1).mk(),
        Cage.ofSum(28).at(0, 2).at(1, 2).at(2, 0).at(2, 1).at(2, 2).mk(),
        Cage.ofSum(25).at(0, 3).at(0, 4).at(1, 3).at(1, 4).mk(),
        Cage.ofSum(14).at(0, 5).at(1, 5).mk(),
        Cage.ofSum(12).at(2, 3).at(3, 2).at(3, 3).mk(),
        Cage.ofSum(14).at(2, 4).at(2, 5).at(2, 6).at(3, 4).mk(),
        Cage.ofSum(8).at(0, 6).at(1, 6).mk(),
        Cage.ofSum(13).at(0, 7).at(0, 8).mk(),
        Cage.ofSum(14).at(1, 7).at(2, 7).at(3, 7).mk(),
        Cage.ofSum(16).at(1, 8).at(2, 8).at(3, 8).mk(),

        // middle nonets
        Cage.ofSum(22).at(3, 0).at(3, 1).at(4, 0).at(4, 1).mk(),
        Cage.ofSum(5).at(5, 0).at(5, 1).mk(),
        Cage.ofSum(18).at(4, 2).at(4, 3).at(5, 2).at(6, 2).mk(),
        Cage.ofSum(9).at(5, 3).at(6, 3).mk(),
        Cage.ofSum(24).at(4, 4).at(4, 5).at(5, 4).mk(),
        Cage.ofSum(7).at(3, 5).at(3, 6).mk(),
        Cage.ofSum(12).at(4, 6).at(4, 7).at(4, 8).mk(),
        Cage.ofSum(19).at(5, 5).at(5, 6).at(6, 5).at(6, 6).mk(),
        Cage.ofSum(18).at(5, 7).at(5, 8).at(6, 7).mk(),

        // lower nonets
        Cage.ofSum(13).at(6, 0).at(6, 1).mk(),
        Cage.ofSum(10).at(7, 0).at(8, 0).mk(),
        Cage.ofSum(22).at(7, 1).at(7, 2).at(7, 3).mk(),
        Cage.ofSum(13).at(8, 1).at(8, 2).at(8, 3).mk(),
        Cage.ofSum(12).at(6, 4).at(7, 4).at(8, 4).mk(),
        Cage.ofSum(13).at(7, 5).at(7, 6).at(8, 5).mk(),
        Cage.ofSum(27).at(6, 8).at(7, 7).at(7, 8).at(8, 6).at(8, 7).at(8, 8).mk()
    ]);
}

class PuzzleSamplesAPI {
    readonly reference = samplePuzzle;
    readonly sudokuDotCom = Object.freeze(new SudokuDotComPuzzleSamples());
    readonly dailyKillerSudokuDotCom = Object.freeze(new DailyKillerSudokuDotComSamples());
}

export const puzzleSamples = Object.freeze(new PuzzleSamplesAPI());
