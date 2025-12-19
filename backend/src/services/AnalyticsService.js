const contentRepository = require('../repositories/ContentRepository');
const ratingRepository = require('../repositories/RatingRepository');
const Content = require('../models/Content');
const Rating = require('../models/Rating');

class AnalyticsService {
  async getDashboard() {
    const [overview, topRated, genreDistribution, recentRatings, ratingDistribution] = await Promise. all([
      this.getOverview(),
      this.getTopRated(10),
      this.getGenreDistribution(),
      this. getRecentRatings(10),
      this.getRatingDistribution()
    ]);

    return {
      overview,
      topRatedContents: topRated,
      genreDistribution,
      recentRatings,
      ratingDistribution
    };
  }

  async getOverview() {
    const [totalContents, totalRatings, avgRatingResult, contentsWithReviews] = await Promise.all([
      Content.countDocuments(),
      Rating.countDocuments(),
      Rating.aggregate([{ $group: { _id: null, avg: { $avg: '$rating' } } }]),
      Content. countDocuments({ totalRatings: { $gt: 0 } })
    ]);

    return {
      totalContents,
      totalRatings,
      averageRating: avgRatingResult[0]?.avg?. toFixed(2) || '0.00',
      contentsWithReviews
    };
  }

  async getTopRated(limit) {
    return await Content.find({ totalRatings: { $gte: 10 } })
      .sort({ averageRating: -1, totalRatings: -1 })
      .limit(limit)
      .select('title year genre averageRating totalRatings')
      .lean();
  }

  async getGenreDistribution() {
    return await Content.aggregate([
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, genre: '$_id', count: 1 } }
    ]);
  }

  async getRecentRatings(limit) {
    return await Rating.find()
      .sort({ createdAt: -1 })
      . limit(limit)
      .populate('contentId', 'title genre year')
      .select('userId rating comment createdAt contentId')
      .lean();
  }

  async getRatingDistribution() {
    const result = await Rating.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result.forEach(item => {
      distribution[item._id] = item.count;
    });

    return distribution;
  }

  async getGenreStats(minRating, minReviews) {
    const rating = minRating || 4.5;
    const reviews = minReviews || 100;

    return await Content.aggregate([
      { 
        $match: { 
          averageRating: { $gte: rating }, 
          totalRatings: { $gte: reviews } 
        } 
      },
      {
        $group: {
          _id: '$genre',
          totalContents: { $sum: 1 },
          averageRating: { $avg: '$averageRating' },
          totalReviews: { $sum: '$totalRatings' },
          maxRating: { $max: '$averageRating' },
          minRating: { $min: '$averageRating' }
        }
      },
      { $sort: { averageRating: -1 } },
      {
        $project: {
          _id: 0,
          genre: '$_id',
          totalContents: 1,
          averageRating: { $round: ['$averageRating', 1] },
          totalReviews: 1,
          maxRating: { $round: ['$maxRating', 1] },
          minRating: { $round: ['$minRating', 1] }
        }
      }
    ]);
  }

  async getExcellencePipeline(minRating, minReviews) {
    const rating = minRating || 4.5;
    const reviews = minReviews || 100;

    const genres = await Content.aggregate([
      { 
        $match: { 
          averageRating: { $gte: rating }, 
          totalRatings: { $gte: reviews } 
        } 
      },
      {
        $group: {
          _id: '$genre',
          totalContents: { $sum: 1 },
          averageRating: { $avg: '$averageRating' },
          totalReviews: { $sum: '$totalRatings' },
          maxRating: { $max: '$averageRating' },
          minRating: { $min: '$averageRating' },
          contents: {
            $push: {
              id: '$_id',
              title: '$title',
              year: '$year',
              rating: '$averageRating',
              reviews: '$totalRatings'
            }
          }
        }
      },
      { $sort: { averageRating: -1 } },
      {
        $project: {
          _id: 0,
          genre: '$_id',
          totalContents: 1,
          averageRating: { $round: ['$averageRating', 1] },
          totalReviews: 1,
          maxRating: { $round: ['$maxRating', 1] },
          minRating: { $round: ['$minRating', 1] },
          contents: { $slice: ['$contents', 10] }
        }
      }
    ]);

    return {
      totalGenres: genres.length,
      criteria: { minRating: rating, minReviews: reviews },
      genres
    };
  }

  async getTrends(days) {
    const daysCount = days || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysCount);

    const trends = await Rating.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { 
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } 
          },
          totalRatings: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      },
      { $sort: { _id: -1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          totalRatings: 1,
          averageRating: { $round: ['$averageRating', 2] }
        }
      }
    ]);

    return trends;
  }

  async getMostPopular(limit) {
    const limitCount = limit || 20;

    return await Content.find({ totalRatings: { $gt: 0 } })
      .sort({ totalRatings: -1, averageRating: -1 })
      .limit(limitCount)
      .select('title year genre averageRating totalRatings')
      .lean();
  }

  async getTopActors(minRating, minReviews, limit) {
    const rating = minRating || 4.5;
    const reviews = minReviews || 100;
    const limitCount = limit || 20;

    const topActors = await Content.aggregate([
      { 
        $match: { 
          averageRating: { $gte: rating }, 
          totalRatings: { $gte: reviews } 
        } 
      },
      { $unwind: '$actors' },
      {
        $group: {
          _id: '$actors',
          appearances: { $sum: 1 },
          averageRating: { $avg: '$averageRating' },
          contents: {
            $push: {
              title: '$title',
              rating: '$averageRating',
              year: '$year'
            }
          }
        }
      },
      { $sort: { appearances: -1, averageRating: -1 } },
      { $limit: limitCount },
      {
        $project: {
          _id: 0,
          actor: '$_id',
          appearances: 1,
          averageRating: { $round: ['$averageRating', 1] },
          topContents: { $slice: ['$contents', 3] }
        }
      }
    ]);

    return topActors;
  }
}

module.exports = new AnalyticsService();