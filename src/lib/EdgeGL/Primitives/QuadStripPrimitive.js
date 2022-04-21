/**
 * Primitives/QuadStripPrimitve.js
 *
 * Defines a quad plane (e.g a generic floor, ocean, etc).
 *
 * @author James Edgeworth (https://jamesedgeworth.com)
 */

/**
 * e.g: CCW
 *
 * 0 --- 3 --- 5
 * |     |     |
 * |     |     |
 * 1 --- 2 --- 4
 */
 module.exports = class QuadStripPrimitive {

    constructor(gl) {
        this.vertices = [

            0.0,   200.0, 0.0,   //TL V0
            100.0, 200.0, 0.0,   //TM V1
            200.0, 200.0, 0.0,   //TR V2

            0.0,   100.0, 0.0,   //ML V3
            100.0, 100.0, 0.0,   //MM V4
            200.0, 100.0, 0.0,   //MR V5

            0.0,   0.0,   0.0,   //BL V6
            100.0, 0.0,   0.0,   //BM V7
            200.0, 0.0,   0.0,   //BR V8

        ];


        this.normals = [
            0.0, -1.0,  0.0,     //TL V0
            0.0, -1.0,  0.0,     //TM V1
            0.0, -1.0,  0.0,     //TR V2

            0.0, -1.0,  0.0,     //ML V3
            0.0, -1.0,  0.0,     //MM V4
            0.0, -1.0,  0.0,     //MR V5

            0.0, -1.0,  0.0,     //BL V6
            0.0, -1.0,  0.0,     //BM V7
            0.0, -1.0,  0.0,     //BR V8
        ];

        this.texCoords = [
            0.0,  1.0, // TL
            0.5,  1.0, // TM
            1.0,  1.0, // TR

            0.0,  0.5, // ML
            0.5,  0.5, // MM
            1.0,  0.5, // MR

            0.0,  0.0, // BL
            0.5,  0.0, // BM
            1.0,  0.0, // BR
        ];


        this.indices = [
            0,  3,  1,    1,  3,  4,        1,  4,  2,    2,  4,  5,
            3,  6,  4,    4,  6,  7,        4,  7,  5,    5,  7,  8
        ];


        this.renderMode = gl.TRIANGLES;


        // this.indices = [
        //     0,  3,  1,      4, 2, 5,   5,3,

        //     3,  6,  4,      7, 5, 8
        // ];


        // this.renderMode = gl.TRIANGLE_STRIP;
    }
}
