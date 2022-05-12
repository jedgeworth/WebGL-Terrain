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
    setLightUniforms(lightObject, enabled) {

        let useLighting = this.gl.getUniformLocation(this.shaderProgram, 'u_UseLighting');

        if (enabled) {
            const i = lightObject.lightIndex;

            let light0Direction = this.gl.getUniformLocation(this.shaderProgram, `u_Light${i}Position`);
            let light0Ambient = this.gl.getUniformLocation(this.shaderProgram, `u_Light${i}Ambient`);
            let light0Diffuse = this.gl.getUniformLocation(this.shaderProgram, `u_Light${i}Diffuse`);
            let light0Specular = this.gl.getUniformLocation(this.shaderProgram, `u_Light${i}Specular`);
            let light0Shininess = this.gl.getUniformLocation(this.shaderProgram, `u_Shininess`);


            this.gl.uniform1i(useLighting, 1);
            this.gl.uniform3fv(light0Direction, lightObject.position.flatten());
            this.gl.uniform3fv(light0Ambient, lightObject.ambient.flatten());
            this.gl.uniform3fv(light0Diffuse, lightObject.diffuse.flatten());
            this.gl.uniform3fv(light0Specular, lightObject.specular.flatten());
            this.gl.uniform1f(light0Shininess, lightObject.shininess);
        } else {
            this.gl.uniform1i(useLighting, 0);
        }

    }

    /**
     * Sets fog settings.
     */
    setFogUniforms(fogSettings, enabled) {

        let useFog = this.gl.getUniformLocation(this.shaderProgram, 'u_UseFog');

        if (enabled) {
            let fogColorUniform = this.gl.getUniformLocation(this.shaderProgram, "u_FogColor");
            let fogNearUniform = this.gl.getUniformLocation(this.shaderProgram, "u_FogNear");
            let fogFarUniform = this.gl.getUniformLocation(this.shaderProgram, "u_FogFar");

            this.gl.uniform1i(useFog, 1);
            this.gl.uniform4fv(fogColorUniform, fogSettings.color);
            this.gl.uniform1f(fogNearUniform, fogSettings.near);
            this.gl.uniform1f(fogFarUniform, fogSettings.far);
        } else {
            this.gl.uniform1i(useFog, 0);
        }
    }


    /**
     * Sets the perspective matrix, and model-view matrix on the shader program.
     * @param {*} perspectiveMatrix The perspective matrix.
     * @param {*} mvMatrix The model-view matrix.
     */
    setMatrixUniforms(perspectiveMatrix, mvMatrix) {

        let projectionMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "u_ProjectionMatrix");
        let modelViewMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "u_ModelViewMatrix");
        let normalMatrixUniform = this.gl.getUniformLocation(this.shaderProgram, "u_NormalMatrix");

        let normalMatrix = mvMatrix.inverse();
        normalMatrix = normalMatrix.transpose();

        this.gl.uniformMatrix4fv(projectionMatrixUniform, false, new Float32Array(perspectiveMatrix.flatten()));
        this.gl.uniformMatrix4fv(modelViewMatrixUniform, false, new Float32Array(mvMatrix.flatten()));
        this.gl.uniformMatrix4fv(normalMatrixUniform, false, new Float32Array(normalMatrix.flatten()));
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
}

