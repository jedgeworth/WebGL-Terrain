/**
 * SkyDome.js
 *
 * Creates a skydome that follows the camera.
 *
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

const DomePrimitive = require('./Primitives/DomePrimitive');
const QuadPlanePrimitive = require('./Primitives/QuadPlanePrimitive');
const SceneObject = require('./SceneObject');


module.exports = class SkyDome {

    constructor(gl, domeGlTexture, floorGlTexture) {

        this.camera = null;

        this.domeSceneObject = null;
        this.floorSceneObject = null;

        this.domeSceneObject = new SceneObject(gl);
        this.domeSceneObject.setPrimitive(new DomePrimitive(gl, 1000, 0.5, 16, 32));
        this.domeSceneObject.setTexture(domeGlTexture);
        this.domeSceneObject.useLighting = false;
        this.domeSceneObject.useFog = false;

        this.floorSceneObject = new SceneObject(gl);
        this.floorSceneObject.setPrimitive(new QuadPlanePrimitive(gl, 1000, false));
        this.floorSceneObject.setTexture(floorGlTexture);
        this.floorSceneObject.useLighting = false;
        this.floorSceneObject.useFog = false;
    }

    /**
     * Registers the scene objects with the app registry.
     * @param {*} edgeGl The app registry.
     * @param {*} domeName A unique name for the dome's scene object.
     * @param {*} floorName A unique name for the floor's scene object.
     */
    registerSceneObjects(edgeGl, domeName, floorName, targetBuffer) {
        edgeGl.registerSceneObject(floorName, this.floorSceneObject, 'base', 'nonDepth', targetBuffer);
        edgeGl.registerSceneObject(domeName, this.domeSceneObject, 'base', 'nonDepth', targetBuffer);
    }

    /**
     * Sets the camera which the dome will follow.
     * @param {*} camera
     */
    setCamera(camera) {
        this.camera = camera;
    }


    /**
     * Called during the render loop to keep the dome at the camera position.
     */
    update(reflected) {
        const position = this.camera.getPosition();

        if (reflected) {
            position[1] *= -1;
        }

        position[1] -= 100.0;

        this.domeSceneObject.setPosition(position[0], position[1], position[2]);
        this.floorSceneObject.setPosition(position[0], position[1], position[2]);
    }
}
