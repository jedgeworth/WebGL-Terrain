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

        this.floorSceneObject = new SceneObject(gl);
        this.floorSceneObject.setPrimitive(new QuadPlanePrimitive(gl, 1000, false));
        this.floorSceneObject.setTexture(floorGlTexture);
    }

    /**
     * Registers the scene objects with the app registry.
     * @param {*} appRegistry The app registry.
     * @param {*} domeName A unique name for the dome's scene object.
     * @param {*} floorName A unique name for the floor's scene object.
     */
    registerSceneObjects(appRegistry, domeName, floorName) {
        appRegistry.registerSceneObject(floorName, this.floorSceneObject, 'base', 'nonDepth');
        appRegistry.registerSceneObject(domeName, this.domeSceneObject, 'base', 'nonDepth');
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
    update() {
        const position = this.camera.getPosition();
        position[1] -= 100.0;

        this.domeSceneObject.setPositionArray(position);
        this.floorSceneObject.setPositionArray(position);
    }
}
