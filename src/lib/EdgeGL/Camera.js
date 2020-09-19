/**
 * Camera.js
 *
 * Represents the location and rotation of the scene's viewport.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */
module.exports = class Camera {

    constructor() {
        this.WALKSPEED = 1;
        this.TURNSPEED = 1;
        this.PIOVER180 = 0.0174532925;

        this.xPos = 0.0;
        this.yPos = 20.0;
        this.zPos = 100.0;

        this.pitch = 0.0;
        this.yaw = 0.0;
    }

    /**
     * Turn camera left.
     */
    yawLeft() {
        yaw += TURNSPEED;
    }

    /**
     * Turn camera right.
     */
    yawRight() {
        yaw -= TURNSPEED;
    }

    /**
     * Angle camera upwards.
     */
    pitchUp() {
        pitch -= TURNSPEED;
    }

    /**
     * Angle camera downwards.
     */
    pitchDown() {
        pitch += TURNSPEED;
    }

    /**
     * Move camera left (strafe).
     */
    moveLeft() {
        xPos -= Math.sin( (yaw + 90) * PIOVER180 ) * WALKSPEED;
        zPos -= Math.cos( (yaw + 90) * PIOVER180 ) * WALKSPEED;
    }

    /**
     * Move camera right (strafe).
     */
    moveRight() {
        xPos += Math.sin( (yaw + 90) * PIOVER180 ) * WALKSPEED;
        zPos += Math.cos( (yaw + 90) * PIOVER180 ) * WALKSPEED;
    }

    /**
     * Move camera forward.
     */
    moveForward() {
        xPos -= Math.sin( yaw * PIOVER180 ) * WALKSPEED;
        zPos -= Math.cos( yaw * PIOVER180 ) * WALKSPEED;
    }

    /**
     * Move camera backward.
     */
    moveBackward() {
        xPos += Math.sin( yaw * PIOVER180 ) * WALKSPEED;
        zPos += Math.cos( yaw * PIOVER180 ) * WALKSPEED;
    }

    /**
     * Move camera upwards (fly).
     */
    moveUp() {
        yPos += WALKSPEED;
    }

    /**
     * Move camera downward.
     */
    moveDown() {
        yPos -= WALKSPEED;
    }

    /**
     * Called per frame to update the scene with the current camera position/rotation.
     */
    update() {
        let xTrans, yTrans, zTrans;

        xTrans = -xPos;
        yTrans = -yPos;
        zTrans = -zPos;

        let yRot = 360.0 - yaw;

        mvRotate(pitch, [TURNSPEED, 0, 0]);
        mvRotate(yRot, [0, TURNSPEED, 0]);

        mvTranslate([xTrans, yTrans, zTrans]);
    }

    /**
     * Print debug information to a HTML element.
     * @param {*} debugElementId ID of the target HTML element to display the text.
     */
    debug(debugElementId) {
        let text = `pitch: ${pitch}`;
        text += `yaw: ${yaw}`;
        text += `x: ${xPos}`;
        text += `y: ${yPos}`;
        text += `z: ${zPos}`;

        document.getElementById(debugElementId).innerHTML = text;
    }
};
