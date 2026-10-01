// ABOUTME: Tests for the grid's presentation rules — cell boundaries and a square's options.
// ABOUTME: Pure functions, so these need no DOM.

import { assertDimensions, buildClasses, optionValuesFor } from './grid';

describe('assertDimensions', () => {
    it('accepts a board that divides into square cells', () => {
        expect(() => assertDimensions(9)).not.toThrow();
        expect(() => assertDimensions(16)).not.toThrow();
    });

    it('rejects one that does not', () => {
        expect(() => assertDimensions(10)).toThrow(/integer square root/);
    });
});

describe('buildClasses', () => {
    it('marks the right edge of each three-by-three cell', () => {
        expect(buildClasses(2, 9)).toContain('cellWall');     // column 3
        expect(buildClasses(5, 9)).toContain('cellWall');     // column 6
        expect(buildClasses(1, 9)).not.toContain('cellWall'); // column 2
    });

    it('marks the bottom edge of each three-by-three cell', () => {
        expect(buildClasses(18, 9)).toContain('cellFooter');     // row 3
        expect(buildClasses(45, 9)).toContain('cellFooter');     // row 6
        expect(buildClasses(0, 9)).not.toContain('cellFooter');  // row 1
    });

    it('marks both edges at a cell corner', () => {
        expect(buildClasses(20, 9)).toBe('cellFooter cellWall'); // row 3, column 3
    });
});

describe('optionValuesFor', () => {
    it('leads with a blank', () => {
        expect(optionValuesFor(0, [2, 3])).toEqual([0, 2, 3]);
    });

    it('includes the square\'s own value, which the hints exclude', () => {
        expect(optionValuesFor(5, [2, 3])).toEqual([0, 2, 3, 5]);
    });

    it('does not repeat the square\'s value when the hints already offer it', () => {
        expect(optionValuesFor(3, [2, 3])).toEqual([0, 2, 3]);
    });

    it('sorts numerically', () => {
        expect(optionValuesFor(10, [2, 11])).toEqual([0, 2, 10, 11]);
    });
});
