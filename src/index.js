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

const OriginPrimitive = require('./lib/EdgeGL/Primitives/OriginPrimitive');
const QuadPlanePrimitive = require('./lib/EdgeGL/Primitives/QuadPlanePrimitive');

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

    appRegistry.modelsLoaded = true;
    assetsLoaded();
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

    const floorObject = new SceneObject(gl);
    floorObject.setPrimitive(new QuadPlanePrimitive(gl));
    floorObject.setTexture(appRegistry.glTextures.grass);

    appRegistry.sceneObjects.floor = floorObject;

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

    if (gl !== null) {
        gl.clearColor(100/255, 149/255, 237/255, 1.0); // Cornflower blue
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        appRegistry.shaders.base = new Shader(gl, "base");
        appRegistry.shaders.line = new Shader(gl, "line");

        appRegistry.glTextures.grass = createGlTexture(gl, appRegistry.textureImages.grass);
        appRegistry.glTextures.blank = createGlTexture(gl, appRegistry.textureImages.blank);
        appRegistry.glTextures.floor = createGlTexture(gl, appRegistry.textureImages.floor);

        initBuffers(gl);

        setInterval(() => { drawScene(gl) }, frameRate);

        document.onkeydown = handleKeyDown;
        document.onkeyup = handleKeyUp;
    }
}

  /**
   * drawScene
   *
   * Renders the scene.
   */
  function drawScene(gl) {

    handleKeys();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    matrices.loadIdentity();
    matrices.perspectiveMatrix = Sylvester.makePerspective(45, 1000.0/1000.0, 0.1, 1000.0);
    appRegistry.camera.update(matrices);

    appRegistry.shaders.line.use();
    appRegistry.sceneObjects.worldOrigin.render(appRegistry.shaders.line, matrices);

    appRegistry.shaders.base.use();
    appRegistry.sceneObjects.floor.render(appRegistry.shaders.base, matrices);

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

