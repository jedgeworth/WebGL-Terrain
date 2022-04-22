/**
 * Color4.js
 *
 * Defines a Color object with 4 parameters.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

 module.exports = class Color4 {

    constructor() {

        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 0;
    }


    flatten() {
        return [this.r, this.g, this.b];
    }
}
