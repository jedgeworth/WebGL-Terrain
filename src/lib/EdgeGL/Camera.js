/**
 * Camera.js
 *
 * Represents the location and rotation of the scene's viewport.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

 const Sylvester = require('sylvester-es6/src/Sylvester');
module.exports = class Camera {

    constructor() {
        this.WALKSPEED = 1;
        this.TURNSPEED = 1;
        this.PIOVER180 = 0.0174532925;

        this.xPos = 0.0;
        this.yPos = 0.0;
        this.zPos = 100.0;

        this.pitch = 0.0;
        this.yaw = 0.0;
    }

    /**
     * Set a specific position.
     * @param {*} x
     * @param {*} y
     * @param {*} z
     */
    setPosition(x, y ,z) {
        this.xPos = x;
        this.yPos = y;
        this.zPos = z;
    }

    /**
     * Set a specific rotation.
     * @param {*} pitch
     * @param {*} yaw
     */
    setRotation(pitch, yaw) {
        this.pitch = pitch;
        this.yaw = yaw;
    }

    /**
     * Turn camera left.
     */
    yawLeft() {

        this.yaw += this.TURNSPEED;
    }

    /**
     * Turn camera right.
     */
    yawRight() {
        this.yaw -= this.TURNSPEED;
    }

    /**
     * Angle camera upwards.
     */
    pitchUp() {
        this.pitch -= this.TURNSPEED;
    }

    /**
     * Angle camera downwards.
     */
    pitchDown() {
        this.pitch += this.TURNSPEED;
    }

    /**
     * Move camera left (strafe).
     */
    moveLeft() {
        this.xPos -= Math.sin( (this.yaw + 90) * this.PIOVER180 ) * this.WALKSPEED;
        this.zPos -= Math.cos( (this.yaw + 90) * this.PIOVER180 ) * this.WALKSPEED;
    }

    /**
     * Move camera right (strafe).
     */
    moveRight() {
        this.xPos += Math.sin( (this.yaw + 90) * this.PIOVER180 ) * this.WALKSPEED;
        this.zPos += Math.cos( (this.yaw + 90) * this.PIOVER180 ) * this.WALKSPEED;
    }

    /**
     * Move camera forward.
     */
    moveForward() {
        this.xPos -= Math.sin( this.yaw * this.PIOVER180 ) * this.WALKSPEED;
        this.zPos -= Math.cos( this.yaw * this.PIOVER180 ) * this.WALKSPEED;
    }

    /**
     * Move camera backward.
     */
    moveBackward() {
        this.xPos += Math.sin( this.yaw * this.PIOVER180 ) * this.WALKSPEED;
        this.zPos += Math.cos( this.yaw * this.PIOVER180 ) * this.WALKSPEED;
    }

    /**
     * Move camera upwards (fly).
     */
    moveUp() {
        this.yPos += this.WALKSPEED;
    }

    /**
     * Move camera downward.
     */
    moveDown() {
        this.yPos -= this.WALKSPEED;
    }

    /**
     * Sets the movement speed.
     *
     * @param {*} newSpeed
     */
    setWalkSpeed(newSpeed) {
        this.WALKSPEED = newSpeed;
    }

    setTurnSpeed(newSpeed) {
        this.TURNSPEED = newSpeed;
    }

    incrementWalkSpeed() {
        this.WALKSPEED += 1;
    }

    decrementWalkSpeed() {

        if (this.WALKSPEED > 0) {
            this.WALKSPEED -= 1;
        }

    }

    /**
     * Called per frame to update the scene with the current camera position/rotation.
     */
    update(matrices) {
        let xTrans, yTrans, zTrans;

        xTrans = -this.xPos;
        yTrans = -this.yPos;
        zTrans = -this.zPos;

        let yRot = 360.0 - this.yaw;

        matrices.mvRotate(this.pitch, [this.TURNSPEED, 0, 0]);
        matrices.mvRotate(yRot, [0, this.TURNSPEED, 0]);

        matrices.mvTranslate([xTrans, yTrans, zTrans]);
    }

    /**
     * Print debug information to a HTML element.
     * @param {*} debugElementId ID of the target HTML element to display the text.
     */
    debug(debugElementId) {
        let text = `<h3>Camera</h3>`;
        text += `speed: ${this.WALKSPEED}<br>\n`;
        text += `pitch: ${this.pitch}<br>\n`;
        text += `yaw: ${this.yaw}<br>\n`;
        text += `x: ${this.xPos.toFixed(2)}<br>\n`;
        text += `y: ${this.yPos.toFixed(2)}<br>\n`;
        text += `z: ${this.zPos.toFixed(2)}`;

        document.getElementById(debugElementId).innerHTML = text;
    }
};
