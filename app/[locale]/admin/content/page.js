import dbConnect from "@/lib/mongodb";
import SiteContent from "@/models/SiteContent";
import ContentClient from "./ContentClient";

export default async function AdminContentPage({ params }) {
  const { locale } = await params;
  await dbConnect();

  const content = await SiteContent.find()
    .sort({ section: 1, order: 1 })
    .lean();
  return (
    <ContentClient
      initialContent={JSON.parse(JSON.stringify(content))}
      locale={locale}
    />
  );
}
