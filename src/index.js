/**
 * index.js
 *
 * Entry point of application.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

require('normalize.css/normalize.css');
require('./styles/index.scss');

const EdgeGL = require('./lib/EdgeGL/EdgeGL');
const edgeGl = new EdgeGL();

const KeyboardHandler = require('./lib/EdgeGL/KeyboardHandler');
const Camera = require('./lib/EdgeGL/Camera');
const SceneObject = require('./lib/EdgeGL/SceneObject');
const Light = require('./lib/EdgeGL/Light');

const OriginPrimitive = require('./lib/EdgeGL/Primitives/OriginPrimitive');
const QuadPlanePrimitive = require('./lib/EdgeGL/Primitives/QuadPlanePrimitive');
const LinePrimitive = require('./lib/EdgeGL/Primitives/LinePrimitive');
const SpherePrimitive = require('./lib/EdgeGL/Primitives/SpherePrimitive');

const Heightmap = require('./lib/EdgeGL/Heightmap');
const Terrain = require('./lib/EdgeGL/Terrain');
const SkyDome = require('./lib/EdgeGL/SkyDome');
const WaterSceneObject = require('./lib/EdgeGL/WaterSceneObject');

const FBOTexture = require('./lib/EdgeGL/FBOTexture');

const Vector3 = require('./lib/EdgeGL/types/Vector3');
const NodePath = require('./lib/EdgeGL/NodePath');


const gl = null;

/**
 * Once DOM is ready, begin.
 */
document.addEventListener("DOMContentLoaded", () => {

    const edgeGl = new EdgeGL();
    if (edgeGl.initWithCanvas('glcanvas')) {

        //======================================================================
        // Stage 1 assets
        //======================================================================

        edgeGl.prepareAssets = (gl) => {

            edgeGl.registerTextureImages({
                'blank' : require('./assets/img/blank.png'),
                'grass' : require('./assets/img/grass.jpg'),
                'orientation' : require('./assets/img/orientation.png'),

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

                'water' : require('./assets/img/blank.png'),
                'water_dudv' : require('./assets/img/dudv.png'),
            });

            edgeGl.registerShaders({
                line: "line",
                base: "base",
                minimal: "minimal",
                water: "water",
                billboard: "billboard",
            });

            // Load Heightmap
            const heightmap = new Heightmap();

            // heightmap.initWithFaultLine(256, 256, 0, () => {
            //     edgeGl.heightmaps.main = heightmap;
            //     edgeGl.assetFlags.modelsLoaded = true;

            //     edgeGl.assetsLoaded();
            // });

            heightmap.initWithFile(require('./assets/terrain/Heightmap.png'), () => {
                edgeGl.heightmaps.main = heightmap;
                edgeGl.assetFlags.modelsLoaded = true;

                edgeGl.assetLoaded();
            });

        };

        //======================================================================
        // Stage 2 - Load objects.
        //======================================================================

        edgeGl.prepareObjects = (gl) => {

            const camera = new Camera();
            // camera.setPosition(-478, 986, -866);
            // camera.setRotation(32, -140);
            camera.setPosition(1750.28, 149, 1281.19);
            camera.setRotation(5, -2);
            edgeGl.setCamera(camera);

            //
            const keyboardHandler = new KeyboardHandler(window, document);
            keyboardHandler.setCamera(camera);
            edgeGl.setKeyboardHandler(keyboardHandler);

            const sunLight = new Light(gl, "0");
            sunLight.setType(1);
            sunLight.setDirection(1.0, -1.0, 1.0);
            sunLight.setAmbient(0.3, 0.3, 0.1);
            sunLight.setDiffuse(0.7, 0.7, 0.7);
            sunLight.setSpecular(0.2, 0.2, 0.2);
            sunLight.setPosition(1, 1, 1);
            edgeGl.setLight('0', sunLight);

            const blueLight = new Light(gl, "1");
            blueLight.setType(1);
            blueLight.setPosition(1.0, -1.0, 1.0);
            blueLight.setAmbient(0.0, 0.0, 0.0);
            blueLight.setDiffuse(0.0, 0.0, 0.7);
            blueLight.setSpecular(0.0, 0.0, 0.5);
            edgeGl.setLight('1', blueLight);

            const terrainPerimeter = new NodePath();
            terrainPerimeter.setPoints([
                new Vector3(0.0, 500.0, 0.0),
                new Vector3(0.0, 500.0, 2000.0),
                new Vector3(2000.0, 500.0, 2000.0),
                new Vector3(2000.0, 500.0, 0.0)
            ]);
            terrainPerimeter.setSpeed(500);

            edgeGl.setNodePath('terrainPerimeter', terrainPerimeter);


            const planes = new NodePath();
            planes.setPoints([
                new Vector3(-250.0, 200.0, -150.0),
                new Vector3(300.0, 200.0, -150.0),
            ]);
            planes.setSpeed(300);
            edgeGl.setNodePath('planes', planes);


            const fboRefractionTexture = new FBOTexture(gl, edgeGl.textures.water);
            fboRefractionTexture.init(1024, 1024);
            fboRefractionTexture.shaderUniforms = {
                clipPlane: [0, -1, 0, edgeGl.waterSettings.level]
            };
            edgeGl.registerFboTexture("fboRefraction", fboRefractionTexture);

            const fboReflectionTexture = new FBOTexture(gl);
            fboReflectionTexture.init(1024, 1024);
            fboReflectionTexture.cameraParams = {
                reflect: true,
                yOffset: 0,
            };
            fboReflectionTexture.shaderUniforms = {
                clipPlane: [0, 1, 0, -edgeGl.waterSettings.level]
            };
            edgeGl.registerFboTexture("fboReflection", fboReflectionTexture);


            //
            // Scene objects
            //
            const originObject = new SceneObject(gl);
            originObject.setPrimitive(new OriginPrimitive(gl));
            edgeGl.registerSceneObject('worldOrigin', originObject, 'line', 'static');

            //

            const skyDome = new SkyDome(
                gl,
                edgeGl.textures.sky,
                edgeGl.textures.waterDeep
            );

            skyDome.registerSceneObjects(edgeGl, 'domeSky', 'domeFloor');
            skyDome.registerSceneObjects(edgeGl, 'domeSky', 'domeFloor', 'fboReflection');
            skyDome.setCamera(camera);
            edgeGl.sky = skyDome;


            //
            const floorObject = new SceneObject(gl);

            floorObject.setPrimitive(new QuadPlanePrimitive(gl, 100, true));
            floorObject.setTexture(edgeGl.textures.fboRefraction);
            floorObject.setPosition(100, 100, 1);

            //edgeGl.registerSceneObject('floor', floorObject, 'minimal', 'ortho');

            //
            const floorObject2 = new SceneObject(gl);

            floorObject2.setPrimitive(new QuadPlanePrimitive(gl, 100, true));
            //floorObject2.setTexture(edgeGl.textures['243']);
            floorObject2.setTexture(edgeGl.textures.fboReflection);
            floorObject2.setPosition(300, 100, 1);

            //edgeGl.registerSceneObject('floor2', floorObject2, 'minimal', 'ortho');

            //
            const sphereObject = new SceneObject(gl);

            sphereObject.setPrimitive(new SpherePrimitive(gl, 50.0, 16, 33));
            sphereObject.setTexture(edgeGl.textures.rock);
            sphereObject.setPosition(0, 100, -200);
            sphereObject.roll = 90.0;

            edgeGl.registerSceneObject('sphere', sphereObject, 'base', 'static');
            edgeGl.registerSceneObject('sphere', sphereObject, 'base', 'static', 'fboRefraction');
            edgeGl.registerSceneObject('sphere', sphereObject, 'base', 'static', 'fboReflection');

            //
            const sphereObject2 = new SceneObject(gl);

            sphereObject2.setPrimitive(new SpherePrimitive(gl, 50.0, 16, 33));
            sphereObject2.setTexture(edgeGl.textures['243']);
            sphereObject2.setPosition(200, 100, -200);

            edgeGl.registerSceneObject('sphere2', sphereObject2, 'base', 'static');
            edgeGl.registerSceneObject('sphere2', sphereObject2, 'base', 'static', 'fboRefraction');
            edgeGl.registerSceneObject('sphere2', sphereObject2, 'base', 'static', 'fboReflection');

            //
            const terrain = new Terrain();
            terrain.setStretch(8);
            terrain.initWithHeightmap(edgeGl.heightmaps.main);

            const terrainObject = new SceneObject(gl);
            terrain.populateSceneObject(terrainObject);

            terrainObject.setRenderMode(gl.TRIANGLE_STRIP);
            terrainObject.setTexture(edgeGl.textures.grassPurpleFlowers);
            //terrainObject.setPosition(0, -50, 0);

            edgeGl.registerSceneObject('terrain', terrainObject, 'base', 'static');
            edgeGl.registerSceneObject('terrain', terrainObject, 'base', 'static', 'fboRefraction');
            edgeGl.registerSceneObject('terrain', terrainObject, 'base', 'static', 'fboReflection');

            //
            const terrainNormalDebugObject = new SceneObject(gl);
            terrain.populateNormalDebugSceneObject(terrainNormalDebugObject);

            terrainNormalDebugObject.setRenderMode(gl.LINES);
            terrainNormalDebugObject.setEnabled(false);
            edgeGl.registerSceneObject('terrainNormalDebug', terrainNormalDebugObject, 'line', 'static');


            //
            const waterObject = new WaterSceneObject(gl);

            waterObject.setPrimitive(new QuadPlanePrimitive(gl, 1024, false));
            waterObject.setTexture(edgeGl.textures.fboRefraction);
            waterObject.setTexture1(edgeGl.textures.fboReflection);
            waterObject.setPosition(1024, 100, 1024);

            edgeGl.registerSceneObject('water', waterObject, 'water', 'static');

            //
            const sunLightObject = new SceneObject(gl);
            sunLightObject.setPrimitive(new QuadPlanePrimitive(gl, 20, true));
            sunLightObject.setTexture(edgeGl.textures.lightbulb);
            sunLightObject.useFog = false;
            sunLightObject.useLighting = false;
            edgeGl.lights.light0.setSceneObject(sunLightObject);

            edgeGl.registerSceneObject('sunLight', sunLightObject, 'billboard', 'static');
            edgeGl.registerSceneObject('sunLight', sunLightObject, 'billboard', 'static', 'fboRefraction');

            // const sunLightVectorObject = new SceneObject(gl);
            // sunLightVectorObject.setPrimitive(new LinePrimitive(gl, edgeGl.lights.light0.position, 20.0));

            // sunLightObject.addSceneObject(sunLightVectorObject);
            // edgeGl.registerSceneObject('sunLightVector', sunLightVectorObject, 'line', 'static');

            edgeGl.nodePaths.terrainPerimeter.addSceneObject(sunLightObject);


            //
            const blueLightObject = new SceneObject(gl);
            blueLightObject.setPrimitive(new QuadPlanePrimitive(gl, 20, true));
            blueLightObject.setTexture(edgeGl.textures.lightbulb);
            blueLightObject.useFog = false;
            blueLightObject.useLighting = false;
            edgeGl.lights.light1.setSceneObject(blueLightObject);

            edgeGl.registerSceneObject('blueLight', blueLightObject, 'billboard', 'static');
            edgeGl.registerSceneObject('blueLight', blueLightObject, 'billboard', 'static', 'fboRefraction');

            // const blueLightVectorObject = new SceneObject(gl);
            // blueLightVectorObject.setPrimitive(new LinePrimitive(gl, edgeGl.lights.light1.position, 20.0));

            // blueLightObject.addSceneObject(blueLightVectorObject);
            // edgeGl.registerSceneObject('blueLightVector', blueLightVectorObject, 'line', 'static');

            edgeGl.nodePaths.planes.addSceneObject(blueLightObject);

            // Example of a more complicated object (TODO: port the object loader across)
            // var tankMesh = new Mesh.Init(gl);
            // tankMesh.setVertices(app.models.tank.vertices);
            // tankMesh.setNormals(app.models.tank.vertexNormals);
            // tankMesh.setTexCoords(app.models.tank.textures);
            // tankMesh.setIndices(app.models.tank.indices);
            // tankMesh.setTexture(app.glTextures.blank);
            // tankMesh.setFlipYaw();
            // app.meshes.tank = tankMesh;

            bindWebUI(gl, edgeGl);

        };

        edgeGl.start();
    }
});



/**
 * Binds any web UI inputs, controls etc.
 */
function bindWebUI(gl, edgeGl) {
    document.querySelectorAll('input[name="renderModeOverride"]').forEach((element) => {
        element.addEventListener('change', (event) => {

            switch (parseInt(event.target.value)) {
                case 0: edgeGl.options.renderModeOverride = null; break;
                case 1: edgeGl.options.renderModeOverride = gl.LINES; break;
                case 2: edgeGl.options.renderModeOverride = gl.POINTS; break;
            }

            Object.values(edgeGl.sceneObjects).forEach((sceneObject) => {

                if (edgeGl.options.renderModeOverride !== null) {
                    sceneObject.setRenderModeOverride(edgeGl.options.renderModeOverride);
                } else {
                    sceneObject.disableRenderModeOverride();
                }

            });
        });
    });


    document.querySelector('input[name="renderNormals"]').addEventListener('change', (event) => {
        edgeGl.options.renderNormals = (event.target.checked);
        edgeGl.sceneObjects.terrainNormalDebug.setEnabled(edgeGl.options.renderNormals);
    });


    document.querySelectorAll('input[class="diffuse"]').forEach((element) => {
        element.addEventListener('change', (event) => {
            edgeGl.lights.light0.setDiffuse(
                document.getElementById('diffuseR').value,
                document.getElementById('diffuseG').value,
                document.getElementById('diffuseB').value,
            );
        });
    });

    document.querySelectorAll('input[class="specular"]').forEach((element) => {
        element.addEventListener('change', (event) => {
            edgeGl.lights.light0.setSpecular(
                document.getElementById('specularR').value,
                document.getElementById('specularG').value,
                document.getElementById('specularB').value,
            );
        });
    });

    document.querySelectorAll('input[class="sunPos"]').forEach((element) => {
        element.addEventListener('change', (event) => {

            const x = document.getElementById('sunPosX').value;
            const y = document.getElementById('sunPosY').value;
            const z = document.getElementById('sunPosZ').value;

            if (edgeGl.lights.light0.type == 0) {
                edgeGl.lights.light0.setDirection(x, y, z);
            } else {
                edgeGl.lights.light0.setPosition(x, y, z);
            }
        });
    });

    document.querySelectorAll('input[class="fog"]').forEach((element) => {
        element.addEventListener('change', (event) => {
            edgeGl.fogSettings.near = document.getElementById('fogNear').value;
            edgeGl.fogSettings.far = document.getElementById('fogFar').value;
        });
    });

    document.querySelector('input[class="shininess"]').addEventListener('change', (event) => {
        edgeGl.lightSettings.shininess = document.getElementById('shininess').value;
    });

    document.querySelector('select[class="sunType"]').addEventListener('change', (event) => {
        edgeGl.lights.light0.setType(document.getElementById('sunType').value);

        if (edgeGl.lights.light0.type == 0) {
            document.getElementById('sunPosX').value = edgeGl.lights.light0.getDirection().x;
            document.getElementById('sunPosY').value = edgeGl.lights.light0.getDirection().y;
            document.getElementById('sunPosZ').value = edgeGl.lights.light0.getDirection().z;
        } else {
            document.getElementById('sunPosX').value = edgeGl.lights.light0.getPosition().x;
            document.getElementById('sunPosY').value = edgeGl.lights.light0.getPosition().y;
            document.getElementById('sunPosZ').value = edgeGl.lights.light0.getPosition().z;
        }
    });

    document.querySelector('select[class="normalMapping"]').addEventListener('change', (event) => {
        edgeGl.lightSettings.useNormalMapping = parseInt(document.getElementById('normalMapping').value);
    });

    document.querySelector('select[class="correctD3d"]').addEventListener('change', (event) => {
        edgeGl.lightSettings.correctD3d = parseInt(document.getElementById('correctD3d').value);
    });

    document.querySelector('input[class="waterLevel"]').addEventListener('change', (event) => {
        edgeGl.waterSettings.level = parseInt(document.getElementById('waterLevel').value);
        edgeGl.frameBuffers.fboReflection.shaderUniforms = {
            clipPlane: [0, 1, 0, -edgeGl.waterSettings.level]
        };

        edgeGl.frameBuffers.fboRefraction.shaderUniforms = {
            clipPlane: [0, -1, 0, edgeGl.waterSettings.level]
        };
    });

    document.querySelector('input[class="waterOffset"]').addEventListener('change', (event) => {

        edgeGl.frameBuffers.fboReflection.cameraParams.yOffset = parseInt(document.getElementById('waterOffset').value);
        // edgeGl.frameBuffersfboReflection.shaderUniforms = {
        //     clipPlane: [0, -1, 0, edgeGl.frameBuffers.fboReflection.cameraParams.yOffset]
        // };
    });


    document.getElementById('faultLineForm').onsubmit = (e) => {

        e.preventDefault();

        const w = document.getElementById('newWidth').value;
        const h = document.getElementById('newHeight').value;
        const steps = document.getElementById('newSteps').value;

        edgeGl.heightmaps.main.initWithFaultLine(w, h, steps, () => {
            const terrain = new Terrain();
            terrain.setStretch(8);
            terrain.initWithHeightmap(edgeGl.heightmaps.main);
            terrain.populateSceneObject(edgeGl.sceneObjects.terrain);
            terrain.populateNormalDebugSceneObject(edgeGl.sceneObjects.terrainNormalDebug);
        });

    };

    let uiVisible = true;

    document.getElementById('toggleUI').onclick = () => {

        if (uiVisible) {
            document.getElementById('topRight').style.display = 'none';
            document.getElementById('bottomRight').style.display = 'none';
        } else {
            document.getElementById('topRight').style.display = 'block';
            document.getElementById('bottomRight').style.display = 'block';
        }


        uiVisible = !uiVisible;
    };
}
