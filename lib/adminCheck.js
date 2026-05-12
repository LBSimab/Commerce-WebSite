import { getCurrentUser } from "@/lib/auth";

export async function checkAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    return { authorized: false, reason: "not-authenticated" };
  }

  if (user.role !== "admin") {
    return { authorized: false, reason: "not-admin" };
  }

  return { authorized: true, user };
}
