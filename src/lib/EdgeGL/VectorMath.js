  /**
   * VectorMath.js
   *
   * Various math helper methods for vectors.
   *
   * @author James Edgeworth (https://jamesedgeworth.com)
   */

  const Vector3 = require('./types/Vector3');

  const PI = 3.14159265359;

  /**
   * Calculates which direction a vector is heading in.
   * @param  {Vector3} v "Vector*" to calculate angle for.
   * @return {[type]}   [description]
   */
  function angleForVector(v) {
    let angle = Math.atan(v.x / v.y) * (180.0 / PI);

    if (v.y < 0) {
        angle = angle + 180.0;
    }

    return angle;
}

/**
 *
 * @param {*} v
 * @returns
 */
function magnitudeForVector(v) {
    return Math.sqrt( (v.x * v.x) + (v.y * v.y) + (v.z * v.z) );
}

/**
 * Use this on any rotations to stop them getting stupidly high angles.
 * @param  {float} a Angle to check.
 * @return {float}   New angle, wrapped if needed.
 */
function wrapAngle(a) {
    if (a < 0) {
        a += 360.0;
    } else if (a > 360.0) {
        a -= 360.0;
    }

    return a;
}

/**
 * Checks if two coordinates are equal (when rounded).
 * @param  {Vector3} v1 "Vector*" object.
 * @param  {Vector3} v2 "Vector*" object.
 * @return {bool}    True if equal.
 */
function pointEqualToPoint(v1, v2) {
    return (Math.round(v1.x) == Math.round(v2.x) &&
            Math.round(v1.x) == Math.round(v2.x) &&
            Math.round(v1.x) == Math.round(v2.x));
}


/**
 * Finds the distance between two vectors.
 *
 * @param {Vector3} v1 "Vector*" object.
 * @param {Vector3} v2 "Vector*" object.
 * @return {float} The distance.
 */
function distanceBetween(v1, v2) {
    const x = v2.x - v1.x;
    const y = v2.y - v1.y;
    const z = v2.z - v1.z;

    return Math.sqrt((x*x) + (y*y) + (z+z));
}

/**
 * Converts radians to degrees.
 * @param  {[type]} rad [description]
 * @return {[type]}     [description]
 */
function radToDeg(rad) {
    return rad * (180.0 / PI);
}

function degToRad(deg) {
    return deg * (PI / 180.0);
}

/**
 * Gets the velocity.
 *
 * @param {Vector3} destinationVector Vector* object
 * @param {Vector3} positionVector Vector* object
 * @param {Vector3} speed speed
 */
function getVelocity(destinationVector, positionVector, speed) {

    const velocityVector = subtractVector(destinationVector, positionVector);
    normalizePosition(velocityVector);

    return multiplyVector(velocityVector, speed);
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
    const result = new Vector3();

    result.x = (v1.y * v2.z) - (v1.z * v2.y);
    result.y = (v1.z * v2.x) - (v1.x * v2.z);
    result.z = (v1.x * v2.y) - (v1.y * v2.x);

    return result;
}

function addVector(v1, v2) {
    const result = new Vector3();

    result.x = v1.x + v2.x;
    result.y = v1.y + v2.y;
    result.z = v1.z + v2.z;

    return result;
}

function subtractVector(v1, v2) {
    const result = new Vector3();

    result.x = v1.x - v2.x;
    result.y = v1.y - v2.y;
    result.z = v1.z - v2.z;

    return result;
}

function multiplyVector(v, value) {
    const result = new Vector3();

    result.x = v.x * value;
    result.y = v.y * value;
    result.z = v.z * value;

    return result;
}

function divideVector(v, value) {
    const result = new Vector3();

    result.x = v.x / value;
    result.y = v.y / value;
    result.z = v.z / value;

    return result;
}

module.exports = {
    angleForVector,
    magnitudeForVector,
    wrapAngle,
    pointEqualToPoint,
    radToDeg,
    degToRad,
    getVelocity,
    distanceBetween,

    normalize,
    normalizePosition,
    zeroPosition,
    crossVector,
    addVector,
    subtractVector,
    divideVector,
};
