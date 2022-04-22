/**
 * AppRegistry.js
 *
 * Contains loaded assets, GL Textures, models, shaders, etc.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */
module.exports = class AppRegistry{

    constructor() {
        this.models = {};
        this.textureImages = {};
        this.heightmaps = {};
        this.glTextures = {};
        this.shaders = {};
        this.sceneObjects = {};
        this.terrains = {};
        this.nodePaths = {};
        this.lights = {};
        this.camera = null;
        this.lastUpdateTime = 0;

        this.modelsLoaded = false;
        this.texturesLoaded = false;

        this.options = {
            isRenderModeLines: false
        };
    }

}
