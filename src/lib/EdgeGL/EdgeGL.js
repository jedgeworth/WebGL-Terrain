const Shader = require("./Shader");

/**
 * AppRegistry.js
 *
 * Contains loaded assets, GL Textures, models, shaders, etc.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

 const Texture = require('./Texture');
module.exports = class EdgeGL{

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

        this.lightSettings = {
            useNormalMapping: 1,
            correctD3d: 1,
            shininess: 1.0 // This is a material property and will be moved to a material object.
        };

        this.textures = {};
        this.frameBuffers = {};

        this.fogSettings = {
            color: [0.8, 0.9, 1.0, 1.0],
            near: 1000,
            far: 5000.0,
        };

        /**
         * Pairs items as {sceneObject: object, shader: shader}.
         */
        this.renderQueue = {
            default: {
                ortho: {},
                static: {},
                dynamic: {},
                nonDepth: {},
            },
        };

        this.lastUpdateTime = 0;


        this.assetFlags = {
            modelsLoaded: false,
            texturesLoaded: false
        };

        this.prepareAssets = null;
        this.prepareObjects = null;

        this.options = {
            isRenderModeLines: false
        };
    }


    /**
     * Binds EdgeGL to an element by id.
     * @param {*} canvasId Id of the target canvas element.
     * @returns
     */
    initWithCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);

        if (canvas === undefined || canvas === null) {
            throw new Error("Could not find the canvas.");
            return false;
        }

        this.gl = null;

        try {
            this.gl = canvas.getContext("webgl");
        } catch(e) {
            console.error(e);
            return false;
        }

        if (!this.gl) {
            console.error("Unable to initialize WebGL.");
            return false;
        }

        this.gl.getExtension("OES_texture_float");
        this.gl.getExtension("OES_texture_float_linear");

        //this.gl.clearColor(100/255, 149/255, 237/255, 1.0); // Cornflower blue
        this.gl.clearColor(0.8, 0.9, 1.0, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LEQUAL);

        //this.gl.enable(gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);
        this.gl.frontFace(this.gl.CW);

        return true;
    }


    /**
     * Called to begin loading assets.
     *
     */
    start() {

        if (this.prepareAssets === null || this.prepareObjects === null) {
            throw "prepareAssets and prepareObjects callbacks must be set prior to calling start().";
        }

        this.prepareAssets();
    }




    /**
     * Called every time an asset is loaded. If all assets are loaded we then
     * call the assetLoadedCallback.
     */
    assetLoaded() {

        if (!this.didLoadAssets) {
            throw "appRegistry: Assets Loaded Callback must be set before loading assets.";
        }

        if (this.assetFlags.modelsLoaded && this.assetFlags.texturesLoaded) {

            try {
                this.didLoadAssets();
            } catch (e) {
                console.error(e);
            }
        }
    }


    /**
     * Once all assets are loaded (via prepareAssets), this is called to prepare
     * stage 2 resources.
     */
    didLoadAssets() {

        this.createGlTextures();
        this.prepareObjects(this.gl);

        this,this.canStartDrawing();
    }


    /**
     *
     */
    canStartDrawing() {
        requestAnimationFrame(() => this.tick());
    }


    /**
     *
     * @param {*} camera
     */
    setCamera(camera) {
        this.camera = camera;
    }

    /**
     *
     * @param {*} keyboardHandler
     */
    setKeyboardHandler(keyboardHandler) {
        this.keyboardHandler = keyboardHandler;
    }

    /**
     * Sets a light.
     *
     *
     * @param {int} index Light index to set to (used in shaders as u_Light0 etc)
     * @param {*} light Light object.
     */
    setLight(index, light) {
        this.lights[`light${index}`] = light;
    }

    /**
     * Sets a nodePath with name.
     * @param {*} name Name of node path.
     * @param {*} nodePath NodePath.
     */
    setNodePath(name, nodePath) {
        this.nodePaths[name] = nodePath;
    }

    /**
     * Creates a Texture() object from image data.
     *
     * Naming scheme is:
     *
     * name: texture
     * name_n: Normal map
     * name_h: Heightmap
     * name_dudv: DUDV map
     * @param {*} imageName Name of image previously added via registerImages.
     */
    registerTexture(imageName) {
        const texture = new Texture(this.gl, imageName);

        if (this.textureImages[imageName] !== undefined) {
            texture.setTexture(this.textureImages[imageName]);
        }

        if (this.textureImages[imageName + '_n'] !== undefined) {
            texture.setNormal(this.textureImages[imageName + '_n']);
        }

        if (this.textureImages[imageName + '_h'] !== undefined) {
            texture.setHeightmap(this.textureImages[imageName + '_h']);
        }

        if (this.textureImages[imageName + '_dudv'] !== undefined) {
            texture.setDUDV(this.textureImages[imageName + '_dudv']);
        }

        this.textures[imageName] = texture;
    }

    /**
     * Loads any expected texture assets from files.
     * @param {*} textures
     */
    registerTextureImages(textures) {
        let countTexturesLoaded = 0;
        const totalEntries = Object.keys(textures).length;

        const self = this;

        for ( const [textureName, filePath] of Object.entries(textures) ) {
            this.textureImages[textureName] = new Image();
            this.textureImages[textureName].onload = function(){
                countTexturesLoaded += 1;
                self.assetFlags.texturesLoaded = (countTexturesLoaded == totalEntries);

                self.assetLoaded();
            }
            this.textureImages[textureName].src = filePath;
        }
    }


    /**
     * Converts any registered textures into GL_TEXTURE buffers.
     */
    createGlTextures() {

        for (const [imageName, textureImage] of Object.entries(this.textureImages)) {
            this.registerTexture(imageName);
        }
    }

    /**
     * Registers a texture from a frame buffer texture object.
     * @param {*} name
     * @param {*} fboTexture
     */
    registerFboTexture(name, fboTexture) {
        this.textures[name] = fboTexture;
        this.frameBuffers[name] = fboTexture;

        this.renderQueue[name] = {
            ortho: {},
            static: {},
            dynamic: {},
            nonDepth: {},
        };
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
     * Registers a sceneObject and adds it to a render queue.
     *
     * A sceneObject can be added to multiple queues with subsequent calls to this method and
     * different fboTextureNames.
     *
     * Shader object is only set if registering object to the default queue (@todo: fix this.)
     *
     *
     * @param {*} sceneObject The sceneObject.
     * @param {*} shaderObject The shader Object to render with.
     * @param {*} renderContext Ortho, static, or nonDepth.
     * @param {*} fboTextureName Name of framebuffer. If not set, sceneObject is registered to the default render queue.
     */
    registerSceneObject(name, sceneObject, shaderName, renderContext, fboTextureName) {

        let targetBuffer;

        if (fboTextureName === undefined) {
            targetBuffer = 'default';
            this.sceneObjects[name] = sceneObject;
            sceneObject.setName(name);
            sceneObject.setShaderProgram(this.shaders[shaderName]);

        } else {
            targetBuffer = fboTextureName;
        }

        this.renderQueue[targetBuffer][renderContext][name] = sceneObject;
    }



    /**
     * Handles resizing the canvas and viewport if the window size changes.
     * @returns
     */
    handleWindowResize() {

        const displayWidth  = this.gl.canvas.clientWidth;
        const displayHeight = this.gl.canvas.clientHeight;

        const needResize = this.gl.canvas.width  !== displayWidth ||
        this.gl.canvas.height !== displayHeight;

        if (needResize) {
            this.gl.canvas.width  = displayWidth;
            this.gl.canvas.height = displayHeight;
        }

        return needResize;
    }


    /**
     * Renders the specified object render queue.
     * @param {*} renderContext ortho, static, or nonDepth.
     */
    render(targetBuffer, renderContext) {

        if (this.renderQueue[targetBuffer][renderContext] !== undefined) {

            if (renderContext === 'nonDepth') {
                this.gl.disable(this.gl.DEPTH_TEST);
            }

            for (const [name, sceneObject] of Object.entries(this.renderQueue[targetBuffer][renderContext])) {

                if (sceneObject.enabled && sceneObject.parentSceneObject === null) {
                    sceneObject.render(this);
                }
            }

            if (renderContext === 'nonDepth') {
                this.gl.enable(this.gl.DEPTH_TEST);
            }
        }

    }


    /**
     * Called once per frame to run the next frame.
     */
    tick() {

        this.keyboardHandler.handleKeys();
        this.handleWindowResize();

        if (this.sky) {
            this.sky.update();
        }

        this.camera.update(true);
        this.camera.debug('cameraDebug');

        Object.entries(this.renderQueue).forEach(([targetBuffer, objects]) => {

            if (targetBuffer !== 'default') {
                this.frameBuffers[targetBuffer].startRender();

                this.render(targetBuffer, 'nonDepth');
                this.render(targetBuffer, 'static');

                this.frameBuffers[targetBuffer].endRender();
            }

        });

        this.camera.update();

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);


        this.render('default', 'nonDepth');
        this.render('default', 'static');


        const currentTime = (new Date).getTime();
        if (this.lastUpdateTime) {
            const delta = currentTime - this.lastUpdateTime;

            if (this.lights.light0.type != 0) {
                this.nodePaths.terrainPerimeter.tick(delta);
            }

            if (this.lights.light1.type != 0) {
                this.nodePaths.planes.tick(delta);
            }
        }

        this.lastUpdateTime = currentTime;

        requestAnimationFrame(() => this.tick());
    }


}
