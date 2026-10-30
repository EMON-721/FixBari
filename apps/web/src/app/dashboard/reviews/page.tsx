"use client";

import { useState } from "react";
import { Star, MessageSquare, ThumbsUp, Edit2, Trash2, Search } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard";

// Mock reviews data
const mockReviews = [
  {
    id: "1",
    bookingId: "BK-K8P2M1",
    serviceName: "AC Servicing",
    technicianName: "Karim Hossain",
    technicianAvatar: null,
    rating: 5,
    comment: "Excellent service! Karim was very professional and completed the work on time. The AC is now working perfectly. Highly recommended for anyone needing AC servicing.",
    createdAt: "Dec 25, 2025",
    helpful: 12,
    response: {
      message: "Thank you so much for your kind words! We're delighted to hear that you're satisfied with our service. Looking forward to serving you again!",
      createdAt: "Dec 26, 2025",
    },
  },
  {
    id: "2",
    bookingId: "BK-P7K2L4",
    serviceName: "Plumbing Repair",
    technicianName: "Jamal Uddin",
    technicianAvatar: null,
    rating: 4,
    comment: "Good service overall. Fixed the leak quickly. Would have given 5 stars but arrived 15 minutes late.",
    createdAt: "Dec 20, 2025",
    helpful: 5,
    response: null,
  },
  {
    id: "3",
    bookingId: "BK-L2N4M5",
    serviceName: "Deep Cleaning",
    technicianName: "Fatima Begum",
    technicianAvatar: null,
    rating: 5,
    comment: "Amazing cleaning service! My home looks spotless. The team was thorough and very careful with all the furniture. Will definitely book again.",
    createdAt: "Dec 10, 2025",
    helpful: 8,
    response: {
      message: "We're thrilled that you loved our cleaning service! Your satisfaction is our priority. See you next time!",
      createdAt: "Dec 11, 2025",
    },
  },
];

// Stats
const reviewStats = {
  totalReviews: 15,
  averageRating: 4.7,
  fiveStars: 10,
  fourStars: 3,
  threeStars: 1,
  twoStars: 1,
  oneStars: 0,
};

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReviews = mockReviews.filter((review) =>
    review.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.technicianName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <DashboardHeader
        title="My Reviews"
        description="View and manage your service reviews"
      />

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Stats Overview */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left: Average Rating */}
              <div className="text-center md:text-left md:border-r border-gray-100 md:pr-6">
                <p className="text-sm text-gray-500 mb-2">Your Average Rating</p>
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <span className="text-5xl font-bold text-gray-900">{reviewStats.averageRating}</span>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.round(reviewStats.averageRating)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">{reviewStats.totalReviews} reviews</p>
                  </div>
                </div>
              </div>

              {/* Right: Rating Breakdown */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = reviewStats[`${stars === 1 ? "one" : stars === 2 ? "two" : stars === 3 ? "three" : stars === 4 ? "four" : "five"}Stars` as keyof typeof reviewStats] as number;
                  const percentage = (count / reviewStats.totalReviews) * 100;
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16">
                        <span className="text-sm text-gray-600">{stars}</span>
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      </div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search reviews by service or technician..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {review.technicianName.split(" ").map((n) => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{review.technicianName}</p>
                      <p className="text-sm text-gray-500">{review.serviceName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">{review.createdAt}</span>
                </div>

                {/* Comment */}
                <p className="text-gray-700 mb-4">{review.comment}</p>

                {/* Helpful */}
                <div className="flex items-center gap-4 mb-4">
                  <button className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{review.helpful} found this helpful</span>
                  </button>
                </div>

                {/* Response */}
                {review.response && (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-gray-900">Response from provider</span>
                      <span className="text-xs text-gray-400">{review.response.createdAt}</span>
                    </div>
                    <p className="text-sm text-gray-600">{review.response.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredReviews.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-500">
                {searchQuery
                  ? "Try adjusting your search criteria"
                  : "You haven't written any reviews yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
