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
 const Texture = require('./Texture');

 module.exports = class SceneObject {

    /**
     * Constructor.
     * @param {*} glContext gl context object.
     */
    constructor(glContext) {
        this.gl = glContext;

        this.name = '';

        this.parentSceneObject = null;
        this.sceneObjects = [];

        this.enabled = true;

        this.shaderProgram = null;
        this.useLighting = true;
        this.useFog = true;

        this.material = {
            shininess: 100.0,

        };

        this.verticesBuffer = null;
        this.textureCoordBuffer = null;
        this.normalBuffer = null;
        this.colorBuffer = null;
        this.indexBuffer = null;
        this.numItems = 0;

        this.glTexture = null;
        this.glTextureNormalMap = null;
        this.texture0 = null;

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

    setEnabled(isEnabled) {
        this.enabled = isEnabled;
    }

    setPosition(x, y, z) {
        this.position.setElements([x, y ,z]);
    }

    setPositionArray(position) {
        this.position.setElements(position);
    }

    addSceneObject(sceneObject) {
        sceneObject.parentSceneObject = this;
        this.sceneObjects.push(sceneObject);
    }

    setShaderProgram(shaderProgram) {
        this.shaderProgram = shaderProgram;
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

        if (texture === undefined) {
            throw "SceneObject: Trying to set a texture that is undefined.";
        }

        this.texture0 = texture;

        // this.glTexture = texture;

        // if (normalMap !== undefined) {
        //     this.glTextureNormalMap = normalMap;
        // }
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


    checkBuffers(shaderProgram) {

        if (!shaderProgram) {
            console.log(`Trying to check buffers when sceneObject ${this.name} doesn't have a shader attached.`);
            return;
        }
        if (shaderProgram.hasVertexPositionAttribute) {
            if (!this.verticesBuffer) {
                console.log(`Shader for ${this.name} has a vertex attribute but will not be bound.`);
            }
        }

        if (shaderProgram.hasVertexColorAttribute) {
            if (!this.colorBuffer) {
                console.log(`Shader for ${this.name} has a color attribute but will not be bound.`);
            }
        }

        if (shaderProgram.hasVertexNormalAttribute) {
            if (!this.normalBuffer) {
                console.log(`Shader for ${this.name} has a normal attribute but will not be bound.`);
            }
        }

        if (shaderProgram.hasTextureCoordAttribute) {
            if (!this.textureCoordBuffer) {
                console.log(`Shader for ${this.name} has a texture coord attribute but will not be bound.`);
            }
        }
    }

    /**
     * Call this to flip the SceneObject upside-down.
     */
    setFlipYaw() {
        this.flipYaw = 180.0;
    }

    /**
     *
     * Called each frame during the game loop to render the scene object.
     * @param {*} shaderProgram EdgeGL/Shader object to use for rendering.
     *
     * @todo sceneObject should not need to know of the entire appRegistry. Find
     * a better way to pass lighting and fog settings in.
     */
    render(appRegistry) {

        appRegistry.camera.matrices.mvPushMatrix();

        appRegistry.camera.matrices.mvTranslate(this.position.elements);
        appRegistry.camera.matrices.mvRotate(this.yaw + this.flipYaw, [0, 1, 0]);

        this.shaderProgram.use();
        this.shaderProgram.setLightUniforms(appRegistry.lights.light0, this.useLighting);
        this.shaderProgram.setFogUniforms(appRegistry.fogSettings, this.useFog);

        this.shaderProgram.setMatrixUniforms(
            appRegistry.camera.matrices.perspectiveMatrix,
            appRegistry.camera.matrices.mvMatrix
        );

        this.shaderProgram.enableAttributes();

        // Vertices
        if (this.verticesBuffer && this.shaderProgram.hasVertexPositionAttribute) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.verticesBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, 3, this.gl.FLOAT, false, 0, 0);
        }

        // Normals
        if (this.normalBuffer && this.shaderProgram.hasVertexNormalAttribute) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, 3, this.gl.FLOAT, false, 0, 0);
        }

        // Colors
        if (this.colorBuffer && this.shaderProgram.hasVertexColorAttribute) {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.vertexColorAttribute, 3, this.gl.FLOAT, false, 0, 0);
        }

        // Textures
        if (this.texture0 && this.shaderProgram.hasTextureCoordAttribute && this.textureCoordBuffer) {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture0.glTexture);
            this.gl.uniform1i(this.gl.getUniformLocation(this.shaderProgram.shaderProgram, "u_Texture0"), 0);

            if (this.texture0.glTextureNormal) {
                this.gl.activeTexture(this.gl.TEXTURE1);
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture0.glTextureNormal);
                this.gl.uniform1i(this.gl.getUniformLocation(this.shaderProgram.shaderProgram, "u_TextureNormal0"), 1);
                this.gl.uniform1i(this.gl.getUniformLocation(this.shaderProgram.shaderProgram, "u_UseNormalMapping"), 1);
            } else {
                this.gl.uniform1i(this.gl.getUniformLocation(this.shaderProgram.shaderProgram, "u_UseNormalMapping"), 0);
            }

            this.gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
            this.gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);
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

        // Render sub-objects.
        for (let i = 0; i < this.sceneObjects.length; i += 1) {
            this.sceneObjects[i].render(appRegistry);
        }

        appRegistry.camera.matrices.mvPopMatrix();

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        this.shaderProgram.disableAttributes();
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
