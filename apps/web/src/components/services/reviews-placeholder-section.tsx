import { Star, ThumbsUp, CheckCircle, Quote } from "lucide-react";
import { StarRating } from "./star-rating";

// Sample reviews for display
const sampleReviews = [
  {
    id: 1,
    name: "Rahim Ahmed",
    avatar: "R",
    date: "2 days ago",
    rating: 5,
    review: "Excellent service! The professional arrived on time and did an amazing job. Very satisfied with the quality of work.",
    helpful: 12,
    verified: true,
  },
  {
    id: 2,
    name: "Fatima Khan",
    avatar: "F",
    date: "1 week ago",
    rating: 5,
    review: "Very professional and courteous. The work was completed faster than expected. Would definitely recommend to others.",
    helpful: 8,
    verified: true,
  },
  {
    id: 3,
    name: "Karim Hassan",
    avatar: "K",
    date: "2 weeks ago",
    rating: 4,
    review: "Good service overall. The professional was skilled and friendly. Minor delay in arrival but made up for it with quality work.",
    helpful: 5,
    verified: true,
  },
];

// Avatar colors
const avatarColors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-pink-500",
];

interface ReviewsPlaceholderSectionProps {
  rating: number;
  ratingCount: number;
}

export function ReviewsPlaceholderSection({
  rating,
  ratingCount,
}: ReviewsPlaceholderSectionProps) {
  // Rating distribution (mock data based on rating)
  const ratingDistribution = [
    { stars: 5, percentage: 70 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 7 },
    { stars: 2, percentage: 2 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Testimonials
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Customer Reviews
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            See what our customers are saying about this service
          </p>
        </div>

        {/* Rating summary */}
        <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 mb-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Overall rating */}
            <div className="text-center md:text-left md:border-r md:border-gray-200 md:pr-8">
              <div className="inline-flex items-end gap-2 mb-3">
                <span className="text-6xl sm:text-7xl font-bold text-gray-900">{rating.toFixed(1)}</span>
                <span className="text-2xl text-gray-400 mb-2">/5</span>
              </div>
              <div className="flex justify-center md:justify-start mb-3">
                <StarRating rating={rating} size="lg" />
              </div>
              <p className="text-gray-500">
                Based on <span className="font-semibold text-gray-900">{ratingCount}</span> reviews
              </p>
            </div>

            {/* Right: Rating distribution */}
            <div className="space-y-3">
              {ratingDistribution.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-12">{item.stars} star</span>
                  <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-10">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleReviews.map((review, index) => (
            <div
              key={review.id}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 relative"
            >
              {/* Quote icon */}
              <div className="absolute top-4 right-4 text-gray-100 group-hover:text-gray-200 transition-colors">
                <Quote className="w-8 h-8" />
              </div>

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white font-semibold text-lg`}>
                  {review.avatar}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    {review.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{review.date}</p>
                </div>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>

              {/* Review text */}
              <p className="text-gray-600 leading-relaxed mb-4">
                {review.review}
              </p>

              {/* Footer */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <button className="inline-flex items-center gap-1.5 hover:text-gray-700 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpful})</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View all reviews button */}
        <div className="text-center mt-10">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
            View All {ratingCount} Reviews
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
