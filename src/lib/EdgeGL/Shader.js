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

        this.vertexShader = null;
        this.fragmentShader = null;

        this.shaderProgram = null;

        this.vertexPositionAttribute = null;
        this.textureCoordAttribute = null;
        this.vertexNormalAttribute = null;
        this.vertexColorAttribute = null;

        // this.light0DirectionAttribute = null;
        // this.light0AmbientAttribute = null;
        // this.light0DiffuseAttribute = null;
        // this.light0SpecularAttribute = null;

        this.hasVertexColorAttribute = false;
        this.hasVertexNormalAttribute = false;
        this.hasTextureCoordAttribute = false;

        //this.hasLight0Attribute = false;

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

        if (vertexShaderSource.indexOf("aVertexColor") > 0) {
            this.hasVertexColorAttribute = true;
        }

        if (vertexShaderSource.indexOf("aTextureCoord") > 0) {
            this.hasTextureCoordAttribute = true;
        }

        if (vertexShaderSource.indexOf("aTextureCoord") > 0) {
            this.hasVertexNormalAttribute = true;
        }

        if (vertexShaderSource.indexOf("aLight0Direction") > 0) {
            this.hasLight0Attribute = true;
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
            console.error("Unable to initialize the shader program.");
        }

        this.gl.useProgram(this.shaderProgram);

        // Combine default attributes.
        this.vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
        this.gl.enableVertexAttribArray(this.vertexPositionAttribute);

        if (this.hasVertexColorAttribute) {
            this.vertexColorAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexColor");
            this.gl.enableVertexAttribArray(this.vertexColorAttribute);
        }

        if (this.hasTextureCoordAttribute) {
            this.textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
            this.gl.enableVertexAttribArray(this.textureCoordAttribute);
        }

        if (this.hasVertexNormalAttribute) {
            this.vertexNormalAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexNormal");
            this.gl.enableVertexAttribArray(this.vertexNormalAttribute);
        }

        // if (this.hasLight0Attribute) {
        //     this.light0DirectionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aLight0Direction");
        //     this.gl.enableVertexAttribArray(this.light0DirectionAttribute);

        //     this.light0AmbientAttribute = this.gl.getAttribLocation(this.shaderProgram, "aLight0Ambient");
        //     this.gl.enableVertexAttribArray(this.light0AmbientAttribute);

        //     this.light0DiffuseAttribute = this.gl.getAttribLocation(this.shaderProgram, "aLight0Diffuse");
        //     this.gl.enableVertexAttribArray(this.light0DiffuseAttribute);

        //     this.light0SpecularAttribute = this.gl.getAttribLocation(this.shaderProgram, "aLight0Specular");
        //     this.gl.enableVertexAttribArray(this.light0SpecularAttribute);
        // }
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
    setLightUniforms(lightObject) {

        const i = lightObject.lightIndex;

        let light0Direction = this.gl.getUniformLocation(this.shaderProgram, `uLight${i}Direction`);
        let light0Ambient = this.gl.getUniformLocation(this.shaderProgram, `uLight${i}Ambient`);
        let light0Diffuse = this.gl.getUniformLocation(this.shaderProgram, `uLight${i}Diffuse`);
        let light0Specular = this.gl.getUniformLocation(this.shaderProgram, `uLight${i}Specular`);

        this.gl.uniform3fv(light0Direction, lightObject.position.flatten());
        this.gl.uniform3fv(light0Ambient, lightObject.ambient.flatten());
        this.gl.uniform3fv(light0Diffuse, lightObject.diffuse.flatten());
        this.gl.uniform3fv(light0Specular, lightObject.specular.flatten());
    }


    /**
     * Sets the perspective matrix, and model-view matrix on the shader program.
     * @param {*} perspectiveMatrix The perspective matrix.
     * @param {*} mvMatrix The model-view matrix.
     */
    setMatrixUniforms(perspectiveMatrix, mvMatrix) {
        let pUniform = this.gl.getUniformLocation(this.shaderProgram, "uPMatrix");
        let mvUniform = this.gl.getUniformLocation(this.shaderProgram, "uMVMatrix");
        let nUniform = this.gl.getUniformLocation(this.shaderProgram, "uNormalMatrix");

        let normalMatrix = mvMatrix.inverse();
        normalMatrix = normalMatrix.transpose();

        this.gl.uniformMatrix4fv(pUniform, false, new Float32Array(perspectiveMatrix.flatten()));
        this.gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));
        this.gl.uniformMatrix4fv(nUniform, false, new Float32Array(normalMatrix.flatten()));
    }

    /**
     * Enables shader attributes.
     */
    enableAttributes() {
        this.gl.enableVertexAttribArray(this.vertexPositionAttribute);

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
        this.gl.disableVertexAttribArray(this.vertexPositionAttribute);
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
                theSource += currentChild.textContent;
            }

            currentChild = currentChild.nextSibling;
        }

        return theSource;
    }
}

