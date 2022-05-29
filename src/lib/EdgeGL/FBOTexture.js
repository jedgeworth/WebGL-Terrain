/**
 * FBOTexture.js
 *
 * Defines a framebuffer texture.
 *
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

const Texture = require("./Texture");

module.exports = class FBOTexture {

    constructor(gl, textureObject) {

        this.gl = gl;

        this.width = 0;
        this.height = 0;
        this.activeTextureId = null;

        this.fbo = 0;
        this.renderBuffer = null;

        this.texture = null;

        this.cameraParams = null;

        // Contains uniforms to pass to the shader only when rendering to
        // this FBO.
        this.shaderUniforms = null;

        if (textureObject !== undefined) {
            this.texture = textureObject;
        }
    }


    /**
     * Create the render buffer texture target.
     *
     * @param {*} width
     * @param {*} height
     */
    init(width, height) {

        this.width = width;
        this.height = height;

        if (!this.texture) {
            this.texture = new Texture();
        }

        this.fbo = this.gl.createFramebuffer();

        if (!this.fbo) {
            throw "FBOTexture: Could not create frame buffer."
        }

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);



        this.renderBuffer = this.gl.createRenderbuffer();

        if (!this.renderBuffer) {
            throw "FBOTexture: Could not create render buffer.";
        }

        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderBuffer);

        const glTexture = this.gl.createTexture();

        if (!glTexture) {
            throw "FBOTexture: Could not create texture.";
        }

        this.gl.bindTexture(this.gl.TEXTURE_2D, glTexture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.FLOAT, null);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);


        //
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, glTexture, 0);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.width, this.height);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.renderBuffer);

        const status = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);

        if (status != this.gl.FRAMEBUFFER_COMPLETE) {
            throw "FBOTexture: Could not successfully bind framebuffer: "+ status.toString();
        }

        this.texture.setGlTexture(glTexture);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
    }


    startRender() {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
        this.gl.clearColor(0.392, 0.584, 0.929, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.viewport(0, 0, this.width, this.height);
        this.gl.enable(this.gl.DEPTH_TEST);
    }

    endRender(defaultWidth, defaultHeight) {
        //this.gl.disable(this.gl.CLIP_PLANE0);
        //this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, null, 0);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        //this.gl.viewport(0, 0, defaultWidth, defaultHeight);

    }

}
