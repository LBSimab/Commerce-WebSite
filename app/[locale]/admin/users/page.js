import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import UsersClient from "./UsersClient";

export default async function AdminUsersPage({ params }) {
  const { locale } = await params;

  await dbConnect();

  const users = await User.find().sort({ createdAt: -1 }).lean();
  const serializedUsers = JSON.parse(JSON.stringify(users));

  return <UsersClient initialUsers={serializedUsers} locale={locale} />;
}
