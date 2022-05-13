/**
 * Vector3.js
 *
 * Defines a Vector object with 3 parameters.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

module.exports = class Vector3 {

    constructor(x, y, z) {
        // Vertex (Offset: 0)

        if (x !== undefined) {
            this.x = x;
            this.y = y;
            this.z = z;
        } else {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        }

    }

    flatten() {
        return [this.x, this.y, this.z];
    }
}
