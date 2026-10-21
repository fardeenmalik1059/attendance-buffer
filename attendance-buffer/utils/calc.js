// Pure attendance maths - no database needed, so it is easy to unit test.

// Attendance percentage rounded to 2 decimals
function percentage(attended, held) {
  if (held === 0) return 0;
  return Math.round((attended / held) * 10000) / 100;
}

// Largest number of FUTURE classes you can skip and still stay >= target %
// Solve: attended / (held + x) >= target / 100   ->   x <= attended*100/target - held
function classesCanSkip(attended, held, target) {
  const x = Math.floor((attended * 100) / target - held);
  return Math.max(0, x);
}

// Smallest number of CONSECUTIVE classes to attend to reach target %
// Solve: (attended + y) / (held + y) >= target / 100  ->  y >= (target*held - 100*attended) / (100 - target)
function classesToAttend(attended, held, target) {
  if (held === 0) return 0;
  if (attended * 100 >= target * held) return 0;
  return Math.ceil((target * held - 100 * attended) / (100 - target));
}

// Percentage if the student skips the next `skip` classes
function whatIfSkip(attended, held, skip) {
  return percentage(attended, held + skip);
}

// Colour-coded status used by the UI
function getStatus(pct, held, target) {
  if (held === 0) return 'No data';
  if (pct < target) return 'Danger';
  if (pct < target + 5) return 'Warning';
  return 'Safe';
}

module.exports = { percentage, classesCanSkip, classesToAttend, whatIfSkip, getStatus };
