  /**
   * VectorMath.js
   *
   * Various math helper methods for vectors.
   *
   * @author James Edgeworth (https://jamesedgeworth.com)
   */

  /**
   * Calculates which direction a vector is heading in.
   * @param  {[type]} v [description]
   * @return {[type]}   [description]
   */
  function angleForVector(v) {
    let angle = Math.atan(v[0] / v[1]) * (180 / 3.14);

    if (v[1] < 0) angle = angle + 180;

    return angle;
}

/**
 * Use this on any rotations to stop them getting stupidly high angles.
 * @param  {[type]} a [description]
 * @return {[type]}   [description]
 */
function wrapAngle(a) {
    if (a < 0) a += 360.0;
    else if (a > 360.0) a -= 360.0;

    return a;
}

/**
 * Checks if two coordinates are equal (when rounded).
 * @param  {[type]} v1 [description]
 * @param  {[type]} v2 [description]
 * @return {[type]}    [description]
 */
function pointEqualToPoint(v1, v2) {
    return (Math.round(v1[0]) == Math.round(v2[0]) &&
            Math.round(v1[1]) == Math.round(v2[1]) &&
            Math.round(v1[2]) == Math.round(v2[2]));
}

/**
 * Converts radians to degrees.
 * @param  {[type]} rad [description]
 * @return {[type]}     [description]
 */
function radToDeg(rad) {
    return (rad * 180) / 3.141;
}


function getVelocity(destination, position, speed) {
    let velocity = destination.subtract(position);
    velocity = velocity.toUnitVector();

    return velocity.multiply(speed);

}

module.exports = {
    angleForVector,
    wrapAngle,
    pointEqualToPoint,
    radToDeg,
    getVelocity,
};
