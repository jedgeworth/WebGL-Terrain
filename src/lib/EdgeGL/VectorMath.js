  /**
   * VectorMath.js
   *
   * Various math helper methods for vectors.
   *
   * @author James Edgeworth (https://jamesedgeworth.com)
   */

  const Vector3 = require('./types/Vector3');

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


/**
 * Noramlise a single value.
 * @param {*} value Value to normalize.
 * @param {*} low  Low value in range.
 * @param {*} high High value in range.
 */
function normalize(value, low, high) {
    return (value - low) / (high - low);
}


/**
 * Normalise position coordinates in an object.
 * Acts on the object - does not return.
 *
 * @param {*} v A "Vector*" object containing x, y, z coordinates.
 */
function normalizePosition(v) {
    const length = Math.sqrt((v.x * v.x) + (v.y * v.y) + (v.z * v.z));

    v.x /= length;
    v.y /= length;
    v.z /= length;
}

function zeroPosition(v)
{
    v.x = 0;
    v.y = 0;
    v.z = 0;
}

/**
 *
 * Creates a Vector3 with the cross product of two "Vector*"'s.
 * @param {*} v1 First vector.
 * @param {*} v2 Second vector.
 */
function crossVector(v1, v2) {
    result = new Vector3();

    result.x = (v1.x * v2.z) - (v1.z * v2.y);
    result.y = (v1.z * v2.x) - (v1.x * v2.z);
    result.z = (v1.x * v2.y) - (v1.y * v2.x);

    return result;
}

function addVector(v1, v2) {
    result = new Vector3();

    result.x = v1.x + v2.x;
    result.y = v1.y + v2.y;
    result.z = v1.z + v2.z;

    return result;
}

function subtractVector(v1, v2) {
    result = new Vector3();

    result.x = v1.x - v2.x;
    result.y = v1.y - v2.y;
    result.z = v1.z - v2.z;

    return result;
}

function divideVector(v, value) {
    result = new Vector3();

    result.x = v.x / value;
    result.y = v.y / value;
    result.z = v.z / value;

    return result;
}

module.exports = {
    angleForVector,
    wrapAngle,
    pointEqualToPoint,
    radToDeg,
    getVelocity,

    normalize,
    normalizePosition,
    zeroPosition,
    crossVector,
    addVector,
    subtractVector,
    divideVector,
};
