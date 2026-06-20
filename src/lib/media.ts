export function imageUrl(src: string, width: number): string {
  if (!src) return "";
  if (!src.includes("res.cloudinary.com")) return src;

  // Insert transformations after /upload/
  if (src.includes("/image/upload/")) {
    return src.replace("/image/upload/", `/image/upload/f_auto,q_auto,w_${width},c_limit/`);
  }
  if (src.includes("/upload/")) {
    return src.replace("/upload/", `/upload/f_auto,q_auto,w_${width},c_limit/`);
  }
  return src;
}

export function videoUrl(src: string): string {
  if (!src) return "";
  if (!src.includes("res.cloudinary.com")) return src;

  if (src.includes("/video/upload/")) {
    return src.replace("/video/upload/", "/video/upload/f_auto,q_auto/");
  }
  if (src.includes("/upload/")) {
    return src.replace("/upload/", "/upload/f_auto,q_auto/");
  }
  return src;
}

export function videoPoster(src: string): string {
  if (!src) return "";
  if (!src.includes("res.cloudinary.com")) return "";

  // Replace extension with .jpg and add so_0 transformation
  const baseUrl = src.substring(0, src.lastIndexOf("."));
  const transformedUrl = baseUrl + ".jpg";

  if (transformedUrl.includes("/video/upload/")) {
    return transformedUrl.replace("/video/upload/", "/video/upload/f_auto,q_auto,so_0/");
  }
  if (transformedUrl.includes("/upload/")) {
    return transformedUrl.replace("/upload/", "/upload/f_auto,q_auto,so_0/");
  }
  return transformedUrl;
}
