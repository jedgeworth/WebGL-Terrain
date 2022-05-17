/**
 * Light.js
 *
 * Represents a directional or point light.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

const { Vector } = require('sylvester-es6');
const Sylvester = require('sylvester-es6/src/Sylvester');

const Vector3 = require('./types/Vector3');
const Color4 = require('./types/Color4');

module.exports = class Light {

    /**
     * Creates a light.
     *
     * Note that position and direction are used in different means depending
     * on the light's type.
     *
     * - Directional lights: The direction is used for the lighting calculation
     * whilst position defines where the object appears in the scene.
     * - Point lights: The position is used in the lighting calculations and
     * where it appears in the scene.
     * - Spot light: The position is used to calculate the lighting whilst the
     * direction specifies which way the light's cone is facing.
     *
     * @param {*} glContext glContext object.
     */
    constructor(glContext, lightIndex) {

        this.gl = glContext;
        this.lightIndex = lightIndex;
        this.sceneObject = null;

        this.position = new Vector3();
        this.direction = new Vector3();

        this.ambient = new Color4();
        this.diffuse = new Color4();
        this.specular = new Color4();

        // 0: Directional light
        // 1: Point light
        // 2: Spot light
        this.type = 0;
    }


    setType(type) {
        this.type = type;
    }

    /**
     * Set the light position.
     * @param {*} x
     * @param {*} y
     * @param {*} z
     */
    setPosition(x, y, z) {

        if (this.sceneObject) {
            this.sceneObject.setPosition(x, y, z);
        }

        this.position.x = x;
        this.position.y = y;
        this.position.z = z;
    }

    /**
     * Gets the position.
     *
     * If we have a sceneObject, we use that instead.
     */
    getPosition() {
        if (this.sceneObject) {
            return this.sceneObject.position;
        }

        return this.position;
    }

    /**
     * Set the light direction.
     *
     * Alias of setPosition.
     * @param {*} x
     * @param {*} y
     * @param {*} z
     */
    setDirection(x, y, z) {

        if (this.sceneObject) {
            this.sceneObject.setDirection(x, y, z);
        }

        this.direction.x = x;
        this.direction.y = y;
        this.direction.z = z;
    }

    /**
     * Gets the direction.
     *
     * If we have a sceneObject, we use that instead.
     */
     getDirection() {
        if (this.sceneObject) {
            return this.sceneObject.direction;
        }

        return this.direction;
    }


    /**
     * Sets the ambient colour of the light.
     *
     * @param {*} r
     * @param {*} g
     * @param {*} b
     * @param {*} a
     */
    setAmbient(r, g, b, a) {
        this.ambient.r = r;
        this.ambient.g = g;
        this.ambient.b = b;
        this.ambient.a = a;
    }

    /**
     * Sets the diffuse colour of the light.
     *
     * @param {*} r
     * @param {*} g
     * @param {*} b
     * @param {*} a
     */
    setDiffuse(r, g, b, a) {
        this.diffuse.r = r;
        this.diffuse.g = g;
        this.diffuse.b = b;
        this.diffuse.a = a;
    }


    /**
     * Sets the specular colour of the light.
     *
     * @param {*} r
     * @param {*} g
     * @param {*} b
     * @param {*} a
     */
    setSpecular(r, g, b, a) {
        this.specular.r = r;
        this.specular.g = g;
        this.specular.b = b;
        this.specular.a = a;
    }


    randomise() {
        this.diffuse.r = Math.random();
        this.diffuse.g = Math.random();
        this.diffuse.b = Math.random();
    }


    /**
     * Set the primitive, if rendering for debug.
     */
    setSceneObject(sceneObject) {
        this.sceneObject = sceneObject;

        this.sceneObject.setPositionVector(this.position);

    }

}
