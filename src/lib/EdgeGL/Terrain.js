/**
 * Terrain.js
 *
 * Prepares a terrain from a Heightmap object.
 *
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

const Vector12 = require('./types/Vector12');
const Vector3 = require('./types/Vector3');
const {normalize, normalizePosition, crossVector, addVector, divideVector} = require('./VectorMath');

module.exports = class Terrain {

    constructor() {
        this.width = 0;
        this.height = 0;
        this.lowValue = 0;
        this.highValue = 0;

        this.heightmap = null;
        this.sceneObject = null;
        this.xMax = 0;
        this.zMax = 0;

        this.stretch = 4;
        this.textureTiling = 128.0;
        this.centralize = false;

        this.verts = []; // Vector12
        this.indices = [];
    }

    /**
     *
     * @param {*} stretch
     */
    setStretch(stretch) {
        this.stretch = stretch;
    }

    /**
     *
     * @param {*} centralize
     */
    setCentralize(centralize) {
        this.centralize = centralize;
    }

    /**
     * Initialises the terrain data.
     *
     * @param {*} heightmap Heightmap object.
     */
    initWithHeightmap(heightmap) {
        this.heightmap = heightmap;

        this.width = heightmap.width * this.stretch;
        this.length = heightmap.height * this.stretch;

        this.lowValue = heightmap.lowValue;
        this.highValue = heightmap.highValue;

        this.xMax = this.width;
        this.zMax = this.length;

        this.createVertices();
        this.createTriangleStripIndexes();
        this.createNormals();
    }

    /**
     * Loads vertices from heightmap data.
     */
    createVertices() {
        const tileStepX = this.textureTiling / this.heightmap.width;
        const tileStepZ = this.textureTiling / this.heightmap.height;

        this.verts = new Array(this.heightmap.width * this.heightmap.height);

        for (let z = 0; z < this.heightmap.height; z += 1) {
            for (let x = 0; x < this.heightmap.width; x += 1) {
                const vert = new Vector12();
                const y = this.heightmap.heightValues[x][z];

                // Position
                vert.x = x * this.stretch;
                vert.y = y;
                vert.z = z * this.stretch;

                // Colour
                const normalizedColor = normalize(y, this.lowValue, this.highValue);

                vert.r = normalizedColor;
                vert.g = normalizedColor;
                vert.b = normalizedColor;
                vert.a = 1.0;

                // Texcoords
                vert.s = x * tileStepX;
                vert.t = z * tileStepZ;

                this.verts[(x * this.heightmap.width) + z] = vert;
            }
        }
    }

    /**
     * Create surface normals.
     *
     * x    x    x
     *
     *
     * x    x    x
     *
     *
     * x    x    x
     */
    createNormals() {
        for (let z = 1; z < this.heightmap.height - 1; z += 1) {
            for (let x = 1; x < this.heightmap.width - 1; x += 1) {

                let top = new Vector12();
                let bottom = new Vector12();
                let left = new Vector12();
                let right = new Vector12();

                let crossRT = new Vector3();
                let crossBR = new Vector3();
                let crossLB = new Vector3();
                let crossTL = new Vector3();

                top    = this.verts[ ((x + 1) * this.heightmap.width) + z ];
                bottom = this.verts[ ((x - 1) * this.heightmap.width) + z ];
                left   = this.verts[ (x * this.heightmap.width) + z - 1 ];
                right  = this.verts[ (x * this.heightmap.width) + z + 1 ];

                crossRT = crossVector(right, top);
                crossTL = crossVector(top, left);
                crossBR = crossVector(bottom, right);
                crossLB = crossVector(left, bottom);

                let avg = addVector(crossRT, crossTL);
                avg = addVector(avg, crossBR);
                avg = addVector(avg, crossLB);
                avg = divideVector(avg, 4.0);

                normalizePosition(avg);

                this.verts[(x * this.heightmap.width) + z].nx = avg.x;
                this.verts[(x * this.heightmap.width) + z].ny = avg.y;
                this.verts[(x * this.heightmap.width) + z].nz = avg.z;

            }
        }
    }

    /**
     * Create GL_TRIANGLE_STRIP indexes.
     *
     */
    createTriangleStripIndexes() {
        let i = 0;

        const numStrips = this.heightmap.height - 1;
        const numDegens = 2 * (numStrips - 1);
        const vertsPerStrip = 2 * this.heightmap.width;

        this.indices = new Uint16Array((vertsPerStrip * numStrips) + numDegens);

        for (let z = 0; z < numStrips; z++) {

            // Degenerate triangle
            if (z > 0) {
                this.indices[i++] = (z * this.heightmap.width);
            }

            for (let x = 0; x < this.heightmap.width; x++) {
                this.indices[i++] = x + ( z      * this.heightmap.width);
                this.indices[i++] = x + ((z + 1) * this.heightmap.width);
            }

            // Degenerate triangle
            if (z != this.heightmap.height - 2) {
                this.indices[i++] = (((z + 1) * this.heightmap.width) + (this.heightmap.width - 1));
            }
        }
    }

    /**
     * Create GL_TRIANGLE indexes.
     *
     */
     createTriangleIndexes() {
        let i = 0;

        this.indices = [];

        const w = this.heightmap.width;

        for (let z = 0; z < this.heightmap.height-1; z += 1) {
            for (let x = 0; x < this.heightmap.width-1; x += 1) {

                this.indices.push( ( z      * w) + x );		//TL
                this.indices.push( ((z + 1) * w) + x );		//BL
                this.indices.push( ((z + 1) * w) + x + 1 );	//BR

                this.indices.push( ((z + 1) * w) + x + 1 );	//BR
                this.indices.push( ( z      * w) + x + 1 );	//TR
                this.indices.push( ( z      * w) + x );		//TL
            }
        }

        this.indices = Uint16Array.from(this.indices);
    }


    /**
     * Creates a SceneObject to draw normals.
     */
    populateNormalDebugSceneObject(sceneObject) {
        let bufferVertices = [];
        let bufferColors = [];

        for (let i = 0; i < this.verts.length; i += 1) {

            bufferVertices.push(this.verts[i].x);
            bufferVertices.push(this.verts[i].y);
            bufferVertices.push(this.verts[i].z);

            bufferColors.push(1.0);
            bufferColors.push(0.0);
            bufferColors.push(0.0);

            bufferVertices.push(this.verts[i].x + (5.0 * this.verts[i].nx));
            bufferVertices.push(this.verts[i].y + (5.0 * this.verts[i].ny));
            bufferVertices.push(this.verts[i].z + (5.0 * this.verts[i].nz));

            bufferColors.push(0.0);
            bufferColors.push(1.0);
            bufferColors.push(0.0);

        }

        sceneObject.setVertices(bufferVertices);
        sceneObject.setColors(bufferColors);
    }


    /**
     * Exports terrain to a scene object.
     *
     * @param {*} sceneObject Object to populate.
     */
    populateSceneObject(sceneObject) {

        let bufferVertices = [];
        let bufferColors = [];
        let bufferTexCoords = [];
        let bufferNormals = [];

        for (let i = 0; i < this.verts.length; i += 1) {
            bufferVertices.push(this.verts[i].x);
            bufferVertices.push(this.verts[i].y);
            bufferVertices.push(this.verts[i].z);

            bufferColors.push(this.verts[i].r);
            bufferColors.push(this.verts[i].g);
            bufferColors.push(this.verts[i].b);

            bufferTexCoords.push(this.verts[i].s);
            bufferTexCoords.push(this.verts[i].t);

            bufferNormals.push(this.verts[i].nx);
            bufferNormals.push(this.verts[i].ny);
            bufferNormals.push(this.verts[i].nz);
        }

        sceneObject.setVertices(bufferVertices);
        sceneObject.setColors(bufferColors);
        sceneObject.setTexCoords(bufferTexCoords);
        sceneObject.setNormals(bufferNormals);
        sceneObject.setIndices(this.indices);

    }
}
