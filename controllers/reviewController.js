import Review from "../models/Review.js";

// Add Review
export const addReview = async (req, res) => {
  const review = await Review.create({ client: req.user.userId, ...req.body });
  res.status(201).json(review);
};

// Get Reviews of Service Provider
export const getReviewsByServiceProvider = async (req, res) => {
  const reviews = await Review.find({ serviceProvider: req.params.serviceProviderId });
  res.status(200).json(reviews);
};

