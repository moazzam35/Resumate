import { authenticate } from "@/lib/middleware";
import { uploadBuffer, parseMultipartForm } from "@/lib/upload";
import {
  apiSuccess,
  apiError,
  apiValidationError,
} from "@/lib/api-response";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/upload
 * Upload an image file to Cloudinary.
 * Accepts multipart/form-data with a "file" field.
 * Validates file type (jpg, png, webp, gif) and size (max 5MB).
 */
export async function POST(request) {
  try {
    const { userId } = await authenticate(request);

    const { file, fields } = await parseMultipartForm(request, "file");

    if (!file) {
      return apiValidationError(
        ["file is required"],
        "No file provided. Please include a file in the 'file' field."
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      const allowed = ALLOWED_TYPES.map((t) => t.replace("image/", ".")).join(", ");
      return apiValidationError(
        [`Invalid file type: ${file.type}`],
        `Only image files are allowed (${allowed}).`
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return apiValidationError(
        [`File too large: ${sizeMB}MB`],
        `Maximum file size is 5MB. Your file is ${sizeMB}MB.`
      );
    }

    // Upload to Cloudinary
    const result = await uploadBuffer(file.buffer, {
      folder: "resume-builder/avatars",
      resourceType: "image",
    });

    return apiSuccess({
      url: result.url,
      publicId: result.publicId,
      format: result.format,
      width: result.width,
      height: result.height,
    }, "File uploaded successfully");
  } catch (error) {
    if (error instanceof Response) return error;
    console.error("Upload error:", error);
    return apiError("Failed to upload file", 500);
  }
}
