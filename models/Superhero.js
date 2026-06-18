const mongoose = require('mongoose');

const superheroSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  realName: {
    type: String
  },
  publisher: {
    type: String
  },
  alignment: {
    type: String,
    enum: ['good', 'bad', 'neutral']
  },
  powers: [{
    type: String
  }],
  firstAppearance: {
    type: String
  },
  description: {
    type: String
  },
  imageUrl: {
    type: String
  },
  apiId: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Superhero', superheroSchema);
