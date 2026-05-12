import { removeTokenCookie } from "@/lib/auth";

export async function POST() {
  try {
    await removeTokenCookie();
    return Response.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
