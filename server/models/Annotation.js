const mongoose = require('mongoose');

const annotationSchema = new mongoose.Schema({
  text_input: {
    type: String,
    required: true
  },
  ai_prediction: {
    label: String,
    reasoning: String
  },
  human_correction: {
    label: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  accuracy_score: {
    type: Number,
    default: null // 1 if match, 0 if mismatch, null if not yet verified
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Annotation', annotationSchema);
