const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Il titolo è obbligatorio'],
    trim: true,
    maxlength: [200, 'Max 200 caratteri']
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 2
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  genre: {
    type: String,
    required: true,
    enum: ['Azione', 'Commedia', 'Drammatico', 'Thriller', 'Sci-Fi', 'Horror', 'Romantico', 'Animazione', 'Documentario', 'Fantasy']
  },
  actors: {
    type: [String],
    required: true,
    validate: {
      validator: v => v && v.length > 0,
      message: 'Almeno un attore richiesto'
    }
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// INDEXES
contentSchema.index({ genre: 1, averageRating: -1 });
contentSchema.index({ averageRating: -1, totalRatings: -1 });
contentSchema.index({ actors: 1 });
contentSchema.index({ title: 'text', description: 'text' });

// VIRTUALS
contentSchema. virtual('ratings', {
  ref: 'Rating',
  localField: '_id',
  foreignField: 'contentId'
});

contentSchema.virtual('formattedDuration').get(function() {
  const h = Math.floor(this.duration / 60);
  const m = this. duration % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
});

// METHODS
contentSchema.methods.updateRatingStats = async function() {
  const Rating = mongoose.model('Rating');
  const stats = await Rating.aggregate([
    { $match: { contentId: this._id } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  if (stats.length > 0) {
    this.averageRating = Math.round(stats[0].avgRating * 10) / 10;
    this.totalRatings = stats[0].count;
  } else {
    this.averageRating = 0;
    this.totalRatings = 0;
  }
  await this.save();
};

// STATICS
contentSchema.statics.findTopQuality = function(minRating = 4.5, minReviews = 100) {
  return this. find({
    averageRating: { $gte: minRating },
    totalRatings: { $gte: minReviews }
  }). sort({ averageRating: -1 });
};

contentSchema.statics.getGenreStats = async function(minRating = 4.5, minReviews = 100) {
  return this.aggregate([
    { $match: { averageRating: { $gte: minRating }, totalRatings: { $gte: minReviews } } },
    { 
      $group: {
        _id: '$genre',
        count: { $sum: 1 },
        avgRating: { $avg: '$averageRating' },
        totalReviews: { $sum: '$totalRatings' }
      }
    },
    { $sort: { avgRating: -1 } },
    {
      $project: {
        _id: 0,
        genre: '$_id',
        totalContents: '$count',
        averageRating: { $round: ['$avgRating', 1] },
        totalReviews: '$totalReviews'
      }
    }
  ]);
};

contentSchema.pre('save', function(next) {
  this.actors = [... new Set(this.actors. map(a => a.trim()))];
  next();
});

module.exports = mongoose.model('Content', contentSchema);