import dbConnect from "@/lib/mongodb";
import Ticket from "@/models/Ticket";
import TicketsClient from "./TicketsClient";

export default async function AdminTicketsPage({ params }) {
  const { locale } = await params;
  await dbConnect();

  const tickets = await Ticket.find()
    .populate("user", "name email")
    .sort({ updatedAt: -1 })
    .lean();

  return (
    <TicketsClient
      initialTickets={JSON.parse(JSON.stringify(tickets))}
      locale={locale}
    />
  );
}
