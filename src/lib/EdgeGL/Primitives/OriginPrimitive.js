/**
 * Primitives/OriginPrimitve.js
 *
 * Defines an object with three lines, each representing either x,y,z.
 *
 * X: Red
 * Y: Green
 * Z: Blue
 *
 * @author James Edgeworth (https://jamesedgeworth.com)
 */

module.exports = class OriginPrimitive {

    constructor(gl) {
        this.vertices = [
            0,       0,     0,
            100.0,   0,     0,

            0,       0,     0,
            0,       100.0, 0,

            0,       0,     0,
            0,       0,     100.0,
        ];

        this.colors = [
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
        ];

        this.renderMode = gl.LINES;
    }
}

