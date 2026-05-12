import dbConnect from "@/lib/mongodb";
import TeamMember from "@/models/TeamMember";
import TeamClient from "./TeamClient";

export default async function AdminTeamPage({ params }) {
  const { locale } = await params;
  await dbConnect();

  const members = await TeamMember.find().sort({ order: 1 }).lean();
  return (
    <TeamClient
      initialMembers={JSON.parse(JSON.stringify(members))}
      locale={locale}
    />
  );
}
