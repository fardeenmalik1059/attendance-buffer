const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name:     { type: String, required: [true, 'Subject name is required'], trim: true, unique: true, maxlength: 80 },
    code:     { type: String, trim: true, uppercase: true, default: '' },
    held:     { type: Number, default: 0, min: [0, 'Classes held cannot be negative'] },
    attended: { type: Number, default: 0, min: [0, 'Classes attended cannot be negative'] },
    target: {
      type: Number,
      default: 75,
      min: [1, 'Target must be between 1 and 99'],
      max: [99, 'Target must be between 1 and 99'],
      validate: { validator: Number.isInteger, message: 'Target must be a whole number' }
    }
  },
  { timestamps: true }
);

// Cross-field rule: you cannot attend more classes than were held
subjectSchema.pre('validate', function () {
  if (this.attended > this.held) {
    this.invalidate('attended', 'Attended classes cannot exceed classes held');
  }
});

module.exports = mongoose.model('Subject', subjectSchema);
