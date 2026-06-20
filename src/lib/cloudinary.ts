import { v2 as cloudinary } from "cloudinary";
import "server-only";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export function cloudinaryReady(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export function signUpload(paramsToSign: Record<string, any>): string {
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "";
  return cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
}

export async function uploadFile(fileDataUri: string, publicId: string): Promise<any> {
  return cloudinary.uploader.upload(fileDataUri, {
    public_id: publicId,
    resource_type: "auto",
  });
}

export function slugify(text: string): string {
  const map: Record<string, string> = {
    ç: "c", Ç: "C", ğ: "g", Ğ: "G", ı: "i", İ: "I", ö: "o", Ö: "O", ş: "s", Ş: "S", ü: "u", Ü: "U"
  };
  
  let formatted = text.toString();
  Object.keys(map).forEach((key) => {
    formatted = formatted.replace(new RegExp(key, "g"), map[key]);
  });

  return formatted
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")           // Replace spaces with -
    .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
    .replace(/\-\-+/g, "-")         // Replace multiple - with single -
    .replace(/^-+/, "")             // Trim - from start
    .replace(/-+$/, "");            // Trim - from end
}
