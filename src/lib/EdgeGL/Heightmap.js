/**
 * Heightmap.js
 *
 * Loads, or generates a heightmap.
 *
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

 const Vector3 = require('./types/Vector3');
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
        this.canvas.id = 'heightmap';
        document.getElementById('debug').appendChild(this.canvas);

        heightmapImage.onload = () => {
            this.width = heightmapImage.width;
            this.height = heightmapImage.height;

            // Ensure dimensions are even.
            if (this.width % 2) {
                this.width -=1;
            }

            if (this.height % 2) {
                this.height -=1;
            }

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
            //document.getElementById('debug').appendChild(this.canvas);
            this.drawToCanvas();

            callback();
        };
        heightmapImage.src = fileName;
    }

    /**
     * Create heightmap via the faultline algorithm.
     *
     * @todo: Write data as image2D.
     */
    initWithFaultLine(width, height, countSteps, callback) {

        this.width = width;
        this.height = height;

        let x1, x2, z1, z2;

        let faultVector = new Vector3();
        let loopVector = new Vector3();

        for (let x = 0; x < this.width; x += 1) {
            this.heightValues[x] = [];

            for (let z = 0; z < this.width; z += 1) {

                this.heightValues[x][z] = 0;
            }
        }

        this.drawToCanvas();

        for (let i = 0; i < countSteps; i += 1) {
            x1 = Math.random() * this.width;
            z1 = Math.random() * this.height;

            x2 = Math.random() * this.width;
            z2 = Math.random() * this.height;

            faultVector.x = x2 - x1;
            faultVector.z = z2 - z1;

            for (let x = 0; x < this.width; x += 1) {

                for (let z = 0; z < this.width; z += 1) {

                    loopVector.x = x2 - x;
                    loopVector.z = z2 - z;

                    if ( (faultVector.x * loopVector.z) - (faultVector.z * loopVector.x) > 0 ) {
                        this.heightValues[x][z] += 1;
                    } else {
                        this.heightValues[x][z] -= 1;
                    }
                }
            }
        }

        this.calculateRange();
        this.postProcess();
        this.drawToCanvas();

        callback();
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

    /**
     *
     */
    drawToCanvas() {

        this.canvas.style.width = '200px';
        this.canvas.style.height = '200px';

        //document.getElementById('debug').appendChild(this.canvas);


        let ctx = this.canvas.getContext('2d');

        this.canvas.width = this.width;
        this.canvas.height = this.height;

        for (let x = 0; x < this.width; x += 1) {
            for (let z = 0; z < this.height; z += 1) {
                this.heightValues[x][z] -= this.lowValue;

                ctx.strokeStyle = `rgb(${this.heightValues[x][z]}, ${this.heightValues[x][z]}, ${this.heightValues[x][z]})`;
                ctx.strokeRect(x, z, 1, 1);
                ctx.strokeStyle = '#000';
            }
        }


    }


}
