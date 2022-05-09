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

const KeyboardHandler = require('./lib/EdgeGL/KeyboardHandler');
const Camera = require('./lib/EdgeGL/Camera');
const Shader = require('./lib/EdgeGL/Shader');
const SceneObject = require('./lib/EdgeGL/SceneObject');
const Light = require('./lib/EdgeGL/Light');

const OriginPrimitive = require('./lib/EdgeGL/Primitives/OriginPrimitive');
const QuadPlanePrimitive = require('./lib/EdgeGL/Primitives/QuadPlanePrimitive');
const CubePrimitive = require('./lib/EdgeGL/Primitives/CubePrimitive');
const LinePrimitive = require('./lib/EdgeGL/Primitives/LinePrimitive');

const Heightmap = require('./lib/EdgeGL/Heightmap');
const Terrain = require('./lib/EdgeGL/Terrain');

const Sylvester = require('sylvester-es6/src/Sylvester');


/**
 * Once DOM is ready, begin.
 */
document.addEventListener("DOMContentLoaded", () => {

    startGlContext();

});


/**
 * Load any expected model resources (.obj)
 */
function loadModels() {

    // Load Heightmap
    const heightmap = new Heightmap();

    // heightmap.initWithFaultLine(128, 128, 1, () => {
    //     appRegistry.heightmaps.main = heightmap;
    //     appRegistry.assetFlags.modelsLoaded = true;

    //     appRegistry.assetsLoaded();
    // });

    heightmap.initWithFile(require('./assets/terrain/Heightmap.png'), () => {
        appRegistry.heightmaps.main = heightmap;
        appRegistry.assetFlags.modelsLoaded = true;

        appRegistry.assetsLoaded();
    });
}

 /**
  * Initialise any vertex and index buffers.
  *
  * @param {*} gl gl context object.
  */
function initSceneObjects(gl) {

    const originObject = new SceneObject(gl);

    originObject.setPrimitive(new OriginPrimitive(gl));

    appRegistry.registerSceneObject('worldOrigin', originObject, 'line', 'static');

    //
    const floorObject = new SceneObject(gl);

    floorObject.setPrimitive(new QuadPlanePrimitive(gl, 100, false));
    floorObject.setTexture(appRegistry.glTextures.grassPurpleFlowers);

    appRegistry.registerSceneObject('floor', floorObject, 'base', 'static');

    //
    const terrain = new Terrain();
    terrain.setStretch(8);
    terrain.initWithHeightmap(appRegistry.heightmaps.main);

    const terrainObject = new SceneObject(gl);
    terrain.populateSceneObject(terrainObject);

    terrainObject.setRenderMode(gl.TRIANGLE_STRIP);
    // terrainObject.setTexture(
    //     appRegistry.glTextures.grass
    // );
    terrainObject.setTexture(
        appRegistry.glTextures.grassPurpleFlowers,
        appRegistry.glTextures.grassPurpleFlowers_n
    );

    appRegistry.registerSceneObject('terrain', terrainObject, 'base', 'static');

    //
    const terrainNormalDebugObject = new SceneObject(gl);
    terrain.populateNormalDebugSceneObject(terrainNormalDebugObject);

    terrainNormalDebugObject.setRenderMode(gl.LINES);
    terrainNormalDebugObject.setEnabled(false);
    appRegistry.registerSceneObject('terrainNormalDebug', terrainNormalDebugObject, 'line', 'static');

    //
    const sunLightObject = new SceneObject(gl);
    sunLightObject.setPrimitive(new QuadPlanePrimitive(gl, 20, true));
    sunLightObject.setTexture(appRegistry.glTextures.lightbulb);
    appRegistry.lights.light0.setSceneObject(sunLightObject);

    appRegistry.registerSceneObject('sunLight', sunLightObject, 'base', 'static');

    const sunLightVectorObject = new SceneObject(gl);
    sunLightVectorObject.setPrimitive(new LinePrimitive(gl, appRegistry.lights.light0.position, 25.0));

    appRegistry.registerSceneObject('sunLightVector', sunLightVectorObject, 'line', 'static');

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
 * Called once assets are loaded, we have a canvas, and we have the gl context.
 * Converts assets to GL assets, loads shaders, objects, etc.
 */
function startGlContext() {

    //const frameRate = 15;
    const canvas = document.getElementById("glcanvas");

    if (canvas === undefined || canvas === null) {
        throw new Error("Could not find the canvas.");
    }

    let gl = null;

    try {
        gl = canvas.getContext("experimental-webgl");
    } catch(e) {
        console.error(e);
    }

    if (!gl) {
        console.error("Unable to initialize WebGL.");
    }

    appRegistry.setGlContext(gl);

    //
    appRegistry.camera = new Camera();
    appRegistry.camera.setPosition(-160, 440, -63);
    appRegistry.camera.setRotation(19, -128);

    //
    appRegistry.keyboardHandler = new KeyboardHandler(window, document);
    appRegistry.keyboardHandler.setCamera(appRegistry.camera);

    if (gl !== null) {

        const sunLight = new Light(gl, "0");
        sunLight.setDirection(1.0, -1.0, 1.0);
        sunLight.setAmbient(0.4, 0.4, 0.4);
        sunLight.setDiffuse(0.7, 0.7, 0.7);
        sunLight.setSpecular(0.6, 0.6, 0.6);
        sunLight.setRenderPosition(500, 500, 500);
        appRegistry.lights.light0 = sunLight;

        appRegistry.onAssetsLoaded = () => {
            appRegistry.createGlTextures();

            initSceneObjects(gl);
            bindWebUI(gl);

            requestAnimationFrame(() => drawScene(gl));

            //setInterval(() => { drawScene(gl) }, frameRate);
        };

        appRegistry.registerTextures({
            'blank' : require('./assets/img/blank.png'),
            'grass' : require('./assets/img/grass.jpg'),
            'grassPurpleFlowers' : require('./assets/img/GrassPurpleFlowers.png'),
            'grassPurpleFlowers_n' : require('./assets/img/GrassPurpleFlowers_N.png'),
            'floor' : require('./assets/img/floor.png'),
            'lightbulb' : require('./assets/img/lightbulb.jpg'),
        });

        appRegistry.registerShaders({
            line: "line",
            base: "base",
            normalmapping: "normalmapping",
            //terrain: "terrain",
        });

        loadModels();

        //gl.clearColor(100/255, 149/255, 237/255, 1.0); // Cornflower blue
        gl.clearColor(0.8, 0.9, 1.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        //gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.frontFace(gl.CW);
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
 * Binds any web UI inputs, controls etc.
 */
function bindWebUI(gl) {
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
        appRegistry.sceneObjects.terrainNormalDebug.setEnabled(appRegistry.options.renderNormals);
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

    document.querySelectorAll('input[class="sunPos"]').forEach((element) => {
        element.addEventListener('change', (event) => {
            appRegistry.lights.light0.setPosition(
                document.getElementById('sunPosX').value,
                document.getElementById('sunPosY').value,
                document.getElementById('sunPosZ').value,
            );
        });
    });

    document.querySelectorAll('input[class="fog"]').forEach((element) => {
        element.addEventListener('change', (event) => {
            appRegistry.fogSettings.near = document.getElementById('fogNear').value;
            appRegistry.fogSettings.far = document.getElementById('fogFar').value;
        });
    });
}



/**
 * drawScene
 *
 * Renders the scene.
 */
function drawScene(gl) {

    appRegistry.keyboardHandler.handleKeys();
    handleWindowResize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    appRegistry.camera.update();
    appRegistry.camera.debug('cameraDebug');

    appRegistry.render('static');


    // appRegistry.meshes.tank.position.setElements([testXPos, 0.0, 0.0]);
    // appRegistry.meshes.tank.render(appRegistry.shaders.base);

    // Handle any animated meshes.
    const currentTime = (new Date).getTime();
    if (appRegistry.lastUpdateTime) {
        const delta = currentTime - appRegistry.lastUpdateTime;

        // (Call any updates on animated sceneObjects based on delta.)
        appRegistry.render('timed', delta);
    }

    appRegistry.lastUpdateTime = currentTime;

    requestAnimationFrame(() => drawScene(gl));
}
