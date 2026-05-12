import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import TicketDetailClient from "./TicketDetailClient";

export default async function ProfileTicketDetailPage({ params }) {
  const { locale, id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  await dbConnect();

  const ticket = await Ticket.findOne({ _id: id, user: user._id })
    .populate("user", "name email")
    .lean();

  if (!ticket) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          {locale === "fa" ? "تیکت یافت نشد" : "Ticket Not Found"}
        </h1>
      </div>
    );
  }

  return (
    <TicketDetailClient
      locale={locale}
      ticket={JSON.parse(JSON.stringify(ticket))}
    />
  );
}
