// ABOUTME: Tests for Point, the 1-indexed board coordinate.
// ABOUTME: Point carries no logic beyond its debug rendering.

import Point from './Point';

describe('Point', () => {
    it('keeps the coordinates it was given', () => {
        const point = new Point(3, 7);

        expect(point.x).toBe(3);
        expect(point.y).toBe(7);
    });

    it('renders as [x,y] for debugging', () => {
        expect(new Point(3, 7).getDebug()).toBe('[3,7]');
    });
});
