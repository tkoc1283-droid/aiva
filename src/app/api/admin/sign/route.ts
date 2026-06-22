import { NextResponse } from "next/server";
import { isAuthed } from "../../../../lib/auth";
import { signUpload } from "../../../../lib/cloudinary";

export const runtime = "nodejs";

export async function POST(request: Request) {
  // Check authorization
  const authenticated = await isAuthed();
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { publicId } = body;

    if (!publicId) {
      return NextResponse.json({ error: "Missing publicId parameter" }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({
        error: "Cloudinary yapılandırması eksik! Lütfen .env.local dosyasındaki Cloudinary değişkenlerini doldurun."
      }, { status: 400 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = {
      public_id: publicId,
      timestamp: timestamp.toString(),
    };

    // Calculate signature using SDK api_sign_request
    const signature = signUpload(paramsToSign);

    return NextResponse.json({
      timestamp,
      signature,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      publicId,
    });
  } catch (error) {
    console.error("Sign API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
