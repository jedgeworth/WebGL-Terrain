/**
 * Texture.js
 *
 * Creates a texture group from a set of image files.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */
 module.exports = class Texture {

    static get TypeTexture() { return 0 };
    static get TypeNormal() { return 1 };
    static get TypeHeightmap() { return 2 };
    static get TypeDUDV() { return 3 };

    /**
     * constructor.
     *
     * @param {*} glContext gl context object.
     */
    constructor(glContext, name) {
        this.gl = glContext;
        this.name = name;

        this.glTexture = null;
        this.glTextureNormal = null;
        this.glTextureHeightmap = null;
        this.glTextureDUDV = null;

        this.onLoad = null;
    }

    /**
     * Sets the texture buffer.
     * @param {*} image
     * @returns
     */
    setTexture(image) {
        this.glTexture = this.createGlTexture(image);

        return this;
    }

    /**
     * Sets an already defined glTexture.
     *
     * @param {*} glTexture
     */
    setGlTexture(glTexture) {
        this.glTexture = glTexture;
    }

    /**
     * Sets the normal buffer.
     * @param {*} image
     * @returns
     */
     setNormal(image) {
        this.glTextureNormal = this.createGlTexture(image);

        return this;
    }

    /**
     * Sets the heightmap buffer.
     * @param {*} image
     * @returns
     */
     setHeightmap(image) {
        this.glTextureHeightmap = this.createGlTexture(image);

        return this;
    }

    /**
     * Sets the DUDV buffer.
     * @param {*} image
     * @returns
     */
     setDUDV(image) {
        this.glTextureDUDV = this.createGlTexture(image);

        return this;
    }


    /**
     * Converts a loaded image into a GL_TEXTURE buffer.
     * @param {*} image Image data, already read from a file.
     */
    createGlTexture(image) {

        const _glTexture = this.gl.createTexture();

        this.gl.bindTexture(this.gl.TEXTURE_2D, _glTexture);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        return _glTexture;
    }
}
