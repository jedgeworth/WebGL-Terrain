/**
 * NodePath.js
 *
 * Defines a collection of points which an object will move between.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */


 const Vector3 = require('./types/Vector3');
 const {
    angleForVector,
    radToDeg,
    getVelocity,
    distanceBetween,
    addVector,
} = require('./VectorMath');

 const modesEnum = {
     LOOP: 1,
     REPEAT: 2,
     ONCE: 3
 };

 module.exports = class NodePath {

     /**
      *
      */
    constructor() {

        this.points = [
            new Vector3(0.0, 500.0, 0.0),
            new Vector3(0.0, 500.0, 2000.0),
            new Vector3(2000.0, 500.0, 2000.0),
            new Vector3(2000.0, 500.0, 0.0)
        ];

        this.threshold = 10.0;
        this.mode = modesEnum.LOOP;

        this.sceneObjects = [];
    }

    /**
     * Adds a sceneObject.
     * @param {*} sceneObject
     */
    addSceneObject(sceneObject) {
        this.sceneObjects.push({
            sceneObject: sceneObject,
            nextNodeNum: 0,
            velocity: null
        });
    }

    /**
     * Updates a sceneObject.
     *
     * Intended to be called by this.tick().
     *
     * @param {*} sceneObjectData As defined by addSceneObject.
     * @param {*} delta Time difference since the last frame.
     */
    updateSceneObject(sceneObjectData, delta) {

        const targetPoint = this.points[ sceneObjectData.nextNodeNum ];

        if ( distanceBetween(sceneObjectData.sceneObject.position, targetPoint) < this.threshold ) {
            sceneObjectData.nextNodeNum += 1;

            if (sceneObjectData.nextNodeNum == this.points.length) {
                // We've reached the end of the path.

                if (this.mode == modesEnum.REPEAT) {
                    sceneObjectData.nextNodeNum = 0;
                    sceneObjectData.sceneObject.position = this.points[0];
                } else if (this.mode == modesEnum.LOOP) {
                    sceneObjectData.nextNodeNum = 0;
                } else {
                    sceneObjectData.nextNodeNum = sceneObjectData.nextNodeNum -= 1;
                }
            }

            const velocityVector = getVelocity(
                this.points[sceneObjectData.nextNodeNum],
                sceneObjectData.sceneObject.position,
                (50 * delta / 1000)
            );

            sceneObjectData.velocity = velocityVector;

            sceneObjectData.sceneObject.setPositionVector(addVector(
                sceneObjectData.sceneObject.position,
                velocityVector
            ));

            const rotation = radToDeg( angleForVector(sceneObjectData.velocity) );
            sceneObjectData.sceneObject.yaw = rotation;
        } else {
            // Keep moving.
            const velocityVector = getVelocity(
                this.points[sceneObjectData.nextNodeNum],
                sceneObjectData.sceneObject.position,
                (500 * delta / 1000)
            );

            sceneObjectData.velocity = velocityVector;

            sceneObjectData.sceneObject.setPositionVector(addVector(
                sceneObjectData.sceneObject.position,
                velocityVector
            ));
        }
    }

    /**
     * Called once per render loop to update positions.
     * @param {*} delta Time difference since the last frame.
     */
    tick(delta) {
        for (let i = 0; i < this.sceneObjects.length; i += 1) {
            this.updateSceneObject(this.sceneObjects[i], delta);
        }
    }


}
