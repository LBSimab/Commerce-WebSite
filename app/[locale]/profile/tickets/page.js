import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import TicketsClient from "./TicketsClient";

export default async function ProfileTicketsPage({ params }) {
  const { locale } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  await dbConnect();

  const tickets = await Ticket.find({ user: user._id })
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <TicketsClient
      locale={locale}
      initialTickets={JSON.parse(JSON.stringify(tickets))}
    />
  );
}
