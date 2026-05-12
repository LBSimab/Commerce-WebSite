import dbConnect from "@/lib/mongodb";
import SiteContent from "@/models/SiteContent";
import TeamMember from "@/models/TeamMember";
import Location from "@/models/Location";
import Review from "@/models/Review";
import ContentBlocks from "@/components/blocks/ContentBlock";

export default async function ContactPage({ params }) {
  const { locale } = await params;

  await dbConnect();

  const blocks = await SiteContent.find({ section: "contact", isActive: true })
    .sort({ order: 1 })
    .lean();

  const [teamMembers, locations, reviews] = await Promise.all([
    TeamMember.find({ isActive: true }).sort({ order: 1 }).lean(),
    Location.find({ isActive: true }).sort({ order: 1 }).lean(),
    Review.find({ isApproved: true })
      .sort({ rating: -1, createdAt: -1 })
      .limit(10)
      .populate("user", "name")
      .lean(),
  ]);

  return (
    <ContentBlocks
      blocks={JSON.parse(JSON.stringify(blocks))}
      teamMembers={JSON.parse(JSON.stringify(teamMembers))}
      locations={JSON.parse(JSON.stringify(locations))}
      reviews={JSON.parse(JSON.stringify(reviews))}
      locale={locale}
      page="contact"
    />
  );
}
