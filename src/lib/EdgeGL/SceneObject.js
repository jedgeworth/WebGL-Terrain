/**
 * SceneObject.js
 *
 * Represents an object of any kind in the scene, from a simple line, to entire meshes loaded from models.
 * Essentially it pairs up textures, buffers, shaders, the object's position and rotation in the scene.
 *
 * TODO:
 *
 * - Generate bounding box
 * - Allow for picking (when we have more complex scene management in place)
 * - Allow multitexturing (provide an array of textures with the keys as the GL_TEXTURE offset)
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

 const Sylvester = require('sylvester-es6/src/Sylvester');

 module.exports = class SceneObject {

    /**
     * Constructor.
     * @param {*} glContext gl context object.
     */
    constructor(glContext) {
        this.gl = glContext;

        this.name = '';

        this.verticesBuffer = null;
        this.textureCoordBuffer = null;
        this.normalBuffer = null;
        this.colorBuffer = null;
        this.indexBuffer = null;
        this.numItems = 0;

        this.glTexture = null;

        this.position = new Sylvester.Vector([0.0, 0.0, 0.0]);
        this.pitch = 0.0;
        this.yaw = 0.0;
        this.roll = 0.0;

        this.flipYaw = 0.0;

        this.renderMode = this.gl.TRIANGLES;
        this.originalRenderMode = this.renderMode;
    }

    /**
     * Sets the name of the SceneObject.
     *
     * Barely used anywhere - so far helpful for stepping through breakpoints..
     *
     * @param {*} name
     */
    setName(name) {
        this.name = name;
    }

    /**
     * Set the vertex buffer data.
     * @param {*} vertices Array of vertices as [v1.x, v1.y, v1.z, v2.x, v2.y, v2.z,...]
     */
    setVertices(vertices) {
        this.verticesBuffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.verticesBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);

        this.numItems = vertices.length / 3;
    }

    /**
     * Set the normals.
     * @param {*} normals Array of normals as [n1.x, n1.y, n1.z, n2.x, n2.y, n2.z, ...]
     */
    setNormals(normals) {
        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);
    }

    /**
     * Set the texture coordinates.
     *
     * @param {*} texCoords Array of coords as [t1.x, t1.y, t2.x, t2.y, ...]
     */
    setTexCoords(texCoords) {
        this.textureCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);
    }

    /**
     * Set the colors.
     *
     * @param {*} colors Array of colors as [c1.r, c1.g, c1.b, c2.r, c2.g, c2.b, ...]
     */
    setColors(colors) {
        this.colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colors), this.gl.STATIC_DRAW);
    }

    /**
     * Set indices, if rendering with an index buffer.
     * @param {*} indices Array of indices as [i1, i2, ...]
     */
    setIndices(indices) {
        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this.gl.STATIC_DRAW);

        // If indices are set, we always use its length as the numItems.
        this.numItems = indices.length;
    }

    /**
     * Set the texture object.
     * @param {*} texture GL_TEXTURE_2D object.
     */
    setTexture(texture) {
        this.glTexture = texture;
    }

    /**
     * Sets the rendering mode to use in glDrawElements/glDrawArrays.
     * @param {*} renderMode GL render mode (defaults to GL_TRIANGLES).
     */
    setRenderMode(renderMode) {
        this.renderMode = renderMode;
        this.originalRenderMode = this.renderMode;
    }

    /**
     * Sets a render mode. Used for debugging.
     * @param {*} newRenderMode New render mode to set (probably gl.LINES)
     */
    setRenderModeOverride(newRenderMode) {
        this.renderMode = newRenderMode;
    }

    /**
     * Disables the previously set render mode override.
     */
    disableRenderModeOverride() {
        this.renderMode = this.originalRenderMode;
    }

    /**
     * Sets all data from an EdgeGL/primitive instance.
     * @param {*} primitive Instance of a primitive.
     */
    setPrimitive(primitive) {
        this.setVertices(primitive.vertices);

        if (primitive.normals) {
            this.setNormals(primitive.normals);
        }

        if (primitive.colors) {
            this.setColors(primitive.colors);
        }

        if (primitive.texCoords) {
            this.setTexCoords(primitive.texCoords);
        }

        if (primitive.indices) {
            this.setIndices(primitive.indices);
        }

        if (primitive.renderMode) {
            this.setRenderMode(primitive.renderMode);
        }
    }

    /**
     * Call this to flip the SceneObject upside-down.
     */
    setFlipYaw() {
        this.flipYaw = 180.0;
    }

    /**
     * Called each frame during the game loop to render the scene object.
     * @param {*} shaderProgram EdgeGL/Shader object to use for rendering.
     */
    render(shaderProgram, matrices) {

        matrices.mvPushMatrix();

        matrices.mvTranslate(this.position.elements);
        matrices.mvRotate(this.yaw + this.flipYaw, [0, 1, 0]);

        shaderProgram.setMatrixUniforms(matrices.perspectiveMatrix, matrices.mvMatrix);
        shaderProgram.enableAttributes();

        // Vertices
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.verticesBuffer);
        this.gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);

        // Normals
        if (this.normalBuffer) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
            this.gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, 3, this.gl.FLOAT, false, 0, 0);
        }

        // Colors
        if (this.colorBuffer) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
            this.gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, 3, this.gl.FLOAT, false, 0, 0);
        }

        // Textures
        if (this.glTexture && this.textureCoordBuffer) {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.glTexture);
            this.gl.uniform1i(this.gl.getUniformLocation(shaderProgram.shaderProgram, "u_Sampler"), 0);

            this.gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
            this.gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);
        } else {
            // This is hopefully catered for by shaderProgram.enableAttributes();
            //this.gl.disableVertexAttribArray(shaderProgram.textureCoordAttribute);
        }

        if (this.indexBuffer) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            this.gl.drawElements(this.renderMode, this.numItems, this.gl.UNSIGNED_SHORT, 0);
        } else if (this.verticesBuffer) {
            this.gl.drawArrays(this.renderMode, 0, this.numItems);
        }

        matrices.mvPopMatrix();

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        shaderProgram.disableAttributes();
    }

    /**
     * Stringifies debug information for the object instance.
     */
    debug() {
        let text = '';
        text += `${this.position.inspect()}<br>`;
        text += `${this.yaw}`;

        return text;
    }
}
