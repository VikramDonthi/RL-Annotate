const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    enum: ['Bug', 'Feature', 'Urgent', 'Question', 'Feedback', 'General']
  },
  keywords: {
    type: [String],
    default: []
  }
});

module.exports = mongoose.model('Rule', ruleSchema);
