import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Standard requirement: log to console if RESEND_API_KEY is not defined
    console.log("=== Contact Form Submission Received ===");
    console.log(`From: ${name} <${email}>`);
    console.log(`Phone: ${phone || "N/A"}`);
    console.log(`Message: ${message}`);
    console.log("========================================");

    const resendKey = process.env.RESEND_API_KEY;
    const contactTo = process.env.CONTACT_TO || "info@aivastudyo.com";

    if (resendKey) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Aiva Studio Contact Form <onboarding@resend.dev>",
            to: contactTo,
            subject: `New Message from ${name} (Aiva Studio Contact Form)`,
            html: `
              <h3>New Contact Message</h3>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone || "N/A"}</p>
              <p><strong>Message:</strong></p>
              <p>${message}</p>
            `,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          console.error("Resend delivery failed:", errText);
        }
      } catch (err) {
        console.error("Error calling Resend api:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
