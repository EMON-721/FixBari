import { Star, MessageSquare } from "lucide-react";

interface ReviewCardProps {
  review: {
    id: string;
    serviceName: string;
    technicianName: string;
    technicianAvatar?: string;
    rating: number;
    comment: string;
    createdAt: string;
    response?: {
      message: string;
      createdAt: string;
    };
  };
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            {review.technicianAvatar ? (
              <img
                src={review.technicianAvatar}
                alt={review.technicianName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-medium text-sm">
                {review.technicianName[0]}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{review.technicianName}</p>
            <p className="text-sm text-gray-500">{review.serviceName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < review.rating
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      <p className="text-gray-600 mb-3">{review.comment}</p>
      <p className="text-xs text-gray-400 mb-4">{review.createdAt}</p>

      {/* Response */}
      {review.response && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-900">Response</span>
          </div>
          <p className="text-sm text-gray-600">{review.response.message}</p>
          <p className="text-xs text-gray-400 mt-2">{review.response.createdAt}</p>
        </div>
      )}
    </div>
  );
}
