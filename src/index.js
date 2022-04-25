/**
 * index.js
 *
 * Entry point of application.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

require('normalize.css/normalize.css');
require('./styles/index.scss');

const AppRegistry = require('./lib/EdgeGL/AppRegistry');
const appRegistry = new AppRegistry();

const Matrices = require('./lib/EdgeGL/Matrices');
const matrices = new Matrices();

const Camera = require('./lib/EdgeGL/Camera');
const Shader = require('./lib/EdgeGL/Shader');
const SceneObject = require('./lib/EdgeGL/SceneObject');
const Light = require('./lib/EdgeGL/Light');

const OriginPrimitive = require('./lib/EdgeGL/Primitives/OriginPrimitive');
const QuadPlanePrimitive = require('./lib/EdgeGL/Primitives/QuadPlanePrimitive');
const CubePrimitive = require('./lib/EdgeGL/Primitives/CubePrimitive');

const Heightmap = require('./lib/EdgeGL/Heightmap');
const Terrain = require('./lib/EdgeGL/Terrain');

const Sylvester = require('sylvester-es6/src/Sylvester');


/**
 * Once DOM is ready, begin.
 */
document.addEventListener("DOMContentLoaded", () => {

    loadTextures();
    loadModels();

});


/**
 * Load any expected image assets.
 */
function loadTextures() {
    const textureAssets = {
        'blank' : require('./assets/img/blank.png'),
        'grass' : require('./assets/img/grass.jpg'),
        'floor' : require('./assets/img/floor.png'),
        'lightbulb' : require('./assets/img/lightbulb.jpg'),
    };

    var countTexturesLoaded = 0;

    for (let textureName in textureAssets) {
        appRegistry.textureImages[textureName] = new Image();
        appRegistry.textureImages[textureName].onload = function(){
            countTexturesLoaded += 1;
            appRegistry.texturesLoaded = (countTexturesLoaded == Object.keys(textureAssets).length);

            assetsLoaded();
        }
        appRegistry.textureImages[textureName].src = textureAssets[textureName];
    }
}

/**
 * Load any expected model resources (.obj)
 */
function loadModels() {

    // Load Heightmap
    const heightmap = new Heightmap();

    // heightmap.initWithFaultLine(128, 128, 1, () => {
    //     appRegistry.heightmaps.main = heightmap;
    //     appRegistry.modelsLoaded = true;

    //     assetsLoaded();
    // });

    heightmap.initWithFile(require('./assets/terrain/Heightmap.png'), () => {
        appRegistry.heightmaps.main = heightmap;
        appRegistry.modelsLoaded = true;

        assetsLoaded();
    });
}

/**
 * Called by any load*() methods. Each marks when they're complete, and
 * this ensures we only proceed when all expected assets are ready.
 */
function assetsLoaded() {
    if (appRegistry.modelsLoaded && appRegistry.texturesLoaded) {

        try {
            startGlContext();
        } catch (e) {
            console.error(e);
        }

    }
}

/**
 * Initialise WebGL on canvas.
 */
function initWebGL(canvas) {
    let gl = null;

    try {
        gl = canvas.getContext("experimental-webgl");
    }
    catch(e) {
        console.error(e);
    }

    if (!gl) {
        console.error("Unable to initialize WebGL.");
    }

    return gl;
}

 /**
  * Initialise any vertex and index buffers.
  *
  * @param {*} gl gl context object.
  */
function initBuffers(gl) {

    const originObject = new SceneObject(gl);
    originObject.setPrimitive(new OriginPrimitive(gl));
    appRegistry.sceneObjects.worldOrigin = originObject;

    //
    const floorObject = new SceneObject(gl);
    floorObject.setPrimitive(new QuadPlanePrimitive(gl));
    floorObject.setTexture(appRegistry.glTextures.grass);

    appRegistry.sceneObjects.floor = floorObject;

    //
    const terrain = new Terrain();
    terrain.setStretch(4);
    terrain.initWithHeightmap(appRegistry.heightmaps.main);

    const terrainObject = new SceneObject(gl);

    terrain.populateSceneObject(terrainObject);
    terrainObject.setRenderMode(gl.TRIANGLE_STRIP);
    terrainObject.setTexture(appRegistry.glTextures.grass);
    appRegistry.sceneObjects.terrain = terrainObject;

    const terrainNormalDebugObject = new SceneObject(gl);
    terrainNormalDebugObject.setName("Terrain normal debug");
    terrain.populateNormalDebugSceneObject(terrainNormalDebugObject);
    terrainNormalDebugObject.setRenderMode(gl.LINES);
    appRegistry.sceneObjects.terrainNormalDebug = terrainNormalDebugObject;

    //
    const sunLight = new Light(gl, "0");
    sunLight.setDirection(1.0, 1.0, 1.0);
    sunLight.setAmbient(0.4, 0.4, 0.4);
    sunLight.setDiffuse(0.7, 0.7, 0.7);
    sunLight.setSpecular(0.6, 0.6, 0.6);
    sunLight.setRenderPosition(500, 500, 500);
    appRegistry.lights.light0 = sunLight;

    const sunLightObject = new SceneObject(gl);
    sunLightObject.setPrimitive(new QuadPlanePrimitive(gl, 20, true));
    sunLightObject.setTexture(appRegistry.glTextures.lightbulb);
    sunLight.setSceneObject(sunLightObject);
    appRegistry.sceneObjects.sunLight = sunLightObject;

    // Example of a more complicated object (TODO: port the object loader across)
    // var tankMesh = new Mesh.Init(gl);
    // tankMesh.setVertices(app.models.tank.vertices);
    // tankMesh.setNormals(app.models.tank.vertexNormals);
    // tankMesh.setTexCoords(app.models.tank.textures);
    // tankMesh.setIndices(app.models.tank.indices);
    // tankMesh.setTexture(app.glTextures.blank);
    // tankMesh.setFlipYaw();
    // app.meshes.tank = tankMesh;
}


/**
 * Create a GL_TEXTURE_2D from an image file.
 *
 * @param {*} gl gl context object.
 * @param {*} textureImage Image() object.
 */
function createGlTexture(gl, textureImage) {
    const glTexture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.bindTexture(gl.TEXTURE_2D, glTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    return glTexture;
}


/**
 * Handle keypresses.
 *
 * TODO: Move this into its own class.
 */
const currentlyPressedKeys = {};

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {

    if (currentlyPressedKeys[37]) {
      // Left cursor key
      appRegistry.camera.yawLeft();
    }
    if (currentlyPressedKeys[39]) {
      // Right cursor key
      appRegistry.camera.yawRight();
    }
    if (currentlyPressedKeys[38]) {
      // Up cursor key
      appRegistry.camera.pitchUp();
    }
    if (currentlyPressedKeys[40]) {
      // Down cursor key
      appRegistry.camera.pitchDown();
    }

    if (currentlyPressedKeys[87]) {
      // W
      appRegistry.camera.moveForward();
    }

    if (currentlyPressedKeys[83]) {
      // S
      appRegistry.camera.moveBackward();
    }

    if (currentlyPressedKeys[65]) {
      // A
      appRegistry.camera.moveLeft();
    }

    if (currentlyPressedKeys[68]) {
      // D
      appRegistry.camera.moveRight();
    }

    if (currentlyPressedKeys[32]) {
      // Space
      appRegistry.camera.moveUp();
    }

    if (currentlyPressedKeys[81]) {
      // Q
      appRegistry.camera.moveDown();
    }

    if (currentlyPressedKeys[82]) {
        // R
        appRegistry.camera.incrementWalkSpeed();
    }

    if (currentlyPressedKeys[70]) {
        // F
        appRegistry.camera.decrementWalkSpeed();
    }
  }

/**
 * Called once assets are loaded, we have a canvas, and we have the gl context.
 * Converts assets to GL assets, loads shaders, objects, etc.
 */
function startGlContext() {

    const frameRate = 15;

    const canvas = document.getElementById("glcanvas");

    if (canvas === undefined || canvas === null) {
        throw new Error("Could not find the canvas.");
    }

    const gl = initWebGL(canvas);
    appRegistry.camera = new Camera();
    appRegistry.camera.setPosition(-160, 440, -63);
    appRegistry.camera.setRotation(19, -128);

    if (gl !== null) {
        gl.clearColor(100/255, 149/255, 237/255, 1.0); // Cornflower blue
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        //gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CW);

        appRegistry.shaders.base = new Shader(gl, "base");
        appRegistry.shaders.line = new Shader(gl, "line");

        appRegistry.glTextures.grass = createGlTexture(gl, appRegistry.textureImages.grass);
        appRegistry.glTextures.blank = createGlTexture(gl, appRegistry.textureImages.blank);
        appRegistry.glTextures.floor = createGlTexture(gl, appRegistry.textureImages.floor);
        appRegistry.glTextures.lightbulb = createGlTexture(gl, appRegistry.textureImages.lightbulb);

        initBuffers(gl);

        setInterval(() => { drawScene(gl) }, frameRate);

        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;

        // Prevent certain keys from scrolling the page.
        window.addEventListener("keydown", function(e) {
            // space and arrow keys
            if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
                e.preventDefault();
            }
        }, false);

        document.querySelectorAll('input[name="renderModeOverride"]').forEach((element) => {
            element.addEventListener('change', (event) => {

                switch (parseInt(event.target.value)) {
                    case 0: appRegistry.options.renderModeOverride = null; break;
                    case 1: appRegistry.options.renderModeOverride = gl.LINES; break;
                    case 2: appRegistry.options.renderModeOverride = gl.POINTS; break;
                }

                Object.values(appRegistry.sceneObjects).forEach((sceneObject) => {

                    if (appRegistry.options.renderModeOverride !== null) {
                        sceneObject.setRenderModeOverride(appRegistry.options.renderModeOverride);
                    } else {
                        sceneObject.disableRenderModeOverride();
                    }

                });
            });
        });


        document.querySelector('input[name="renderNormals"]').addEventListener('change', (event) => {
            appRegistry.options.renderNormals = (event.target.checked);
        });


        document.querySelectorAll('input[class="diffuse"]').forEach((element) => {
            element.addEventListener('change', (event) => {
                appRegistry.lights.light0.setDiffuse(
                    document.getElementById('diffuseR').value,
                    document.getElementById('diffuseG').value,
                    document.getElementById('diffuseB').value,
                );
            });
        });

        document.querySelectorAll('input[class="specular"]').forEach((element) => {
            element.addEventListener('change', (event) => {
                appRegistry.lights.light0.setSpecular(
                    document.getElementById('specularR').value,
                    document.getElementById('specularG').value,
                    document.getElementById('specularB').value,
                );
            });
        });
    }
}

/**
 * Allow a window rezize to resize the canvas.
 *
 * (src: https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html)
 */
function handleWindowResize(canvas) {

    const displayWidth  = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    const needResize = canvas.width  !== displayWidth ||
                        canvas.height !== displayHeight;

    if (needResize) {
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }

    return needResize;
}

/**
 * drawScene
 *
 * Renders the scene.
 */
function drawScene(gl) {

    handleKeys();
    handleWindowResize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    matrices.loadIdentity();
    matrices.perspectiveMatrix = Sylvester.makePerspective(45, 1000.0/1000.0, 0.1, 6000.0);
    appRegistry.camera.update(matrices);
    appRegistry.camera.debug('cameraDebug');

    appRegistry.shaders.line.use();
    appRegistry.sceneObjects.worldOrigin.render(appRegistry.shaders.line, matrices);

    if (appRegistry.options.renderNormals) {
        appRegistry.sceneObjects.terrainNormalDebug.render(appRegistry.shaders.line, matrices);
    }


    appRegistry.shaders.base.use();
    //appRegistry.lights.light0.randomise();
    appRegistry.shaders.base.setLightUniforms(appRegistry.lights.light0);

    appRegistry.sceneObjects.sunLight.render(appRegistry.shaders.base, matrices);
    appRegistry.sceneObjects.terrain.render(appRegistry.shaders.base, matrices);


    // appRegistry.meshes.tank.position.setElements([testXPos, 0.0, 0.0]);
    // appRegistry.meshes.tank.render(appRegistry.shaders.base);

    // Handle any animated meshes.
    const currentTime = (new Date).getTime();
    if (appRegistry.lastUpdateTime) {
        const delta = currentTime - appRegistry.lastUpdateTime;

        // (Call any updates on animated sceneObjects based on delta.)
    }

    appRegistry.lastUpdateTime = currentTime;

    drawDebug();
}

/**
 * Calls any .debug() methods to output to the page.
 */
function drawDebug() {

    //let text = `testXPos: ${testXPos}`;

    //let text = '';
    //text += `<h5>Tank</h5>${appRegistry.meshes.tank.debug()}`;
    //document.getElementById("debug").innerHTML = text;

    // let text = '';
    // text += `<h5>Origin:</h5>${appRegistry.sceneObjects.worldOrigin.debug()}`;
    // document.getElementById("debug").innerHTML = text;

    //appRegistry.camera.debug('debug');
}

