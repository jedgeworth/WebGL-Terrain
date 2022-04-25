const {
    sumTL,
    sumBL,
    sumBR,
    sumTR,
    sumAll,
    sumTM,
    sumML,
    sumMR,
    sumBM
} = require('./indices');

test('Checks TL = 0 WHERE x0, z0', () => {
  expect(sumTL(0, 0, 3)).toBe(0);
});

test('Checks BL = 3 WHERE x0, z0', () => {
  expect(sumBL(0, 0, 3)).toBe(3);
});

test('Checks BR = 4 WHERE x0, z0', () => {
  expect(sumBR(0, 0, 3)).toBe(4);
});

test('Checks TR = 1 WHERE x0, z0', () => {
  expect(sumTR(0, 0, 3)).toBe(1);
});



test('Checks TL = 1 WHERE x1, z0', () => {
  expect(sumTL(1, 0, 3)).toBe(1);
});

test('Checks BL = 4 WHERE x1, z0', () => {
  expect(sumBL(1, 0, 3)).toBe(4);
});

test('Checks BR = 5 WHERE x1, z0', () => {
  expect(sumBR(1, 0, 3)).toBe(5);
});

test('Checks TR = 2 WHERE x1, z0', () => {
  expect(sumTR(1, 0, 3)).toBe(2);
});




test('Checks TL = 3 WHERE x0, z1', () => {
  expect(sumTL(0, 1, 3)).toBe(3);
});

test('Checks BL = 6 WHERE x0, z1', () => {
  expect(sumBL(0, 1, 3)).toBe(6);
});

test('Checks BR = 7 WHERE x0, z1', () => {
  expect(sumBR(0, 1, 3)).toBe(7);
});

test('Checks TR = 4 WHERE x0, z1', () => {
  expect(sumTR(0, 1, 3)).toBe(4);
});

test('Checks all WHERE w3', () => {
  expect(sumAll(3)).toBe("0,3,4,4,1,0,1,4,5,5,2,1,3,6,7,7,4,3,4,7,8,8,5,4");
});



test('Checks TM = 1 WHERE x1, z1', () => {
    expect(sumTM(1, 1, 3)).toBe(1);
});

test('Checks BM = 7 WHERE x1, z1', () => {
    expect(sumBM(1, 1, 3)).toBe(7);
});

test('Checks ML = 3 WHERE x1, z1', () => {
    expect(sumML(1, 1, 3)).toBe(3);
});

test('Checks MR = 5 WHERE x1, z1', () => {
    expect(sumMR(1, 1, 3)).toBe(5);
});
