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
     *
     * @param {*} glContext glContext object.
     */
    constructor(glContext, lightIndex) {

        this.gl = glContext;
        this.lightIndex = lightIndex;
        this.sceneObject = null;

        this.renderPosition = new Vector3();

        this.position = new Vector3();
        this.direction = new Vector3();

        this.ambient = new Color4();
        this.diffuse = new Color4();
        this.specular = new Color4();

        // 0: Directional light
        // 1: Point light
        // 2: Spot light
        this.type = 0;

        // This is a material property and will be moved to a material object.
        this.shininess = 1.0;
    }


    setType(type) {
        this.type = type;

        this.updateSceneObjectPosition();
    }

    /**
     * Depending on the light type, this updates the scene object to use
     * the correct position.
     */
    updateSceneObjectPosition() {

        if (this.sceneObject !== null) {
            if (this.type == 0) {
                if (this.renderPosition.x + this.renderPosition.y + this.renderPosition.z != 0.0) {
                    this.sceneObject.setPositionArray([
                        this.renderPosition.x,
                        this.renderPosition.y,
                        this.renderPosition.z
                    ]);
                } else {
                    this.sceneObject.setPositionArray([
                        this.position.x,
                        this.position.y,
                        this.position.z
                    ]);
                }
            } else {
                this.sceneObject.setPositionArray([
                    this.position.x,
                    this.position.y,
                    this.position.z
                ]);
            }
        }
    }

    /**
     * Set the light position.
     * @param {*} x
     * @param {*} y
     * @param {*} z
     */
    setPosition(x, y, z) {

        this.position.x = x;
        this.position.y = y;
        this.position.z = z;

        this.updateSceneObjectPosition();
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
        this.setPosition(x, y, z);
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

    /**
     * Sets the render positon of the light.
     *
     * If used, the light will display from this location rather than the
     * light position. E.g,if we have a sunlight and want the icon to appear in the
     * scene somewhere convenient.
     *
     * @param {*} x
     * @param {*} y
     * @param {*} z
     */
    setRenderPosition(x, y, z) {
        this.renderPosition.x = x;
        this.renderPosition.y = y;
        this.renderPosition.z = z;

        this.updateSceneObjectPosition();
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

        this.updateSceneObjectPosition();

    }

}
