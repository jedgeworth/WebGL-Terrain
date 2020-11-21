/**
 * Vector12.js
 *
 * Defines a Vector object with 12 parameters.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

module.exports = class Vector12 {

    constructor() {
        // Vertex (Offset: 0)
        this.x = 0.0;
        this.y = 0.0;
        this.z = 0.0;

        // Texcoords (Offset 3)
        this.s = 0.0;
        this.t = 0.0;

        // Colours (Offset: 5)
        this.r = 0.0;
        this.g = 0.0;
        this.b = 0.0;
        this.a = 0.0;

        // Normals (Offset: 9)
        this.nx = 0.0;
        this.ny = 0.0;
        this.nz = 0.0;
    }
}
