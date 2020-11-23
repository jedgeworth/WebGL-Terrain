/**
 * Terrain.js
 *
 * Prepares a terrain from a Heightmap object.
 *
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

const Vector12 = require('./types/Vector12');
const {normalize} = require('./VectorMath');

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
        this.createIndexes();
    }

    /**
     * Loads vertices from heightmap data.
     */
    createVertices() {
        const tileStepX = this.textureTiling / this.heightmap.width;
        const tileStepZ = this.textureTiling / this.heightmap.height;

        this.verts = new Array(this.heightmap.width * this.heightmap.height);

        for (let x = 0; x < this.heightmap.width; x += 1) {
            for (let z = 0; z < this.heightmap.height; z += 1) {
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
     */
    createNormals() {
        for (let x = 1; x < this.heightmap.width - 1; x += 1) {
            for (let z = 1; z < this.heightmap.height - 1; z += 1) {


            }
        }
    }

    /**
     * Create indexes.
     */
    createIndexes() {
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

            bufferNormals.push(1.0);
            bufferNormals.push(1.0);
            bufferNormals.push(1.0);
        }

        sceneObject.setVertices(bufferVertices);
        sceneObject.setColors(bufferColors);
        sceneObject.setTexCoords(bufferTexCoords);
        sceneObject.setIndices(this.indices);

    }
}
