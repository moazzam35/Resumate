import { v2 as cloudinary } from "cloudinary";

/**
 * Configure Cloudinary instance.
 * Reads CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET from env.
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The file content as a Buffer
 * @param {object} options
 * @param {string} options.folder - Cloudinary folder name
 * @param {string} options.publicId - Optional public ID
 * @param {string} options.resourceType - "image" | "raw" | "video"
 * @returns {Promise<{url: string, publicId: string, format: string}>}
 */
export async function uploadBuffer(fileBuffer, options = {}) {
  const { folder = "resume-builder", publicId, resourceType = "image" } = options;

  return new Promise((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error("Upload timed out after 30 seconds. Please try again."));
      }
    }, 30_000);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: resourceType,
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      },
      (error, result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
        });
      }
    );

    uploadStream.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    });

    uploadStream.end(fileBuffer);
  });
}

/**
 * Upload a file from a URL to Cloudinary.
 * @param {string} url - The URL of the file to upload
 * @param {object} options
 * @returns {Promise<{url: string, publicId: string}>}
 */
export async function uploadUrl(url, options = {}) {
  const { folder = "resume-builder", publicId } = options;
  const result = await cloudinary.uploader.upload(url, {
    folder,
    public_id: publicId,
    resource_type: "image",
  });
  return {
    url: result.secure_url,
    publicId: result.public_id,
    format: result.format,
  };
}

/**
 * Delete a file from Cloudinary.
 * @param {string} publicId
 * @param {string} resourceType
 */
export async function deleteFile(publicId, resourceType = "image") {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/**
 * Parse multipart/form-data from a Request object.
 * This works in Next.js App Router without multer.
 * @param {Request} request
 * @param {string} fieldName - The form field name for the file
 * @returns {Promise<{file: File, fields: object}>}
 */
export async function parseMultipartForm(request, fieldName = "file", maxSize = 10 * 1024 * 1024) {
  const formData = await request.formData();
  const file = formData.get(fieldName);

  if (!file || typeof file === "string") {
    return { file: null, fields: Object.fromEntries(formData) };
  }

  if (file.size > maxSize) {
    throw new Error(`File exceeds maximum size of ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  return {
    file: {
      buffer,
      name: file.name,
      type: file.type,
      size: file.size,
    },
    fields: Object.fromEntries(formData),
  };
}
