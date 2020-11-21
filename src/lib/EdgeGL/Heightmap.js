/**
 * Heightmap.js
 *
 * Loads, or generates a heightmap.
 *
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

module.exports = class Heightmap {

    constructor() {
        this.width = 0;
        this.height = 0;
        this.heightValues = [];
        this.lowValue = 0;
        this.highValue = 0;
        this.canvas = null;

    }

    /**
     * Initialise heightmap with an image file.
     *
     * @param {*} fileName path to filename.
     */
    initWithFile(fileName, callback) {
        const heightmapImage = new Image();
        this.canvas = document.createElement('canvas');

        heightmapImage.onload = () => {
            this.width = heightmapImage.width;
            this.height = heightmapImage.height;

            this.canvas.width = this.width;
            this.canvas.height = this.height;

            this.canvas.getContext('2d').drawImage(heightmapImage, 0, 0, this.width, this.height);

            for (let i = 0; i < this.width; i += 1) {
                this.heightValues[i] = [];

                for (let j = 0; j < this.height; j += 1) {
                    const imageData = this.canvas.getContext('2d').getImageData(i, j, 1, 1);
                    this.heightValues[i][j] = parseFloat(imageData.data[0]);
                }
            }

            this.calculateRange();
            this.postProcess();

            // For very temporary debug purposes.
            document.getElementById('debug').appendChild(this.canvas);

            callback();
        };
        heightmapImage.src = fileName;
    }

    /**
     * Determines the lowest and highest Y values.
     */
    calculateRange() {
        this.highValue = 0.0;
        this.lowValue = 100000.0;

        for (let x = 0; x < this.width; x += 1) {
            for (let z = 0; z < this.height; z += 1) {
                if (this.heightValues[x][z] < this.lowValue) {
                    this.lowValue = this.heightValues[x][z];
                }

                if (this.heightValues[x][z] > this.highValue) {
                    this.highValue = this.heightValues[x][z];
                }
            }
        }
    }

    /**
     * Perform any post processing (normalisation, etc)
     */
    postProcess() {
        for (let x = 0; x < this.width; x += 1) {
            for (let z = 0; z < this.height; z += 1) {
                this.heightValues[x][z] -= this.lowValue;
            }
        }

        this.highValue -= this.lowValue;
        this.lowValue = 0.0;
    }


}
