const Rating = require('../models/Rating');

class RatingRepository {
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [ratings, total] = await Promise.all([
      Rating.find().populate('contentId', 'title genre year').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Rating.countDocuments()
    ]);
    return { ratings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async findById(id) {
    return await Rating.findById(id).populate('contentId', 'title genre year').lean();
  }

  async findByContent(contentId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [ratings, total] = await Promise.all([
      Rating.find({ contentId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Rating.countDocuments({ contentId })
    ]);
    return { ratings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async findByUser(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [ratings, total] = await Promise. all([
      Rating.find({ userId }).populate('contentId', 'title genre year').sort({ createdAt: -1 }).skip(skip). limit(limit).lean(),
      Rating.countDocuments({ userId })
    ]);
    return { ratings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async create(data) {
    const rating = new Rating(data);
    return await rating.save();
  }

  async update(id, data) {
    return await Rating.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Rating.findByIdAndDelete(id);
  }

  async findUserRatingForContent(userId, contentId) {
    return await Rating.findOne({ userId, contentId }).lean();
  }

  async getRatingDistribution(contentId) {
    return await Rating.aggregate([
      { $match: { contentId } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
  }

  async getUserAverageRating(userId) {
    const result = await Rating.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } }
    ]);
    return result[0] || { avgRating: 0, totalRatings: 0 };
  }
}

module.exports = new RatingRepository();