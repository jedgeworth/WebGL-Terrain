/**
 * Primitives/SpherePrimtive.js
 *
 * Defines a sphere.
 *
 *
 * @author James Edgeworth (https://jamesedgeworth.com)
 */

 module.exports = class SpherePrimitive {

    constructor(gl, radius, slices, stacks) {
        this.vertices = [];
        this.texCoords = [];
        //this.indices = [];
        this.normals = [];

        const PI = 3.1415926535897;
        const drho = PI / stacks;
        const dtheta = 2.0 * PI / slices;
        const ds = 1.0 / slices;
        const dt = 1.0 / stacks;
        let t = 1.0;
        let s = 0.0;

        for (let i = 0; i < stacks; i+= 1) {
            const rho = i * drho;
            const srho = Math.sin(rho);
            const crho = Math.cos(rho);
            const srhodrho = Math.sin(rho + drho);
            const crhodrho = Math.cos(rho + drho);

            s = 0.0;

            for (let j = 0; j < slices; j += 1) {
                const theta = (j == slices) ? 0.0 : j * dtheta;
                const stheta = -Math.sin(theta);
                const ctheta = Math.cos(theta);

                let x = stheta * srho;
                let y = ctheta * srho;
                let z = crho;

                this.texCoords.push(s);
                this.texCoords.push(t);

                this.normals.push(x);
                this.normals.push(y);
                this.normals.push(z);

                this.vertices.push(x * radius);
                this.vertices.push(y * radius);
                this.vertices.push(z * radius);


                x = stheta * srhodrho;
                y = ctheta * srhodrho;
                z = crhodrho;

                this.texCoords.push(s);
                this.texCoords.push(t - dt);

                s += ds;

                this.normals.push(x);
                this.normals.push(y);
                this.normals.push(z);

                this.vertices.push(x * radius);
                this.vertices.push(y * radius);
                this.vertices.push(z * radius);
            }

            t -= dt;
        }


        this.renderMode = gl.TRIANGLE_STRIP;
    }
}
