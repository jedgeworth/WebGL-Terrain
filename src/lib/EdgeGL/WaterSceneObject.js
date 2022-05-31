/**
 * WaterSceneObject.js
 *
 * Creates a water plane.
 *
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

 const QuadPlanePrimitive = require('./Primitives/QuadPlanePrimitive');
 const SceneObject = require('./SceneObject');


 module.exports = class WaterSceneObject extends SceneObject {

    /**
     *
     * @param {*} gl
     */
     constructor(gl) {

        super(gl);

        this.waterMovement = 0.0;
     }

     /**
      *
      * @param {*} appRegistry
      */
     render(appRegistry) {

        this.shaderProgram.use();

        if (appRegistry.delta) {
            this.waterMovement += appRegistry.delta * 0.00003;
            this.waterMovement %=1;
        }

        this.shaderProgram.setUniform1f('u_WaterMovement', this.waterMovement);
        this.shaderProgram.setUniform1f('u_UseDudvMap', 1);

        super.render(appRegistry, true);
     }
 }
