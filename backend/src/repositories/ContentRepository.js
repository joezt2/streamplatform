const Content = require('../models/Content');

class ContentRepository {
  async findAll(page = 1, limit = 20, sort = { createdAt: -1 }) {
    const skip = (page - 1) * limit;
    const [contents, total] = await Promise. all([
      Content.find(). sort(sort).skip(skip).limit(limit).lean(),
      Content.countDocuments()
    ]);
    return {
      contents,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    };
  }

  async findById(id) {
    return await Content.findById(id).lean();
  }

  async create(data) {
    const content = new Content(data);
    return await content.save();
  }

  async update(id, data) {
    return await Content.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  }

  async delete(id) {
    return await Content.findByIdAndDelete(id);
  }

  async findByGenre(genre, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [contents, total] = await Promise.all([
      Content.find({ genre }). sort({ averageRating: -1 }). skip(skip).limit(limit). lean(),
      Content.countDocuments({ genre })
    ]);
    return { contents, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async findByActor(actor, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query = { actors: { $regex: actor, $options: 'i' } };
    const [contents, total] = await Promise. all([
      Content.find(query).sort({ year: -1 }).skip(skip).limit(limit).lean(),
      Content.countDocuments(query)
    ]);
    return { contents, pagination: { page, limit, total, pages: Math. ceil(total / limit) } };
  }

  async findTopQuality(minRating = 4.5, minReviews = 100, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const query = { averageRating: { $gte: minRating }, totalRatings: { $gte: minReviews } };
    const [contents, total] = await Promise.all([
      Content.find(query).sort({ averageRating: -1, totalRatings: -1 }).skip(skip).limit(limit).lean(),
      Content.countDocuments(query)
    ]);
    return { contents, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async search(searchTerm, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [contents, total] = await Promise. all([
      Content.find({ $text: { $search: searchTerm } }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } }). skip(skip).limit(limit). lean(),
      Content.countDocuments({ $text: { $search: searchTerm } })
    ]);
    return { contents, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async getStats() {
    const stats = await Content.aggregate([
      { $group: { _id: null, totalContents: { $sum: 1 }, avgRating: { $avg: '$averageRating' }, totalRatings: { $sum: '$totalRatings' } } }
    ]);
    const genreCount = await Content.aggregate([
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    return { ... stats[0], genreDistribution: genreCount };
  }

  async getGenreStats(minRating = 4.5, minReviews = 100) {
    return await Content.aggregate([
      { $match: { averageRating: { $gte: minRating }, totalRatings: { $gte: minReviews } } },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 },
          avgRating: { $avg: '$averageRating' },
          totalReviews: { $sum: '$totalRatings' },
          contents: {
            $push: { id: '$_id', title: '$title', rating: '$averageRating', reviews: '$totalRatings' }
          }
        }
      },
      { $sort: { avgRating: -1 } },
      {
        $project: {
          _id: 0,
          genre: '$_id',
          totalContents: '$count',
          averageRating: { $round: ['$avgRating', 1] },
          totalReviews: '$totalReviews',
          topContents: { $slice: ['$contents', 5] }
        }
      }
    ]);
  }
}

module.exports = new ContentRepository();