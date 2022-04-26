/**
 * KeyboardHandler.js
 *
 * Handles mapping keypresses to functions.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */
 module.exports = class KeyboardHandler{


    /**
     * Binds the keyboard handler to the current window, document.
     * @param {*} window
     * @param {*} document
     */
    constructor(window, document) {

        this.currentlyPressedKeys = {};
        this.camera = null;

        const self = this;

        //
        document.onkeydown = function (e) {
            self.currentlyPressedKeys[e.keyCode] = true;
        };
        document.onkeyup = function (e) {
            self.currentlyPressedKeys[e.keyCode] = false;
        };

        // Prevent certain keys from scrolling the page.
        window.addEventListener("keydown", function(e) {
            // space and arrow keys
            if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
        }, false);
    }

    /**
     * Sets the camera object.
     * @param {*} camera
     */
    setCamera(camera) {
        this.camera = camera;
    }

    /**
     * Called once per render loop.
     */
    handleKeys() {

        if (this.currentlyPressedKeys[37]) {
          // Left cursor key
          this.camera.yawLeft();
        }
        if (this.currentlyPressedKeys[39]) {
          // Right cursor key
          this.camera.yawRight();
        }
        if (this.currentlyPressedKeys[38]) {
          // Up cursor key
          this.camera.pitchUp();
        }
        if (this.currentlyPressedKeys[40]) {
          // Down cursor key
          this.camera.pitchDown();
        }

        if (this.currentlyPressedKeys[87]) {
          // W
          this.camera.moveForward();
        }

        if (this.currentlyPressedKeys[83]) {
          // S
          this.camera.moveBackward();
        }

        if (this.currentlyPressedKeys[65]) {
          // A
          this.camera.moveLeft();
        }

        if (this.currentlyPressedKeys[68]) {
          // D
          this.camera.moveRight();
        }

        if (this.currentlyPressedKeys[32]) {
          // Space
          this.camera.moveUp();
        }

        if (this.currentlyPressedKeys[81]) {
          // Q
          this.camera.moveDown();
        }

        if (this.currentlyPressedKeys[82]) {
            // R
            this.camera.incrementWalkSpeed();
        }

        if (this.currentlyPressedKeys[70]) {
            // F
            this.camera.decrementWalkSpeed();
        }
      }

}
