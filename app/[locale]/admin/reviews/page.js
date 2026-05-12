import dbConnect from "@/lib/mongodb";
import Review from "@/models/Review";
import ReviewsClient from "./ReviewsClient";

export default async function AdminReviewsPage({ params }) {
  const { locale } = await params;

  await dbConnect();

  const reviews = await Review.find()
    .populate("product", "name nameFa")
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  const serialized = JSON.parse(JSON.stringify(reviews));

  return <ReviewsClient initialReviews={serialized} locale={locale} />;
}
