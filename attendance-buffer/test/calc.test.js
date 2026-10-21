const test = require('node:test');
const assert = require('node:assert');
const { percentage, classesCanSkip, classesToAttend, whatIfSkip, getStatus } = require('../utils/calc');

test('percentage', () => {
  assert.strictEqual(percentage(18, 20), 90);
  assert.strictEqual(percentage(0, 0), 0);
  assert.strictEqual(percentage(2, 3), 66.67);
});

test('classesCanSkip keeps attendance at or above target', () => {
  assert.strictEqual(classesCanSkip(18, 20, 75), 4);   // 18/24 = 75%
  assert.strictEqual(classesCanSkip(15, 20, 75), 0);   // exactly 75% already
  assert.strictEqual(classesCanSkip(10, 20, 75), 0);   // below target
});

test('classesToAttend recovers to target', () => {
  assert.strictEqual(classesToAttend(10, 20, 75), 20); // 30/40 = 75%
  assert.strictEqual(classesToAttend(18, 20, 75), 0);  // already safe
  assert.strictEqual(classesToAttend(0, 0, 75), 0);
});

test('classesToAttend result really reaches the target', () => {
  for (const [a, h, t] of [[10, 20, 75], [7, 15, 75], [30, 50, 80], [1, 9, 60]]) {
    const y = classesToAttend(a, h, t);
    assert.ok(((a + y) / (h + y)) * 100 >= t, `fails for ${a}/${h} @ ${t}`);
    if (y > 0) assert.ok(((a + y - 1) / (h + y - 1)) * 100 < t, `not minimal for ${a}/${h} @ ${t}`);
  }
});

test('whatIfSkip and status', () => {
  assert.strictEqual(whatIfSkip(18, 20, 2), 81.82);
  assert.strictEqual(getStatus(90, 20, 75), 'Safe');
  assert.strictEqual(getStatus(77, 20, 75), 'Warning');
  assert.strictEqual(getStatus(60, 20, 75), 'Danger');
  assert.strictEqual(getStatus(0, 0, 75), 'No data');
});
