const Vector3 = require('./types/Vector3');
const {normalize, normalizePosition, crossVector, addVector, divideVector} = require('./VectorMath');

test('crossVector calculates correctly', () => {

    const v1 = new Vector3();
    v1.x = 3.0;
    v1.y = -3.0;
    v1.z = 1.0;

    const v2 = new Vector3();
    v2.x = 4.0;
    v2.y = 9.0;
    v2.z = 2.0;

    const cv = new Vector3();
    cv.x = -15.0;
    cv.y = -2.0;
    cv.z = 39.0;


  expect(crossVector(v1, v2)).toEqual(cv);
});


