const Vector3 = require('./types/Vector3');
const {
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
} = require('./VectorMath');

//
test('angleForVector calculates correctly', () => {

    const v1 = new Vector3(20.0, 20.0, 0.0);

    expect( Math.round(angleForVector(v1)) ).toEqual(45);
});

//
test('magnitudeForVector calculates correctly', () => {

    const v1 = new Vector3(20.0, 20.0, 0.0);

    expect( Math.round(magnitudeForVector(v1)) ).toEqual(28);
});

//
test('wrapAngle calculates correctly', () => {
    expect( wrapAngle(370.0) ).toEqual(10.0);
});

//
test('pointEqualToPoint calculates correctly', () => {

    const v1 = new Vector3(23, 20, 10);
    const v2 = new Vector3(23, 20, 10);

    expect( pointEqualToPoint(v1, v2) ).toEqual(true);
});

//
test('crossVector calculates correctly', () => {

    const v1 = new Vector3(3.0, -3.0, 1.0);
    const v2 = new Vector3(4.0, 9.0, 2.0);
    const cv = new Vector3(-15.0, -2.0, 39.0);

    expect(crossVector(v1, v2)).toEqual(cv);
});

//
test('distanceBetween calculates correctly', () => {

    const v1 = new Vector3();
    v1.x = 1.0;
    v1.y = 1.0;
    v1.z = 0.0;

    const v2 = new Vector3();
    v2.x = 2.0;
    v2.y = 1.0;
    v2.z = 2.0;

    expect( distanceBetween(v1, v2).toFixed(2)).toEqual("2.24");
});


//
test('rad2deg calculates correctly', () => {
    expect( radToDeg(1).toFixed(2) ).toEqual("57.30");
});

//
test('deg2rad calculates correctly', () => {
    expect( degToRad(1).toFixed(3) ).toEqual("0.017");
});

//
test('getVelocity calculates correctly', () => {

    const positionVector = new Vector3(1, 1, 1);
    const destinationVector = new Vector3(200, 100, 1);

    const velocityVector = getVelocity(destinationVector, positionVector, 10.0);

    const rx = velocityVector.x.toFixed(2);
    const ry = velocityVector.y.toFixed(2);
    const rz = velocityVector.z.toFixed(2);

    expect( [rx, ry, rz] ).toEqual(["8.95", "4.45", "0.00"]);
});

//
test('normalizePosition calculates correctly', () => {

    const v1 = new Vector3(20, 20, 1);

    normalizePosition(v1);

    const rx = v1.x.toFixed(3);
    const ry = v1.y.toFixed(3);
    const rz = v1.z.toFixed(3);

    expect( [rx, ry, rz] ).toEqual(["0.707", "0.707", "0.035"]);
});
