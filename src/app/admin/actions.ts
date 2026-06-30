"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, checkPassword, getSessionToken, isAuthed } from "../../lib/auth";
import { saveStore, Store } from "../../lib/overrides";

export async function login(prevState: any, formData: FormData) {
  const password = formData.get("password") as string;
  
  if (!password) {
    return { error: "Lütfen bir parola girin." };
  }

  if (checkPassword(password)) {
    const token = getSessionToken(password);
    const cookieStore = await cookies();
    
    cookieStore.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    
    return { success: true };
  }

  return { error: "Geçersiz parola." };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function persistStore(store: Store) {
  try {
    const authenticated = await isAuthed();
    if (!authenticated) {
      return { error: "Yetkisiz erişim. Lütfen panel şifresini girip tekrar giriş yapın." };
    }

    await saveStore(store);
    
    // Revalidate cache to update all statically generated pages
    revalidatePath("/", "layout");
    revalidatePath("/[locale]", "layout");
    return { success: true };
  } catch (err: any) {
    console.error("persistStore error:", err);
    return { error: err.message || "Bilinmeyen bir hata oluştu." };
  }
}
