/**
 * Primitives/DomePrimtive.js
 *
 * Defines a dome.
 *
 *
 * @author James Edgeworth (https://jamesedgeworth.com)
 */

 module.exports = class DomePrimitive {

    constructor(gl, radius, dampen, slices, sides) {
        this.vertices = [];
        this.texCoords = [];
        this.indices = [];
        this.normals = [];

        const PI = 3.1415926535897;

        const totalVertexEntries = ((slices +1) * (sides +1)) * 3;
        const polyAngle = 2.0 * (PI / sides);

        for (let j = 0; j <= slices; j+= 1) {
            let angle = j * ( (PI/2) / slices );

            for (let i = 0; i <= sides; i += 1) {
                let vx = Math.cos(i * polyAngle) * Math.cos(angle);
                let vy = dampen * Math.sin(angle);
                let vz = Math.sin(i * polyAngle) * Math.cos(angle);

                this.vertices.push(vx * radius);
                this.vertices.push(vy * radius);
                this.vertices.push(vz * radius);

                this.texCoords.push( i / sides );
                this.texCoords.push( j / slices );

                this.normals.push(1.0);
                this.normals.push(1.0);
                this.normals.push(1.0);

                // this.vertices[j * (sides + 1) + i] = vx * skyRadius;
                // this.vertices[j * (sides + 1) + i] = vx * skyRadius;
                // this.vertices[j * (sides + 1) + i] = vx * skyRadius;
            }
        }

        const totalIndices = (slices * (sides +1)) * 2;

        for (let j = 1; j <= slices; j += 1) {
            for (let i = 0; i <= sides; i += 1) {
                this.indices.push(  j      * (sides + 1) + i );
                this.indices.push( (j - 1) * (sides + 1) + i );
            }
        }


        this.renderMode = gl.TRIANGLE_STRIP;
    }
}
