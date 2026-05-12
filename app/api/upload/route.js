/**
 * Upload API
 *
 * POST — Upload an image file to /public/uploads/
 * Returns the file path for saving to the database.
 */

import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request) {
  try {
    // Only admins can upload
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json(
        { success: false, message: "No file uploaded" },
        { status: 400 },
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return Response.json(
        {
          success: false,
          message: "Invalid file type. Allowed: JPG, PNG, WebP, GIF",
        },
        { status: 400 },
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { success: false, message: "File too large. Max 5MB" },
        { status: 400 },
      );
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop();
    const filename = `category-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Ensure upload directory exists
    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "categories",
    );
    await mkdir(uploadDir, { recursive: true });

    // Save file
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return the public path
    const publicPath = `/uploads/categories/${filename}`;

    return Response.json({
      success: true,
      data: { url: publicPath },
    });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
