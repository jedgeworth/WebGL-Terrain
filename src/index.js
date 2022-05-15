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
const Texture = require('./lib/EdgeGL/Texture');

const OriginPrimitive = require('./lib/EdgeGL/Primitives/OriginPrimitive');
const QuadPlanePrimitive = require('./lib/EdgeGL/Primitives/QuadPlanePrimitive');
const CubePrimitive = require('./lib/EdgeGL/Primitives/CubePrimitive');
const LinePrimitive = require('./lib/EdgeGL/Primitives/LinePrimitive');
const DomePrimitive = require('./lib/EdgeGL/Primitives/DomePrimitive');

const Heightmap = require('./lib/EdgeGL/Heightmap');
const Terrain = require('./lib/EdgeGL/Terrain');
const SkyDome = require('./lib/EdgeGL/SkyDome');

const Sylvester = require('sylvester-es6/src/Sylvester');
const Vector3 = require('./lib/EdgeGL/types/Vector3');
const {distanceBetween} = require('./lib/EdgeGL/VectorMath');
const NodePath = require('./lib/EdgeGL/NodePath');


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

    const skyDome = new SkyDome(
        gl,
        appRegistry.textures.sky,
        appRegistry.textures.waterDeep
    );

    skyDome.registerSceneObjects(appRegistry, 'domeSky', 'domeFloor');
    skyDome.setCamera(appRegistry.camera);
    appRegistry.sky = skyDome;


    //
    const floorObject = new SceneObject(gl);

    floorObject.setPrimitive(new QuadPlanePrimitive(gl, 100, false));
    floorObject.setTexture(appRegistry.textures.rock);
    floorObject.setPosition(0, 0, -200);

    appRegistry.registerSceneObject('floor', floorObject, 'base', 'static');

    //
    const floorObject2 = new SceneObject(gl);

    floorObject2.setPrimitive(new QuadPlanePrimitive(gl, 100, false));
    floorObject2.setTexture(appRegistry.textures['243']);
    floorObject2.setPosition(200, 0, -200);

    appRegistry.registerSceneObject('floor2', floorObject2, 'base', 'static');

    //
    const terrain = new Terrain();
    terrain.setStretch(8);
    terrain.initWithHeightmap(appRegistry.heightmaps.main);

    const terrainObject = new SceneObject(gl);
    terrain.populateSceneObject(terrainObject);

    terrainObject.setRenderMode(gl.TRIANGLE_STRIP);
    terrainObject.setTexture(appRegistry.textures.grassPurpleFlowers);

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
    sunLightObject.setTexture(appRegistry.textures.lightbulb);
    sunLightObject.useFog = false;
    sunLightObject.useLighting = false;
    appRegistry.lights.light0.setSceneObject(sunLightObject);

    appRegistry.registerSceneObject('sunLight', sunLightObject, 'base', 'static');

    const sunLightVectorObject = new SceneObject(gl);
    sunLightVectorObject.setPrimitive(new LinePrimitive(gl, appRegistry.lights.light0.position, 20.0));

    sunLightObject.addSceneObject(sunLightVectorObject);
    appRegistry.registerSceneObject('sunLightVector', sunLightVectorObject, 'line', 'static');

    appRegistry.nodePaths.terrainPerimeter.addSceneObject(sunLightObject);


    //
    const blueLightObject = new SceneObject(gl);
    blueLightObject.setPrimitive(new QuadPlanePrimitive(gl, 20, true));
    blueLightObject.setTexture(appRegistry.textures.lightbulb);
    blueLightObject.useFog = false;
    blueLightObject.useLighting = false;
    appRegistry.lights.light1.setSceneObject(blueLightObject);

    appRegistry.registerSceneObject('blueLight', blueLightObject, 'base', 'static');

    const blueLightVectorObject = new SceneObject(gl);
    blueLightVectorObject.setPrimitive(new LinePrimitive(gl, appRegistry.lights.light1.position, 20.0));

    blueLightObject.addSceneObject(blueLightVectorObject);
    appRegistry.registerSceneObject('blueLightVector', blueLightVectorObject, 'line', 'static');

    appRegistry.nodePaths.planes.addSceneObject(blueLightObject);





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

    const canvas = document.getElementById("glcanvas");

    if (canvas === undefined || canvas === null) {
        throw new Error("Could not find the canvas.");
    }

    let gl = null;

    try {
        gl = canvas.getContext("webgl");
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
        sunLight.setAmbient(0.3, 0.3, 0.3);
        sunLight.setDiffuse(0.7, 0.7, 0.7);
        sunLight.setSpecular(0.2, 0.2, 0.2);
        sunLight.setRenderPosition(500, 500, 500);
        sunLight.setType(1);
        appRegistry.lights.light0 = sunLight;

        const blueLight = new Light(gl, "1");
        blueLight.setDirection(1.0, -1.0, 1.0);
        blueLight.setAmbient(0.0, 0.0, 0.3);
        blueLight.setDiffuse(0.0, 0.0, 0.7);
        blueLight.setSpecular(0.0, 0.0, 0.2);
        blueLight.setType(1);
        appRegistry.lights.light1 = blueLight;

        appRegistry.onAssetsLoaded = () => {
            appRegistry.createGlTextures();

            initSceneObjects(gl);
            bindWebUI(gl);

            requestAnimationFrame(() => drawScene(gl));
        };


        appRegistry.nodePaths.terrainPerimeter = new NodePath();
        appRegistry.nodePaths.terrainPerimeter.setPoints([
            new Vector3(0.0, 500.0, 0.0),
            new Vector3(0.0, 500.0, 2000.0),
            new Vector3(2000.0, 500.0, 2000.0),
            new Vector3(2000.0, 500.0, 0.0)
        ]);
        appRegistry.nodePaths.terrainPerimeter.setSpeed(500);


        appRegistry.nodePaths.planes = new NodePath();
        appRegistry.nodePaths.planes.setPoints([
            new Vector3(-250.0, 200.0, -150.0),
            new Vector3(300.0, 200.0, -150.0),

            // new Vector3(0.0, 500.0, 2000.0),
            // new Vector3(2000.0, 500.0, 2000.0),
            // new Vector3(2000.0, 500.0, 0.0),
            // new Vector3(0.0, 500.0, 0.0),
        ]);
        appRegistry.nodePaths.planes.setSpeed(300);


        appRegistry.registerTextureImages({
            'blank' : require('./assets/img/blank.png'),
            'grass' : require('./assets/img/grass.jpg'),

            'grassPurpleFlowers' : require('./assets/img/GrassPurpleFlowers.png'),
            'grassPurpleFlowers_n' : require('./assets/img/GrassPurpleFlowers_N.png'),

            'rock' : require('./assets/img/rocks.png'),
            'rock_n' : require('./assets/img/rocks_N.png'),

            '243' : require('./assets/img/243.png'),
            '243_n' : require('./assets/img/243_n.png'),

            'floor' : require('./assets/img/floor.png'),
            'lightbulb' : require('./assets/img/lightbulb.jpg'),
            'sky' : require('./assets/img/sky.png'),
            'waterDeep' : require('./assets/img/water_deep.png'),
        });

        appRegistry.registerShaders({
            line: "line",
            base: "base",
            billboard: "billboard",
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

    document.querySelector('input[class="shininess"]').addEventListener('change', (event) => {
        appRegistry.lightSettings.shininess = document.getElementById('shininess').value;
    });

    document.querySelector('select[class="sunType"]').addEventListener('change', (event) => {
        appRegistry.lights.light0.setType(document.getElementById('sunType').value);

        if (appRegistry.lights.light0.type == 0) {
            document.getElementById('sunPosX').value = appRegistry.lights.light0.getPosition().x;
            document.getElementById('sunPosY').value = appRegistry.lights.light0.getPosition().y;
            document.getElementById('sunPosZ').value = appRegistry.lights.light0.getPosition().z;
        }
    });

    document.querySelector('select[class="normalMapping"]').addEventListener('change', (event) => {
        appRegistry.lightSettings.useNormalMapping = parseInt(document.getElementById('normalMapping').value);
    });

    document.querySelector('select[class="correctD3d"]').addEventListener('change', (event) => {
        appRegistry.lightSettings.correctD3d = parseInt(document.getElementById('correctD3d').value);
    });


    document.getElementById('faultLineForm').onsubmit = (e) => {

        e.preventDefault();

        const w = document.getElementById('newWidth').value;
        const h = document.getElementById('newHeight').value;
        const steps = document.getElementById('newSteps').value;

        appRegistry.heightmaps.main.initWithFaultLine(w, h, steps, () => {
            const terrain = new Terrain();
            terrain.setStretch(8);
            terrain.initWithHeightmap(appRegistry.heightmaps.main);
            terrain.populateSceneObject(appRegistry.sceneObjects.terrain);
            terrain.populateNormalDebugSceneObject(appRegistry.sceneObjects.terrainNormalDebug);
        });

    };
}

/**
 * drawScene
 *
 * Renders the scene.
 */
function drawScene(gl) {

    appRegistry.keyboardHandler.handleKeys();
    handleWindowResize(gl.canvas);

    if (appRegistry.sky) {
        appRegistry.sky.update();
    }

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    appRegistry.camera.update();
    appRegistry.camera.debug('cameraDebug');

    appRegistry.render('nonDepth');
    appRegistry.render('static');

    // Handle any animated meshes.
    const currentTime = (new Date).getTime();
    if (appRegistry.lastUpdateTime) {
        const delta = currentTime - appRegistry.lastUpdateTime;

        if (appRegistry.lights.light0.type == 1) {
            appRegistry.nodePaths.terrainPerimeter.tick(delta);
        }

        if (appRegistry.lights.light1.type == 1) {
            appRegistry.nodePaths.planes.tick(delta);
        }
    }

    appRegistry.lastUpdateTime = currentTime;

    requestAnimationFrame(() => drawScene(gl));
}
