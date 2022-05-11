const Shader = require("./Shader");

/**
 * AppRegistry.js
 *
 * Contains loaded assets, GL Textures, models, shaders, etc.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */
module.exports = class AppRegistry{

    constructor() {
        this.gl = null;
        this.camera = null;
        this.keyboardHandler = null;

        this.models = {};
        this.textureImages = {};
        this.heightmaps = {};

        this.glTextures = {};
        this.shaders = {};
        this.sceneObjects = {};
        this.nodePaths = {};
        this.sky = null;

        this.lights = {};

        this.fogSettings = {
            color: [0.8, 0.9, 1.0, 1.0],
            near: 1000,
            far: 5000.0,
        };

        /**
         * Pairs items as {sceneObject: object, shader: shader}.
         */
        this.renderQueue = {
            ortho: {},
            static: {},
            dynamic: {},
            nonDepth: {},
        };

        this.lastUpdateTime = 0;


        this.assetFlags = {
            modelsLoaded: false,
            texturesLoaded: false
        };

        this.onAssetsLoaded = null;

        this.options = {
            isRenderModeLines: false
        };
    }

    /**
     * Sets the gl context from the canvas.
     */
    setGlContext(gl) {
        this.gl = gl;
    }

    /**
     * Called every time an asset is loaded. If all assets are loaded we then
     * call the assetsLoadedCallback.
     */
    assetsLoaded() {

        if (!this.onAssetsLoaded) {
            throw "appRegistry: Assets Loaded Callback must be set before loading assets.";
        }

        if (this.assetFlags.modelsLoaded && this.assetFlags.texturesLoaded) {

            try {
                this.onAssetsLoaded();
            } catch (e) {
                console.error(e);
            }
        }
    }


    /**
     * Loads any expected texture assets from files.
     * @param {*} textures
     */
    registerTextures(textures) {
        let countTexturesLoaded = 0;
        const totalEntries = Object.keys(textures).length;

        const self = this;

        for ( const [textureName, filePath] of Object.entries(textures) ) {
            this.textureImages[textureName] = new Image();
            this.textureImages[textureName].onload = function(){
                countTexturesLoaded += 1;
                self.assetFlags.texturesLoaded = (countTexturesLoaded == totalEntries);

                self.assetsLoaded();
            }
            this.textureImages[textureName].src = filePath;
        }
    }


    /**
     * Converts any registered textures into GL_TEXTURE buffers.
     */
    createGlTextures() {
        for (const [textureKey, textureImage] of Object.entries(this.textureImages)) {
            const glTexture = this.gl.createTexture();

            this.gl.bindTexture(this.gl.TEXTURE_2D, glTexture);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

            this.gl.bindTexture(this.gl.TEXTURE_2D, glTexture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureImage);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
            this.gl.bindTexture(this.gl.TEXTURE_2D, null);

            this.glTextures[textureKey] = glTexture;
        }
    }




    /**
     * Register a shader.
     *
     * Shaders are loaded from <script> tags.
     *
     * @param {*} keyName Variable name of shader (e.g appRegistry.shaders.{keyName})
     * @param {*} shaderName Name of shader - e.g if <script id="myshader-vs">, shaderName would be "myshader".
     */
     registerShader(keyName, shaderName) {

        if (!this.gl) {
            throw "appRegistry: glContext must be set before shader can be loaded.";
        }

        if (!shaderName) {
            shaderName = keyName;
        }

        this.shaders[keyName] = new Shader(this.gl, shaderName);
    }

    /**
     * Shortcut method to load a list of shaders as {shaderKey: "shaderName"}.
     * @param {*} shaders
     */
    registerShaders(shaders) {
        for ( const [keyName, shaderName] of Object.entries(shaders) ) {
            this.registerShader(keyName, shaderName);
        }
    }




    /**
     * Registers a sceneObject.
     *
     * @param {*} sceneObject The sceneObject.
     * @param {*} shaderObject The shader Object to render with.
     * @param {*} renderContext Ortho, static, or timed.
     */
    registerSceneObject(name, sceneObject, shaderName, renderContext) {

        this.sceneObjects[name] = sceneObject;
        sceneObject.setName(name);

        this.renderQueue[renderContext][name] = {
            shaderObject: this.shaders[shaderName],
            sceneObject: sceneObject,
        };
    }


    /**
     * Renders the specified object render queue.
     * @param {*} renderContext ortho, static, or timed.
     * @param {*} matrices Matrices, as prepared in index->drawScene.
     * @param {*} delta If renderContext is timed, this is the delta between frames.
     */
    render(renderContext, delta) {

        if (this.renderQueue[renderContext] !== undefined) {

            if (renderContext === 'nonDepth') {
                this.gl.disable(this.gl.DEPTH_TEST);
            }

            for (const [objectName, objectWithShader] of Object.entries(this.renderQueue[renderContext])) {

                if (objectWithShader.sceneObject.enabled && objectWithShader.sceneObject.parentSceneObject === null) {
                    objectWithShader.shaderObject.use();
                    objectWithShader.shaderObject.setLightUniforms(this.lights.light0);
                    objectWithShader.shaderObject.setFogUniforms(this.fogSettings);

                    objectWithShader.sceneObject.render(objectWithShader.shaderObject, this.camera);
                }
            }

            if (renderContext === 'nonDepth') {
                this.gl.enable(this.gl.DEPTH_TEST);
            }
        }

    }

}
