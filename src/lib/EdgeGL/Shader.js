/**
 * Shader.js
 *
 * Loads a vertex and fragment shader pair.
 *
 * Currently, shaders are defined in <script> tags in the html and loaded
 * by referring to their name.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */
module.exports = class Shader {

    /**
     * constructor.
     *
     * @param {*} glContext gl context object.
     * @param {*} scriptElementId name of shader. If script id is "base-vs" and "base-fs", this would be "base".
     */
    constructor(glContext, scriptElementId) {
        this.gl = glContext;

        this.name = scriptElementId;
        this.vertexShader = null;
        this.fragmentShader = null;

        this.shaderProgram = null;

        this.vertexPositionAttribute = null;
        this.textureCoordAttribute = null;
        this.vertexNormalAttribute = null;
        this.vertexColorAttribute = null;

        this.hasVertexPositionAttribute = false;
        this.hasVertexColorAttribute = false;
        this.hasVertexNormalAttribute = false;
        this.hasTextureCoordAttribute = false;

        this.variableLog = [];

        this.compile(scriptElementId);
    }

    /**
     * Compiles the shader program from vertex and fragment sources.
     *
     * Sources are defined as script tags:
     *
     * <script id="base-vs" type="x-shader/x-vertex">
     * <script id="base-fs" type="x-shader/x-fragment">
     *
     * To load the above sources, you would instantiate a shader object
     * with scriptElementId of "base".
     * @param {*} scriptElementId Name of vs/fs sources.
     */
    compile(scriptElementId) {
        // Vertex shader
        let vertexShaderSource = this.readSourceFromElement(scriptElementId + "-vs");
        this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);

        if (vertexShaderSource.indexOf("a_VertexPosition") > 0) {
            this.hasVertexPositionAttribute = true;
        }

        if (vertexShaderSource.indexOf("a_VertexColor") > 0) {
            this.hasVertexColorAttribute = true;
        }

        if (vertexShaderSource.indexOf("a_TextureCoord") > 0) {
            this.hasTextureCoordAttribute = true;
        }

        if (vertexShaderSource.indexOf("a_VertexNormal") > 0) {
            this.hasVertexNormalAttribute = true;
        }

        this.gl.shaderSource(this.vertexShader, vertexShaderSource);
        this.gl.compileShader(this.vertexShader);

        if (!this.gl.getShaderParameter(this.vertexShader, this.gl.COMPILE_STATUS)) {
            console.error("An error occurred compiling the shaders: " + this.gl.getShaderInfoLog(this.vertexShader));
            return null;
        }

        // Fragment shader
        let fragmentShaderSource = this.readSourceFromElement(scriptElementId + "-fs");
        this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

        this.gl.shaderSource(this.fragmentShader, fragmentShaderSource);
        this.gl.compileShader(this.fragmentShader);

        if (!this.gl.getShaderParameter(this.fragmentShader, this.gl.COMPILE_STATUS)) {
            console.error("An error occurred compiling the shaders: " + this.gl.getShaderInfoLog(this.fragmentShader));
            return null;
        }

        // Shader program
        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, this.vertexShader);
        this.gl.attachShader(this.shaderProgram, this.fragmentShader);
        this.gl.linkProgram(this.shaderProgram);

        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            console.error("Unable to initialize the shader program: " + this.gl.getProgramInfoLog(this.shaderProgram));
        }

        this.gl.useProgram(this.shaderProgram);

        // Combine default attributes.
        if (this.hasVertexPositionAttribute) {
            this.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "a_VertexPosition");
        }

        if (this.hasVertexColorAttribute) {
            this.vertexColorAttribute = this.gl.getAttribLocation(this.shaderProgram, "a_VertexColor");
        }

        if (this.hasTextureCoordAttribute) {
            this.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "a_TextureCoord");
        }

        if (this.hasVertexNormalAttribute) {
            this.vertexNormalAttribute = this.gl.getAttribLocation(this.shaderProgram, "a_VertexNormal");
        }
    }

    /**
     * Binds the shader program to the gl context.
     */
    use() {
        this.gl.useProgram(this.shaderProgram);

        this.variableLog = [];
    }

    /**
     * Unbinds (all) shader programs.
     */
    stop() {
        this.gl.useProgram(null);
    }

    /**
     * Sets lighting from a Light().
     * @param {*} lightObject Instantiated Light() object.
     */
    setLightUniforms(lights, lightSettings, enabled) {

        if (enabled) {

            this.setUniform1i('u_UseLighting', 1);
            this.setUniform1i('u_UseNormalMap', lightSettings.useNormalMapping);
            this.setUniform1i('u_CorrectD3d', lightSettings.correctD3d);
            this.setUniform1f('u_Shininess', lightSettings.shininess);

            Object.entries(lights).forEach(([key, lightObject]) => {
                const i = lightObject.lightIndex;

                this.setUniform3fv(`u_Lights[${i}].position`, lightObject.getPosition().flatten());
                this.setUniform3fv(`u_Lights[${i}].direction`, lightObject.getDirection().flatten());
                this.setUniform3fv(`u_Lights[${i}].ambient`, lightObject.ambient.flatten());
                this.setUniform3fv(`u_Lights[${i}].diffuse`, lightObject.diffuse.flatten());
                this.setUniform3fv(`u_Lights[${i}].specular`, lightObject.specular.flatten());
                this.setUniform1i(`u_Lights[${i}].type`, lightObject.type);
            });
        } else {
            this.setUniform1i('u_UseLighting', 0);
        }
    }

    /**
     * Sets fog settings.
     */
    setFogUniforms(fogSettings, enabled) {

        if (enabled) {
            this.setUniform1i('u_UseFog', 1);
            this.setUniform4fv('u_FogColor', fogSettings.color);
            this.setUniform1f('u_FogNear', fogSettings.near);
            this.setUniform1f('u_FogFar', fogSettings.far);
        } else {
            this.setUniform1i('u_UseFog', 0);
        }
    }


    /**
     * Sets the perspective matrix, and model-view matrix on the shader program.
     * @param {*} perspectiveMatrix The perspective matrix.
     * @param {*} mvMatrix The model-view matrix.
     */
    setCameraUniforms(camera) {

        const normalMatrix = camera.matrices.mvMatrix.inverse().transpose();

        this.setUniformMatrix4fv('u_ProjectionMatrix', new Float32Array(camera.matrices.perspectiveMatrix.flatten()));
        this.setUniformMatrix4fv('u_ModelViewMatrix', new Float32Array(camera.matrices.mvMatrix.flatten()));
        this.setUniformMatrix3fv('u_NormalMatrix', new Float32Array(normalMatrix.flatten()));
        this.setUniform3fv(`u_CameraWorldPosition`, camera.getPosition());
    }

    /**
     * Enables shader attributes.
     */
    enableAttributes() {
        if (this.hasVertexPositionAttribute) {
            this.gl.enableVertexAttribArray(this.vertexPositionAttribute);
        }

        if (this.hasVertexColorAttribute) {
            this.gl.enableVertexAttribArray(this.vertexColorAttribute);
        }

        if (this.hasTextureCoordAttribute) {
            this.gl.enableVertexAttribArray(this.textureCoordAttribute);
        }

        if (this.hasVertexNormalAttribute) {
            this.gl.enableVertexAttribArray(this.vertexNormalAttribute);
        }
    }

    /**
     * Disables shader attributes.
     */
    disableAttributes() {
        if (this.hasVertexPositionAttribute) {
            this.gl.disableVertexAttribArray(this.vertexPositionAttribute);
        }

        if (this.hasVertexColorAttribute) {
            this.gl.disableVertexAttribArray(this.vertexColorAttribute);
        }

        if (this.hasTextureCoordAttribute) {
            this.gl.disableVertexAttribArray(this.textureCoordAttribute);
        }

        if (this.hasVertexNormalAttribute) {
            this.gl.disableVertexAttribArray(this.vertexNormalAttribute);
        }
    }

    /**
     * Reads the content of shader scripts:
     * <script id="base-vs" type="x-shader/x-vertex">
     * <script id="base-fs" type="x-shader/x-fragment">
     *
     * @param {*} id
     */
    readSourceFromElement(id) {
        let shaderScript = document.getElementById(id);

        if (!shaderScript) {
            return null;
        }

        let theSource = "";
        let currentChild = shaderScript.firstChild;

        while(currentChild) {
            if (currentChild.nodeType == 3) {
                theSource += currentChild.textContent.trim();
            }

            currentChild = currentChild.nextSibling;
        }

        return theSource;
    }

    /**
     * Shortcut method to set a uniform1i.
     * @param {*} name Uniform name.
     * @param {*} value Value to set.
     */
     setUniform1i(name, value) {
        const uniform = this.gl.getUniformLocation(this.shaderProgram, name);

        if (uniform) {
            this.gl.uniform1i(uniform, value);

            this.variableLog.push(`Setting ${name} to ${value}`);
        } else {
            this.variableLog.push(`Did not set ${name}`);
        }
    }

    /**
     * Shortcut method to set a uniform1f.
     * @param {*} name Uniform name.
     * @param {*} value Value to set.
     */
    setUniform1f(name, value) {
        const uniform = this.gl.getUniformLocation(this.shaderProgram, name);

        if (uniform) {
            this.gl.uniform1f(uniform, value);

            this.variableLog.push(`Setting ${name} to ${value}`);
        } else {
            this.variableLog.push(`Did not set ${name}`);
        }
    }

    /**
     * Shortcut method to set a uniform3fv.
     * @param {*} name Uniform name.
     * @param {*} value Value to set.
     */
    setUniform3fv(name, value) {
        const uniform = this.gl.getUniformLocation(this.shaderProgram, name);

        if (uniform) {
            this.gl.uniform3fv(uniform, value);

            this.variableLog.push(`Setting ${name} to ${value}`);
        } else {
            this.variableLog.push(`Did not set ${name}`);
        }
    }

    /**
     * Shortcut method to set a uniform4fv.
     * @param {*} name Uniform name.
     * @param {*} value Value to set.
     */
    setUniform4fv(name, value) {
        const uniform = this.gl.getUniformLocation(this.shaderProgram, name);

        if (uniform) {
            this.gl.uniform4fv(uniform, value);

            this.variableLog.push(`Setting ${name} to ${value}`);
        } else {
            this.variableLog.push(`Did not set ${name}`);
        }
    }

    /**
     * Shortcut method to set a uniformMatrix4fv.
     * @param {*} name Uniform name.
     * @param {*} value Value to set.
     */
     setUniformMatrix3fv(name, value) {
        const uniform = this.gl.getUniformLocation(this.shaderProgram, name);

        if (uniform) {
            this.gl.uniformMatrix3fv(uniform, false, value);

            this.variableLog.push(`Setting ${name} to ${value}`);
        } else {
            this.variableLog.push(`Did not set ${name}`);
        }
    }

    /**
     * Shortcut method to set a uniformMatrix4fv.
     * @param {*} name Uniform name.
     * @param {*} value Value to set.
     */
    setUniformMatrix4fv(name, value) {
        const uniform = this.gl.getUniformLocation(this.shaderProgram, name);

        if (uniform) {
            this.gl.uniformMatrix4fv(uniform, false, value);

            this.variableLog.push(`Setting ${name} to ${value}`);
        } else {
            this.variableLog.push(`Did not set ${name}`);
        }
    }
}

