/**
 * indices.js
 *
 * This is used to ensure we correctly calculate indexes used in Terrain.js.
 *
 * @author: James Edgeworth (https://jamesedgeworth.com)
 */

// These are used for finding the four corner vertices per quad for indices.
function sumTL(x, z, w) {
  return ((z * w) + x);
}

function sumBL(x, z, w) {
  return ((z + 1) * w) + x;
}

function sumBR(x, z, w) {
  return ((z + 1) * w) + x + 1;
}

function sumTR(x, z, w) {
  return (z * w) + x + 1;
}

// These are used for finding the 4 neighbouring vertices for normals.
function sumTM(x, z, w) {
    return ((z - 1) * w) + x;
}

function sumBM(x, z, w) {
    return ((z + 1) * w) + x;
}

function sumML(x, z, w) {
    return (z * w) + x - 1;
}

function sumMR(x, z, w) {
    return (z * w) + x + 1;
}


// Functional test to determine all 6 indices (of the corners) correctly form the index array.
function sumAll(w) {

  let vars = [];

  for (let z = 0; z < w-1; z+=1) {
    for (let x = 0; x < w-1; x+=1) {
      vars.push(sumTL(x, z, w));
      vars.push(sumBL(x, z, w));
      vars.push(sumBR(x, z, w));
      vars.push(sumBR(x, z, w));
      vars.push(sumTR(x, z, w));
      vars.push(sumTL(x, z, w));
    }
  }

  return vars.join(',');
}

module.exports = {
    sumTL,
    sumBL,
    sumBR,
    sumTR,
    sumAll,
    sumTM,
    sumML,
    sumMR,
    sumBM,
};
