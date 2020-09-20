/**
 * Matrix utility functions.
 *
 * Manages the Model-View-Matrix stack.
 *
 * I cannot remember where I got the original functions from, and will give credit
 * when I find it.
 *
 * Original functions converted to ES6.
 *
 */

const Sylvester = require('sylvester-es6/src/Sylvester');

module.exports = class Matrices {

    constructor() {
        this.mvMatrix = Sylvester.Matrix.I(4);
        this.perspectiveMatrix = Sylvester.Matrix.I(4);

        this.mvMatrixStack = [];
    }

    /**
     * Resets the mvMatrix.
     */
    loadIdentity() {
        this.mvMatrix = Sylvester.Matrix.I(4);
    }

    /**
     * Multiplies the mvMatrix by another matrix.
     * @param {*} m
     */
    multMatrix(m) {
        this.mvMatrix = this.mvMatrix.x(m);
    }

    /**
     *
     * @param {*} v
     */
    mvTranslate(v) {
        this.multMatrix(
            Sylvester.Matrix.Translation(
                new Sylvester.Vector([v[0], v[1], v[2]])
            ).ensure4x4()
        );
    }

    /**
     * Pushes the mvMatrix stack.
     * @param {*} m
     */
    mvPushMatrix(m) {
        if (m) {
            this.mvMatrixStack.push(m.dup());
            this.mvMatrix = m.dup();
        } else {
            this.mvMatrixStack.push(this.mvMatrix.dup());
        }
    }

    /**
     * Pops the mvMatrix stack.
     */
    mvPopMatrix() {
        if (!this.mvMatrixStack.length) {
            throw("Can't pop from an empty matrix stack.");
        }

        this.mvMatrix = this.mvMatrixStack.pop();
        return this.mvMatrix;
    }

    /**
     *
     * @param {*} angle
     * @param {*} v
     */
    mvRotate(angle, v) {
        const inRadians = angle * Math.PI / 180.0;

        let m = Sylvester.Matrix.Rotation(
            inRadians,
            new Sylvester.Vector([v[0], v[1], v[2]])
        ).ensure4x4();

        this.multMatrix(m);
    }

}
