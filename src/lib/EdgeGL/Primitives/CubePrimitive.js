/**
 * Primitives/CubePrimtive.js
 *
 * Defines a cube.
 *
 * @todo Vertex buffer is not big enough for the draw call..
 *
 * @author James Edgeworth (https://jamesedgeworth.com)
 */

 module.exports = class CubePrimitive {

    constructor(gl) {
        this.vertices = [
            -10, -10,  10,   // LDF V0
             10, -10,  10,   // RDF V1
            -10,  10,  10,   // LUF V2
             10,  10,  10,   // RUF V3

            -10, -10, -10,   // LDB V4
             10, -10, -10,   // RDB V5
            -10,  10, -10,   // LUB V6
             10,  10, -10    // RUB V7
        ];


        this.normals = [
            // (todo)
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,

            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
        ];

        this.texCoords = [

            0.0,  0.0, // LDF V0
            1.0,  0.0, // RDF V1
            0.0,  1.0, // LUF V2
            1.0,  1.0, // RUF V3

            0.0,  0.0, // LDB V4
            1.0,  0.0, // RDB V5
            0.0,  1.0, // LUB V6
            1.0,  1.0, // RUB V7
        ];

        this.indices = [
            // U
            2, 6, 7,
            2, 3, 7,

            // D
            0, 4, 5,
            0, 1, 5,

            // L
            0, 2, 6,
            0, 4, 6,

            // R
            1, 3, 7,
            1, 5, 7,

            // F
            0, 2, 3,
            0, 1, 3,

            // B
            4, 6, 7,
            4, 5, 7
        ];

        this.renderMode = gl.TRIANGLES;
    }
}
