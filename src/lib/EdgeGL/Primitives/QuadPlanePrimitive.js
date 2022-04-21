/**
 * Primitives/QuadPlanePrimitve.js
 *
 * Defines a quad plane (e.g a generic floor, ocean, etc).
 *
 * @author James Edgeworth (https://jamesedgeworth.com)
 */

module.exports = class QuadPlanePrimitive {

    constructor(gl) {
        this.vertices = [
            // Bottom face
            -100.0, 0.0, -100.0,    //BL V0
             100.0, 0.0, -100.0,    //BR V1
             100.0, 0.0,  100.0,    //TR V2
            -100.0, 0.0,  100.0,    //TL V3
        ];


        this.normals = [
            // Bottom
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
            0.0, -1.0,  0.0,
        ];

        this.texCoords = [
            // Bottom
            0.0,  0.0,
            1.0,  0.0,
            1.0,  1.0,
            0.0,  1.0,
        ];

        this.indices = [
            0,  1,  2,      0,  2,  3,    // bottom
        ];

        this.renderMode = gl.TRIANGLES;
    }
}
