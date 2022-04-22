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

        this.renderPosition = new Vector3();

        this.position = new Vector3();
        this.direction = new Vector3();

        this.ambient = new Color4();
        this.diffuse = new Color4();
        this.specular = new Color4();
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
    }

}
