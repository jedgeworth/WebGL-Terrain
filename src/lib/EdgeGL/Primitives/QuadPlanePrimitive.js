/**
 * Primitives/QuadPlanePrimitve.js
 *
 * Defines a quad plane (e.g a generic floor, ocean, etc).
 *
 * @author James Edgeworth (https://jamesedgeworth.com)
 */

module.exports = class QuadPlanePrimitive {

    constructor(gl, w, isWall) {

        if (w === undefined) {
            w = 100;
        }

        if (isWall === true) {

            this.vertices = [
                // Front face
                -w, -w, 0.0,    //BL V0
                 w, -w, 0.0,    //BR V1
                 w,  w, 0.0,    //TR V2
                -w,  w, 0.0,    //TL V3
            ];

        } else {
            this.vertices = [
                // Bottom face
                -w, 0.0, -w,    //BL V0
                 w, 0.0, -w,    //BR V1
                 w, 0.0,  w,    //TR V2
                -w, 0.0,  w,    //TL V3
            ];
        }



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
