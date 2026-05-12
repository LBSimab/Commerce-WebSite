import TicketClient from "./TicketClient";

export default async function TicketPage({ params, searchParams }) {
  const { locale, id } = await params;
  const { token } = await searchParams;

  let ticket = null;
  let error = null;

  if (id && token) {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/tickets?token=${token}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        ticket = data.data;
      } else {
        error = data.message;
      }
    } catch {
      error = "Error loading ticket";
    }
  }

  return (
    <TicketClient
      locale={locale}
      id={id}
      token={token}
      initialTicket={ticket}
      initialError={error}
    />
  );
}
