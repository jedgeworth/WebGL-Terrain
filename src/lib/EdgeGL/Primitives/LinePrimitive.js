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

 module.exports = class LinePrimitive {

    constructor(gl, position, length) {
        this.vertices = [
            0.0,       0.0,     0.0,
            position.x * length,       position.y * length,     position.z * length,
        ];

        this.colors = [
            // X (R)
            1.0, 1.0, 0.0,
            1.0, 1.0, 0.0,
        ];

        this.renderMode = gl.LINES;
    }
}

