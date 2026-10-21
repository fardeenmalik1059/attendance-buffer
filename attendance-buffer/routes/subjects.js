const express = require('express');
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const { percentage, classesCanSkip, classesToAttend, whatIfSkip, getStatus } = require('../utils/calc');

const router = express.Router();

const validId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid subject id' });
  }
  next();
};

// Attach the calculated fields to a subject document
function withStats(doc) {
  const s = doc.toObject();
  const pct = percentage(s.attended, s.held);
  return {
    ...s,
    percentage: pct,
    canSkip: classesCanSkip(s.attended, s.held, s.target),
    mustAttend: classesToAttend(s.attended, s.held, s.target),
    status: getStatus(pct, s.held, s.target)
  };
}

function handleError(res, err) {
  if (err.code === 11000) return res.status(409).json({ error: 'This subject already exists' });
  if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
  return res.status(500).json({ error: err.message });
}

// CREATE -> POST /api/subjects
router.post('/', async (req, res) => {
  try {
    const { name, code, held, attended, target } = req.body;
    const subject = await Subject.create({ name, code, held, attended, target });
    res.status(201).json(withStats(subject));
  } catch (err) {
    handleError(res, err);
  }
});

// READ ALL -> GET /api/subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    res.json(subjects.map(withStats));
  } catch (err) {
    handleError(res, err);
  }
});

// SUMMARY (uses MongoDB aggregation pipelines) -> GET /api/subjects/summary
// NOTE: must be declared before '/:id'
router.get('/summary', async (req, res) => {
  try {
    const [totals] = await Subject.aggregate([
      { $group: { _id: null, subjects: { $sum: 1 }, held: { $sum: '$held' }, attended: { $sum: '$attended' } } }
    ]);

    const [lowest] = await Subject.aggregate([
      { $match: { held: { $gt: 0 } } },
      { $addFields: { pct: { $multiply: [{ $divide: ['$attended', '$held'] }, 100] } } },
      { $sort: { pct: 1 } },
      { $limit: 1 }
    ]);

    const held = totals ? totals.held : 0;
    const attended = totals ? totals.attended : 0;
    res.json({
      subjects: totals ? totals.subjects : 0,
      held,
      attended,
      overallPercentage: percentage(attended, held),
      lowestSubject: lowest ? { name: lowest.name, percentage: Math.round(lowest.pct * 100) / 100 } : null
    });
  } catch (err) {
    handleError(res, err);
  }
});

// MARK A CLASS -> POST /api/subjects/:id/mark   body: { "present": true | false }
router.post('/:id/mark', validId, async (req, res) => {
  try {
    if (typeof req.body.present !== 'boolean') {
      return res.status(400).json({ error: '"present" must be true or false' });
    }
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    subject.held += 1;
    if (req.body.present) subject.attended += 1;
    await subject.save();
    res.json(withStats(subject));
  } catch (err) {
    handleError(res, err);
  }
});

// WHAT-IF -> GET /api/subjects/:id/whatif?skip=3
router.get('/:id/whatif', validId, async (req, res) => {
  try {
    const skip = parseInt(req.query.skip, 10);
    if (Number.isNaN(skip) || skip < 0 || skip > 100) {
      return res.status(400).json({ error: 'skip must be a number between 0 and 100' });
    }
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    const predicted = whatIfSkip(subject.attended, subject.held, skip);
    res.json({
      skip,
      currentPercentage: percentage(subject.attended, subject.held),
      predictedPercentage: predicted,
      belowTarget: predicted < subject.target
    });
  } catch (err) {
    handleError(res, err);
  }
});

// UPDATE -> PUT /api/subjects/:id
router.put('/:id', validId, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    ['name', 'code', 'held', 'attended', 'target'].forEach((k) => {
      if (req.body[k] !== undefined) subject[k] = req.body[k];
    });
    await subject.save();
    res.json(withStats(subject));
  } catch (err) {
    handleError(res, err);
  }
});

// DELETE -> DELETE /api/subjects/:id
router.delete('/:id', validId, async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
