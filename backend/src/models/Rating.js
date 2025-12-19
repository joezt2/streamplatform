const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content',
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Il voto deve essere intero'
    }
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  }
}, {
  timestamps: false
});

// INDEXES
ratingSchema.index({ contentId: 1, createdAt: -1 });
ratingSchema. index({ userId: 1, contentId: 1 }, { unique: true });
ratingSchema.index({ rating: 1 });

// MIDDLEWARE - Auto-update content stats
ratingSchema.post('save', async function(doc) {
  const Content = mongoose.model('Content');
  const content = await Content.findById(doc. contentId);
  if (content) await content.updateRatingStats();
});

ratingSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    const Content = mongoose. model('Content');
    const content = await Content.findById(doc.contentId);
    if (content) await content.updateRatingStats();
  }
});

module.exports = mongoose.model('Rating', ratingSchema);